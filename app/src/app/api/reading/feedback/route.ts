import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/db/auth';
import { submitReadingFeedback, submitAnonymousFeedback } from '@/lib/db/queries';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { readingId, helpful } = body as { readingId?: string; helpful: boolean };

  if (typeof helpful !== 'boolean') {
    return NextResponse.json({ error: 'helpful must be a boolean' }, { status: 400 });
  }

  // Authenticated reading feedback
  if (readingId) {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await submitReadingFeedback(readingId, helpful);
    return NextResponse.json({ ok: true });
  }

  // Anonymous (free reading) feedback
  await submitAnonymousFeedback(helpful);
  return NextResponse.json({ ok: true });
}
