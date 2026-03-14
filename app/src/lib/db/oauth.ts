import { getDb, ensureSchema } from './sqlite';
import { AuthUser } from './auth';

export async function findUserByGoogleId(googleId: string): Promise<{ id: string; email: string } | undefined> {
  await ensureSchema();
  const db = getDb();
  const result = await db.execute({
    sql: 'SELECT id, email FROM profiles WHERE google_id = ?',
    args: [googleId],
  });
  return result.rows[0] as unknown as { id: string; email: string } | undefined;
}

export async function findOrCreateGoogleUser(
  email: string,
  googleId: string,
  displayName?: string,
): Promise<AuthUser> {
  await ensureSchema();
  const db = getDb();

  // 1. Check by Google ID
  const byGoogleId = await findUserByGoogleId(googleId);
  if (byGoogleId) {
    return { id: byGoogleId.id, email: byGoogleId.email };
  }

  // 2. Check by email — link Google to existing account
  const byEmail = await db.execute({
    sql: 'SELECT id, email FROM profiles WHERE email = ?',
    args: [email.toLowerCase().trim()],
  });

  if (byEmail.rows[0]) {
    const existing = byEmail.rows[0] as unknown as { id: string; email: string };
    await db.execute({
      sql: "UPDATE profiles SET google_id = ?, auth_provider = CASE WHEN auth_provider = 'email' THEN 'email+google' ELSE auth_provider END, updated_at = datetime('now') WHERE id = ?",
      args: [googleId, existing.id],
    });
    return { id: existing.id, email: existing.email };
  }

  // 3. Create new user
  const id = crypto.randomUUID();
  const sentinelHash = `OAUTH:${crypto.randomUUID()}`;

  await db.execute({
    sql: `INSERT INTO profiles (id, email, password_hash, display_name, auth_provider, google_id) VALUES (?, ?, ?, ?, 'google', ?)`,
    args: [id, email.toLowerCase().trim(), sentinelHash, displayName || null, googleId],
  });

  return { id, email: email.toLowerCase().trim() };
}
