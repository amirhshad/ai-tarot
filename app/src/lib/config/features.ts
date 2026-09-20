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
 * **Currently true, ahead of Stripe being wired up.** The pricing table and
 * upgrade CTAs are live so we can measure how many people click through to pay
 * (`upgrade_clicked` in PostHog). Until STRIPE_SECRET_KEY and the four price-ID
 * env vars are set in Vercel, /api/stripe/checkout answers 503 with
 * PAYMENTS_NOT_YET_CONFIGURED — a deliberate "opening shortly" message, not a
 * failure. Set those env vars to complete the funnel; no code change needed.
 *
 * Flip to false to hide paid signups again.
 */
export const PAYMENTS_ENABLED = true;
