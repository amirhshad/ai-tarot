# Core Business Rules

> **The pricing UI is live; Stripe is not yet wired up.** `PAYMENTS_ENABLED` in
> `app/src/lib/config/features.ts` is `true`, so the pricing table and upgrade
> CTAs are public and clicks are recorded as `upgrade_clicked` in PostHog. But
> until `STRIPE_SECRET_KEY` and the four price-ID env vars are set in Vercel,
> `/api/stripe/checkout` answers `503 PAYMENTS_NOT_YET_CONFIGURED` with an
> "opening shortly" message. Nobody can complete a purchase yet; paid tiers are
> still granted manually. Setting those env vars completes the funnel with no
> code change — see [Subscription Management](#subscription-management).

## Pricing & Model Selection

| Tier | Price | Credits | AI Model | Interpretation Style |
|------|-------|---------|----------|---------------------|
| Free | $0 | 3 / day | Claude Haiku 4.5 | Short summary (~150-300 words) |
| Pro | $8.99/mo | 120 / month | Claude Sonnet 5 | Deep narrative (~400-700 words) |
| Premium | $19.99/mo | 350 / month | Claude Sonnet 5 | Deep narrative + custom spreads |

These prices are set against measured worst-case (Farsi) token cost: Pro lands
near 64% gross margin at full usage, Premium near 75%. The earlier $7.99 /
$14.99 left Premium with no headroom for the Farsi multiplier. Changing a price
means changing `monthlyPrice` in `lib/stripe/config.ts`, the display strings in
`components/billing/PricingTable.tsx` and `components/reading/FollowUpChat.tsx`,
and the `Offer` JSON-LD in `app/[locale]/layout.tsx` — all four, or the site
contradicts itself.

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

**Status: UI live, checkout not yet connected (Sep 2026).** `PAYMENTS_ENABLED`
is `true`, so the pricing table and upgrade CTAs are public, but no Stripe
credentials are set — every checkout attempt answers `503
PAYMENTS_NOT_YET_CONFIGURED`. There are no subscribers, and nobody can become
one until the env vars below are set. The flag was turned on ahead of Stripe
deliberately, to measure how many people click through to pay.

### Granting a paid tier today

Set `profiles.tier` to `'pro'` or `'premium'` directly in Turso. That single write
grants Sonnet 5, all spreads, and follow-ups immediately — the app reads tier from
the database and never asks Stripe on the read path. No Stripe customer or
subscription record is required.

### What the flag controls

When `false` it hides all of this; it is currently `true`, so all of it is live:

- `/api/stripe/checkout` accepting requests at all (when `false` it 503s immediately)
- Pricing table, upgrade CTAs, and the `/billing` nav link for free users
- "Upgrade to Pro" wording in quota and follow-up messages

**The flag does not gate the credit system.** Credits are enforced on every
reading and follow-up regardless of its value — see [Credits](#credits).

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
