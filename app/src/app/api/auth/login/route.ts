import { NextRequest, NextResponse } from 'next/server';
import { signIn, setSessionCookie } from '@/lib/db/auth';

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
  }

  const result = await signIn(email, password);

  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: 401 });
  }

  await setSessionCookie(result.user);
  return NextResponse.json({ user: result.user });
}
