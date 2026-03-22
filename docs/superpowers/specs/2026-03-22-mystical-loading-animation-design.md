# Mystical Loading Animation for Tarot Readings

**Date:** 2026-03-22
**Status:** Approved
**Approach:** Buffer-then-reveal (client-side only)

## Problem

When a user draws a new reading, the AI interpretation streams in line-by-line via SSE. This creates a utilitarian experience that doesn't match the mystical nature of a tarot reading. Users should see a beautiful, themed loading animation while the AI generates, then see the complete interpretation revealed at once.

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Animation style | Glowing tarot cards | Directly tied to the tarot theme; cards themselves appear to be "read" |
| Reveal transition | Smooth fade-in | Keeps focus on the reading content, not the transition |
| Status text | Rotating mystical messages | Reduces perceived wait time, builds narrative anticipation |
| Implementation approach | Client-side buffer | Zero API changes, SSE streams silently into a ref |

## Architecture

### No API Changes

The existing SSE streaming endpoint (`POST /api/reading`) remains unchanged. The `done` event already sends `{ done: true, fullText, readingId }` — we use `data.fullText` from the done event directly instead of accumulating in a ref, which is simpler and more reliable.

### State Flow

```
User clicks "Get Your Reading"
  -> isInterpreting = true (line 109 of page.tsx)
  -> fetch starts, SSE connection established
  -> setStep('interpret') (line 136, after response.ok check)
  -> Show ReadingLoadingAnimation (glowing cards + rotating messages)
  -> SSE chunks arrive but are NOT written to state (ignored for display)
  -> `done` event arrives with data.fullText
  -> setInterpretation(data.fullText)
  -> finally block: setIsInterpreting(false)
  -> ReadingLoadingAnimation unmounts, interpretation fades in (0.6s ease-in)

On error (network failure, API error, stream error):
  -> setError(message) is called
  -> finally block: setIsInterpreting(false)
  -> interpretation remains ''
  -> Loading animation unmounts, error message block renders at bottom of page
  -> SpreadLayout (cards) remains visible above the error
```

**Note:** `isInterpreting = true` and `setStep('interpret')` are NOT atomic — there is async logic between them (the fetch call). If the fetch itself fails before `setStep`, the user stays on the `reveal` step with the error shown below. This is existing behavior and is acceptable.

### Render Conditions (interpret step)

Use `interpretation` as the primary signal, not `isInterpreting`, to avoid a one-frame rendering gap between state updates:

- `step === 'interpret' && !interpretation` → show `ReadingLoadingAnimation`
- `step === 'interpret' && interpretation` → show interpretation text with fade-in

### Minimum Display Time

To prevent a jarring flash on fast responses (e.g., single-card Haiku reading), enforce a minimum 2-second display time for the loading animation. Track `loadingStartTime` via ref when entering the interpret step. When the done event arrives, if elapsed time < 2s, delay `setInterpretation` by the remaining time.

## Components

### New: `ReadingLoadingAnimation`

**File:** `src/components/reading/ReadingLoadingAnimation.tsx`

**Props:**
```typescript
interface ReadingLoadingAnimationProps {
  cardCount: number;  // Number of glowing card silhouettes to render
  language: 'en' | 'fa'; // For selecting localized status messages
}
```

**Visual elements:**

1. **Glowing card silhouettes** — Rectangles matching tarot card proportions (roughly 2:3 aspect ratio), arranged horizontally centered. Each card has:
   - Dark background with subtle gradient (`linear-gradient(145deg, #1a1a2e, #16213e)`)
   - Golden border (`#d4af37`)
   - Pulsing glow animation with staggered `animation-delay` (0.4s between cards)
   - `@keyframes cardGlow` alternates `box-shadow` intensity over 2.5s

2. **Rotating status messages** — Text below the cards that cycles every 3 seconds with a fade transition between messages. Messages loop back to the beginning after the last one to handle long-running readings (e.g., 10-card Celtic Cross on Sonnet).

