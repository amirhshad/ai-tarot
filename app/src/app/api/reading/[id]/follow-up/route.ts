import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/db/auth';
import { getProfile, getReading, getFollowUps, countUserFollowUps, createFollowUp } from '@/lib/db/queries';
import { getSpread } from '@/lib/tarot/spreads';
import { deserializeDrawnCards } from '@/lib/tarot/shuffle';
import { buildFollowUpPrompt, buildExtraCardContext } from '@/lib/ai/prompts';
import { streamFollowUp } from '@/lib/ai/client';
import { spend, refund, claimIncluded } from '@/lib/credits/ledger';
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

  // The included-slot check is a claim, not a read: the slot ref is
  // deterministic per slot index so that concurrent requests for the same
  // slot collide on the same ledger row, and the partial unique index on
  // ref_id lets exactly one of them win. A request that loses the race (or
  // has already used up its included slots) falls through to the paid path
  // below like any other follow-up.
  const includedSlotRef = `${id}:included:${userMessageCount}`;
  const isIncluded =
    userMessageCount < INCLUDED_FOLLOW_UPS &&
    (await claimIncluded(user.id, tier, includedSlotRef));

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

  // Everything from here through the start of streaming can throw (a DB write
  // failure saving the user's message or reading back the conversation history,
  // an outage or our own credit balance running out in the Anthropic call), and
  // none of it produced a single token — the credit must go back.
  let stream;
  try {
    // Save user message
    await createFollowUp({ reading_id: id, role: 'user', content: question });

    // Build conversation history (includes the message just saved above)
    const allFollowUps = await getFollowUps(id);
    const messages = allFollowUps.map(f => ({
      role: f.role as 'user' | 'assistant',
      content: f.content,
    }));

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
