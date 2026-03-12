import { NextRequest, NextResponse } from 'next/server';
import { getSpread } from '@/lib/tarot/spreads';
import { SpreadType } from '@/lib/tarot/types';
import { deserializeDrawnCards } from '@/lib/tarot/shuffle';
import { buildInterpretationPrompt, buildQuestionMessage } from '@/lib/ai/prompts';
import { streamInterpretation } from '@/lib/ai/client';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { cards: cardData, question } = body as {
    cards: { cardId: number; reversed: boolean; positionIndex: number }[];
    question?: string;
  };

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
  });

  const questionSuffix = buildQuestionMessage({ question, language: 'en' });

  const stream = await streamInterpretation({
    systemPrompt,
    userMessage: userMessage + questionSuffix,
    tier: 'free',
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
