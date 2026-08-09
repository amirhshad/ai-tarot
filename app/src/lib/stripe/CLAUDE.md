# Stripe / Billing — Local Rules

> **Payments are currently disabled.** `PAYMENTS_ENABLED` in
> `../config/features.ts` is `false`. `/api/stripe/checkout` returns 503 before
> reaching any code in this directory. The webhook and portal are still live, and
> every rule below still applies — assume this code can run.

## Before editing files here, read:
- `directives/core-business-rules.md` — Pricing tiers, subscription logic
- `docs/product-spec.md` — Full feature matrix

## Rules

0. **`config.ts` is not just Stripe.** `PLANS[tier].limits` is the source of truth
   for entitlements — quota checks and follow-up limits both read it, and they run
   for every user whether or not payments are on. Changing a limit here changes
   what free users can do. Don't delete this file if Stripe is ever removed; move it.

1. **Never expose secret keys.** Stripe secret key (`sk_live_*`, `sk_test_*`) must stay in server-side environment variables only. Never log, return in API responses, or include in client bundles.

2. **Always verify webhook signatures.** Every webhook handler must verify `stripe-signature` header using `stripe.webhooks.constructEvent()`. Never process unverified webhook payloads.

3. **Prefer Stripe-hosted UI.** Use Stripe Checkout for payments and Stripe Customer Portal for subscription management. Minimize custom payment UI to reduce PCI scope.

4. **Tier changes are webhook-driven.** When a subscription changes (upgrade, downgrade, cancel), the webhook handler updates the `profiles` table. The app reads tier from the database, not from Stripe directly on each request.

5. **Downgrade at period end.** On cancellation or downgrade, access continues until the current billing period ends. Don't cut off access immediately.

6. **Test before deploying webhook changes.** Use Stripe CLI (`stripe listen --forward-to`) to test webhook handlers locally before deploying. Dry-run against test mode events.

7. **Idempotent webhook handling.** Stripe may send the same event multiple times. Webhook handlers should be idempotent — check if the change was already applied before writing to the database.

8. **Gate new purchase paths behind `PAYMENTS_ENABLED`.** Any new route or UI that
   takes money must check the flag, the same way `/api/stripe/checkout` does.
   Don't reintroduce a way to buy a plan while the flag is `false`.

9. **Granting access doesn't need Stripe.** To give someone a paid tier, set
   `profiles.tier` in Turso. Don't create Stripe customers or subscriptions by
   hand to achieve it.

## Key files
- `client.ts` — Stripe client initialization (throws if `STRIPE_SECRET_KEY` unset)
- `config.ts` — Price IDs **and per-tier entitlement limits** (see rule 0)
- `helpers.ts` — Checkout session creation, portal session, webhook handling
- `../config/features.ts` — `PAYMENTS_ENABLED` master switch
