import { NextRequest, NextResponse } from 'next/server';
import { getSpread } from '@/lib/tarot/spreads';
import { SpreadType } from '@/lib/tarot/types';
import { deserializeDrawnCards } from '@/lib/tarot/shuffle';
import { buildInterpretationPrompt, buildQuestionMessage, ReadingTopic } from '@/lib/ai/prompts';
import { streamInterpretation } from '@/lib/ai/client';
import { getClientIp, checkFreeReadingLimit, recordFreeReading } from '@/lib/utils/rate-limit';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { cards: cardData, question, topic: rawTopic } = body as {
    cards: { cardId: number; reversed: boolean; positionIndex: number }[];
    question?: string;
    topic?: string;
  };

  const validTopics = ['love', 'yes-or-no', 'career'];
  const topic: ReadingTopic = rawTopic && validTopics.includes(rawTopic) ? rawTopic as ReadingTopic : null;

  // Validate question length
  if (question && question.length > 500) {
    return NextResponse.json({ error: 'Question is too long (max 500 characters)' }, { status: 400 });
  }

  // Rate limit by IP
  const ip = getClientIp(request);
  const rateLimit = await checkFreeReadingLimit(ip);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: `You've reached the free reading limit. Try again in ${rateLimit.retryAfterMinutes} minutes, or sign up for unlimited readings.` },
      { status: 429 },
    );
  }

  const spreadType: SpreadType = 'three-card';
  const spread = getSpread(spreadType);
  if (!spread) {
    return NextResponse.json({ error: 'Invalid spread type' }, { status: 400 });
  }

  if (cardData.length !== spread.cardCount) {
    return NextResponse.json({ error: 'Invalid card count' }, { status: 400 });
  }

  const drawnCards = deserializeDrawnCards(cardData, spread.positions);

  const { systemPrompt, userMessage } = buildInterpretationPrompt({
    spread,
    cards: drawnCards,
    language: 'en',
    tier: 'free',
    topic,
  });

  const questionSuffix = buildQuestionMessage({ question, language: 'en' });

  const stream = await streamInterpretation({
    systemPrompt,
    userMessage: userMessage + questionSuffix,
    tier: 'free',
  });

  // Record rate limit entry after successful stream start
  await recordFreeReading(ip);

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

        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ done: true, fullText })}\n\n`,
          ),
        );
        controller.close();
      } catch (err) {
        console.error('Anonymous reading stream error:', err);
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
