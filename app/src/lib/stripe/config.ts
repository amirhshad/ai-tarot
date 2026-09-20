import { TIER_GRANTS } from '@/lib/credits/config';

/**
 * Plans.
 *
 * Prices are retained for when payments are re-enabled — nothing is for sale
 * today (see PAYMENTS_ENABLED). Entitlements are credits: see
 * `lib/credits/config.ts` for costs and `lib/credits/ledger.ts` for the store.
 */
export const PLANS = {
  free: {
    name: 'Free',
    monthlyPrice: 0,
    monthlyPriceId: null,
    yearlyPriceId: null,
    credits: TIER_GRANTS.free,
    period: 'day' as const,
  },
  pro: {
    name: 'Pro',
    monthlyPrice: 899, // cents
    monthlyPriceId: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || '',
    yearlyPriceId: process.env.STRIPE_PRO_YEARLY_PRICE_ID || '',
    credits: TIER_GRANTS.pro,
    period: 'month' as const,
  },
  premium: {
    name: 'Premium',
    monthlyPrice: 1999, // cents
    monthlyPriceId: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID || '',
    yearlyPriceId: process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID || '',
    credits: TIER_GRANTS.premium,
    period: 'month' as const,
  },
} as const;

export type PlanName = keyof typeof PLANS;

export function getPlan(tier: string) {
  return PLANS[tier as PlanName] || PLANS.free;
}
