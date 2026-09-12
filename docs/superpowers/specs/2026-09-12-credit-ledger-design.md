# Credit Ledger — Design

> Created: 2026-09-12
> Status: Approved, not yet implemented
> Scope: entitlement engine only. No Stripe work, no pricing page, no checkout.
> `PAYMENTS_ENABLED` stays `false`.

## Why

`PLANS[tier].limits` grants paid tiers `Infinity` readings. Measured against
real token costs, that is loss-making above two Farsi readings per day:

| Readings/day | Pro $7.99 (FA 3-card + 5 follow-ups) | Premium $14.99 (FA Celtic + 10 follow-ups) |
|---|---|---|
| 1 | $3.05 | $7.11 |
| 2 | $6.09 | $14.22 |
| 3 | $9.14 (**loss**) | $21.34 (**loss**) |
| 10 | $30.47 (**loss**) | $71.12 (**loss**) |

Farsi drives this: ~3.5 tokens/word against ~1.3 for English, with identical
word targets in `prompts.ts`. A credit allowance replaces "unlimited" so the
worst case is bounded before payments are re-enabled.

## Decisions

1. **Append-only ledger.** Every grant, spend, and refund is an immutable row.
   Balance is `SUM(delta)` over the current period. Chosen over a
   `credits_remaining` column for the audit trail — the thing you need exactly
   when money is involved — and because every write being an INSERT removes
   lost-update risk.
2. **Monthly grant, no rollover.** Unused credits vanish at period end.
3. **Free tier moves to credits too.** 3 credits/day, reset 00:00 UTC. One
   entitlement mechanism for all tiers. The `usage` table is retired.
4. **Follow-ups: 2 included per reading, then 1 credit each.** Paid tiers only;
   free stays at 0 follow-ups.
5. **No cron.** Grants are lazy: the first balance read in a new period inserts
   the grant row.

## Credit costs

| Action | Credits | Worst-case COGS (Farsi) |
|---|---|---|
| Single card | 1 | $0.023 |
| Three-card | 2 | $0.023 |
| Horseshoe | 3 | $0.029 |
| Celtic Cross | 5 | $0.041 |
| Follow-up beyond the included 2 | 1 | $0.016 |

## Grants

| Tier | Grant | Period key | Worst-case COGS | Margin |
|---|---|---|---|---|
| free | 3 | `d:YYYY-MM-DD` | $0.26/mo | — |
| pro (Plus, $8.99) | 120 | `m:YYYY-MM` | ~$3.20 | 64% |
| premium ($19.99) | 350 | `m:YYYY-MM` | ~$5.00 | 75% |

The `profiles.tier` values stay `free` / `pro` / `premium` exactly as today —
"Plus" is a display name only, and renaming the tier key is not part of this
change. Prices are recorded here as the intended packaging. This spec does not change
`monthlyPrice` in `stripe/config.ts` — that happens when payments are
re-enabled.

### Packaging consequences (accepted)

- **Horseshoe becomes reachable on free** (3 credits = the full daily grant).
  Free readings are capped at 150–200 words by `getMaxTokens` regardless of
  spread, so the cost is identical to a single card. Celtic Cross stays
  unreachable at 5 credits with no rollover.
- **Free keeps 0 follow-ups.** The 2 included follow-ups are a paid-tier
  entitlement and the clearest upgrade lever.

## Schema

Added to `ensureSchema()` in `lib/db/sqlite.ts`, following the existing pattern.

```sql
CREATE TABLE IF NOT EXISTS credit_ledger (
  id         TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id    TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  period_key TEXT NOT NULL,
  delta      INTEGER NOT NULL,
  reason     TEXT NOT NULL,
  ref_id     TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_credit_ledger_user_period
  ON credit_ledger(user_id, period_key);

CREATE UNIQUE INDEX IF NOT EXISTS idx_credit_ledger_one_grant
  ON credit_ledger(user_id, period_key) WHERE reason = 'grant';

CREATE UNIQUE INDEX IF NOT EXISTS idx_credit_ledger_one_refund
  ON credit_ledger(ref_id) WHERE reason = 'refund';
```

`reason` is one of `grant`, `spend`, `refund`, `purchase`, `adjust`.
`ref_id` holds the reading id or follow-up id so a refund can be matched to
what it reverses.

The partial unique index makes lazy granting idempotent: two concurrent
first-requests of a period cannot both insert a grant.

### Period keys

- free → `d:` + UTC `YYYY-MM-DD`
- pro / premium → `m:` + UTC `YYYY-MM`

The prefix makes the period type self-describing and prevents a daily key from
colliding with a monthly one if a user changes tier mid-period.

**Tier change mid-period.** An upgrade lands on a monthly key with no grant row
yet, so the user receives a full month's credits for a partial month. Accepted:
generous, simple, and self-correcting at the next renewal. A downgrade strands
the unspent monthly balance under a key that is no longer read — correct.

## Atomic spend

Check-and-debit is one statement, so the balance cannot be read stale:

```sql
INSERT INTO credit_ledger (user_id, period_key, delta, reason, ref_id)
SELECT ?, ?, ?, 'spend', ?
WHERE (
  SELECT COALESCE(SUM(delta), 0) FROM credit_ledger
  WHERE user_id = ? AND period_key = ?
) >= ?;
```

`delta` is negative; the final `?` is the positive cost. `rowsAffected === 0`
means insufficient credits — no transaction, no locking, no round-trip.

