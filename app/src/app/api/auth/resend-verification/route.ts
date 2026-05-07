import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/db/auth';
import { getProfile } from '@/lib/db/queries';
import {
  generateVerificationToken,
  saveVerificationToken,
  getVerificationTokenExpiresAt,
} from '@/lib/db/verification';
import { sendVerificationEmail } from '@/lib/email/client';

export async function POST(_request: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const profile = await getProfile(user.id);
  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  if (profile.email_verified === 1) {
    return NextResponse.json({ error: 'Email already verified' }, { status: 400 });
  }

  // Rate limit: 1 resend per 60 seconds
  const lastExpiresAt = await getVerificationTokenExpiresAt(user.id);
  if (lastExpiresAt) {
    const lastIssued = new Date(lastExpiresAt).getTime() - 24 * 60 * 60 * 1000;
    const secondsSinceIssued = (Date.now() - lastIssued) / 1000;
    if (secondsSinceIssued < 60) {
      return NextResponse.json(
        { error: 'Please wait before requesting another email', retryAfter: Math.ceil(60 - secondsSinceIssued) },
        { status: 429 },
      );
    }
  }

  const { token, expiresAt } = generateVerificationToken();
  await saveVerificationToken(user.id, token, expiresAt);
  void sendVerificationEmail(user.email, token, profile.display_name ?? undefined);

  return NextResponse.json({ ok: true });
}
