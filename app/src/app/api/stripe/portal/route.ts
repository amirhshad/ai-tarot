import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/db/auth';
import { getProfile } from '@/lib/db/queries';
import { createPortalSession } from '@/lib/stripe/helpers';

export async function POST(request: NextRequest) {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const profile = await getProfile(user.id);

  if (!profile?.stripe_customer_id) {
    return NextResponse.json({ error: 'No billing account found' }, { status: 404 });
  }

  const origin = request.headers.get('origin') || '';
  const session = await createPortalSession({
    customerId: profile.stripe_customer_id,
    returnUrl: `${origin}/billing`,
  });

  return NextResponse.json({ url: session.url });
}
