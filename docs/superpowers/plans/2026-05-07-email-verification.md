# Email Verification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add email verification to the email signup flow — one free reading allowed before verification is required, Google OAuth auto-verified, bots frozen out via DB migration.

**Architecture:** Three new columns on `profiles` (email_verified, verification_token, verification_token_expires_at). Signup generates a token and sends a verification email. After the user's first reading, the dashboard shows a full-screen gate until the link is clicked. Google OAuth users are auto-verified at creation time.

**Tech Stack:** Turso/libSQL, Resend (HTML email), Next.js API routes, React (client component for gate)

---

## File Map

| Action | File | Purpose |
|--------|------|---------|
| Modify | `app/src/lib/db/sqlite.ts` | Add 3 columns to schema + one-time migration for existing users |
| Modify | `app/src/lib/db/queries.ts` | Add `email_verified` to `Profile` type; add `getReadingCount` |
| Create | `app/src/lib/db/verification.ts` | Token generation, DB save, token lookup/validation |
| Modify | `app/src/lib/email/client.ts` | Add `sendVerificationEmail` |
| Create | `app/src/lib/email/templates/verification.ts` | HTML email template |
| Modify | `app/src/app/api/auth/signup/route.ts` | Generate token + send verification email on signup |
| Modify | `app/src/lib/db/oauth.ts` | Set `email_verified = 1` for Google users |
| Create | `app/src/app/api/auth/verify/route.ts` | GET — validate token, mark verified, redirect |
| Create | `app/src/app/api/auth/resend-verification/route.ts` | POST — resend verification email (rate-limited) |
| Modify | `app/src/app/api/reading/route.ts` | Block second reading if not verified |
| Create | `app/src/components/auth/VerificationGate.tsx` | Full-screen overlay component |
| Modify | `app/src/app/[locale]/(app)/dashboard/page.tsx` | Render gate + verified toast |

---

## Task 1: DB Schema — Add Verification Columns

**Files:**
- Modify: `app/src/lib/db/sqlite.ts`

- [ ] **Step 1: Add three columns to `ensureSchema`**

In `app/src/lib/db/sqlite.ts`, add the following after the existing `CREATE TABLE IF NOT EXISTS profiles` block (after all the `CREATE INDEX` statements, before `_initialized = true`):

```typescript
  await db.executeMultiple(`
    ALTER TABLE profiles ADD COLUMN email_verified INTEGER NOT NULL DEFAULT 0;
    ALTER TABLE profiles ADD COLUMN verification_token TEXT DEFAULT NULL;
    ALTER TABLE profiles ADD COLUMN verification_token_expires_at TEXT DEFAULT NULL;
  `).catch(() => {
    // Columns already exist — safe to ignore in SQLite
  });
```

- [ ] **Step 2: Add one-time migration for existing users**

Immediately after the `ALTER TABLE` block above, add:

```typescript
  // Migration: grandfather real users, freeze bot accounts
  // Bots: Gmail addresses with 3+ dots in local part (dot-trick pattern)
  await db.executeMultiple(`
    UPDATE profiles
    SET email_verified = 1
    WHERE auth_provider IN ('google', 'email+google');

    UPDATE profiles
    SET email_verified = 1
    WHERE auth_provider = 'email'
      AND email NOT GLOB '*.*.*.*@gmail.com';

    UPDATE profiles
    SET email_verified = 1
    WHERE auth_provider = 'email'
      AND email NOT LIKE '%gmail.com';
  `).catch(() => {});
```

- [ ] **Step 3: Verify migration runs cleanly**

```bash
cd app && node -e "
const { ensureSchema } = require('./src/lib/db/sqlite.ts');
ensureSchema().then(() => console.log('OK')).catch(console.error);
" 2>&1 || echo "Use turso CLI to verify"
```

Instead, verify via Turso CLI:
```bash
turso db shell ai-tarot "SELECT email, email_verified FROM profiles ORDER BY created_at;"
```

Expected: dot-trick Gmail accounts have `email_verified = 0`, all others have `1`.

- [ ] **Step 4: Commit**

```bash
git add app/src/lib/db/sqlite.ts
git commit -m "feat: add email_verified columns and migrate existing users"
```

---

## Task 2: Profile Type + Reading Count Query

**Files:**
- Modify: `app/src/lib/db/queries.ts`

