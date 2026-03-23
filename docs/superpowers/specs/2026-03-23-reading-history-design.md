# Reading History — Timeline View with Filters

**Date:** 2026-03-23
**Status:** Approved

## Problem

The dashboard shows only the 10 most recent readings in a plain list (spread type, question snippet, date, delete button). There is no way to see older readings, search, or filter by type/topic/date. Users with many readings lose access to their history.

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Architecture | Dashboard preview + dedicated `/history` page | Dashboard stays clean; history page has room for full features |
| Layout | Vertical timeline | Feels like a journal of spiritual journey; shows interpretation snippets; scales well |
| Filtering | Search + spread type + topic + date range | Full filtering suite covers all use cases |
| Pagination | "Load more" button, 20 per page | Simpler than page numbers; works naturally with timeline |

## Two Components

### 1. Dashboard — Recent Readings Preview

Replace the current 10-item plain list with a 5-item compact timeline preview.

Each entry shows:
- Spread type (capitalized, e.g., "Three Card") + topic badge if present (e.g., "Love", "Career")
- Question text (or "General reading" if none) — truncated
- Relative date (e.g., "2 days ago") or absolute if older than 7 days
- Clickable → navigates to `/reading/{id}`

Below the list: "View All History →" link to `/history`.

Remove the `DeleteReadingButton` from dashboard — deletion can happen from the reading detail page.

### 2. Dedicated `/history` Page

**URL:** `/history` (under `(app)` route group, requires auth)

**Header:** "Reading History" with total reading count

**Filter bar** (sticky below the page header):
- Search input — placeholder "Search by question..." — filters on `question` column via SQL `LIKE`
- Spread type dropdown: All / Single Card / Three Card / Celtic Cross
- Topic dropdown: All / General / Love / Career / Yes or No
- Date range: "From" and "To" HTML date inputs (`<input type="date">`)
- "Clear filters" button (only visible when filters are active)

**Timeline** below filters:
- Vertical amber line (2px) on the left with dot markers at each entry
- Readings grouped by date heading (e.g., "March 20, 2026")
- Each timeline entry:
  - Amber dot marker on the timeline line
  - Spread type + topic badge (e.g., "Three Card · Love")
  - Question (or "General reading" fallback)
  - First ~120 characters of interpretation as a muted preview snippet
  - Date formatted as "March 20, 2026"
  - Entire entry is clickable → `/reading/{id}`
- "Load more" button at bottom (hidden when no more readings)
- Empty state (no readings): "No readings yet. Start your first one!" + CTA link to `/reading/new`
- Empty filter state: "No readings match your filters." + "Clear filters" button

**Implementation note:** The history page is a client component that fetches readings via an API route. Filters update the API call, which re-fetches with new parameters.

### 3. API Route for Filtered Readings

**Endpoint:** `GET /api/readings`

**Query parameters:**
- `search` — string, filters `question LIKE '%search%'`
- `spreadType` — enum, filters `spread_type = ?`
- `topic` — enum, filters `topic = ?`
- `dateFrom` — ISO date string, filters `created_at >= ?`
- `dateTo` — ISO date string, filters `created_at <= ?` (inclusive, so adds 1 day)
- `offset` — number, for pagination (default 0)
- `limit` — number (default 20, max 50)

**Response:**
```json
{
  "readings": [...ReadingRow with topic field],
  "total": 42,
  "hasMore": true
}
```

### 4. Navigation

Add "History" link to the authenticated nav in `Header.tsx`, between "Spreads" and "Billing" (both desktop and mobile).

### 5. Database: Add `topic` Column

The `readings` table currently does not store `topic`. The API route receives `topic` from the client (line 25 of `route.ts`) but does not save it.

**Migration:** Add `topic TEXT` column to `readings` table. Nullable — existing readings will have `NULL` (treated as "General").

**Changes:**
- `ensureSchema()` in `sqlite.ts`: add `ALTER TABLE readings ADD COLUMN topic TEXT` (with IF NOT EXISTS or try/catch for idempotency)
- `createReading()` in `queries.ts`: accept `topic` parameter, save to DB
- `POST /api/reading` route: pass `topic` to `createReading()`
- `ReadingRow` interface: add `topic: string | null`

## Files Changed

| File | Action | What |
|------|--------|------|
| `app/src/lib/db/sqlite.ts` | **Modify** | Add `topic` column migration |
| `app/src/lib/db/queries.ts` | **Modify** | Update `ReadingRow`, `createReading`, add `getFilteredReadings` |
| `app/src/app/api/reading/route.ts` | **Modify** | Pass `topic` to `createReading` |
| `app/src/app/api/readings/route.ts` | **New** | GET endpoint for filtered readings list |
| `app/src/components/reading/ReadingTimeline.tsx` | **New** | Timeline component (date groups, entries, amber line) |
| `app/src/components/reading/ReadingFilters.tsx` | **New** | Filter bar (search, dropdowns, date pickers) |
| `app/src/app/(app)/history/page.tsx` | **New** | History page composing filters + timeline + load more |
| `app/src/app/(app)/dashboard/page.tsx` | **Modify** | Replace 10-item list with 5-item preview + "View All" link |
| `app/src/components/layout/Header.tsx` | **Modify** | Add "History" nav link |

## Styling

Follow existing patterns:
- Dark theme: `bg-white/[0.04]`, `border-white/[0.08]`
- Amber accents: `text-amber-400`, `bg-amber-400` for timeline dots
- Text hierarchy: `text-white` for primary, `text-gray-400`/`text-gray-500` for secondary
- Rounded containers: `rounded-xl` or `rounded-2xl`
- Transitions: `hover:border-white/15 transition-colors`
- RTL: respect `language` prop with `dir` attribute where text appears

## Testing

- Verify dashboard shows 5 recent readings with "View All" link
- Verify history page loads all readings in timeline layout
- Verify search filters by question text
- Verify spread type dropdown filters correctly
- Verify topic dropdown filters correctly
- Verify date range filtering works
- Verify "Clear filters" resets all filters
- Verify "Load more" fetches next page of results
- Verify clicking a reading navigates to detail page
- Verify empty states display correctly (no readings, no filter matches)
- Verify new readings save `topic` to the database
- Verify existing readings (topic = NULL) display as "General"
- Verify Farsi locale works (RTL layout, translated labels)
- Build passes with no TypeScript errors
