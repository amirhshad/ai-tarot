# Credit Ledger Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the `Infinity`-limit tier model with an append-only credit ledger that bounds worst-case AI cost per user.

**Architecture:** Every grant, spend, and refund is an immutable row in a new `credit_ledger` table; balance is `SUM(delta)` over the current period key. Check-and-debit is a single conditional `INSERT ... SELECT ... WHERE`, so it is atomic without transactions. Grants are lazy — the first balance read in a new period inserts the grant row, so no cron is needed.

**Tech Stack:** Next.js 14, TypeScript, Turso (libSQL/SQLite), Vitest 3.

**Spec:** `docs/superpowers/specs/2026-09-12-credit-ledger-design.md`

## Global Constraints

- `PAYMENTS_ENABLED` stays `false`. No Stripe products, prices, checkout, or pricing-page work in this plan.
- `monthlyPrice` in `app/src/lib/stripe/config.ts` is NOT changed. The $8.99 / $19.99 packaging is recorded in the spec only.
- `profiles.tier` values stay exactly `free` / `pro` / `premium`. "Plus" is display copy only; do not rename the tier key.
- Credit costs: single 1, three-card 2, horseshoe 3, celtic-cross 5, follow-up beyond the included 2 costs 1.
- Tier grants: free 3 (daily), pro 120 (monthly), premium 350 (monthly).
- `INCLUDED_FOLLOW_UPS = 2`, paid tiers only. Free tier keeps 0 follow-ups.
- Period keys: free `d:YYYY-MM-DD` (UTC), paid `m:YYYY-MM` (UTC). The prefix is part of the key.
- The `usage` table is left in place but becomes unread. Do not drop it; do not write to it.
- Schema changes go in `ensureSchema()` in `app/src/lib/db/sqlite.ts`, following the existing pattern. There is no migration runner.
- **There is a stray nested git repository at `app/.git`** (a leftover `create-next-app` scaffold from 2026-03-10). The real project repo is the parent at the repo root. **Every `git add` / `git commit` / `git rm` in this plan runs from the repo root**, never from `app/` — a commit made from inside `app/` lands in the vestigial nested repo and never reaches the project history. Verify commits with `git -C "<repo root>" log --oneline`.
- npm commands (and only npm commands) run from the `app/` directory. Test command: `npm test`. Typecheck: `npx tsc --noEmit`.
- Per `app/vitest.config.ts`, API routes and React components are deliberately not unit-tested in this codebase. Tasks 4–6 use `tsc --noEmit` plus a scripted manual verification instead.

---

## File Structure

| File | Responsibility |
|---|---|
| `app/src/lib/credits/schema.ts` (create) | The `credit_ledger` DDL as an exported constant, so `ensureSchema()` and the tests share one definition |
| `app/src/lib/credits/config.ts` (create) | Pure constants and period-key logic. No I/O |
| `app/src/lib/credits/config.test.ts` (create) | Unit tests for the above |
| `app/src/lib/credits/ledger.ts` (create) | The only module that reads or writes `credit_ledger` |
| `app/src/lib/credits/ledger.test.ts` (create) | Unit tests against a real in-memory libSQL database |
| `app/src/lib/db/sqlite.ts` (modify) | Add the ledger DDL to `ensureSchema()` |
| `app/src/lib/db/queries.ts` (modify) | `createReading` accepts an optional `id` |
| `app/src/app/api/reading/route.ts` (modify) | Spend before generating; refund on both failure windows |
| `app/src/app/api/reading/[id]/follow-up/route.ts` (modify) | Included-then-charged follow-ups; refund on failure |
| `app/src/app/api/auth/me/route.ts` (modify) | Return the credit balance |
| `app/src/components/reading/FollowUpChat.tsx` (modify) | Balance-aware UI instead of `getFollowUpLimit` |
| `app/src/lib/stripe/config.ts` (modify) | Replace the `limits` block with a credit grant |
| `app/src/lib/utils/quota.ts` (delete) | Superseded by `ledger.ts` |
| `app/src/lib/utils/quota.test.ts` (delete) | Superseded by `ledger.test.ts` |
| `directives/core-business-rules.md`, `docs/product-spec.md` (modify) | Document the credit model |

---

### Task 1: Credit constants and period keys

Pure logic, no database. Everything downstream depends on these names.

**Files:**
- Create: `app/src/lib/credits/config.ts`
- Test: `app/src/lib/credits/config.test.ts`

**Interfaces:**
- Consumes: `SpreadType` from `@/lib/tarot/types`
- Produces: `SPREAD_COSTS: Record<SpreadType, number>`, `FOLLOW_UP_COST: number`, `INCLUDED_FOLLOW_UPS: number`, `TIER_GRANTS: Record<string, number>`, `grantFor(tier: string): number`, `periodKeyFor(tier: string, now?: Date): string`

- [ ] **Step 1: Write the failing test**

