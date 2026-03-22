# Mystical Loading Animation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace line-by-line streaming interpretation display with a glowing-cards loading animation that buffers the response silently, then reveals the full text at once with a smooth fade-in.

**Architecture:** Client-side only change. The SSE streaming API remains untouched. A new `ReadingLoadingAnimation` component renders glowing card silhouettes + rotating mystical messages. The page component buffers streamed text without displaying it, then reveals the complete interpretation on the `done` event.

**Tech Stack:** React, Tailwind CSS, CSS @keyframes animations, Next.js

**Spec:** `docs/superpowers/specs/2026-03-22-mystical-loading-animation-design.md`

---

## File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `app/src/components/reading/ReadingLoadingAnimation.tsx` | **Create** | Glowing cards animation + rotating status messages |
| `app/src/app/(app)/reading/new/page.tsx` | **Modify** | Buffer stream silently, show loading component, fade-in reveal |

---

## Task 1: Create ReadingLoadingAnimation Component

**Files:**
- Create: `app/src/components/reading/ReadingLoadingAnimation.tsx`

- [ ] **Step 1: Create the component file with props interface and card silhouettes**

```tsx
'use client';

import { useState, useEffect } from 'react';

const MESSAGES_EN = [
  'Sensing the energy of your cards...',
  'Reading the connections between them...',
  'Weaving your narrative...',
  'The story is taking shape...',
  'Almost ready to reveal your reading...',
];

const MESSAGES_FA = [
  '...در حال حس کردن انرژی کارت‌های شما',
  '...در حال خواندن ارتباط بین آن‌ها',
  '...در حال بافتن روایت شما',
  '...داستان شما در حال شکل‌گیری است',
  '...تقریباً آماده است تا خوانش شما آشکار شود',
];

interface ReadingLoadingAnimationProps {
  cardCount: number;
  language: 'en' | 'fa';
}

export default function ReadingLoadingAnimation({ cardCount, language }: ReadingLoadingAnimationProps) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [messageFade, setMessageFade] = useState(true);
  const messages = language === 'fa' ? MESSAGES_FA : MESSAGES_EN;

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const interval = setInterval(() => {
      setMessageFade(false);
      timeoutId = setTimeout(() => {
        setMessageIndex((prev) => (prev + 1) % messages.length);
        setMessageFade(true);
      }, 300);
    }, 3000);
    return () => {
      clearInterval(interval);
      clearTimeout(timeoutId);
    };
  }, [messages.length]);

  return (
    <div className="flex flex-col items-center gap-8 py-12" role="status" aria-live="polite">
      {/* Glowing card silhouettes */}
      <div className="flex items-center justify-center gap-3 sm:gap-4">
        {Array.from({ length: cardCount }).map((_, i) => (
          <div
            key={i}
            className="w-[52px] h-[78px] sm:w-[60px] sm:h-[90px] rounded-lg border-2 animate-card-glow"
            style={{
              background: 'linear-gradient(145deg, #1a1a2e, #16213e)',
              borderColor: 'rgba(212, 175, 55, 0.4)',
              animationDelay: `${i * 0.4}s`,
            }}
          />
        ))}
      </div>

      {/* Rotating status message */}
      <p
        className="text-sm sm:text-base tracking-wider transition-opacity duration-300"
        style={{
          color: '#d4af37',
          opacity: messageFade ? 1 : 0,
        }}
        dir={language === 'fa' ? 'rtl' : 'ltr'}
      >
        {messages[messageIndex]}
      </p>

      <style jsx>{`
        @keyframes cardGlow {
          0%, 100% {
            box-shadow: 0 0 8px rgba(212, 175, 55, 0.2);
            border-color: rgba(212, 175, 55, 0.4);
          }
          50% {
            box-shadow: 0 0 25px rgba(212, 175, 55, 0.6);
            border-color: rgba(212, 175, 55, 1);
          }
        }
        .animate-card-glow {
          animation: cardGlow 2.5s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-card-glow {
            animation: none;
            border-color: rgba(212, 175, 55, 0.7);
            box-shadow: 0 0 15px rgba(212, 175, 55, 0.3);
          }
        }
      `}</style>
    </div>
  );
}
```

- [ ] **Step 2: Verify the component compiles**

Run: `cd app && npx next build 2>&1 | tail -20`
Expected: Build succeeds (component is not yet imported anywhere, so this confirms no syntax errors in the project)

- [ ] **Step 3: Commit**

```bash
git add app/src/components/reading/ReadingLoadingAnimation.tsx
git commit -m "feat: add ReadingLoadingAnimation component with glowing cards and rotating messages"
```

---

## Task 2: Modify page.tsx to Buffer Stream and Show Loading Animation

**Files:**
- Modify: `app/src/app/(app)/reading/new/page.tsx`

- [ ] **Step 1: Add import for the loading component and useRef**

At the top of the file, add `useRef` to the React import (line 3) and add the component import after line 12:

```tsx
// Line 3 changes from:
import { useState, useEffect } from 'react';
// to:
import { useState, useEffect, useRef } from 'react';

// Add after line 12:
import ReadingLoadingAnimation from '@/components/reading/ReadingLoadingAnimation';
```

- [ ] **Step 2: Add showInterpretation state and loadingStartRef**

After line 38 (`const [error, setError] = useState('');`), add:

```tsx
const [showInterpretation, setShowInterpretation] = useState(false);
const loadingStartRef = useRef<number>(0);
```

