/**
 * Feature flags.
 *
 * PAYMENTS_ENABLED — master switch for Stripe checkout and all upgrade UI.
 *
 * While false:
 *   - /api/stripe/checkout returns 503 and no Checkout session is created
 *   - the pricing table, /billing nav link, and upgrade CTAs are hidden
 *   - quota messages drop "Upgrade to Pro" wording (there is nothing to upgrade to)
 *
 * Everything downstream of `profiles.tier` is untouched — pro/premium tiers still
 * grant Sonnet 5, unlimited spreads, and follow-ups. Grant them by setting
 * `profiles.tier` directly in Turso. The Stripe webhook stays live so existing
 * subscriptions keep syncing.
 *
 * Flip to true to restore paid signups.
 */
export const PAYMENTS_ENABLED = false;
