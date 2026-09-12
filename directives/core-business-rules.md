# Core Business Rules

> **Paid subscriptions are currently disabled.** `PAYMENTS_ENABLED` in
> `app/src/lib/config/features.ts` is `false`, so no one can buy a plan — see
> [Subscription Management](#subscription-management). Tier logic below is still
> live and correct; paid tiers are granted manually. Flip the flag to `true` to
> restore paid signups, at which point every rule here applies as written.

## Pricing & Model Selection

| Tier | Price | Credits | AI Model | Interpretation Style |
|------|-------|---------|----------|---------------------|
| Free | $0 | 3 / day | Claude Haiku 4.5 | Short summary (~150-300 words) |
| Pro | $7.99/mo (not for sale) | 120 / month | Claude Sonnet 5 | Deep narrative (~400-700 words) |
| Premium | $14.99/mo (not for sale) | 350 / month | Claude Sonnet 5 | Deep narrative + custom spreads |

Prices are the configured amounts, retained for when payments are re-enabled.
Nothing can be purchased today. The intended repricing ($8.99 / $19.99) is
recorded in `docs/superpowers/specs/2026-09-12-credit-ledger-design.md` and
applies only when Stripe is switched back on.

**Model selection is server-side only.** The client sends the reading request;
the server checks the user's tier from the `profiles` table and selects the
model. Never trust client-provided model preferences.

## Credits

Entitlements are credits, not per-spread daily counters.

| Action | Credits |
|--------|---------|
| Single card | 1 |
| Three-card | 2 |
| Horseshoe | 3 |
| Celtic Cross | 5 |
| Follow-up beyond the first 2 of a reading | 1 |

- Costs live in `app/src/lib/credits/config.ts`; the store is
  `app/src/lib/credits/ledger.ts`. Those two files are the source of truth.
- Free users get 3 credits per UTC day; paid users a monthly allowance keyed to
  the calendar month. **Credits do not roll over.**
- Grants are lazy — the first request of a new period inserts its own grant row.
  There is no cron job.
- Celtic Cross is paid-tier-only, enforced by an explicit server-side check in
  `app/src/app/api/reading/route.ts` (not just by its 5-credit cost outstripping
  the 3-credit free daily grant — a future grant increase or credit pack must
  not silently unlock it). Horseshoe is reachable on free: free readings are
  capped at 150-200 words by `getMaxTokens` regardless of spread, so it costs
  the same as a single card.
- **Credits do not bound every reading.** `/api/reading/free` is unauthenticated
  and never touches the credit ledger — anonymous readings sit outside the
  credit system entirely. They are bounded instead by the per-IP and global
  rate limits in `app/src/lib/utils/rate-limit.ts`. Do not read this section as
  a guarantee that every reading's cost is capped by credits.
- Every reading includes 2 free follow-ups on paid tiers. **Free tier gets
  none.**
- A failed generation is refunded automatically, keyed on the reading id.

**The `usage` table is dead.** It is left in place to avoid a migration, but
nothing reads or writes it. Do not add to it.

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