Create `app/src/lib/credits/config.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import type { SpreadType } from '@/lib/tarot/types';
import {
  SPREAD_COSTS,
  FOLLOW_UP_COST,
  INCLUDED_FOLLOW_UPS,
  grantFor,
  periodKeyFor,
} from './config';

describe('SPREAD_COSTS', () => {
  it('prices every spread type', () => {
    const spreads: SpreadType[] = ['single', 'three-card', 'celtic-cross', 'horseshoe'];
    for (const spread of spreads) {
      expect(SPREAD_COSTS[spread], spread).toBeGreaterThan(0);
    }
  });

  it('matches the approved packaging', () => {
    expect(SPREAD_COSTS['single']).toBe(1);
    expect(SPREAD_COSTS['three-card']).toBe(2);
    expect(SPREAD_COSTS['horseshoe']).toBe(3);
    expect(SPREAD_COSTS['celtic-cross']).toBe(5);
    expect(FOLLOW_UP_COST).toBe(1);
    expect(INCLUDED_FOLLOW_UPS).toBe(2);
  });

  it("keeps Celtic Cross out of reach of a free user's daily grant", () => {
    expect(SPREAD_COSTS['celtic-cross']).toBeGreaterThan(grantFor('free'));
  });

  it('lets a free user afford exactly one horseshoe per day', () => {
    expect(SPREAD_COSTS['horseshoe']).toBe(grantFor('free'));
  });
});

describe('grantFor', () => {
  it('grants the approved amounts', () => {
    expect(grantFor('free')).toBe(3);
    expect(grantFor('pro')).toBe(120);
    expect(grantFor('premium')).toBe(350);
  });

  it('falls back to the free grant for an unknown tier', () => {
    expect(grantFor('mystery-tier')).toBe(3);
  });
});

describe('periodKeyFor', () => {
  it('gives free users a UTC day key', () => {
    expect(periodKeyFor('free', new Date('2026-09-12T10:00:00Z'))).toBe('d:2026-09-12');
  });

  it('gives paid users a UTC month key', () => {
    expect(periodKeyFor('pro', new Date('2026-09-12T10:00:00Z'))).toBe('m:2026-09');
    expect(periodKeyFor('premium', new Date('2026-09-12T10:00:00Z'))).toBe('m:2026-09');
  });

  it('rolls the free key at 00:00 UTC, not local midnight', () => {
    expect(periodKeyFor('free', new Date('2026-09-12T23:59:59Z'))).toBe('d:2026-09-12');
    expect(periodKeyFor('free', new Date('2026-09-13T00:00:00Z'))).toBe('d:2026-09-13');
  });

  it('rolls the paid key at the month boundary', () => {
    expect(periodKeyFor('pro', new Date('2026-09-30T23:59:59Z'))).toBe('m:2026-09');
    expect(periodKeyFor('pro', new Date('2026-10-01T00:00:00Z'))).toBe('m:2026-10');
  });

  it('never collides a daily key with a monthly key', () => {
    const day = periodKeyFor('free', new Date('2026-09-12T10:00:00Z'));
    const month = periodKeyFor('pro', new Date('2026-09-12T10:00:00Z'));
    expect(day).not.toBe(month);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd app && npx vitest run src/lib/credits/config.test.ts`
Expected: FAIL — `Failed to resolve import "./config"`.

- [ ] **Step 3: Write the implementation**

Create `app/src/lib/credits/config.ts`:

```typescript
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
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd app && npx vitest run src/lib/credits/config.test.ts`
Expected: PASS, 9 tests.

- [ ] **Step 5: Commit**

```bash
git add app/src/lib/credits/config.ts app/src/lib/credits/config.test.ts
git commit -m "feat(credits): add credit costs, tier grants, and period keys"
```

---

### Task 2: Ledger schema

The DDL lives in its own module so `ensureSchema()` and the ledger tests share one definition rather than drifting apart.

**Files:**
- Create: `app/src/lib/credits/schema.ts`
- Modify: `app/src/lib/db/sqlite.ts`

**Interfaces:**
- Produces: `CREDIT_LEDGER_DDL: string` — executable via `db.executeMultiple()`

- [ ] **Step 1: Write the schema module**

Create `app/src/lib/credits/schema.ts`:

```typescript
/**
 * Credit ledger DDL.
 *
 * Exported as a constant so ensureSchema() and the ledger tests create an
 * identical table — a test passing against a drifted schema is worse than no
 * test.
 *
 * Two partial unique indexes do real work:
 *  - one grant per (user, period) makes lazy granting idempotent, so two
 *    concurrent first-requests of a period cannot both grant.
 *  - one refund per ref_id makes refunding idempotent, so the pre-stream and
 *    mid-stream failure handlers cannot both pay out.
 */
export const CREDIT_LEDGER_DDL = `
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
`;
```

- [ ] **Step 2: Wire it into ensureSchema()**

In `app/src/lib/db/sqlite.ts`, add the import at the top of the file, next to the existing imports:

```typescript
import { CREDIT_LEDGER_DDL } from '@/lib/credits/schema';
```

