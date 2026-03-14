import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/db/auth';
import { createReading, updateReadingInterpretation } from '@/lib/db/queries';

export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const body = await request.json();
  const { spreadType, cards, question, interpretation } = body as {
    spreadType: string;
    cards: { cardId: number; reversed: boolean; positionIndex: number }[];
    question?: string | null;
    interpretation: string;
  };

  if (!spreadType || !cards || !interpretation) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const readingId = await createReading({
    user_id: user.id,
    spread_type: spreadType,
    question: question || undefined,
    cards,
    model_used: 'claude-haiku-4-5-20251001',
    language: 'en',
  });

  await updateReadingInterpretation(readingId, interpretation);

  return NextResponse.json({ readingId });
}