Granting and refunding both use `INSERT OR IGNORE` against their partial unique
indexes for the same guarantee — no read-then-write, so concurrent callers
cannot double-apply:

```sql
INSERT OR IGNORE INTO credit_ledger (user_id, period_key, delta, reason)
VALUES (?, ?, ?, 'grant');
```

## Modules

### `lib/credits/config.ts` (new)

Pure constants and date logic, no I/O: `SPREAD_COSTS`, `FOLLOW_UP_COST`,
`INCLUDED_FOLLOW_UPS`, `TIER_GRANTS`, `periodKeyFor(tier, date)`.

### `lib/credits/ledger.ts` (new)

The only module that touches the ledger:

- `ensureGrant(userId, tier)` — idempotent lazy grant for the current period
- `getBalance(userId, tier)` — calls `ensureGrant`, returns the current balance
- `spend(userId, tier, cost, refId)` → `{ ok, balance, reason? }`
- `refund(userId, tier, cost, refId)` — positive row, `reason = 'refund'`

### Retired

`lib/utils/quota.ts` and `lib/utils/quota.test.ts` are deleted. The
`checkQuota` → generate → `incrementUsage` sequence is replaced by a single
`spend()` before generation plus `refund()` on failure. The `usage` table is
left in place, unread, to avoid a migration; nothing writes to it after this
change.

## Data flow

### Reading (`api/reading/route.ts`)

1. Resolve profile and tier (unchanged).
2. Validate spread and card count (unchanged) — before any debit.
3. Generate the reading id in the route (`crypto.randomUUID()`) so the debit and
   the reading row share one identifier. `createReading` gains an optional `id`
   parameter and uses it when supplied, keeping its current default otherwise.
4. `spend(user.id, tier, SPREAD_COSTS[spreadType], readingId)`. On `!ok`,
   return 403 with the insufficient-credits reason and balance. Nothing has been
   written yet, so there is no row to clean up.
5. Create the reading row with that id, build prompts, call
   `streamInterpretation`.
6. **Refund on failure** at both windows:
   - `streamInterpretation()` throwing before the stream opens (this is the
     path that produces `credit balance is too low` from the Anthropic API).
   - the `catch` inside `ReadableStream.start` for a mid-stream failure.

   Today `incrementUsage` runs before generation and is never reversed, so a
   failed reading silently burns quota. Under credits that becomes a refund
   obligation, so both windows must call `refund()`.

### Follow-up (`api/reading/[id]/follow-up/route.ts`)

1. `countUserFollowUps(id)` — existing call.
2. If the count is below `INCLUDED_FOLLOW_UPS`, it is free; otherwise
   `spend(..., FOLLOW_UP_COST, followUpId)`. On `!ok`, 403.
3. Free tier short-circuits to 403 before either branch, as today.
4. Refund on generation failure, same two windows.

The route currently saves the user's message *before* generating, so a failed
follow-up both counts against the allowance and persists a dangling message.
The refund covers the credit; the dangling message is pre-existing behaviour
and out of scope here.

### Balance surfacing

`api/auth/me` returns `credits: { balance, grant, periodEndsAt }` so the client
has the balance without a second request. `FollowUpChat.tsx` reads it instead of
calling `getFollowUpLimit`, and shows cost-aware copy once the included
follow-ups are used up.

## Error handling

| Case | Behaviour |
|---|---|
| Insufficient credits | 403, `code: 'INSUFFICIENT_CREDITS'`, with balance and cost |
| Free user requests a follow-up | 403, existing upgrade copy |
| Generation throws pre-stream | refund, 500 |
| Generation throws mid-stream | refund, error event on the SSE stream |
| Double refund for one `ref_id` | `INSERT OR IGNORE` against the partial unique index on `ref_id` — a read-then-write check would race with itself when both failure windows fire |
| Unknown tier | falls back to free grant, matching `getPlan`'s existing behaviour |

## Testing

Unit, against an in-memory libSQL client, mirroring how `quota.test.ts` is set
up today:

- `config.ts` — period keys roll at 00:00 UTC; monthly keys roll at month
  boundaries; every spread has a cost.
- Grant idempotency — two concurrent `ensureGrant` calls produce one grant row.
- Spend — succeeds down to exactly zero; the balance never goes negative;
  `rowsAffected === 0` surfaces as `ok: false`.
- Concurrency — two parallel `spend` calls against a balance of 1 produce
  exactly one success.
- Refund — restores the balance; a second refund for the same `ref_id` is a
  no-op.
- Period rollover — spending to zero, then advancing the clock a day (free) or
  a month (paid), yields a full balance.
- Tier change mid-period — a free user upgraded mid-month gets the full monthly
  grant, and their daily-key rows are not counted.
- Route-level — a reading is refunded when `streamInterpretation` throws.

## Out of scope

Stripe products and prices, one-time credit packs, the pricing page, checkout,
webhook credit grants, rollover, and the `$8.99` / `$19.99` price changes in
`stripe/config.ts`. Each depends on this ledger existing first.

## Follow-on cost work (not this change)

Identified while costing the tiers, worth more than any price change:

1. Cache the follow-up prefix — the original interpretation is resent every
   turn; `cache_control` cuts follow-up input cost by roughly 90%.
2. Lower Farsi word targets ~40% in `prompts.ts` — Farsi is denser per word, so
   600 Farsi words is both a longer read and 2.3× the cost.