Then, immediately after the `free_reading_rate_limits` block and BEFORE the `// Migrations for new columns` comment, add:

```typescript
  // Credit ledger — append-only entitlement store (replaces the `usage` table).
  await db.executeMultiple(CREDIT_LEDGER_DDL);
```

- [ ] **Step 3: Verify the schema applies cleanly**

Run: `cd app && npx tsc --noEmit`
Expected: no errors.

Then run this throwaway script to confirm the DDL executes and the partial indexes exist:

```bash
cd app && cat > /tmp/ddl-check.mjs <<'EOF'
import { createClient } from '@libsql/client';
const ddl = (await import('./src/lib/credits/schema.ts')).CREDIT_LEDGER_DDL;
const db = createClient({ url: ':memory:' });
await db.executeMultiple(ddl);
const r = await db.execute("SELECT name FROM sqlite_master WHERE type='index' AND name LIKE 'idx_credit_ledger%' ORDER BY name");
console.log(r.rows.map(x => x.name));
EOF
npx tsx /tmp/ddl-check.mjs; rm /tmp/ddl-check.mjs
```

Expected output: `[ 'idx_credit_ledger_one_grant', 'idx_credit_ledger_one_refund', 'idx_credit_ledger_user_period' ]`

If `tsx` is not installed, skip this step — Task 3's tests exercise the same DDL and will catch a malformed statement.

- [ ] **Step 4: Commit**

```bash
git add app/src/lib/credits/schema.ts app/src/lib/db/sqlite.ts
git commit -m "feat(credits): add credit_ledger table to schema"
```

---

### Task 3: The ledger

The core of the feature. Tests run against a real in-memory libSQL database rather than mocks, because the behaviour under test IS the SQL — a mocked `db.execute` would assert nothing about atomicity.

**Files:**
- Create: `app/src/lib/credits/ledger.ts`
- Test: `app/src/lib/credits/ledger.test.ts`

**Interfaces:**
- Consumes: `grantFor`, `periodKeyFor` from `./config`; `CREDIT_LEDGER_DDL` from `./schema`; `getDb`, `ensureSchema` from `@/lib/db/sqlite`
- Produces:
  - `ensureGrant(userId: string, tier: string, now?: Date): Promise<void>`
  - `getBalance(userId: string, tier: string, now?: Date): Promise<number>`
  - `spend(userId: string, tier: string, cost: number, refId: string, now?: Date): Promise<SpendResult>`
  - `refund(refId: string): Promise<void>`
  - `interface SpendResult { ok: boolean; balance: number; cost: number }`

- [ ] **Step 1: Write the failing test**

Create `app/src/lib/credits/ledger.test.ts`:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createClient, type Client } from '@libsql/client';
import { CREDIT_LEDGER_DDL } from './schema';

let db: Client;

// A real in-memory database: the behaviour under test is the SQL itself.
vi.mock('@/lib/db/sqlite', () => ({
  getDb: () => db,
  ensureSchema: async () => {},
}));

import { ensureGrant, getBalance, spend, refund } from './ledger';

beforeEach(async () => {
  db = createClient({ url: ':memory:' });
  await db.executeMultiple(CREDIT_LEDGER_DDL);
});

const rows = async () =>
  (await db.execute('SELECT reason, delta, ref_id, period_key FROM credit_ledger ORDER BY rowid')).rows;

describe('ensureGrant', () => {
  it('grants the tier allowance on first call', async () => {
    await ensureGrant('u1', 'pro');
    expect(await getBalance('u1', 'pro')).toBe(120);
  });

  it('is idempotent — a second call does not double-grant', async () => {
    await ensureGrant('u1', 'free');
    await ensureGrant('u1', 'free');
    expect(await getBalance('u1', 'free')).toBe(3);
    expect((await rows()).filter(r => r.reason === 'grant')).toHaveLength(1);
  });

  it('grants once under concurrency', async () => {
    await Promise.all([
      ensureGrant('u1', 'premium'),
      ensureGrant('u1', 'premium'),
      ensureGrant('u1', 'premium'),
    ]);
    expect(await getBalance('u1', 'premium')).toBe(350);
  });
});

describe('spend', () => {
  it('debits and reports the new balance', async () => {
    const result = await spend('u1', 'pro', 5, 'reading-1');
    expect(result.ok).toBe(true);
    expect(result.balance).toBe(115);
  });

  it('allows spending down to exactly zero', async () => {
    expect((await spend('u1', 'free', 3, 'r1')).ok).toBe(true);
    expect(await getBalance('u1', 'free')).toBe(0);
  });

  it('refuses a spend larger than the balance and writes nothing', async () => {
    await spend('u1', 'free', 2, 'r1');
    const result = await spend('u1', 'free', 3, 'r2');
    expect(result.ok).toBe(false);
    expect(result.balance).toBe(1);
    expect((await rows()).some(r => r.ref_id === 'r2')).toBe(false);
  });

  it('never lets the balance go negative under concurrency', async () => {
    await spend('u1', 'free', 2, 'setup');           // balance now 1
    const results = await Promise.all([
      spend('u1', 'free', 1, 'race-a'),
      spend('u1', 'free', 1, 'race-b'),
    ]);
    expect(results.filter(r => r.ok)).toHaveLength(1);
    expect(await getBalance('u1', 'free')).toBe(0);
  });
});

