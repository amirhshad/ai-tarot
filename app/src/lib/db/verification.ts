import crypto from 'crypto';
import { getDb, ensureSchema } from './sqlite';

export function generateVerificationToken(): { token: string; expiresAt: string } {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  return { token, expiresAt };
}

export async function saveVerificationToken(userId: string, token: string, expiresAt: string): Promise<void> {
  await ensureSchema();
  const db = getDb();
  await db.execute({
    sql: `UPDATE profiles SET verification_token = ?, verification_token_expires_at = ?, updated_at = datetime('now') WHERE id = ?`,
    args: [token, expiresAt, userId],
  });
}

export async function findProfileByVerificationToken(
  token: string,
): Promise<{ id: string; email: string; verification_token_expires_at: string | null } | undefined> {
  await ensureSchema();
  const db = getDb();
  const result = await db.execute({
    sql: 'SELECT id, email, verification_token_expires_at FROM profiles WHERE verification_token = ?',
    args: [token],
  });
  return result.rows[0] as unknown as
    | { id: string; email: string; verification_token_expires_at: string | null }
    | undefined;
}

export async function markEmailVerified(userId: string): Promise<void> {
  await ensureSchema();
  const db = getDb();
  await db.execute({
    sql: `UPDATE profiles SET email_verified = 1, verification_token = NULL, verification_token_expires_at = NULL, updated_at = datetime('now') WHERE id = ?`,
    args: [userId],
  });
}

export async function getVerificationTokenExpiresAt(userId: string): Promise<string | null> {
  await ensureSchema();
  const db = getDb();
  const result = await db.execute({
    sql: 'SELECT verification_token_expires_at FROM profiles WHERE id = ?',
    args: [userId],
  });
  const row = result.rows[0] as unknown as { verification_token_expires_at: string | null } | undefined;
  return row?.verification_token_expires_at ?? null;
}
