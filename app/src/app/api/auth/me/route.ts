import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/db/auth';
import { getProfile } from '@/lib/db/queries';
import { getBalance } from '@/lib/credits/ledger';
import { grantFor } from '@/lib/credits/config';

export async function GET() {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ user: null, profile: null, credits: null });
  }

  const profile = await getProfile(user.id);
  const tier = profile?.tier || 'free';

  return NextResponse.json({
    user: { id: user.id, email: user.email },
    profile: profile ? {
      display_name: profile.display_name,
      language: profile.language,
      tier: profile.tier,
    } : null,
    // getBalance() reaches ensureGrant's INSERT into credit_ledger, whose
    // user_id has an enforced FK to profiles(id) — calling it without a
    // profile row throws. Only compute a balance when a profile exists.
    credits: profile ? {
      balance: await getBalance(user.id, tier),
      grant: grantFor(tier),
    } : null,
  });
}
