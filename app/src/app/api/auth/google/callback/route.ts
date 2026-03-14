import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { setSessionCookie } from '@/lib/db/auth';
import { findOrCreateGoogleUser } from '@/lib/db/oauth';
import { sendWelcomeEmail } from '@/lib/email/client';

function signState(data: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(data).digest('hex').slice(0, 16);
}

/** Decode URL-safe base64 (handles both base64url and standard base64) */
function fromBase64Url(str: string): string {
  return Buffer.from(str, 'base64url').toString('utf8');
}

function resolveBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const stateParam = request.nextUrl.searchParams.get('state');
  const error = request.nextUrl.searchParams.get('error');

  const baseUrl = resolveBaseUrl();

  if (error || !code || !stateParam) {
    console.error('OAuth callback missing params:', { error, hasCode: !!code, hasState: !!stateParam });
    return NextResponse.redirect(`${baseUrl}/login?error=oauth_failed`);
  }

  // Validate HMAC-signed state (stateless — no cookie needed)
  // State is base64url-encoded JSON: {nonce, redirect, sig}
  let redirect = '/dashboard';
  try {
    const state = JSON.parse(fromBase64Url(stateParam)) as { nonce: string; redirect: string; sig: string };
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return NextResponse.redirect(`${baseUrl}/login?error=server_misconfigured`);
    }
    const expectedSig = signState(`${state.nonce}:${state.redirect}`, secret);

    if (state.sig !== expectedSig) {
      console.error('OAuth state HMAC mismatch:', { expected: expectedSig, received: state.sig });
      return NextResponse.redirect(`${baseUrl}/login?error=oauth_invalid_state`);
    }

    redirect = state.redirect || '/dashboard';
  } catch (err) {
    console.error('OAuth state decode failed:', err, { stateParam: stateParam.substring(0, 50) });
    return NextResponse.redirect(`${baseUrl}/login?error=oauth_invalid_state`);
  }

  // Exchange code for tokens
  const redirectUri = `${baseUrl}/api/auth/google/callback`;
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  if (!tokenRes.ok) {
    console.error('Google token exchange failed:', await tokenRes.text());
    return NextResponse.redirect(`${baseUrl}/login?error=oauth_token_failed`);
  }

  const tokens = await tokenRes.json();
  const idToken = tokens.id_token as string;

  // Decode the ID token to get user info (signature verified by Google during exchange)
  // JWT segments use base64url encoding (not standard base64)
  let email: string;
  let name: string | undefined;
  let googleId: string;

  try {
    const payload = JSON.parse(Buffer.from(idToken.split('.')[1], 'base64url').toString('utf8'));
    email = payload.email;
    name = payload.name;
    googleId = payload.sub;

    if (!email || !googleId) {
      throw new Error('Missing email or sub in ID token');
    }
  } catch (err) {
    console.error('Failed to decode Google ID token:', err);
    return NextResponse.redirect(`${baseUrl}/login?error=oauth_decode_failed`);
  }

  // Find or create user
  const user = await findOrCreateGoogleUser(email, googleId, name);

  // Set session cookie
  await setSessionCookie(user);

  // Send welcome email for new users (fire-and-forget)
  void sendWelcomeEmail(user.email, name);

  return NextResponse.redirect(`${baseUrl}${redirect}`);
}