- [ ] **Step 3: Add useEffect for fade-in trigger**

After the existing `useEffect` block (after line 53), add:

```tsx
useEffect(() => {
  if (interpretation) {
    requestAnimationFrame(() => {
      setShowInterpretation(true);
    });
  } else {
    setShowInterpretation(false);
  }
}, [interpretation]);
```

- [ ] **Step 4: Modify handleGetReading to buffer silently with minimum display time**

Replace the `handleGetReading` function (lines 107-167) with:

```tsx
async function handleGetReading() {
  if (!spreadType || drawnCards.length === 0) return;
  setIsInterpreting(true);
  setError('');

  try {
    const response = await fetch('/api/reading', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        spreadType,
        cards: serializeDrawnCards(drawnCards),
        question: question || undefined,
        topic: topic || undefined,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to get reading');
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No reader');

    const decoder = new TextDecoder();
    let buffer = '';

    setStep('interpret');
    loadingStartRef.current = Date.now();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = JSON.parse(line.slice(6));
          if (data.done) {
            const elapsed = Date.now() - loadingStartRef.current;
            const minDisplayTime = 2000;
            if (elapsed < minDisplayTime) {
              await new Promise((r) => setTimeout(r, minDisplayTime - elapsed));
            }
            setInterpretation(data.fullText);
            setReadingId(data.readingId);
          }
          if (data.error) {
            throw new Error(data.error);
          }
        }
      }
    }
  } catch (err) {
    setError((err as Error).message);
  } finally {
    setIsInterpreting(false);
  }
}
```

Key changes from original:
- Removed `fullText` accumulation and `setInterpretation(fullText)` from the text-chunk loop
- Uses `data.fullText` from the done event directly
- Enforces 2s minimum display time before revealing

- [ ] **Step 5: Commit handler changes**

```bash
git add app/src/app/(app)/reading/new/page.tsx
git commit -m "feat: buffer SSE stream silently with minimum 2s loading display"
```

---

## Task 3: Update JSX to Show Loading Animation and Fade-In Reveal

**Files:**
- Modify: `app/src/app/(app)/reading/new/page.tsx`

- [ ] **Step 1: Add loading animation block in the interpret step**

Replace the interpret step JSX block (lines 301-329) with:

```tsx
{/* Step: Interpret — Loading Animation */}
{step === 'interpret' && !interpretation && (
  <ReadingLoadingAnimation cardCount={drawnCards.length} language={language} />
)}

{/* Step: Interpret — Revealed Reading */}
{step === 'interpret' && interpretation && (
  <div
    className="max-w-2xl mx-auto space-y-6 transition-opacity duration-[600ms] ease-in"
    style={{ opacity: showInterpretation ? 1 : 0 }}
  >
    <div className="p-6 rounded-2xl bg-white/[0.04] border border-white/[0.08]" dir={language === 'fa' ? 'rtl' : 'ltr'}>
      <h2 className="text-xl font-semibold text-amber-400 mb-4">
        {language === 'fa' ? 'خوانش شما' : 'Your Reading'}
      </h2>
      <div className="prose prose-invert max-w-none">
        <p className="text-amber-50/95 text-base sm:text-lg leading-7 sm:leading-8 whitespace-pre-wrap">
          {interpretation}
        </p>
      </div>
    </div>

    {readingId && (
      <div className="text-center">
        <button
          onClick={() => router.push(`/reading/${readingId}`)}
          className="px-6 py-2.5 bg-white/10 hover:bg-white/15 text-gray-200 font-medium rounded-xl text-sm transition-colors"
        >
          View Full Reading & Follow-up
        </button>
      </div>
    )}
  </div>
)}
```

Key changes from original:
- Removed `interpretation &&` gate from loading — shows loading when `!interpretation`
- Removed pulsing cursor span
- Added `transition-opacity` + `showInterpretation` for fade-in
- Removed `!isInterpreting` gate from "View Full Reading" button — `readingId` is set with interpretation now

- [ ] **Step 2: Commit JSX changes**

```bash
git add app/src/app/(app)/reading/new/page.tsx
git commit -m "feat: show glowing cards loading animation with fade-in reveal"
```

---

## Task 4: Build Verification and Manual Testing

**Files:**
- None (verification only)

- [ ] **Step 1: Run production build to verify no errors**

Run: `cd app && npm run build`
Expected: Build succeeds with no TypeScript or compilation errors

- [ ] **Step 2: Start dev server and test manually**

Run: `cd app && npm run dev`

Manual test checklist:
1. Navigate to `/reading/new`
2. Select a topic, spread, enter a question, draw cards, reveal all
3. Click "Get Your Reading"
4. **Verify:** Glowing card silhouettes appear (matching the number of drawn cards)
5. **Verify:** Status messages rotate every ~3 seconds
6. **Verify:** After AI completes, the loading fades away and interpretation fades in smoothly
7. **Verify:** "View Full Reading & Follow-up" button appears
8. **Verify:** Clicking it navigates to the reading detail page

- [ ] **Step 3: Test error handling**

Disconnect network or trigger an API error during loading:
1. **Verify:** Loading animation disappears
2. **Verify:** Error message appears at the bottom
3. **Verify:** Cards remain visible above

- [ ] **Step 4: Final commit if any fixes were needed**

Only if fixes were applied in steps 2-3. Otherwise skip.
