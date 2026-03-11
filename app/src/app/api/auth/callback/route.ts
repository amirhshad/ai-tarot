import { NextResponse } from 'next/server';

// OAuth callback — not used with local SQLite auth.
// Kept as a redirect stub for future Supabase migration.
export async function GET(request: Request) {
  const { origin } = new URL(request.url);
  return NextResponse.redirect(`${origin}/dashboard`);
}
