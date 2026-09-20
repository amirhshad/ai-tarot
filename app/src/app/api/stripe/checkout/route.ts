import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/db/auth';
import { getProfile, updateProfile } from '@/lib/db/queries';
import { createCheckoutSession, getOrCreateCustomer } from '@/lib/stripe/helpers';
import { PLANS, PlanName } from '@/lib/stripe/config';
import { PAYMENTS_ENABLED } from '@/lib/config/features';

export async function POST(request: NextRequest) {
  try {
    if (!PAYMENTS_ENABLED) {
      return NextResponse.json(
        { error: 'Subscriptions are not available at the moment.' },
        { status: 503 },
      );
    }

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

    // PAYMENTS_ENABLED can be on before Stripe itself is wired up — the pricing
    // table goes live first so we can measure intent. Until the secret key and
    // price IDs are set in Vercel, say so plainly rather than failing with a 500
    // (or, worse, leaking "STRIPE_SECRET_KEY is not set" from the catch below).
    if (!priceId || !process.env.STRIPE_SECRET_KEY?.trim()) {
      console.warn('Checkout attempted before Stripe was configured', { plan, interval });
      return NextResponse.json(
        {
          error: 'Card payments are opening shortly. Your interest has been noted — check back soon.',
          code: 'PAYMENTS_NOT_YET_CONFIGURED',
        },
        { status: 503 },
      );
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
    // Log the real error; never return it. Stripe failures carry internal
    // detail (including config state) that should not reach the browser.
    console.error('Stripe checkout error:', err);
    return NextResponse.json(
      { error: 'We could not start checkout. Please try again shortly.' },
      { status: 500 },
    );
  }
}
