import { NextRequest, NextResponse } from 'next/server';
import { addToWaitlist } from '@/lib/db/queries';

export async function POST(request: NextRequest) {
  const { email } = await request.json();

  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  await addToWaitlist(email);

  return NextResponse.json({ success: true });
}
