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