describe('refund', () => {
  it('restores the credits of a spend', async () => {
    await spend('u1', 'pro', 5, 'reading-1');
    await refund('reading-1');
    expect(await getBalance('u1', 'pro')).toBe(120);
  });

  it('is idempotent — both failure handlers can call it', async () => {
    await spend('u1', 'pro', 5, 'reading-1');
    await refund('reading-1');
    await refund('reading-1');
    expect(await getBalance('u1', 'pro')).toBe(120);
  });

  it('is a no-op when there is no matching spend', async () => {
    await ensureGrant('u1', 'pro');
    await refund('never-spent');
    expect(await getBalance('u1', 'pro')).toBe(120);
  });

  it('refunds into the period the spend came from, not the current one', async () => {
    const late = new Date('2026-09-12T23:59:59Z');
    await spend('u1', 'free', 3, 'r1', late);
    await refund('r1');
    const refundRow = (await rows()).find(r => r.reason === 'refund');
    expect(refundRow?.period_key).toBe('d:2026-09-12');
  });
});

describe('period rollover', () => {
  it('gives a free user a fresh balance the next day', async () => {
    const today = new Date('2026-09-12T12:00:00Z');
    const tomorrow = new Date('2026-09-13T12:00:00Z');
    await spend('u1', 'free', 3, 'r1', today);
    expect(await getBalance('u1', 'free', today)).toBe(0);
    expect(await getBalance('u1', 'free', tomorrow)).toBe(3);
  });

  it('gives a paid user a fresh balance the next month', async () => {
    const sept = new Date('2026-09-30T23:00:00Z');
    const oct = new Date('2026-10-01T01:00:00Z');
    await spend('u1', 'pro', 120, 'r1', sept);
    expect(await getBalance('u1', 'pro', sept)).toBe(0);
    expect(await getBalance('u1', 'pro', oct)).toBe(120);
  });
});

