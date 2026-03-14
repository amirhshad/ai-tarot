import { NextRequest, NextResponse } from 'next/server';
import { signUp, setSessionCookie } from '@/lib/db/auth';
import { sendWelcomeEmail } from '@/lib/email/client';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const result = await signUp(email, password, name);

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    await setSessionCookie(result.user);
    void sendWelcomeEmail(result.user.email, name);
    return NextResponse.json({ user: result.user });
  } catch (err) {
    console.error('Signup error:', err);
    return NextResponse.json({ error: (err as Error).message || 'Internal error' }, { status: 500 });
  }
}
