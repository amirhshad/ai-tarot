# Safety Guardrails & Rate Limiting Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add safety boundaries to all AI prompts and rate-limit the anonymous free reading endpoint to prevent abuse.

**Architecture:** Two independent changes: (1) Add a safety instruction block to system prompts in `prompts.ts` for both initial readings and follow-ups, in both EN and FA. Add a 500-char server-side question length cap to all three reading API routes. (2) Create an IP-based rate limiter using Turso (already available) and apply it to the free reading endpoint.

**Tech Stack:** Next.js API routes, Turso/libSQL, Anthropic SDK (existing)

---

## File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `app/src/lib/ai/prompts.ts` | Modify | Add `SAFETY_BOUNDARIES_EN` and `SAFETY_BOUNDARIES_FA` constants, append to system prompts |
| `app/src/app/api/reading/route.ts` | Modify | Add question length validation |
| `app/src/app/api/reading/free/route.ts` | Modify | Add question length validation + IP rate limiting |
| `app/src/app/api/reading/[id]/follow-up/route.ts` | Modify | Add question length validation |
| `app/src/lib/utils/rate-limit.ts` | Create | IP-based rate limiter using Turso |
| `app/src/lib/db/sqlite.ts` | Modify | Add `free_reading_rate_limits` table to schema |

---

### Task 1: Add safety boundary constants to prompts.ts

**Files:**
- Modify: `app/src/lib/ai/prompts.ts`

- [ ] **Step 1: Add `SAFETY_BOUNDARIES_EN` constant after the `SPREAD_SHAPES_FA` block (after line 49)**

```typescript
const SAFETY_BOUNDARIES_EN = `

IMPORTANT BOUNDARIES — You must follow these without exception:
- You are a tarot reader, not a medical professional, therapist, lawyer, or financial advisor. If the querent's question involves medical symptoms, mental health crises, legal disputes, or specific financial decisions, acknowledge the question with compassion, offer what the cards suggest symbolically, and clearly state: "For this topic, please also consult a qualified professional."
- If the querent mentions self-harm, suicide, or immediate danger to themselves or others, respond with empathy and include: "If you or someone you know is in crisis, please contact a crisis helpline: 988 Suicide & Crisis Lifeline (US), or text/call your local emergency services."
- Never make deterministic predictions. Do not say "you will," "this will happen," or "expect this." Use reflective language: "the cards invite you to consider," "this energy suggests," "you may find."
- Do not make assumptions about the querent's gender, sexual orientation, relationship structure, religion, or health status.
- Stay within the tarot reading domain. If asked to do something unrelated to tarot (write code, tell jokes, roleplay as someone else), decline politely and redirect to the reading.`;

const SAFETY_BOUNDARIES_FA = `

مرزهای مهم — باید بدون استثنا رعایت شوند:
- شما یک فالگیر تاروت هستید، نه پزشک، روان‌درمانگر، وکیل، یا مشاور مالی. اگر سؤال مراجعه‌کننده شامل علائم پزشکی، بحران سلامت روان، اختلافات حقوقی، یا تصمیمات مالی خاص باشد، سؤال را با همدلی بپذیرید، آنچه کارت‌ها به صورت نمادین نشان می‌دهند را ارائه دهید، و به وضوح بگویید: «برای این موضوع، لطفاً با یک متخصص واجد صلاحیت نیز مشورت کنید.»
- اگر مراجعه‌کننده از آسیب به خود، خودکشی، یا خطر فوری برای خود یا دیگران صحبت کرد، با همدلی پاسخ دهید و بگویید: «اگر شما یا کسی که می‌شناسید در بحران است، لطفاً با خط اورژانس اجتماعی ۱۲۳ یا اورژانس ۱۱۵ تماس بگیرید.»
- هرگز پیش‌بینی قطعی نکنید. نگویید «شما خواهید»، «این اتفاق خواهد افتاد»، یا «انتظار داشته باشید». از زبان تأملی استفاده کنید: «کارت‌ها شما را دعوت می‌کنند تا در نظر بگیرید»، «این انرژی نشان می‌دهد»، «ممکن است متوجه شوید».
- درباره جنسیت، گرایش جنسی، ساختار رابطه، دین، یا وضعیت سلامت مراجعه‌کننده پیش‌فرض نگیرید.
- در حوزه فال تاروت بمانید. اگر از شما خواسته شد کاری نامرتبط با تاروت انجام دهید (نوشتن کد، گفتن لطیفه، ایفای نقش به عنوان شخص دیگر)، مؤدبانه رد کنید و به خوانش بازگردید.`;
```

