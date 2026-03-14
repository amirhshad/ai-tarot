import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

function signState(data: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(data).digest('hex').slice(0, 16);
}

/** Encode to URL-safe base64 (no +, /, or = characters) */
function toBase64Url(str: string): string {
  return Buffer.from(str, 'utf8').toString('base64url');
}

function resolveBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
}

export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json({ error: 'Google OAuth not configured' }, { status: 500 });
  }

  const baseUrl = resolveBaseUrl();
  const redirectUri = `${baseUrl}/api/auth/google/callback`;

  // Get the redirect destination from query params
  const redirect = request.nextUrl.searchParams.get('redirect') || '/dashboard';

  // Create HMAC-signed state (stateless — no cookie needed)
  // Uses base64url encoding to avoid +, /, = chars that break in URL query strings
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
  }
  const nonce = crypto.randomUUID();
  const sig = signState(`${nonce}:${redirect}`, secret);
  const state = toBase64Url(JSON.stringify({ nonce, redirect, sig }));

  const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  googleAuthUrl.searchParams.set('client_id', clientId);
  googleAuthUrl.searchParams.set('redirect_uri', redirectUri);
  googleAuthUrl.searchParams.set('response_type', 'code');
  googleAuthUrl.searchParams.set('scope', 'openid email profile');
  googleAuthUrl.searchParams.set('state', state);
  googleAuthUrl.searchParams.set('prompt', 'select_account');

  return NextResponse.redirect(googleAuthUrl.toString());
}
