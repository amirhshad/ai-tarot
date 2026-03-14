import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/db/auth';
import { getProfile, createReading, updateReadingInterpretation } from '@/lib/db/queries';
import { getSpread } from '@/lib/tarot/spreads';
import { SpreadType } from '@/lib/tarot/types';
import { deserializeDrawnCards } from '@/lib/tarot/shuffle';
import { buildInterpretationPrompt, buildQuestionMessage, ReadingTopic } from '@/lib/ai/prompts';
import { streamInterpretation } from '@/lib/ai/client';
import { checkQuota, incrementUsage } from '@/lib/utils/quota';
import { sendReadingSummary } from '@/lib/email/client';

export async function POST(request: NextRequest) {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const profile = await getProfile(user.id);

  const tier = (profile?.tier || 'free') as 'free' | 'pro' | 'premium';
  const language = (profile?.language || 'en') as 'en' | 'fa';

  const body = await request.json();
  const { spreadType, cards: cardData, question, topic } = body as {
    spreadType: SpreadType;
    cards: { cardId: number; reversed: boolean; positionIndex: number }[];
    question?: string;
    topic?: ReadingTopic;
  };

  // Validate spread
  const spread = getSpread(spreadType);
  if (!spread) {
    return NextResponse.json({ error: 'Invalid spread type' }, { status: 400 });
  }

  if (cardData.length !== spread.cardCount) {
    return NextResponse.json({ error: 'Invalid card count' }, { status: 400 });
  }

  // Check quota
  const quota = await checkQuota(user.id, tier, spreadType);
  if (!quota.allowed) {
    return NextResponse.json({ error: quota.reason }, { status: 403 });
  }

  // Deserialize cards
  const drawnCards = deserializeDrawnCards(cardData, spread.positions);

  // Build prompts
  const { systemPrompt, userMessage } = buildInterpretationPrompt({
    spread,
    cards: drawnCards,
    language,
    tier,
    topic: topic || undefined,
  });

  const questionSuffix = buildQuestionMessage({ question, language });

  // Create reading record (interpretation filled later)
  const readingId = await createReading({
    user_id: user.id,
    spread_type: spreadType,
    question,
    cards: cardData,
    model_used: tier === 'free' ? 'haiku-4.5' : 'sonnet-4',
    language,
  });

  // Increment usage
  await incrementUsage(user.id, spreadType);

  // Stream the interpretation
  const stream = await streamInterpretation({
    systemPrompt,
    userMessage: userMessage + questionSuffix,
    tier,
  });

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