- [ ] **Step 1: Add `email_verified` to the `Profile` interface**

In `app/src/lib/db/queries.ts`, update the `Profile` interface:

```typescript
export interface Profile {
  id: string;
  email: string;
  display_name: string | null;
  language: string;
  tier: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string;
  updated_at: string;
  email_verified: number; // 0 = unverified, 1 = verified
}
```

- [ ] **Step 2: Add `getReadingCount` function**

After the `getRecentReadings` function in `app/src/lib/db/queries.ts`, add:

```typescript
export async function getReadingCount(userId: string): Promise<number> {
  await ensureSchema();
  const db = getDb();
  const result = await db.execute({
    sql: 'SELECT COUNT(*) as count FROM readings WHERE user_id = ?',
    args: [userId],
  });
  const row = result.rows[0] as unknown as { count: number };
  return row?.count ?? 0;
}
```

- [ ] **Step 3: Commit**

```bash
git add app/src/lib/db/queries.ts
git commit -m "feat: add email_verified to Profile type and getReadingCount query"
```

---

## Task 3: Verification Token DB Functions

**Files:**
- Create: `app/src/lib/db/verification.ts`

- [ ] **Step 1: Create the file**

```typescript
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
): Promise<{ id: string; email: string; verification_token_expires_at: string } | undefined> {
  await ensureSchema();
  const db = getDb();
  const result = await db.execute({
    sql: 'SELECT id, email, verification_token_expires_at FROM profiles WHERE verification_token = ?',
    args: [token],
  });
  return result.rows[0] as unknown as
    | { id: string; email: string; verification_token_expires_at: string }
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

export async function getLastTokenIssuedAt(userId: string): Promise<string | null> {
  await ensureSchema();
  const db = getDb();
  const result = await db.execute({
    sql: 'SELECT verification_token_expires_at FROM profiles WHERE id = ?',
    args: [userId],
  });
  const row = result.rows[0] as unknown as { verification_token_expires_at: string | null } | undefined;
  return row?.verification_token_expires_at ?? null;
}
```

- [ ] **Step 2: Commit**

```bash
git add app/src/lib/db/verification.ts
git commit -m "feat: add verification token DB functions"
```

---

## Task 4: Verification Email Template + Client Function

**Files:**
- Create: `app/src/lib/email/templates/verification.ts`
- Modify: `app/src/lib/email/client.ts`

- [ ] **Step 1: Create the email template**

Create `app/src/lib/email/templates/verification.ts`:

