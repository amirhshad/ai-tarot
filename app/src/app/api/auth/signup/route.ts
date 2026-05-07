import { NextRequest, NextResponse } from 'next/server';
import { signUp, setSessionCookie } from '@/lib/db/auth';
import { sendWelcomeEmail, sendVerificationEmail } from '@/lib/email/client';
import { generateVerificationToken, saveVerificationToken } from '@/lib/db/verification';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();
    const displayName = typeof name === 'string' ? name.trim() || undefined : undefined;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const result = await signUp(email, password, name);

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // Generate and store verification token
    const { token, expiresAt } = generateVerificationToken();
    await saveVerificationToken(result.user.id, token, expiresAt);

    // Fire-and-forget emails
    void sendWelcomeEmail(result.user.email, displayName);
    void sendVerificationEmail(result.user.email, token, displayName);

    await setSessionCookie(result.user);
    return NextResponse.json({ user: result.user });
  } catch (err) {
    console.error('Signup error:', err);
    return NextResponse.json({ error: (err as Error).message || 'Internal error' }, { status: 500 });
  }
}