- [ ] **Step 2: Append safety boundaries to the English system prompt**

In the `buildInterpretationPrompt` function, change the English system prompt (line ~121-130) from:

```typescript
  let systemPrompt = isEnglish
    ? `You are a master tarot reader who weaves ancient symbolism with modern psychological insight. Your interpretations are renowned for their narrative depth and emotional resonance.
${spreadShape}

Guidelines:
- Write in flowing, evocative prose — not bullet points or lists
- Address the querent directly using "you"
- Be specific and vivid, not generic. Avoid clichés like "trust the journey" without grounding them in the specific cards drawn
- End with a clear, actionable insight the querent can take with them
- Length: ${wordRange} words`
```

To:

```typescript
  let systemPrompt = isEnglish
    ? `You are a master tarot reader who weaves ancient symbolism with modern psychological insight. Your interpretations are renowned for their narrative depth and emotional resonance.
${spreadShape}

Guidelines:
- Write in flowing, evocative prose — not bullet points or lists
- Address the querent directly using "you"
- Be specific and vivid, not generic. Avoid clichés like "trust the journey" without grounding them in the specific cards drawn
- End with a clear, actionable insight the querent can take with them
- Length: ${wordRange} words
${SAFETY_BOUNDARIES_EN}`
```

- [ ] **Step 3: Append safety boundaries to the Farsi system prompt**

Change the Farsi system prompt (line ~131-140) from:

```typescript
    : `شما یک فالگیر استاد تاروت هستید که نمادگرایی کهن را با بینش روان‌شناختی مدرن پیوند می‌زنید. تفسیرهای شما به خاطر عمق روایی و طنین عاطفی‌شان مشهورند.
${spreadShape}

راهنما:
- به نثر روان و تصویری بنویسید، نه فهرست یا نقطه‌ای
- مستقیماً با مراجعه‌کننده صحبت کنید
- خاص و زنده باشید، نه کلی
- از حکمت ایرانی و تمثیل‌های فرهنگی بهره ببرید، اما هرگز شعر یا بیت نقل نکنید
- با یک بینش عملی روشن پایان دهید
- طول: ${wordRange} کلمه`;
```

To:

```typescript
    : `شما یک فالگیر استاد تاروت هستید که نمادگرایی کهن را با بینش روان‌شناختی مدرن پیوند می‌زنید. تفسیرهای شما به خاطر عمق روایی و طنین عاطفی‌شان مشهورند.
${spreadShape}

راهنما:
- به نثر روان و تصویری بنویسید، نه فهرست یا نقطه‌ای
- مستقیماً با مراجعه‌کننده صحبت کنید
- خاص و زنده باشید، نه کلی
- از حکمت ایرانی و تمثیل‌های فرهنگی بهره ببرید، اما هرگز شعر یا بیت نقل نکنید
- با یک بینش عملی روشن پایان دهید
- طول: ${wordRange} کلمه
${SAFETY_BOUNDARIES_FA}`;
```

- [ ] **Step 4: Add safety boundaries to the English follow-up prompt**

In `buildFollowUpPrompt`, append to the English return value (after line ~200 "Keep responses concise..."):

```typescript
    ? `You are continuing a tarot reading conversation. Maintain the same narrative voice and depth as the original interpretation.

The reading was a ${spread.name} spread with these cards:
${cardSummary}

