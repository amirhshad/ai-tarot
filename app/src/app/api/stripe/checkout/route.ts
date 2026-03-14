import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/db/auth';
import { getProfile, updateProfile } from '@/lib/db/queries';
import { createCheckoutSession, getOrCreateCustomer } from '@/lib/stripe/helpers';
import { PLANS, PlanName } from '@/lib/stripe/config';

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan, interval } = await request.json() as {
      plan: 'pro' | 'premium';
      interval: 'monthly' | 'yearly';
    };

    const planConfig = PLANS[plan as PlanName];
    if (!planConfig) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const priceId = interval === 'yearly' ? planConfig.yearlyPriceId : planConfig.monthlyPriceId;
    if (!priceId) {
      return NextResponse.json({ error: 'Pricing not configured' }, { status: 500 });
    }

    // Get or create Stripe customer
    const profile = await getProfile(user.id);

    const customerId = await getOrCreateCustomer({
      email: user.email!,
      userId: user.id,
      existingCustomerId: profile?.stripe_customer_id || undefined,
    });

    // Save customer ID if new
    if (!profile?.stripe_customer_id) {
      await updateProfile(user.id, { stripe_customer_id: customerId });
    }

    const origin = request.headers.get('origin') || '';
    const session = await createCheckoutSession({
      customerId,
      priceId,
      successUrl: `${origin}/dashboard?upgraded=true`,
      cancelUrl: `${origin}/billing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    console.error('Stripe checkout error:', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
