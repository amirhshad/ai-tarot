# Stripe / Billing — Local Rules

## Before editing files here, read:
- `directives/core-business-rules.md` — Pricing tiers, subscription logic
- `docs/product-spec.md` — Full feature matrix

## Rules

1. **Never expose secret keys.** Stripe secret key (`sk_live_*`, `sk_test_*`) must stay in server-side environment variables only. Never log, return in API responses, or include in client bundles.

2. **Always verify webhook signatures.** Every webhook handler must verify `stripe-signature` header using `stripe.webhooks.constructEvent()`. Never process unverified webhook payloads.

3. **Prefer Stripe-hosted UI.** Use Stripe Checkout for payments and Stripe Customer Portal for subscription management. Minimize custom payment UI to reduce PCI scope.

4. **Tier changes are webhook-driven.** When a subscription changes (upgrade, downgrade, cancel), the webhook handler updates the `profiles` table. The app reads tier from the database, not from Stripe directly on each request.

5. **Downgrade at period end.** On cancellation or downgrade, access continues until the current billing period ends. Don't cut off access immediately.

6. **Test before deploying webhook changes.** Use Stripe CLI (`stripe listen --forward-to`) to test webhook handlers locally before deploying. Dry-run against test mode events.

7. **Idempotent webhook handling.** Stripe may send the same event multiple times. Webhook handlers should be idempotent — check if the change was already applied before writing to the database.

## Key files
- `client.ts` — Stripe client initialization
- `config.ts` — Price IDs, product configuration
- `helpers.ts` — Checkout session creation, portal session, webhook handling