```typescript
interface VerificationEmailProps {
  verifyUrl: string;
  displayName?: string;
}

export function verificationEmail({ verifyUrl, displayName }: VerificationEmailProps): string {
  const greeting = displayName ? `Hi ${displayName}` : 'Hello';

  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:520px;margin:0 auto;padding:40px 24px;">
    <div style="text-align:center;margin-bottom:32px;">
      <span style="font-size:36px;color:#f59e0b;">✴</span>
      <h1 style="color:#ffffff;font-size:22px;margin:12px 0 0;">TarotVeil</h1>
    </div>

    <div style="background:#111111;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:32px 24px;">
      <h2 style="color:#f59e0b;font-size:18px;margin:0 0 16px;">${greeting},</h2>
      <p style="color:#d4d4d4;font-size:15px;line-height:1.6;margin:0 0 16px;">
        The cards are waiting. Confirm your email address to unlock your readings and keep your journey with TarotVeil.
      </p>
      <p style="color:#d4d4d4;font-size:15px;line-height:1.6;margin:0 0 24px;">
        This link expires in 24 hours.
      </p>
      <div style="text-align:center;margin-bottom:24px;">
        <a href="${verifyUrl}" style="display:inline-block;background:#f59e0b;color:#000000;font-weight:600;font-size:15px;padding:12px 28px;border-radius:10px;text-decoration:none;">
          Verify My Email
        </a>
      </div>
      <p style="color:#666666;font-size:12px;line-height:1.6;margin:0;">
        Or copy this link into your browser:<br>
        <span style="color:#a3a3a3;word-break:break-all;">${verifyUrl}</span>
      </p>
    </div>

    <p style="color:#666666;font-size:12px;text-align:center;margin-top:32px;">
      If you didn't create a TarotVeil account, you can safely ignore this email.
    </p>
  </div>
</body>
</html>`.trim();
}
```

- [ ] **Step 2: Add `sendVerificationEmail` to the email client**

In `app/src/lib/email/client.ts`, add this import at the top:

```typescript
import { verificationEmail } from './templates/verification';
```

Then add this function after `sendWelcomeEmail`:

```typescript
export async function sendVerificationEmail(
  email: string,
  token: string,
  displayName?: string,
): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://localhost:3000';
  const verifyUrl = `${baseUrl}/api/auth/verify?token=${token}`;
  const html = verificationEmail({ verifyUrl, displayName });
  await sendEmail(email, 'Confirm your email — your reading awaits', html);
}
```

- [ ] **Step 3: Commit**

```bash
git add app/src/lib/email/templates/verification.ts app/src/lib/email/client.ts
git commit -m "feat: add verification email template and sendVerificationEmail"
```

---

## Task 5: Update Signup Route

**Files:**
- Modify: `app/src/app/api/auth/signup/route.ts`

- [ ] **Step 1: Update the signup route**

Replace the contents of `app/src/app/api/auth/signup/route.ts` with:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { signUp, setSessionCookie } from '@/lib/db/auth';
import { sendWelcomeEmail, sendVerificationEmail } from '@/lib/email/client';
import { generateVerificationToken, saveVerificationToken } from '@/lib/db/verification';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const result = await signUp(email, password, name);

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // Generate and store verification token
    const { token, expiresAt } = generateVerificationToken();
    await saveVerificationToken(result.user.id, token, expiresAt);

    // Fire-and-forget emails
    void sendWelcomeEmail(result.user.email, name);
    void sendVerificationEmail(result.user.email, token, name);

    await setSessionCookie(result.user);
    return NextResponse.json({ user: result.user });
  } catch (err) {
    console.error('Signup error:', err);
    return NextResponse.json({ error: (err as Error).message || 'Internal error' }, { status: 500 });
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add app/src/app/api/auth/signup/route.ts
git commit -m "feat: generate verification token and send verification email on signup"
```

---

## Task 6: Auto-Verify Google OAuth Users

**Files:**
- Modify: `app/src/lib/db/oauth.ts`

- [ ] **Step 1: Set `email_verified = 1` on Google user creation**

In `app/src/lib/db/oauth.ts`, find the `// 3. Create new user` block and update the INSERT:

```typescript
  // 3. Create new user
  const id = crypto.randomUUID();
  const sentinelHash = `OAUTH:${crypto.randomUUID()}`;

  await db.execute({
    sql: `INSERT INTO profiles (id, email, password_hash, display_name, auth_provider, google_id, email_verified)
          VALUES (?, ?, ?, ?, 'google', ?, 1)`,
    args: [id, email.toLowerCase().trim(), sentinelHash, displayName || null, googleId],
  });
```

Also update the existing-account link (the `// 2. Check by email` block) to ensure email is verified when linking Google:

```typescript
    await db.execute({
      sql: `UPDATE profiles
            SET google_id = ?,
                auth_provider = CASE WHEN auth_provider = 'email' THEN 'email+google' ELSE auth_provider END,
                email_verified = 1,
                updated_at = datetime('now')
            WHERE id = ?`,
      args: [googleId, existing.id],
    });
```

- [ ] **Step 2: Commit**

```bash
git add app/src/lib/db/oauth.ts
git commit -m "feat: auto-verify email for Google OAuth signups"
```

---

## Task 7: Verify Token API Route

**Files:**
- Create: `app/src/app/api/auth/verify/route.ts`

- [ ] **Step 1: Create the route**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { findProfileByVerificationToken, markEmailVerified } from '@/lib/db/verification';

function resolveBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL;
  return 'http://localhost:3000';
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  const baseUrl = resolveBaseUrl();

  if (!token) {
    return NextResponse.redirect(`${baseUrl}/dashboard?verified=error`);
  }

  const profile = await findProfileByVerificationToken(token);

  if (!profile) {
    return NextResponse.redirect(`${baseUrl}/dashboard?verified=invalid`);
  }

  const expired = new Date(profile.verification_token_expires_at) < new Date();
  if (expired) {
    return NextResponse.redirect(`${baseUrl}/dashboard?verified=expired`);
  }

  await markEmailVerified(profile.id);

  return NextResponse.redirect(`${baseUrl}/dashboard?verified=true`);
}
```

- [ ] **Step 2: Verify the route works manually**

Start dev server:
```bash
cd app && npm run dev
```

Then use Turso CLI to get a real token from a test account:
```bash
turso db shell ai-tarot "SELECT verification_token FROM profiles WHERE email_verified = 0 LIMIT 1;"
```

Visit `http://localhost:3000/api/auth/verify?token=<token>` — should redirect to `/dashboard?verified=true`.

