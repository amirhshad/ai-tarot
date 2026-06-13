import { getDb, ensureSchema } from '@/lib/db/sqlite';

const FREE_READING_LIMIT = 3;        // max readings per IP
const FREE_READING_WINDOW_HOURS = 24; // within this time window

// Global backstop: cap total anonymous free readings per hour across ALL IPs.
// This bounds worst-case LLM spend even if per-IP limiting is evaded (e.g. via
// header spoofing or large IP rotation). Override with FREE_READING_GLOBAL_HOURLY_CAP.
const GLOBAL_HOURLY_CAP = Number(process.env.FREE_READING_GLOBAL_HOURLY_CAP) || 500;

/**
 * Extract client IP from request headers.
 *
 * SECURITY: the leftmost x-forwarded-for entry is supplied by the client and is
 * forgeable, so it must NOT be used for rate limiting. On Vercel, `x-real-ip`
 * is set by the platform to the true client IP and overrides any client value;
 * prefer it. Only fall back to the LAST x-forwarded-for entry (the hop appended
 * by the platform), never the first.
 */
export function getClientIp(request: Request): string {
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();

  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const parts = forwarded.split(',').map((p) => p.trim()).filter(Boolean);
    if (parts.length > 0) return parts[parts.length - 1];
  }
  return 'unknown';
}

/**
 * Check the global hourly ceiling for anonymous free readings.
 * Returns { allowed: false } once the platform-wide cap is hit.
 */
export async function checkGlobalFreeReadingLimit(): Promise<{ allowed: boolean }> {
  await ensureSchema();
  const db = getDb();

  const cutoff = new Date(Date.now() - 60 * 60 * 1000)
    .toISOString()
    .replace('T', ' ')
    .slice(0, 19);

  const result = await db.execute({
    sql: `SELECT COUNT(*) as count FROM free_reading_rate_limits WHERE created_at > ?`,
    args: [cutoff],
  });

  const count = (result.rows[0] as unknown as { count: number }).count;
  return { allowed: count < GLOBAL_HOURLY_CAP };
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
  await ensureSchema();
  const db = getDb();

  // Always record (including 'unknown') so the global hourly cap accounts for
  // every anonymous reading, not just those with an identifiable IP.
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