describe('tier change mid-period', () => {
  it('grants a full month on upgrade and ignores the daily rows', async () => {
    const now = new Date('2026-09-12T12:00:00Z');
    await spend('u1', 'free', 3, 'r1', now);       // spent everything as a free user
    expect(await getBalance('u1', 'pro', now)).toBe(120);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd app && npx vitest run src/lib/credits/ledger.test.ts`
Expected: FAIL — `Failed to resolve import "./ledger"`.

- [ ] **Step 3: Write the implementation**

Create `app/src/lib/credits/ledger.ts`:

```typescript
import { getDb, ensureSchema } from '@/lib/db/sqlite';
import { grantFor, periodKeyFor } from './config';

export interface SpendResult {
  ok: boolean;
  /** Balance after the attempt. Unchanged when `ok` is false. */
  balance: number;
  cost: number;
}

async function balanceOf(userId: string, periodKey: string): Promise<number> {
  const db = getDb();
  const result = await db.execute({
    sql: 'SELECT COALESCE(SUM(delta), 0) AS balance FROM credit_ledger WHERE user_id = ? AND period_key = ?',
    args: [userId, periodKey],
  });
  return Number(result.rows[0]?.balance ?? 0);
}

/**
 * Insert this period's grant if it is not already there.
 *
 * This is why no cron job is needed: the first read or spend of a new period
 * creates its own grant. `INSERT OR IGNORE` against the partial unique index
 * makes it safe to call concurrently — a read-then-write check would let two
 * simultaneous first-requests both grant.
 */
export async function ensureGrant(userId: string, tier: string, now: Date = new Date()): Promise<void> {
  await ensureSchema();
  const db = getDb();
  await db.execute({
    sql: `INSERT OR IGNORE INTO credit_ledger (user_id, period_key, delta, reason)
          VALUES (?, ?, ?, 'grant')`,
    args: [userId, periodKeyFor(tier, now), grantFor(tier)],
  });
}

export async function getBalance(userId: string, tier: string, now: Date = new Date()): Promise<number> {
  await ensureGrant(userId, tier, now);
  return balanceOf(userId, periodKeyFor(tier, now));
}

/**
 * Atomically check the balance and debit it.
 *
 * The check and the write are one statement, so two concurrent callers cannot
 * both pass a check against the same credit. `rowsAffected === 0` means the
 * WHERE clause failed, i.e. insufficient credits — nothing was written.
 */
export async function spend(
  userId: string,
  tier: string,
  cost: number,
  refId: string,
  now: Date = new Date(),
): Promise<SpendResult> {
  await ensureGrant(userId, tier, now);
  const db = getDb();
  const periodKey = periodKeyFor(tier, now);

  const result = await db.execute({
    sql: `INSERT INTO credit_ledger (user_id, period_key, delta, reason, ref_id)
          SELECT ?, ?, ?, 'spend', ?
          WHERE (
            SELECT COALESCE(SUM(delta), 0) FROM credit_ledger
            WHERE user_id = ? AND period_key = ?
          ) >= ?`,
    args: [userId, periodKey, -cost, refId, userId, periodKey, cost],
  });

  return {
    ok: result.rowsAffected > 0,
    balance: await balanceOf(userId, periodKey),
    cost,
  };
}

/**
 * Reverse a spend, identified by what it paid for.
 *
 * The refund lands in the period the ORIGINAL spend belongs to, not the current
 * one — a reading that starts at 23:59 and fails at 00:01 must not move a
 * credit into the next day. Idempotent via the partial unique index on ref_id,
 * because both the pre-stream and mid-stream failure handlers may fire.
 */
export async function refund(refId: string): Promise<void> {
  await ensureSchema();
  const db = getDb();
  await db.execute({
    sql: `INSERT OR IGNORE INTO credit_ledger (user_id, period_key, delta, reason, ref_id)
          SELECT user_id, period_key, -delta, 'refund', ref_id
          FROM credit_ledger
          WHERE ref_id = ? AND reason = 'spend'`,
    args: [refId],
  });
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd app && npx vitest run src/lib/credits/ledger.test.ts`
Expected: PASS, 13 tests.

If the concurrency test is flaky, do NOT add a retry or a sleep — a genuine failure there means the conditional insert is not atomic, which is the whole point of the design. Re-read the SQL instead.

- [ ] **Step 5: Commit**

```bash
git add app/src/lib/credits/ledger.ts app/src/lib/credits/ledger.test.ts
git commit -m "feat(credits): add atomic credit ledger with lazy grants and refunds"
```

---

### Task 4: Charge readings

**Files:**
- Modify: `app/src/lib/db/queries.ts` (`createReading`)
- Modify: `app/src/app/api/reading/route.ts`

**Interfaces:**
- Consumes: `spend`, `refund` from `@/lib/credits/ledger`; `SPREAD_COSTS` from `@/lib/credits/config`
- Produces: a 403 response carrying `{ error, code: 'INSUFFICIENT_CREDITS', balance, cost }`

- [ ] **Step 1: Let createReading accept a caller-supplied id**

The debit must happen before any row is written, and the debit and the reading need the same id. In `app/src/lib/db/queries.ts`, change the `createReading` signature to add an optional `id`:

```typescript
export async function createReading(data: {
  id?: string;
  user_id: string;
  spread_type: string;
  question?: string;
  cards: unknown;
  model_used: string;
  language: string;
  topic?: string;
}): Promise<string> {
```

Inside the function, find the line that generates the id (`const id = crypto.randomUUID();`) and change it to:

```typescript
  const id = data.id ?? crypto.randomUUID();
```

Leave the rest of the function unchanged. Existing callers that omit `id` keep working.

- [ ] **Step 2: Swap the quota check for a credit spend**

In `app/src/app/api/reading/route.ts`, replace the import on line 9:

```typescript
import { checkQuota, incrementUsage } from '@/lib/utils/quota';
```

with:

```typescript
import { spend, refund } from '@/lib/credits/ledger';
import { SPREAD_COSTS } from '@/lib/credits/config';
```

Replace the quota block (the `// Check quota` comment and the four lines following it) with:

```typescript
  // Reserve credits before spending any money with Anthropic. The reading id is
  // generated here so the debit and the reading row share one identifier, which
  // is what lets a failed generation be refunded precisely.
  const readingId = crypto.randomUUID();
  const cost = SPREAD_COSTS[spreadType];
  const charge = await spend(user.id, tier, cost, readingId);

  if (!charge.ok) {
    return NextResponse.json(
      {
        error: tier === 'free'
          ? 'You have used your free readings for today. Come back tomorrow for more.'
          : 'You are out of credits for this billing period.',
        code: 'INSUFFICIENT_CREDITS',
        balance: charge.balance,
        cost,
      },
      { status: 403 },
    );
  }
```

- [ ] **Step 3: Pass the id through and delete the usage increment**

Still in `app/src/app/api/reading/route.ts`, change the `createReading` call to reuse the id — replace `const readingId = await createReading({` with:

```typescript
  await createReading({
    id: readingId,
```

so the call now begins:

```typescript
  await createReading({
    id: readingId,
    user_id: user.id,
    spread_type: spreadType,
```

Then delete these two lines entirely:

```typescript
  // Increment usage
  await incrementUsage(user.id, spreadType);
```

- [ ] **Step 4: Refund when generation fails**

Two failure windows, both of which currently leave the user charged.

First, wrap the `streamInterpretation` call so a pre-stream throw is refunded. Replace:

```typescript
  const stream = await streamInterpretation({
    systemPrompt,
    userMessage: userMessage + questionSuffix,
    tier,
    spreadType: spread.type,
  });
```

with:

```typescript
  // The Anthropic call can fail before a single token arrives — an outage, or
  // our own credit balance running out. The user must not pay for that.
  let stream;
  try {
    stream = await streamInterpretation({
      systemPrompt,
      userMessage: userMessage + questionSuffix,
      tier,
      spreadType: spread.type,
    });
  } catch (err) {
    await refund(readingId);
    console.error('Reading generation failed before streaming:', err);
    return NextResponse.json(
      { error: 'The reading could not be generated. Your credits have not been used.' },
      { status: 502 },
    );
  }
```

Second, in the `catch (err)` block inside `ReadableStream.start`, add the refund as the first statement, immediately after `console.error('Reading stream error:', err);`:

```typescript
        await refund(readingId);
```

- [ ] **Step 5: Typecheck and run the full suite**

Run: `cd app && npx tsc --noEmit && npm test`
Expected: tsc clean. Vitest still passes Tasks 1 and 3; `quota.test.ts` still passes because `quota.ts` has not been deleted yet.

- [ ] **Step 6: Verify the refund path by hand**

Per `app/vitest.config.ts`, route handlers are not unit-tested in this codebase, so verify this one manually — it is the step that protects real money.

Temporarily add `throw new Error('forced');` as the first line of `streamInterpretation` in `app/src/lib/ai/client.ts`, then:

```bash
cd app && npm run dev
```

Sign in, request a reading, and confirm: the response is a 502 with the "credits have not been used" message. Then check the ledger:

```bash
cd app && cat > /tmp/ledger-check.mjs <<'EOF'
import { createClient } from '@libsql/client';
const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
const r = await db.execute('SELECT reason, delta, ref_id FROM credit_ledger ORDER BY rowid DESC LIMIT 5');
console.table(r.rows);
EOF
node --env-file=.env.local /tmp/ledger-check.mjs; rm /tmp/ledger-check.mjs
```

Expected: a `spend` row and a matching `refund` row with the same `ref_id`, netting to zero.

**Remove the forced throw before continuing.** Confirm with `git diff src/lib/ai/client.ts` showing no changes.

- [ ] **Step 7: Commit**

```bash
git add app/src/lib/db/queries.ts app/src/app/api/reading/route.ts
git commit -m "feat(credits): charge readings against the ledger, refund on failure"
```

---

### Task 5: Charge follow-ups

**Files:**
- Modify: `app/src/app/api/reading/[id]/follow-up/route.ts`

**Interfaces:**
- Consumes: `spend`, `refund` from `@/lib/credits/ledger`; `FOLLOW_UP_COST`, `INCLUDED_FOLLOW_UPS` from `@/lib/credits/config`

- [ ] **Step 1: Replace the follow-up limit check**

In `app/src/app/api/reading/[id]/follow-up/route.ts`, replace the import on line 8:

```typescript
import { getFollowUpLimit } from '@/lib/stripe/config';
```

with:

```typescript
import { spend, refund } from '@/lib/credits/ledger';
import { FOLLOW_UP_COST, INCLUDED_FOLLOW_UPS } from '@/lib/credits/config';
```

Then replace the whole `// Check follow-up limit` block (from that comment through the closing brace of the `if (userMessageCount >= limit)` statement) with:

```typescript
  // Follow-ups are the single largest hidden cost in a reading — ten of them in
  // Farsi cost more than the Celtic Cross that spawned them. The first two come
  // free so normal use never feels metered; beyond that they draw credits.
  const userMessageCount = await countUserFollowUps(id);

  if (tier === 'free') {
    return NextResponse.json(
      { error: 'Follow-up questions are available to members.' },
      { status: 403 },
    );
  }

  const followUpRef = `${id}:followup:${userMessageCount}`;
  const isIncluded = userMessageCount < INCLUDED_FOLLOW_UPS;

  if (!isIncluded) {
    const charge = await spend(user.id, tier, FOLLOW_UP_COST, followUpRef);
    if (!charge.ok) {
      return NextResponse.json(
        {
          error: 'You are out of credits for this billing period.',
          code: 'INSUFFICIENT_CREDITS',
          balance: charge.balance,
          cost: FOLLOW_UP_COST,
        },
        { status: 403 },
      );
    }
  }
```

`followUpRef` is deterministic per reading and position, so a retry of the same follow-up cannot be double-charged and the refund can find its spend.

- [ ] **Step 2: Refund when the follow-up fails**

Replace the `// Stream response` block:

```typescript
  // Stream response
  const stream = await streamFollowUp({
    systemPrompt,
    messages,
    tier: tier as 'free' | 'pro' | 'premium',
  });
```

with:

```typescript
  // Stream response. A pre-stream throw means no tokens were generated, so the
  // credit must go back.
  let stream;
  try {
    stream = await streamFollowUp({
      systemPrompt,
      messages,
      tier: tier as 'free' | 'pro' | 'premium',
    });
  } catch (err) {
    if (!isIncluded) await refund(followUpRef);
    console.error('Follow-up generation failed before streaming:', err);
    return NextResponse.json(
      { error: 'The response could not be generated. Your credits have not been used.' },
      { status: 502 },
    );
  }
```

Then handle the mid-stream case. The route has an inline `ReadableStream` whose
catch currently discards the error:

```typescript
      } catch {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: 'Stream error' })}\n\n`),
        );
        controller.close();
      }
```

Replace it with:

```typescript
      } catch (err) {
        if (!isIncluded) await refund(followUpRef);
        console.error('Follow-up stream error:', err);
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: 'Stream error' })}\n\n`),
        );
        controller.close();
      }
```