Verify in DB:
```bash
turso db shell ai-tarot "SELECT email, email_verified FROM profiles WHERE email_verified = 1;"
```

- [ ] **Step 3: Commit**

```bash
git add app/src/app/api/auth/verify/route.ts
git commit -m "feat: add GET /api/auth/verify token validation route"
```

---

## Task 8: Resend Verification API Route

**Files:**
- Create: `app/src/app/api/auth/resend-verification/route.ts`

- [ ] **Step 1: Create the route**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/db/auth';
import { getProfile } from '@/lib/db/queries';
import {
  generateVerificationToken,
  saveVerificationToken,
  getLastTokenIssuedAt,
} from '@/lib/db/verification';
import { sendVerificationEmail } from '@/lib/email/client';

export async function POST(_request: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const profile = await getProfile(user.id);
  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  if (profile.email_verified === 1) {
    return NextResponse.json({ error: 'Email already verified' }, { status: 400 });
  }

  // Rate limit: 1 resend per 60 seconds
  const lastExpiresAt = await getLastTokenIssuedAt(user.id);
  if (lastExpiresAt) {
    const lastIssued = new Date(lastExpiresAt).getTime() - 24 * 60 * 60 * 1000;
    const secondsSinceIssued = (Date.now() - lastIssued) / 1000;
    if (secondsSinceIssued < 60) {
      return NextResponse.json(
        { error: 'Please wait before requesting another email', retryAfter: Math.ceil(60 - secondsSinceIssued) },
        { status: 429 },
      );
    }
  }

  const { token, expiresAt } = generateVerificationToken();
  await saveVerificationToken(user.id, token, expiresAt);
  void sendVerificationEmail(user.email, token, profile.display_name ?? undefined);

  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 2: Commit**

```bash
git add app/src/app/api/auth/resend-verification/route.ts
git commit -m "feat: add POST /api/auth/resend-verification route"
```

---

## Task 9: Block Second Reading at API Level

**Files:**
- Modify: `app/src/app/api/reading/route.ts`

- [ ] **Step 1: Add verification check after profile fetch**

In `app/src/app/api/reading/route.ts`, after the `const tier = ...` line, add:

```typescript
  // Block second reading if email not verified
  if (profile?.email_verified === 0) {
    const { getReadingCount } = await import('@/lib/db/queries');
    const count = await getReadingCount(user.id);
    if (count >= 1) {
      return NextResponse.json({ error: 'Please verify your email to continue reading', code: 'EMAIL_UNVERIFIED' }, { status: 403 });
    }
  }
```

- [ ] **Step 2: Commit**

```bash
git add app/src/app/api/reading/route.ts
git commit -m "feat: block second reading for unverified email accounts"
```

---

## Task 10: VerificationGate Component

**Files:**
- Create: `app/src/components/auth/VerificationGate.tsx`

- [ ] **Step 1: Create the component**

```typescript
'use client';

import { useState } from 'react';

interface Props {
  email: string;
}

export default function VerificationGate({ email }: Props) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [countdown, setCountdown] = useState(0);

  async function handleResend() {
    setStatus('sending');
    try {
      const res = await fetch('/api/auth/resend-verification', { method: 'POST' });
      if (res.status === 429) {
        const data = await res.json();
        setCountdown(data.retryAfter ?? 60);
        setStatus('idle');
        const timer = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) { clearInterval(timer); return 0; }
            return prev - 1;
          });
        }, 1000);
        return;
      }
      if (!res.ok) throw new Error('Failed');
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm px-4">
      <div className="w-full max-w-md bg-[#111111] border border-white/10 rounded-2xl p-8 text-center">
        <span className="text-4xl block mb-4">✴</span>
        <h2 className="text-xl font-bold text-amber-400 mb-3">Confirm your email</h2>
        <p className="text-gray-300 text-sm leading-relaxed mb-2">
          We sent a verification link to
        </p>
        <p className="text-white font-medium text-sm mb-6 break-all">{email}</p>
        <p className="text-gray-400 text-sm leading-relaxed mb-8">
          Click the link in that email to unlock your readings. Check your spam folder if you don't see it.
        </p>

        {status === 'sent' ? (
          <p className="text-amber-400 text-sm">Email sent — check your inbox.</p>
        ) : status === 'error' ? (
          <p className="text-red-400 text-sm">Something went wrong. Try again.</p>
        ) : countdown > 0 ? (
          <p className="text-gray-500 text-sm">Resend available in {countdown}s</p>
        ) : (
          <button
            onClick={handleResend}
            disabled={status === 'sending'}
            className="text-amber-400 hover:text-amber-300 text-sm underline underline-offset-2 disabled:opacity-50"
          >
            {status === 'sending' ? 'Sending…' : 'Resend verification email'}
          </button>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/src/components/auth/VerificationGate.tsx
git commit -m "feat: add VerificationGate full-screen overlay component"
```

---

## Task 11: Dashboard Integration

**Files:**
- Create: `app/src/components/auth/VerifiedToast.tsx`
- Modify: `app/src/app/[locale]/(app)/dashboard/page.tsx`

- [ ] **Step 1: Create VerifiedToast component**

Create `app/src/components/auth/VerifiedToast.tsx`:

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function VerifiedToast() {
  const [visible, setVisible] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    router.replace(pathname, { scroll: false });
    const timer = setTimeout(() => setVisible(false), 4000);
    return () => clearTimeout(timer);
  }, [pathname, router]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-amber-500 text-black font-medium text-sm px-5 py-3 rounded-xl shadow-lg">
      ✓ Email verified — welcome to Tarot Veil
    </div>
  );
}
```

- [ ] **Step 2: Update DashboardPage signature to accept searchParams**

In `app/src/app/[locale]/(app)/dashboard/page.tsx`, update the component signature from:

```typescript
export default async function DashboardPage({ params }: { params: Promise<{ locale: string }> }) {
```

to:

```typescript
export default async function DashboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ verified?: string }>;
}) {
```

- [ ] **Step 3: Add imports and fetch reading count**

At the top of `app/src/app/[locale]/(app)/dashboard/page.tsx`, add:

```typescript
import VerificationGate from '@/components/auth/VerificationGate';
import VerifiedToast from '@/components/auth/VerifiedToast';
import { getReadingCount } from '@/lib/db/queries';
```

Inside `DashboardPage`, after the `const readings = ...` line, add:

```typescript
  const readingCount = await getReadingCount(user.id);
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const justVerified = resolvedSearchParams?.verified === 'true';
  const showGate = profile?.email_verified === 0 && readingCount >= 1;
```

- [ ] **Step 4: Render the gate and toast**

Inside the returned JSX, right after `<ClaimAnonymousReading />`, add:

```tsx
      {showGate && <VerificationGate email={user.email} />}
      {justVerified && <VerifiedToast />}
```

- [ ] **Step 5: Run the dev server and test the full flow**

```bash
cd app && npm run dev
```

Test checklist:
1. Sign up with a new email → land on dashboard, verification email sent
2. Do one reading → dashboard shows normally
3. Try to start a second reading → reading API returns 403 with `code: EMAIL_UNVERIFIED`
4. Dashboard shows `VerificationGate` overlay with your email address
5. Click "Resend" → button shows "Email sent"
6. Click the link in the verification email → redirects to `/dashboard?verified=true`
7. Toast shows "Email verified — welcome to Tarot Veil" for 4 seconds
8. Gate is gone, second reading now allowed

- [ ] **Step 6: Commit**

```bash
git add app/src/components/auth/VerifiedToast.tsx app/src/app/[locale]/(app)/dashboard/page.tsx
git commit -m "feat: show verification gate on dashboard and verified toast after confirmation"
```

---

## Task 12: Build Check

- [ ] **Step 1: Run production build**

```bash
cd app && npm run build
```

Expected: no TypeScript errors, no build failures.

- [ ] **Step 2: Fix any type errors and commit**

```bash
git add -A
git commit -m "fix: resolve build errors from email verification feature"
```
