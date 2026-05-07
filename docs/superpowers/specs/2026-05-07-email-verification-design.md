# Email Verification — Design Spec

**Date:** 2026-05-07
**Status:** Approved
**Motivation:** Bot accounts using Gmail dot-trick addresses are abusing the free reading tier. Email verification confirms inbox ownership and kills the economics of multi-account abuse.

---

## Scope

- Email-only signups must verify before getting a second reading
- Google OAuth signups are auto-verified (Google already confirmed the email)
- Existing real users are grandfathered as verified; existing bot accounts are frozen

---

## Database

Three new columns on the `profiles` table:

```sql
ALTER TABLE profiles ADD COLUMN email_verified INTEGER NOT NULL DEFAULT 0;
ALTER TABLE profiles ADD COLUMN verification_token TEXT DEFAULT NULL;
ALTER TABLE profiles ADD COLUMN verification_token_expires_at TEXT DEFAULT NULL;
```

### Migration for existing accounts

| Account type | Action |
|---|---|
| Google OAuth (`auth_provider = 'google'` or `'email+google'`) | `email_verified = 1` |
| Email accounts with a real display name (not a random string) AND a non-dot-trick address | `email_verified = 1` |
| Bot accounts (dot-trick pattern: 3+ dots in Gmail local part + digits) | `email_verified = 0` — frozen after first reading |

Bot detection for migration: Gmail addresses where the local part contains 3 or more dots AND ends with digits (e.g. `ke.ga.s.usep.oj1.2@gmail.com`). Applied as a one-time SQL UPDATE — not runtime logic.

---

## Signup Flow

**`/api/auth/signup` changes:**
1. Create profile with `email_verified = 0`
2. Generate a 32-byte `crypto.randomBytes(32).toString('hex')` token
3. Store token + `Date.now() + 24h` expiry on the profile
4. Fire-and-forget: send verification email via Resend
5. Set session cookie and return — user lands on dashboard normally

Google OAuth signups (`/api/auth/google/callback`): set `email_verified = 1` on profile creation, skip token generation entirely.

---

## API Routes

### `GET /api/auth/verify?token=xxx`
- Look up profile by `verification_token`
- If not found → return 400 "Invalid or expired link"
- If `verification_token_expires_at` is in the past → return 400 "Link expired"
- Set `email_verified = 1`, clear `verification_token` and `verification_token_expires_at`
- Redirect to `/dashboard?verified=true`

### `POST /api/auth/resend-verification`
- Requires authenticated session
- If already verified → return 400
- If last token was issued less than 60 seconds ago → return 429
- Generate fresh token + new 24h expiry, update profile
- Send new verification email
- Return 200

---

## Gating Logic

After a reading is saved, the dashboard/reading history checks the session user:

```
if (user.email_verified === 0 && readingCount >= 1) {
  show verification gate
}
```

- The reading they just completed is visible — they are not punished, just blocked from starting another
- Gate is a full-screen overlay on the dashboard, not a dismissible banner
- Gate shows the email address on file and a "Resend email" button

---

## Verification Email

- **Transport:** Resend (`RESEND_FROM_EMAIL`)
- **Template:** React Email component
- **Subject:** `Confirm your email — your reading awaits`
- **Tone:** Warm, mystical, on-brand — not a cold transactional email
- **CTA:** Single button — "Verify My Email" → links to `/api/auth/verify?token=xxx`
- **Fallback:** Plain-text version with the full URL for clients that block HTML

---

## Verification Gate UI

Shown on the dashboard when `email_verified = 0` and `readingCount >= 1`:

- Full-screen overlay (not dismissible)
- Message: *"We sent a link to [email]. Click it to unlock your readings."*
- "Resend email" button — disabled for 60s after clicking, then re-enabled
- If user verifies on another device: manual page refresh picks up the new state

---

## Success State

- Verification link redirects to `/dashboard?verified=true`
- Dashboard detects the query param and shows a toast: *"Email verified — welcome to Tarot Veil"*
- Query param is cleared from the URL after the toast is shown

---

## What Is Not In Scope

- Email change flow (not needed now)
- SMS verification
- CAPTCHA (may be added later as a secondary layer)
- Blocking unverified users from the free anonymous reading (that flow is separate)
