import { NextRequest, NextResponse } from 'next/server';
import { signUp, setSessionCookie } from '@/lib/db/auth';

export async function POST(request: NextRequest) {
  const { email, password, name } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
  }

  const result = await signUp(email, password, name);

  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  await setSessionCookie(result.user);
  return NextResponse.json({ user: result.user });
}