The original interpretation was:
${interpretation}
${extraCardSection}
When answering follow-up questions:
- Reference the specific cards and their positions when relevant
- Stay consistent with the narrative you established
- Go deeper when asked — explore nuances, card combinations, and hidden connections
- Be warm but honest — don't shy away from difficult truths the cards suggest
- If the user drew an EXTRA CARD, treat it as a clarifying card that adds a new layer to the existing reading. Explain how it interacts with the original cards — does it reinforce, challenge, or add nuance to the narrative? Weave it into the existing story.
- Keep responses concise (150-250 words) unless the question warrants more depth
${SAFETY_BOUNDARIES_EN}`
```

- [ ] **Step 5: Add safety boundaries to the Farsi follow-up prompt**

Same pattern — append `${SAFETY_BOUNDARIES_FA}` at the end of the Farsi follow-up return string.

- [ ] **Step 6: Run type check**

Run: `cd app && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 7: Commit**

```bash
git add app/src/lib/ai/prompts.ts
git commit -m "feat: add safety boundary instructions to all AI prompts (EN + FA)"
```

---

### Task 2: Add question length validation to all reading API routes

**Files:**
- Modify: `app/src/app/api/reading/route.ts`
- Modify: `app/src/app/api/reading/free/route.ts`
- Modify: `app/src/app/api/reading/[id]/follow-up/route.ts`

The max question length is 500 characters. This prevents prompt injection via massive user input.

- [ ] **Step 1: Add validation to the authenticated reading route**

In `app/src/app/api/reading/route.ts`, add after line 32 (`const language = ...`):

```typescript
  // Validate question length
  if (question && question.length > 500) {
    return NextResponse.json({ error: 'Question is too long (max 500 characters)' }, { status: 400 });
  }
```

- [ ] **Step 2: Add validation to the free reading route**

In `app/src/app/api/reading/free/route.ts`, add after line 17 (the topic validation):

```typescript
  // Validate question length
  if (question && question.length > 500) {
    return NextResponse.json({ error: 'Question is too long (max 500 characters)' }, { status: 400 });
  }
```

- [ ] **Step 3: Add validation to the follow-up route**

In `app/src/app/api/reading/[id]/follow-up/route.ts`, change the existing validation at line 54 from:

```typescript
  if (!question?.trim()) {
    return NextResponse.json({ error: 'Question is required' }, { status: 400 });
  }
```

To:

```typescript
  if (!question?.trim()) {
    return NextResponse.json({ error: 'Question is required' }, { status: 400 });
  }

  if (question.length > 500) {
    return NextResponse.json({ error: 'Question is too long (max 500 characters)' }, { status: 400 });
  }
```

- [ ] **Step 4: Run type check**

Run: `cd app && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add app/src/app/api/reading/route.ts app/src/app/api/reading/free/route.ts "app/src/app/api/reading/[id]/follow-up/route.ts"
git commit -m "feat: add 500-char question length limit to all reading endpoints"
```

---

### Task 3: Create the rate limit table in Turso schema

**Files:**
- Modify: `app/src/lib/db/sqlite.ts`

- [ ] **Step 1: Add rate limit table to `ensureSchema()`**

In `app/src/lib/db/sqlite.ts`, add after the `reading_feedback` table creation block (after line ~89):

```typescript
  // Rate limiting for anonymous free readings
  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS free_reading_rate_limits (
      ip TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_free_rate_ip_time ON free_reading_rate_limits(ip, created_at);
  `);
```

- [ ] **Step 2: Run type check**

Run: `cd app && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add app/src/lib/db/sqlite.ts
git commit -m "feat: add free_reading_rate_limits table to schema"
```

---

### Task 4: Create the rate limiter utility

**Files:**
- Create: `app/src/lib/utils/rate-limit.ts`

- [ ] **Step 1: Create `app/src/lib/utils/rate-limit.ts`**

```typescript
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
```

- [ ] **Step 2: Run type check**

Run: `cd app && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add app/src/lib/utils/rate-limit.ts
git commit -m "feat: add IP-based rate limiter for free readings"
```

---

### Task 5: Apply rate limiting to the free reading endpoint

**Files:**
- Modify: `app/src/app/api/reading/free/route.ts`

- [ ] **Step 1: Add rate limit imports and checks**

Add at the top of the file:

```typescript
import { getClientIp, checkFreeReadingLimit, recordFreeReading } from '@/lib/utils/rate-limit';
```

Then add after the question length validation (added in Task 2) and before the spread validation:

```typescript
  // Rate limit by IP
  const ip = getClientIp(request);
  const rateLimit = await checkFreeReadingLimit(ip);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: `You've reached the free reading limit. Try again in ${rateLimit.retryAfterMinutes} minutes, or sign up for unlimited readings.` },
      { status: 429 },
    );
  }
