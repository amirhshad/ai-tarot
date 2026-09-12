import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/db/auth';
import { getProfile, getReading, getFollowUps, countUserFollowUps, createFollowUp } from '@/lib/db/queries';
import { getSpread } from '@/lib/tarot/spreads';
import { deserializeDrawnCards } from '@/lib/tarot/shuffle';
import { buildFollowUpPrompt, buildExtraCardContext } from '@/lib/ai/prompts';
import { streamFollowUp } from '@/lib/ai/client';
import { spend, refund } from '@/lib/credits/ledger';
import { FOLLOW_UP_COST, INCLUDED_FOLLOW_UPS } from '@/lib/credits/config';
import { getCardById } from '@/lib/tarot/deck';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get reading
  const reading = await getReading(id, user.id);

  if (!reading) {
    return NextResponse.json({ error: 'Reading not found' }, { status: 404 });
  }

  // Get profile
  const profile = await getProfile(user.id);

  const tier = profile?.tier || 'free';

  // Follow-ups are the single largest hidden cost in a reading — ten of them in
  // Farsi cost more than the Celtic Cross that spawned them. The first two come
  // free so normal use never feels metered; beyond that they draw credits.
  const userMessageCount = await countUserFollowUps(id);

  if (tier === 'free') {
    return NextResponse.json(
      { error: 'Follow-up questions are available to members.' },
      { status: 403 },
    );
  }

  // Anything that can deterministically reject the request must run before the
  // debit, so parse and validate the body first.
  const body = await request.json();
  const { question, extraCard, language: requestLanguage } = body as {
    question: string;
    extraCard?: { cardId: number; reversed: boolean };
    language?: 'en' | 'fa';
  };

  const language = (requestLanguage || profile?.language || 'en') as 'en' | 'fa';

  if (!question?.trim()) {
    return NextResponse.json({ error: 'Question is required' }, { status: 400 });
  }

  if (question.length > 500) {
    return NextResponse.json({ error: 'Question is too long (max 500 characters)' }, { status: 400 });
  }

  const followUpRef = `${id}:followup:${crypto.randomUUID()}`;
  const isIncluded = userMessageCount < INCLUDED_FOLLOW_UPS;

  if (!isIncluded) {
    const charge = await spend(user.id, tier, FOLLOW_UP_COST, followUpRef);
    if (!charge.ok) {
      return NextResponse.json(
        {
          error: 'You are out of credits for this billing period.',
          code: 'INSUFFICIENT_CREDITS',
          balance: charge.balance,
          cost: FOLLOW_UP_COST,
        },
        { status: 403 },
      );
    }
  }

  // Save user message
  await createFollowUp({ reading_id: id, role: 'user', content: question });

  // Build context
  const spread = getSpread(reading.spread_type);
  const cardsData = typeof reading.cards === 'string' ? JSON.parse(reading.cards) : reading.cards;
  const cards = spread
    ? deserializeDrawnCards(
        cardsData as { cardId: number; reversed: boolean; positionIndex: number }[],
        spread.positions,
      )
    : [];

  // Build extra card context if present
  let extraCardContext = '';
  if (extraCard) {
    const card = getCardById(extraCard.cardId);
    if (card) {
      extraCardContext = buildExtraCardContext({
        card,
        reversed: extraCard.reversed,
        language,
        originalCardIds: cards.map(c => c.card.id),
      });
    }
  }

  const systemPrompt = buildFollowUpPrompt({
    spread: spread!,
    cards,
    interpretation: reading.interpretation || '',
    language,
    extraCardContext,
  });

  // Build conversation history
  const allFollowUps = await getFollowUps(id);

  const messages = allFollowUps.map(f => ({
    role: f.role as 'user' | 'assistant',
    content: f.content,
  }));

  // Stream response. A pre-stream throw means no tokens were generated, so the
  // credit must go back.
  let stream;
  try {
    stream = await streamFollowUp({
      systemPrompt,
      messages,
      tier: tier as 'free' | 'pro' | 'premium',
    });
  } catch (err) {
    if (!isIncluded) await refund(followUpRef);
    console.error('Follow-up generation failed before streaming:', err);
    return NextResponse.json(
      { error: 'The response could not be generated. Your credits have not been used.' },
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

        // Save assistant response
        await createFollowUp({ reading_id: id, role: 'assistant', content: fullText });

        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ done: true, fullText })}\n\n`),
        );
        controller.close();
      } catch (err) {
        if (!isIncluded) await refund(followUpRef);
        console.error('Follow-up stream error:', err);
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: 'Stream error' })}\n\n`),
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
