import { getDb, ensureSchema } from '@/lib/db/sqlite';

const FREE_READING_LIMIT = 3;        // max readings per IP
const FREE_READING_WINDOW_HOURS = 24; // within this time window

/**
 * Extract client IP from request headers.
 * On Vercel, x-forwarded-for contains the real IP.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || 'unknown';
}

/**
 * Check whether an IP has exceeded the free reading rate limit.
 * Returns { allowed: true } or { allowed: false, retryAfterMinutes }.
 */
export async function checkFreeReadingLimit(ip: string): Promise<{
  allowed: boolean;
  retryAfterMinutes?: number;
}> {
  if (ip === 'unknown') return { allowed: true };

  await ensureSchema();
  const db = getDb();

  const cutoff = new Date(Date.now() - FREE_READING_WINDOW_HOURS * 60 * 60 * 1000)
    .toISOString()
    .replace('T', ' ')
    .slice(0, 19);

  const result = await db.execute({
    sql: `SELECT COUNT(*) as count FROM free_reading_rate_limits WHERE ip = ? AND created_at > ?`,
    args: [ip, cutoff],
  });

  const count = (result.rows[0] as unknown as { count: number }).count;

  if (count >= FREE_READING_LIMIT) {
    // Find the oldest entry in the window to estimate retry time
    const oldest = await db.execute({
      sql: `SELECT created_at FROM free_reading_rate_limits WHERE ip = ? AND created_at > ? ORDER BY created_at ASC LIMIT 1`,
      args: [ip, cutoff],
    });

    let retryAfterMinutes = 60;
    if (oldest.rows[0]) {
      const oldestTime = new Date((oldest.rows[0] as unknown as { created_at: string }).created_at + 'Z').getTime();
      const expiresAt = oldestTime + FREE_READING_WINDOW_HOURS * 60 * 60 * 1000;
      retryAfterMinutes = Math.max(1, Math.ceil((expiresAt - Date.now()) / 60000));
    }

    return { allowed: false, retryAfterMinutes };
  }

  return { allowed: true };
}

/**
 * Record a free reading for rate limiting purposes.
 */
export async function recordFreeReading(ip: string): Promise<void> {
  if (ip === 'unknown') return;

  await ensureSchema();
  const db = getDb();

  await db.execute({
    sql: `INSERT INTO free_reading_rate_limits (ip) VALUES (?)`,
    args: [ip],
  });

  // Cleanup old entries (older than 48 hours) to prevent table bloat
  const cleanup = new Date(Date.now() - 48 * 60 * 60 * 1000)
    .toISOString()
    .replace('T', ' ')
    .slice(0, 19);

  await db.execute({
    sql: `DELETE FROM free_reading_rate_limits WHERE created_at < ?`,
    args: [cleanup],
  });
}