```

Then add after the stream is successfully started (before the `return new Response(...)` at the end), record the usage:

```typescript
  // Record rate limit entry after successful stream start
  await recordFreeReading(ip);
```

The full modified file should be:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getSpread } from '@/lib/tarot/spreads';
import { SpreadType } from '@/lib/tarot/types';
import { deserializeDrawnCards } from '@/lib/tarot/shuffle';
import { buildInterpretationPrompt, buildQuestionMessage, ReadingTopic } from '@/lib/ai/prompts';
import { streamInterpretation } from '@/lib/ai/client';
import { getClientIp, checkFreeReadingLimit, recordFreeReading } from '@/lib/utils/rate-limit';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { cards: cardData, question, topic: rawTopic } = body as {
    cards: { cardId: number; reversed: boolean; positionIndex: number }[];
    question?: string;
    topic?: string;
  };

  const validTopics = ['love', 'yes-or-no', 'career'];
  const topic: ReadingTopic = rawTopic && validTopics.includes(rawTopic) ? rawTopic as ReadingTopic : null;

  // Validate question length
  if (question && question.length > 500) {
    return NextResponse.json({ error: 'Question is too long (max 500 characters)' }, { status: 400 });
  }

  // Rate limit by IP
  const ip = getClientIp(request);
  const rateLimit = await checkFreeReadingLimit(ip);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: `You've reached the free reading limit. Try again in ${rateLimit.retryAfterMinutes} minutes, or sign up for unlimited readings.` },
      { status: 429 },
    );
  }

  const spreadType: SpreadType = 'three-card';
  const spread = getSpread(spreadType);
  if (!spread) {
    return NextResponse.json({ error: 'Invalid spread type' }, { status: 400 });
  }

  if (cardData.length !== spread.cardCount) {
    return NextResponse.json({ error: 'Invalid card count' }, { status: 400 });
  }

  const drawnCards = deserializeDrawnCards(cardData, spread.positions);

  const { systemPrompt, userMessage } = buildInterpretationPrompt({
    spread,
    cards: drawnCards,
    language: 'en',
    tier: 'free',
    topic,
  });

  const questionSuffix = buildQuestionMessage({ question, language: 'en' });

  const stream = await streamInterpretation({
    systemPrompt,
    userMessage: userMessage + questionSuffix,
    tier: 'free',
  });

  // Record rate limit entry after successful stream start
  await recordFreeReading(ip);

  const encoder = new TextEncoder();

  const responseStream = new ReadableStream({
    async start(controller) {
      try {
        let fullText = '';
        for await (const event of stream) {
          if (event.type === 'content_block_delta') {
            const delta = event as { type: string; delta?: { type?: string; text?: string } };
            if (delta.delta?.type === 'text_delta' && delta.delta?.text) {
              fullText += delta.delta.text;
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text: delta.delta.text })}\n\n`),
              );
            }
          }
        }

        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ done: true, fullText })}\n\n`,
          ),
        );
        controller.close();
      } catch (err) {
        console.error('Anonymous reading stream error:', err);
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: (err as Error).message || 'Stream error' })}\n\n`),
        );
        controller.close();
      }
    },
  });

  return new Response(responseStream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
```

- [ ] **Step 2: Run type check**

Run: `cd app && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Run build**

Run: `cd app && npx next build`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add app/src/app/api/reading/free/route.ts
git commit -m "feat: apply IP rate limiting to anonymous free reading endpoint (3/day)"
```

- [ ] **Step 5: Push all commits**

```bash
git push
```
