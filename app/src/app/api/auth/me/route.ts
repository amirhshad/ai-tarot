import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/db/auth';
import { getProfile } from '@/lib/db/queries';

export async function GET() {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ user: null, profile: null });
  }

  const profile = await getProfile(user.id);

  return NextResponse.json({
    user: { id: user.id, email: user.email },
    profile: profile ? {
      display_name: profile.display_name,
      language: profile.language,
      tier: profile.tier,
    } : null,
  });
}
