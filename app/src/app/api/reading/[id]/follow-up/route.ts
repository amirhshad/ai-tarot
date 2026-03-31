import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/db/auth';
import { getProfile, getReading, getFollowUps, countUserFollowUps, createFollowUp } from '@/lib/db/queries';
import { getSpread } from '@/lib/tarot/spreads';
import { deserializeDrawnCards } from '@/lib/tarot/shuffle';
import { buildFollowUpPrompt, buildExtraCardContext } from '@/lib/ai/prompts';
import { streamFollowUp } from '@/lib/ai/client';
import { getFollowUpLimit } from '@/lib/stripe/config';
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
  const language = (profile?.language || 'en') as 'en' | 'fa';

  // Check follow-up limit
  const userMessageCount = await countUserFollowUps(id);
  const limit = getFollowUpLimit(tier);

  if (userMessageCount >= limit) {
    return NextResponse.json(
      { error: limit === 0 ? 'Follow-up questions require Pro subscription.' : 'Follow-up limit reached for this reading.' },
      { status: 403 },
    );
  }

  const body = await request.json();
  const { question, extraCard } = body as {
    question: string;
    extraCard?: { cardId: number; reversed: boolean };
  };

  if (!question?.trim()) {
    return NextResponse.json({ error: 'Question is required' }, { status: 400 });
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

  // Stream response
  const stream = await streamFollowUp({
    systemPrompt,
    messages,
    tier: tier as 'free' | 'pro' | 'premium',
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

        // Save assistant response
        await createFollowUp({ reading_id: id, role: 'assistant', content: fullText });

        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ done: true, fullText })}\n\n`),
        );
        controller.close();
      } catch {
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
