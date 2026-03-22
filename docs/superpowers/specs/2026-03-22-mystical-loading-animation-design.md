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

The existing SSE streaming endpoint (`POST /api/reading`) remains unchanged. All modifications are client-side only, in the reading page and a new loading component.

### State Flow

```
User clicks "Get Your Reading"
  -> isInterpreting = true, step = 'interpret'
  -> Show ReadingLoadingAnimation (glowing cards + rotating messages)
  -> SSE streams silently into useRef (not useState)
  -> `done` event arrives from SSE
  -> setInterpretation(fullTextRef.current), isInterpreting = false
  -> ReadingLoadingAnimation fades out, interpretation text fades in (0.6s ease-in)
```

## Components

### New: `ReadingLoadingAnimation`

**File:** `src/components/reading/ReadingLoadingAnimation.tsx`

**Props:**
```typescript
interface ReadingLoadingAnimationProps {
  cardCount: number; // Number of glowing card silhouettes to render
}
```

**Visual elements:**

1. **Glowing card silhouettes** — Rectangles matching tarot card proportions (roughly 2:3 aspect ratio), arranged horizontally centered. Each card has:
   - Dark background with subtle gradient (`linear-gradient(145deg, #1a1a2e, #16213e)`)
   - Golden border (`#d4af37`)
   - Pulsing glow animation with staggered `animation-delay` (0.4s between cards)
   - `@keyframes cardGlow` alternates `box-shadow` intensity over 2.5s

2. **Rotating status messages** — Text below the cards that cycles every 3 seconds with a fade transition between messages:
   - "Sensing the energy of your cards..."
   - "Reading the connections between them..."
   - "Weaving your narrative..."
   - "The story is taking shape..."
   - "Almost ready to reveal your reading..."

3. **All CSS-only animations** — No animation libraries. Uses `@keyframes` for card glow and CSS `opacity` transitions for message rotation (driven by a `useEffect` + `setInterval`).

**RTL support:** The component accepts no text content that varies by direction. The rotating messages will be defined inline and should include Farsi variants when `language === 'fa'`. The card layout is horizontally centered and symmetric, so no RTL adjustments are needed.

### Modified: `reading/new/page.tsx`

**Changes to `handleGetReading()`:**

1. Add `fullTextRef = useRef('')` at component level
2. In the SSE loop, replace `setInterpretation(fullText)` with `fullTextRef.current = fullText` (silent accumulation)
3. On `done` event: call `setInterpretation(fullTextRef.current)` to trigger the reveal
4. Keep all other logic unchanged (error handling, `setReadingId`, `setIsInterpreting`)

**Changes to interpret step JSX:**

1. When `isInterpreting === true` and `interpretation === ''`: render `<ReadingLoadingAnimation cardCount={drawnCards.length} />`
2. When `isInterpreting === false` and `interpretation !== ''`: render the interpretation text inside a container with `transition: opacity 0.6s ease-in`, starting from `opacity: 0` and transitioning to `opacity: 1`
3. Remove the inline pulsing cursor (`<span className="animate-pulse" />`) since text no longer streams visibly

**Fade-in implementation:** Use a state flag `showInterpretation` that flips to `true` after a `requestAnimationFrame` tick once `interpretation` is set. The container uses:
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

## Files Changed

| File | Change |
|------|--------|
| `src/components/reading/ReadingLoadingAnimation.tsx` | **New** — Loading animation component |
| `src/app/(app)/reading/new/page.tsx` | **Modified** — Buffer stream in ref, show loading, fade-in reveal |

## Testing

- Verify loading animation appears when "Get Your Reading" is clicked
- Verify all cards glow with staggered animation
- Verify status messages rotate every ~3 seconds
- Verify interpretation appears all at once after stream completes (not progressively)
- Verify smooth fade-in transition on reveal
- Verify error states still display correctly
- Verify "View Full Reading & Follow-up" button appears after reveal
- Test with both single card and multi-card spreads
- Test with Farsi locale for RTL message display

## Rollback

To revert to streaming display: change `fullTextRef.current = fullText` back to `setInterpretation(fullText)` in the SSE loop and remove the loading component render. One-line change in the handler, plus reverting the JSX conditional.
