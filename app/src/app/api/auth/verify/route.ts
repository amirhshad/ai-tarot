import { NextRequest, NextResponse } from 'next/server';
import { findProfileByVerificationToken, markEmailVerified } from '@/lib/db/verification';

function resolveBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL;
  return 'http://localhost:3000';
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  const baseUrl = resolveBaseUrl();

  if (!token) {
    return NextResponse.redirect(`${baseUrl}/dashboard?verified=error`);
  }

  const profile = await findProfileByVerificationToken(token);

  if (!profile) {
    return NextResponse.redirect(`${baseUrl}/dashboard?verified=invalid`);
  }

  const expiresAtMs = profile.verification_token_expires_at
    ? new Date(profile.verification_token_expires_at).getTime()
    : NaN;
  const expired = Number.isNaN(expiresAtMs) || expiresAtMs < Date.now();
  if (expired) {
    return NextResponse.redirect(`${baseUrl}/dashboard?verified=expired`);
  }

  await markEmailVerified(profile.id);

  return NextResponse.redirect(`${baseUrl}/dashboard?verified=true`);
}