- [ ] **Step 3: Typecheck**

Run: `cd app && npx tsc --noEmit`
Expected: no errors. If `tier` is typed as `string` and `spend` rejects it, that is fine — `spend` takes `string`.

- [ ] **Step 4: Verify by hand**

```bash
cd app && npm run dev
```

As a user whose tier is `pro` (set `profiles.tier` in Turso), open a reading and ask three follow-ups. Expected: the first two are free, the third debits one credit. Confirm with the ledger-check script from Task 4 Step 6 — exactly one `spend` row with a `:followup:2` ref.

- [ ] **Step 5: Commit**

```bash
git add "app/src/app/api/reading/[id]/follow-up/route.ts"
git commit -m "feat(credits): include two follow-ups per reading, charge beyond that"
```

---

### Task 6: Surface the balance

**Files:**
- Modify: `app/src/app/api/auth/me/route.ts`
- Modify: `app/src/components/reading/FollowUpChat.tsx`

**Interfaces:**
- Consumes: `getBalance` from `@/lib/credits/ledger`; `grantFor`, `INCLUDED_FOLLOW_UPS`, `FOLLOW_UP_COST` from `@/lib/credits/config`
- Produces: `/api/auth/me` response gains `credits: { balance: number; grant: number }`

- [ ] **Step 1: Return the balance from /api/auth/me**