3. **All CSS-only animations** — No animation libraries. Uses `@keyframes` for card glow and CSS `opacity` transitions for message rotation (driven by a `useEffect` + `setInterval`).

**Accessibility:**
- Container has `role="status"` and `aria-live="polite"` so screen readers announce loading progress
- Rotating messages are announced to screen readers via the live region
- All animations respect `prefers-reduced-motion`: when enabled, disable the glow pulse and show static golden border instead

**RTL support:** The card layout is horizontally centered and symmetric — no RTL adjustments needed. Farsi messages are selected via the `language` prop and rendered with appropriate text direction.

### Modified: `reading/new/page.tsx`

**Changes to `handleGetReading()`:**

1. Remove progressive `setInterpretation(fullText)` from the SSE text-chunk loop — chunks are received but not written to state
2. On `done` event: call `setInterpretation(data.fullText)` using the server-provided complete text
3. Add `loadingStartRef = useRef(Date.now())` set when entering interpret step, used to enforce minimum 2s display time
4. Keep all other logic unchanged (error handling, `setReadingId`, `setIsInterpreting`)

**Changes to interpret step JSX:**

1. When `step === 'interpret' && !interpretation`: render `<ReadingLoadingAnimation cardCount={drawnCards.length} language={language} />`
2. When `step === 'interpret' && interpretation`: render the interpretation text with fade-in transition
3. Remove the inline pulsing cursor (`<span className="animate-pulse" />`) since text no longer streams visibly

**Fade-in implementation:** Use a `useEffect` watching `interpretation` that sets `showInterpretation = true` after a `requestAnimationFrame` tick. This ensures the DOM renders with `opacity: 0` first, then the transition to `opacity: 1` triggers on the next frame.

```css
opacity: 0;
transition: opacity 0.6s ease-in;
/* when showInterpretation is true: */
opacity: 1;
```

## Rotating Messages

### English
```typescript
const MESSAGES_EN = [
  "Sensing the energy of your cards...",
  "Reading the connections between them...",
  "Weaving your narrative...",
  "The story is taking shape...",
  "Almost ready to reveal your reading...",
];
```

### Farsi
```typescript
const MESSAGES_FA = [
  "...در حال حس کردن انرژی کارت‌های شما",
  "...در حال خواندن ارتباط بین آن‌ها",
  "...در حال بافتن روایت شما",
  "...داستان شما در حال شکل‌گیری است",
  "...تقریباً آماده است تا خوانش شما آشکار شود",
];
```

**Note:** Arabic support is not yet implemented in the app (language type is `'en' | 'fa'`). Arabic messages can be added when Arabic locale is introduced.

## Files Changed

| File | Change |
|------|--------|
| `src/components/reading/ReadingLoadingAnimation.tsx` | **New** — Loading animation component |
| `src/app/(app)/reading/new/page.tsx` | **Modified** — Buffer stream, show loading, fade-in reveal |

## Testing

- Verify loading animation appears when "Get Your Reading" is clicked
- Verify all cards glow with staggered animation
- Verify status messages rotate every ~3 seconds and loop after the last message
- Verify interpretation appears all at once after stream completes (not progressively)
- Verify smooth fade-in transition on reveal
- Verify minimum 2s display time on fast responses
- Verify error during loading: animation disappears, error message shows, cards remain visible
- Verify network failure mid-stream: error displayed correctly
- Verify "View Full Reading & Follow-up" button appears after reveal
- Test with single card, three-card, and larger spreads
- Test with Farsi locale for RTL message display
- Verify `prefers-reduced-motion` disables glow animation
- Verify screen reader announces loading status

## Rollback

To revert to streaming display: restore `setInterpretation(fullText)` in the SSE text-chunk loop, remove the loading component, and revert the JSX conditionals. Minimal change surface.
