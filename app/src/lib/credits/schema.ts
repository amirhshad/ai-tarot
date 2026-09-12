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