Replace the contents of `app/src/app/api/auth/me/route.ts` with:

```typescript
import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/db/auth';
import { getProfile } from '@/lib/db/queries';
import { getBalance } from '@/lib/credits/ledger';
import { grantFor } from '@/lib/credits/config';

export async function GET() {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ user: null, profile: null, credits: null });
  }

  const profile = await getProfile(user.id);
  const tier = profile?.tier || 'free';

  return NextResponse.json({
    user: { id: user.id, email: user.email },
    profile: profile ? {
      display_name: profile.display_name,
      language: profile.language,
      tier: profile.tier,
    } : null,
    credits: {
      balance: await getBalance(user.id, tier),
      grant: grantFor(tier),
    },
  });
}
```

- [ ] **Step 2: Make FollowUpChat balance-aware**

In `app/src/components/reading/FollowUpChat.tsx`, replace the import:

```typescript
import { getFollowUpLimit } from '@/lib/stripe/config';
```

with:

```typescript
import { INCLUDED_FOLLOW_UPS, FOLLOW_UP_COST } from '@/lib/credits/config';
```

Add `credits` to the props interface:

```typescript
interface FollowUpChatProps {
  readingId: string;
  tier: string;
  existingMessages?: Message[];
  language?: 'en' | 'fa';
  /** Current credit balance; null for signed-out or unknown. */
  credits?: number | null;
}
```

and to the destructured parameters, after `language = 'en',`:

```typescript
  credits = null,
```

Then replace the three derived lines:

```typescript
  const limit = getFollowUpLimit(tier);
  const userMessageCount = messages.filter(m => m.role === 'user').length;
  const remaining = limit - userMessageCount;
  const canAsk = remaining > 0;
```

with:

```typescript
  const userMessageCount = messages.filter(m => m.role === 'user').length;
  const includedLeft = Math.max(0, INCLUDED_FOLLOW_UPS - userMessageCount);
  const nextCostsCredits = includedLeft === 0;
  // Free users have no follow-ups at all; paid users are limited by their
  // balance once the included follow-ups are used up.
  const canAsk =
    tier !== 'free' && (!nextCostsCredits || (credits ?? 0) >= FOLLOW_UP_COST);
  const remaining = includedLeft;
```

- [ ] **Step 3: Pass credits in from the caller**

There is exactly one call site: `app/src/app/[locale]/(app)/reading/[id]/page.tsx`.
It is a server component, so it can read the balance directly — no `/api/auth/me`
round trip.

Add the imports alongside the existing ones at the top of that file:

```typescript
import { getBalance } from '@/lib/credits/ledger';
```

After the existing `const followUps = await getFollowUps(id);` line, add:

```typescript
  const tier = profile?.tier || 'free';
  const credits = await getBalance(user.id, tier);
```

Then update the render, replacing:

```tsx
        <FollowUpChat
          readingId={id}
          tier={profile?.tier || 'free'}
```

with:

