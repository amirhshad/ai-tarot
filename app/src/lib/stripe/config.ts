export const PLANS = {
  free: {
    name: 'Free',
    monthlyPrice: 0,
    monthlyPriceId: null,
    yearlyPriceId: null,
    limits: {
      singlePerDay: 1,
      threeCardPerWeek: 1,
      celticCrossPerWeek: 0,
      followUpsPerReading: 0,
    },
  },
  pro: {
    name: 'Pro',
    monthlyPrice: 799, // cents
    monthlyPriceId: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || '',
    yearlyPriceId: process.env.STRIPE_PRO_YEARLY_PRICE_ID || '',
    limits: {
      singlePerDay: Infinity,
      threeCardPerWeek: Infinity,
      celticCrossPerWeek: Infinity,
      followUpsPerReading: 5,
    },
  },
  premium: {
    name: 'Premium',
    monthlyPrice: 1499, // cents
    monthlyPriceId: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID || '',
    yearlyPriceId: process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID || '',
    limits: {
      singlePerDay: Infinity,
      threeCardPerWeek: Infinity,
      celticCrossPerWeek: Infinity,
      followUpsPerReading: 10,
    },
  },
} as const;

export type PlanName = keyof typeof PLANS;

export function getPlan(tier: string) {
  return PLANS[tier as PlanName] || PLANS.free;
}

export function getFollowUpLimit(tier: string): number {
  return getPlan(tier).limits.followUpsPerReading;
}
