import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/db/auth';
import { getProfile, createReading, updateReadingInterpretation, getReadingCount } from '@/lib/db/queries';
import { getSpread } from '@/lib/tarot/spreads';
import { SpreadType } from '@/lib/tarot/types';
import { deserializeDrawnCards } from '@/lib/tarot/shuffle';
import { buildInterpretationPrompt, buildQuestionMessage, ReadingTopic } from '@/lib/ai/prompts';
import { streamInterpretation } from '@/lib/ai/client';
import { spend, refund } from '@/lib/credits/ledger';
import { SPREAD_COSTS } from '@/lib/credits/config';
import { sendReadingSummary } from '@/lib/email/client';

export async function POST(request: NextRequest) {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const profile = await getProfile(user.id);

  const tier = (profile?.tier || 'free') as 'free' | 'pro' | 'premium';

  // Block second reading if email not verified
  if (profile?.email_verified === 0) {
    const count = await getReadingCount(user.id);
    if (count >= 1) {
      return NextResponse.json({ error: 'Please verify your email to continue reading', code: 'EMAIL_UNVERIFIED' }, { status: 403 });
    }
  }

  const body = await request.json();
  const { spreadType, cards: cardData, question, topic, language: requestLanguage } = body as {
    spreadType: SpreadType;
    cards: { cardId: number; reversed: boolean; positionIndex: number }[];
    question?: string;
    topic?: ReadingTopic;
    language?: 'en' | 'fa';
  };

  const language = (requestLanguage || profile?.language || 'en') as 'en' | 'fa';

  // Validate question length
  if (question && question.length > 500) {
    return NextResponse.json({ error: 'Question is too long (max 500 characters)' }, { status: 400 });
  }

  // Validate spread
  const spread = getSpread(spreadType);
  if (!spread) {
    return NextResponse.json({ error: 'Invalid spread type' }, { status: 400 });
  }

  if (cardData.length !== spread.cardCount) {
    return NextResponse.json({ error: 'Invalid card count' }, { status: 400 });
  }

  // Deserialize cards before any debit — this is a pure function whose job here is
  // exactly to validate the client-supplied card ids, so a bad id becomes a clean
  // 400 instead of a charged 500.
  let drawnCards;
  try {
    drawnCards = deserializeDrawnCards(cardData, spread.positions);
  } catch (err) {
    console.error('Invalid card data:', err);
    return NextResponse.json({ error: 'Invalid card data' }, { status: 400 });
  }

  // Reserve credits before spending any money with Anthropic. The reading id is
  // generated here so the debit and the reading row share one identifier, which
  // is what lets a failed generation be refunded precisely.
  const readingId = crypto.randomUUID();
  const cost = SPREAD_COSTS[spreadType];
  const charge = await spend(user.id, tier, cost, readingId);

  if (!charge.ok) {
    return NextResponse.json(
      {
        error: tier === 'free'
          ? 'You have used your free readings for today. Come back tomorrow for more.'
          : 'You are out of credits for this billing period.',
        code: 'INSUFFICIENT_CREDITS',
        balance: charge.balance,
        cost,
      },
      { status: 403 },
    );
  }

  // Build prompts
  const { systemPrompt, userMessage } = buildInterpretationPrompt({
    spread,
    cards: drawnCards,
    language,
    tier,
    topic: topic || undefined,
  });

  const questionSuffix = buildQuestionMessage({ question, language });

  // Everything from here through the start of streaming can throw (a DB write
  // failure in createReading, an outage or our own credit balance running out in
  // the Anthropic call), and none of it produced a single token — the user must
  // not pay for any of it.
  let stream;
  try {
    // Create reading record (interpretation filled later)
    await createReading({
      id: readingId,
      user_id: user.id,
      spread_type: spreadType,
      question,
      cards: cardData,
      model_used: tier === 'free' ? 'haiku-4.5' : 'sonnet-5',
      language,
      topic: topic || undefined,
    });

    stream = await streamInterpretation({
      systemPrompt,
      userMessage: userMessage + questionSuffix,
      tier,
      spreadType: spread.type,
    });
  } catch (err) {
    await refund(readingId);
    console.error('Reading generation failed before streaming:', err);
    return NextResponse.json(
      { error: 'The reading could not be generated. Your credits have not been used.' },
      { status: 502 },
    );
  }

  const encoder = new TextEncoder();

  const responseStream = new ReadableStream({
    async start(controller) {
      try {
        let fullText = '';
        for await (const event of stream) {
          if (event.type === 'content_block_delta') {
            const delta = event as { type: string; delta?: { type?: string; text?: string } };
            if (delta.delta?.type === 'text_delta' && delta.delta?.text) {
              fullText += delta.delta.text;
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text: delta.delta.text })}\n\n`),
              );
            }
          }
        }

        // Save interpretation to database
        await updateReadingInterpretation(readingId, fullText);

        // Fire-and-forget reading summary email
        const cardNames = drawnCards.map(dc => dc.card.name + (dc.reversed ? ' (Reversed)' : ''));
        void sendReadingSummary(user.email, readingId, spreadType, cardNames, fullText);

        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ done: true, fullText, readingId })}\n\n`,
          ),
        );
        controller.close();
      } catch (err) {
        console.error('Reading stream error:', err);
        await refund(readingId);
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: (err as Error).message || 'Stream error' })}\n\n`),
        );
        controller.close();
      }
    },
  });

  return new Response(responseStream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
