import { SpreadType } from '@/lib/tarot/types';

/**
 * Credit costs and grants.
 *
 * Costs are set against measured worst-case (Farsi) token cost per action —
 * see docs/superpowers/specs/2026-09-12-credit-ledger-design.md. Changing a
 * number here changes the unit economics of every tier, so change them
 * together with the margin table in that spec.
 */
export const SPREAD_COSTS: Record<SpreadType, number> = {
  'single': 1,
  'three-card': 2,
  'horseshoe': 3,
  'celtic-cross': 5,
};

/** Cost of a follow-up once the included ones are used up. */
export const FOLLOW_UP_COST = 1;

/**
 * Follow-ups included with every reading, free of credits. Paid tiers only —
 * the free tier gets none, which is the clearest upgrade lever we have.
 */
export const INCLUDED_FOLLOW_UPS = 2;

export const TIER_GRANTS: Record<string, number> = {
  free: 3,       // one single + one three-card, or one horseshoe, per day
  pro: 120,
  premium: 350,
};

/** Credits granted per period. Unknown tiers fall back to free, matching getPlan(). */
export function grantFor(tier: string): number {
  return TIER_GRANTS[tier] ?? TIER_GRANTS.free;
}

/**
 * The period a spend belongs to.
 *
 * Free users are metered daily so the product keeps its come-back-tomorrow
 * rhythm; paid users monthly. The `d:` / `m:` prefix makes the period type
 * self-describing in the data and stops a daily key colliding with a monthly
 * one when a user changes tier mid-period.
 */
export function periodKeyFor(tier: string, now: Date = new Date()): string {
  const iso = now.toISOString();
  return tier === 'free' ? `d:${iso.slice(0, 10)}` : `m:${iso.slice(0, 7)}`;
}
