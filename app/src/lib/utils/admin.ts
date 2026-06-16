/**
 * Admin authorization.
 *
 * Admin access is granted by an explicit email allowlist in the
 * ADMIN_EMAILS environment variable (comma-separated), NOT by billing tier.
 * Paying customers must never gain access to platform-wide analytics/PII.
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const allowlist = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return allowlist.includes(email.toLowerCase());
}
