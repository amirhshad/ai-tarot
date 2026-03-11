import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/client';
import { updateProfileByStripeCustomer, updateProfileByStripeSubscription } from '@/lib/db/queries';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.subscription && session.customer) {
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string,
        );
        const priceId = subscription.items.data[0]?.price.id;
        const tier = getTierFromPriceId(priceId);

        await updateProfileByStripeCustomer(session.customer as string, {
          tier,
          stripe_subscription_id: subscription.id,
        });
      }
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      const priceId = subscription.items.data[0]?.price.id;
      const tier = getTierFromPriceId(priceId);

      await updateProfileByStripeSubscription(subscription.id, { tier });
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      await updateProfileByStripeSubscription(subscription.id, {
        tier: 'free',
        stripe_subscription_id: undefined,
      });
      break;
    }
  }

  return NextResponse.json({ received: true });
}

function getTierFromPriceId(priceId: string): string {
  const proMonthly = process.env.STRIPE_PRO_MONTHLY_PRICE_ID;
  const proYearly = process.env.STRIPE_PRO_YEARLY_PRICE_ID;
  const premiumMonthly = process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID;
  const premiumYearly = process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID;

  if (priceId === proMonthly || priceId === proYearly) return 'pro';
  if (priceId === premiumMonthly || priceId === premiumYearly) return 'premium';
  return 'free';
}
