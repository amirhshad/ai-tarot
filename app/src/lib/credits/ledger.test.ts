import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createClient, type Client } from '@libsql/client';
import { CREDIT_LEDGER_DDL } from './schema';

let db: Client;

// A real in-memory database: the behaviour under test is the SQL itself.
vi.mock('@/lib/db/sqlite', () => ({
  getDb: () => db,
  ensureSchema: async () => {},
}));

import { ensureGrant, getBalance, spend, refund, claimIncluded } from './ledger';

beforeEach(async () => {
  db = createClient({ url: ':memory:' });
  // credit_ledger.user_id REFERENCES profiles(id), and this libSQL client
  // enforces foreign keys by default (unlike stock SQLite). A minimal
  // profiles fixture satisfies the constraint for every test's 'u1' user —
  // this is fixture setup only, not part of the behaviour under test.
  await db.execute('CREATE TABLE profiles (id TEXT PRIMARY KEY)');
  await db.execute("INSERT INTO profiles (id) VALUES ('u1')");
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

describe('claimIncluded', () => {
  it('succeeds on the first claim of a slot and costs nothing', async () => {
    await ensureGrant('u1', 'pro');
    const won = await claimIncluded('u1', 'pro', 'reading-1:included:0');
    expect(won).toBe(true);
    expect(await getBalance('u1', 'pro')).toBe(120);
  });

  it('refuses a second claim on the same ref', async () => {
    await claimIncluded('u1', 'pro', 'reading-1:included:0');
    const second = await claimIncluded('u1', 'pro', 'reading-1:included:0');
    expect(second).toBe(false);
  });

  it('resolves concurrent claims on one ref to exactly one winner', async () => {
    const results = await Promise.all([
      claimIncluded('u1', 'pro', 'reading-1:included:0'),
      claimIncluded('u1', 'pro', 'reading-1:included:0'),
      claimIncluded('u1', 'pro', 'reading-1:included:0'),
    ]);
    expect(results.filter(Boolean)).toHaveLength(1);
  });
});

describe('tier change mid-period', () => {
  it('grants a full month on upgrade and ignores the daily rows', async () => {
    const now = new Date('2026-09-12T12:00:00Z');
    await spend('u1', 'free', 3, 'r1', now);       // spent everything as a free user
    expect(await getBalance('u1', 'pro', now)).toBe(120);
  });
});