```tsx
        <FollowUpChat
          readingId={id}
          tier={tier}
          credits={credits}
```

Leave the remaining props (`existingMessages`, `language`) unchanged.

Verify no other call site appeared since this plan was written:

```bash
cd app && grep -rn "FollowUpChat" src | grep -v "components/reading/FollowUpChat.tsx:"
```

Expected: only the import and the render in that one page.

- [ ] **Step 4: Typecheck and build**

Run: `cd app && npx tsc --noEmit && npm run build`
Expected: both clean. The build is the only check that catches a broken component prop.

- [ ] **Step 5: Commit**

```bash
git add app/src/app/api/auth/me/route.ts app/src/components/reading/FollowUpChat.tsx "app/src/app/[locale]/(app)/reading/[id]/page.tsx"
git commit -m "feat(credits): surface credit balance in the API and follow-up UI"
```

---

### Task 7: Retire the quota system and document the model

**Files:**
- Delete: `app/src/lib/utils/quota.ts`, `app/src/lib/utils/quota.test.ts`
- Modify: `app/src/lib/stripe/config.ts`
- Modify: `directives/core-business-rules.md`, `docs/product-spec.md`

- [ ] **Step 1: Confirm nothing still imports quota**

Run this from the repo root:

```bash
grep -rn "utils/quota\|checkQuota\|incrementUsage\|getFollowUpLimit" app/src \
  | grep -v "lib/utils/quota" | grep -v "lib/stripe/config.ts"
```

Expected: no results. The two excluded paths still legitimately match at this
point — `quota.ts`/`quota.test.ts` are deleted in Step 2 and the
`getFollowUpLimit` definition in `stripe/config.ts` in Step 3. What must be gone
is every remaining *caller*. If anything else matches, fix that call site before
deleting.

- [ ] **Step 2: Delete the old quota module**

```bash
git rm app/src/lib/utils/quota.ts app/src/lib/utils/quota.test.ts
```

- [ ] **Step 3: Replace the limits block in PLANS**

In `app/src/lib/stripe/config.ts`, replace each tier's `limits` object with a credit grant, and delete `getFollowUpLimit`. The file becomes:

```typescript
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
    monthlyPrice: 799, // cents
    monthlyPriceId: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || '',
    yearlyPriceId: process.env.STRIPE_PRO_YEARLY_PRICE_ID || '',
    credits: TIER_GRANTS.pro,
    period: 'month' as const,
  },
  premium: {
    name: 'Premium',
    monthlyPrice: 1499, // cents
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
```

`monthlyPrice` stays at 799 / 1499 — repricing belongs with the Stripe work, not here.

- [ ] **Step 4: Run everything**

Run: `cd app && npm run verify`
Expected: `tsc --noEmit` clean, all Vitest suites pass, prompt-freeze clean.

- [ ] **Step 5: Update the directive**

In `directives/core-business-rules.md`, replace the "Pricing & Model Selection", "Rate Limits (Free Tier)", and "Follow-up Limits" sections with:

```markdown
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
- Celtic Cross is unreachable on free (5 credits against a 3-credit daily
  grant). Horseshoe is reachable: free readings are capped at 150-200 words by
  `getMaxTokens` regardless of spread, so it costs the same as a single card.
- Every reading includes 2 free follow-ups on paid tiers. **Free tier gets
  none.**
- A failed generation is refunded automatically, keyed on the reading id.

**The `usage` table is dead.** It is left in place to avoid a migration, but
nothing reads or writes it. Do not add to it.
```

- [ ] **Step 6: Update the product spec**

In `docs/product-spec.md`, replace the "Pricing Tiers" table with:

```markdown
## Pricing Tiers

| Feature | Free | Pro ($7.99/mo) | Premium ($14.99/mo) |
|---------|------|----------------|---------------------|
| Credits | 3/day | 120/month | 350/month |
| AI Model | Haiku 4.5 (short summary) | Sonnet 5 (deep narrative) | Sonnet 5 (deep narrative) |
| Follow-ups | None | 2 free per reading, then 1 credit | 2 free per reading, then 1 credit |
| Languages | English only | English + Farsi | English + Farsi + Arabic |
| History | Last 5 readings | Full + search | Full + trend analysis |

Credits do not roll over. Costs per action are in
`directives/core-business-rules.md`.
```

- [ ] **Step 7: Commit**

```bash
git add app/src/lib/stripe/config.ts directives/core-business-rules.md docs/product-spec.md
git commit -m "refactor(credits): retire the quota system in favour of the ledger"
```

---

## Done when

- `npm run verify` passes from `app/`.
- `grep -rn "checkQuota\|incrementUsage\|getFollowUpLimit" app/src` returns nothing.
- A free user gets 3 credits/day; a `pro` user 120/month; both reset on their own period boundary.
- A forced generation failure leaves a matching `spend` + `refund` pair in `credit_ledger`.
- `PAYMENTS_ENABLED` is still `false` and `monthlyPrice` is still 799 / 1499.
