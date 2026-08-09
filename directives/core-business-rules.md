# Core Business Rules

> **Paid subscriptions are currently disabled.** `PAYMENTS_ENABLED` in
> `app/src/lib/config/features.ts` is `false`, so no one can buy a plan — see
> [Subscription Management](#subscription-management). Tier logic below is still
> live and correct; paid tiers are granted manually. Flip the flag to `true` to
> restore paid signups, at which point every rule here applies as written.

## Pricing & Model Selection

| Tier | Price | AI Model | Interpretation Style |
|------|-------|----------|---------------------|
| Free | $0 | Claude Haiku 4.5 | Short summary (~150-300 words) |
| Pro | $7.99/mo (not for sale) | Claude Sonnet 5 | Deep narrative (~400-700 words) |
| Premium | $14.99/mo (not for sale) | Claude Sonnet 5 | Deep narrative + custom spreads |

Prices are the configured amounts, retained for when payments are re-enabled. Nothing can be purchased today.

**Model selection is server-side only.** The client sends the reading request; the server checks the user's tier from the `profiles` table and selects the model. Never trust client-provided model preferences.

## Rate Limits (Free Tier)

- 1 single-card reading per day
- 1 three-card reading per day
- Celtic Cross and Horseshoe are members-only (`pro` / `premium`), limit 0 on free
- Tracked in the `usage` table, one row per user per day
- Reset logic: counters reset at 00:00 UTC

**On the `usage.week_start` column.** It holds a `YYYY-MM-DD` day key, not a week
start — the name is legacy. Quota periods were weekly until Aug 2026, which meant
`singlePerDay: 1` was really enforcing one reading per *week*. The period key in
`checkQuota` is now the UTC day; the column was left alone to avoid a migration,
and stale weekly rows are simply never matched again. Rename it only alongside a
real migration.

Limits live in `PLANS[tier].limits` in `app/src/lib/stripe/config.ts` and are read
by `app/src/lib/utils/quota.ts`. That file is the source of truth for entitlements,
not just prices — it stays even if Stripe is removed entirely.

## Follow-up Limits

| Tier | Follow-ups per Reading |
|------|----------------------|
| Free | 0 |
| Pro | 5 |
| Premium | 10 |

Follow-ups are counted per reading, not per day. Each follow-up retains full context (original cards, interpretation, and all prior messages).

## Language Access

| Tier | Languages |
|------|-----------|
| Free | English only |
| Pro | English + Farsi |
| Premium | English + Farsi + Arabic |

## Reading History

| Tier | History Access |
|------|---------------|
| Free | Last 5 readings |
| Pro | Full history + search |
| Premium | Full history + search + trend analysis |

## Subscription Management

**Status: disabled (Aug 2026).** `PAYMENTS_ENABLED` in
`app/src/lib/config/features.ts` is `false`. The owner's own subscription was
cancelled in the Stripe Dashboard; there are no other subscribers.

### Granting a paid tier today

Set `profiles.tier` to `'pro'` or `'premium'` directly in Turso. That single write
grants Sonnet 5, all spreads, and follow-ups immediately — the app reads tier from
the database and never asks Stripe on the read path. No Stripe customer or
subscription record is required.

### What the flag turns off

- `/api/stripe/checkout` returns 503 before a Checkout session is created
- Pricing table, upgrade CTAs, and the `/billing` nav link for free users
- "Upgrade to Pro" wording in quota and follow-up messages

### What stays live regardless

- The webhook (`/api/stripe/webhook`) — still verifies signatures and still writes
  tier, so any lingering Stripe event lands correctly. **Note:** a
  `customer.subscription.deleted` event will set that user's tier to `'free'`,
  including the owner's. Re-grant manually if that happens.
- The customer portal (`/api/stripe/portal`), reachable by anyone whose tier is
  already paid
- `stripe_customer_id` / `stripe_subscription_id` columns and all tier logic

### Rules that apply when payments are re-enabled

- Payments via Stripe Billing (checkout sessions, customer portal)
- Webhook events update the `profiles` table tier field
- On downgrade: access to paid features stops at period end, not immediately
- On cancellation: revert to free tier at period end
- Prefer Stripe's hosted checkout and portal — minimize custom payment UI

### Before re-enabling

Confirm `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and the four price-ID env
vars are still set in Vercel, and that the webhook endpoint still exists in the
Stripe Dashboard. `lib/stripe/client.ts` throws if the secret key is missing.
