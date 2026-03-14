import Stripe from 'stripe';

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }
  return new Stripe(key, {
    apiVersion: '2026-02-25.clover',
    typescript: true,
    httpClient: Stripe.createFetchHttpClient(),
  });
}

// For backward compatibility — lazily creates a new instance per call
export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    return (getStripe() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
