# Reading History Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a full reading history feature with a timeline view, filtering (search, spread type, topic, date range), and pagination — plus a dashboard preview with "View All" link.

**Architecture:** Database migration adds `topic` column to readings. A new API endpoint (`GET /api/readings`) serves filtered, paginated results. A client-side history page at `/history` renders a timeline with filters synced to URL params. The dashboard is simplified to show 5 recent readings with a "View All History" link.

**Tech Stack:** Next.js 14, React, Tailwind CSS, libSQL/Turso, TypeScript

**Spec:** `docs/superpowers/specs/2026-03-23-reading-history-design.md`

---

## File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `app/src/lib/db/sqlite.ts` | **Modify** | Add `topic` column migration |
| `app/src/lib/db/queries.ts` | **Modify** | Update `ReadingRow`, `createReading`, add `getFilteredReadings` |
| `app/src/app/api/reading/route.ts` | **Modify** | Pass `topic` to `createReading` |
| `app/src/app/api/readings/route.ts` | **New** | GET endpoint for filtered readings list |
| `app/src/components/reading/ReadingTimeline.tsx` | **New** | Timeline component (date groups, entries, amber line) |
| `app/src/components/reading/ReadingFilters.tsx` | **New** | Filter bar (search, dropdowns, date pickers) |
| `app/src/app/(app)/history/page.tsx` | **New** | History page composing filters + timeline + load more |
| `app/src/app/(app)/dashboard/page.tsx` | **Modify** | 5-item preview + "View All" link |
| `app/src/components/layout/Header.tsx` | **Modify** | Add "History" nav link |

---

## Task 1: Database Migration — Add `topic` Column

**Files:**
- Modify: `app/src/lib/db/sqlite.ts`

- [ ] **Step 1: Add the topic column migration**

In `sqlite.ts`, find the `migrations` array (line 92-97) and add the new migration:

```typescript
// Change from:
const migrations = [
  `ALTER TABLE readings ADD COLUMN share_token TEXT`,
  `ALTER TABLE profiles ADD COLUMN auth_provider TEXT DEFAULT 'email'`,
  `ALTER TABLE profiles ADD COLUMN google_id TEXT`,
  `ALTER TABLE readings ADD COLUMN feedback INTEGER`,
];

// Change to:
const migrations = [
  `ALTER TABLE readings ADD COLUMN share_token TEXT`,
  `ALTER TABLE profiles ADD COLUMN auth_provider TEXT DEFAULT 'email'`,
  `ALTER TABLE profiles ADD COLUMN google_id TEXT`,
  `ALTER TABLE readings ADD COLUMN feedback INTEGER`,
  `ALTER TABLE readings ADD COLUMN topic TEXT`,
];
```

- [ ] **Step 2: Verify build passes**

Run: `cd app && npx next build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add app/src/lib/db/sqlite.ts
git commit -m "feat: add topic column migration to readings table"
```

---

## Task 2: Update Queries — ReadingRow, createReading, getFilteredReadings

**Files:**
- Modify: `app/src/lib/db/queries.ts`

- [ ] **Step 1: Add `topic` to `ReadingRow` interface**

Find the `ReadingRow` interface (line 43-56) and add `topic`:

```typescript
export interface ReadingRow {
  id: string;
  user_id: string;
  spread_type: string;
  question: string | null;
  cards: string; // JSON string
  interpretation: string | null;
  model_used: string;
  language: string;
  tokens_used: number;
  share_token: string | null;
  feedback: number | null;
  topic: string | null;
  created_at: string;
}
```

- [ ] **Step 2: Update `createReading` to accept and save `topic`**

Replace the `createReading` function (lines 58-74) with:

```typescript
export async function createReading(data: {
  user_id: string;
  spread_type: string;
  question?: string;
  cards: unknown;
  model_used: string;
  language: string;
  topic?: string;
}): Promise<string> {
  await ensureSchema();
  const db = getDb();
  const id = crypto.randomUUID();
  await db.execute({
    sql: `INSERT INTO readings (id, user_id, spread_type, question, cards, model_used, language, topic) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [id, data.user_id, data.spread_type, data.question || null, JSON.stringify(data.cards), data.model_used, data.language, data.topic || null],
  });
  return id;
}
```

- [ ] **Step 3: Add `getFilteredReadings` function**

Add this function after `getRecentReadings` (after line 94):

```typescript
export interface ReadingFilters {
  search?: string;
  spreadType?: string;
  topic?: string; // 'general' maps to IS NULL
  dateFrom?: string;
  dateTo?: string;
}

export async function getFilteredReadings(
  userId: string,
  filters: ReadingFilters,
  offset: number = 0,
  limit: number = 20
): Promise<{ readings: ReadingRow[]; total: number }> {
  await ensureSchema();
  const db = getDb();

  const conditions: string[] = ['user_id = ?'];
  const args: (string | number)[] = [userId];

  if (filters.search) {
    conditions.push('question LIKE ?');
    args.push(`%${filters.search}%`);
  }

  if (filters.spreadType) {
    conditions.push('spread_type = ?');
    args.push(filters.spreadType);
  }

  if (filters.topic) {
    if (filters.topic === 'general') {
      conditions.push('topic IS NULL');
    } else {
      conditions.push('topic = ?');
      args.push(filters.topic);
    }
  }

  if (filters.dateFrom) {
    conditions.push('created_at >= ?');
    args.push(filters.dateFrom);
  }

  if (filters.dateTo) {
    // Add 1 day for inclusive end date, use strict less-than
    // String manipulation avoids timezone issues with Date object
    const [y, m, d] = filters.dateTo.split('-').map(Number);
    const nextDay = new Date(Date.UTC(y, m - 1, d + 1));
    const nextDayStr = nextDay.toISOString().split('T')[0];
    conditions.push('created_at < ?');
    args.push(nextDayStr);
  }

  const where = conditions.join(' AND ');

  const countResult = await db.execute({
    sql: `SELECT COUNT(*) as count FROM readings WHERE ${where}`,
    args,
  });
  const total = (countResult.rows[0] as unknown as { count: number }).count;

  const result = await db.execute({
    sql: `SELECT * FROM readings WHERE ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    args: [...args, limit, offset],
  });
  const readings = result.rows as unknown as ReadingRow[];

  return { readings, total };
}
```

- [ ] **Step 4: Verify build passes**

Run: `cd app && npx next build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 5: Commit**

```bash
git add app/src/lib/db/queries.ts
git commit -m "feat: add topic to ReadingRow, createReading, and getFilteredReadings"
```

---

## Task 3: Save Topic in API Route

**Files:**
- Modify: `app/src/app/api/reading/route.ts`

- [ ] **Step 1: Pass topic to createReading**

Find the `createReading` call (lines 63-70) and add `topic`:

```typescript
// Change from:
const readingId = await createReading({
  user_id: user.id,
  spread_type: spreadType,
  question,
  cards: cardData,
  model_used: tier === 'free' ? 'haiku-4.5' : 'sonnet-4',
  language,
});

// Change to:
const readingId = await createReading({
  user_id: user.id,
  spread_type: spreadType,
  question,
  cards: cardData,
  model_used: tier === 'free' ? 'haiku-4.5' : 'sonnet-4',
  language,
  topic: topic || undefined,
});
```

- [ ] **Step 2: Verify build passes**

Run: `cd app && npx next build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add app/src/app/api/reading/route.ts
git commit -m "feat: save topic when creating a reading"
```

---

## Task 4: Create GET /api/readings Endpoint

**Files:**
- Create: `app/src/app/api/readings/route.ts`

- [ ] **Step 1: Create the filtered readings API route**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/db/auth';
import { getFilteredReadings, type ReadingFilters } from '@/lib/db/queries';

export async function GET(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);

  const filters: ReadingFilters = {};
  const search = searchParams.get('search');
  const spreadType = searchParams.get('spreadType');
  const topic = searchParams.get('topic');
  const dateFrom = searchParams.get('dateFrom');
  const dateTo = searchParams.get('dateTo');

  if (search) filters.search = search;
  if (spreadType) filters.spreadType = spreadType;
  if (topic) filters.topic = topic;
  if (dateFrom) filters.dateFrom = dateFrom;
  if (dateTo) filters.dateTo = dateTo;

  const offset = parseInt(searchParams.get('offset') || '0', 10);
  const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 50);

  const { readings, total } = await getFilteredReadings(user.id, filters, offset, limit);

  return NextResponse.json({
    readings,
    total,
    hasMore: offset + readings.length < total,
  });
}
```

- [ ] **Step 2: Verify build passes**

Run: `cd app && npx next build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add app/src/app/api/readings/route.ts
git commit -m "feat: add GET /api/readings endpoint with filtering and pagination"
```

---

## Task 5: Create ReadingTimeline Component

**Files:**
- Create: `app/src/components/reading/ReadingTimeline.tsx`

- [ ] **Step 1: Create the timeline component**

```tsx
'use client';

import Link from 'next/link';
import type { ReadingRow } from '@/lib/db/queries';

interface ReadingTimelineProps {
  readings: ReadingRow[];
  language?: 'en' | 'fa';
}

function formatSpreadType(type: string): string {
  return type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function formatTopic(topic: string | null): string | null {
  if (!topic) return null;
  const map: Record<string, string> = {
    'love': 'Love',
    'career': 'Career',
    'yes-or-no': 'Yes/No',
  };
  return map[topic] || topic;
}

function groupByDate(readings: ReadingRow[]): { date: string; readings: ReadingRow[] }[] {
  const groups: Map<string, ReadingRow[]> = new Map();
  for (const reading of readings) {
    const date = new Date(reading.created_at).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    if (!groups.has(date)) groups.set(date, []);
    groups.get(date)!.push(reading);
  }
  return Array.from(groups.entries()).map(([date, readings]) => ({ date, readings }));
}

export default function ReadingTimeline({ readings, language = 'en' }: ReadingTimelineProps) {
  const groups = groupByDate(readings);

  if (readings.length === 0) return null;

  return (
    <div className="relative" dir={language === 'fa' ? 'rtl' : 'ltr'}>
      {/* Vertical timeline line */}
      <div className="absolute top-0 bottom-0 left-[7px] w-[2px] bg-amber-400/20" />

      <div className="space-y-8">
        {groups.map((group) => (
          <div key={group.date}>
            {/* Date heading */}
            <h3 className="text-sm font-medium text-gray-400 mb-4 pl-8">
              {group.date}
            </h3>

            <div className="space-y-3">
              {group.readings.map((reading) => {
                const topicLabel = formatTopic(reading.topic);
                const snippet = reading.interpretation
                  ? reading.interpretation.slice(0, 120) + (reading.interpretation.length > 120 ? '...' : '')
                  : null;

                return (
                  <Link
                    key={reading.id}
                    href={`/reading/${reading.id}`}
                    className="relative flex items-start pl-8 group"
                  >
                    {/* Timeline dot */}
                    <div className="absolute left-[3px] top-2 w-[10px] h-[10px] rounded-full bg-amber-400/60 group-hover:bg-amber-400 transition-colors border-2 border-black" />

                    {/* Content */}
                    <div className="flex-1 p-4 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-amber-400/20 transition-colors">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-amber-400">
                          {formatSpreadType(reading.spread_type)}
                        </span>
                        {topicLabel && (
                          <>
                            <span className="text-gray-600">·</span>
                            <span className="text-xs text-gray-400">{topicLabel}</span>
                          </>
                        )}
                      </div>
                      <p className="text-sm text-gray-300 truncate">
                        {reading.question || 'General reading'}
                      </p>
                      {snippet && (
                        <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                          {snippet}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build passes**

Run: `cd app && npx next build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add app/src/components/reading/ReadingTimeline.tsx
git commit -m "feat: add ReadingTimeline component with date grouping"
```

---

## Task 6: Create ReadingFilters Component

**Files:**
- Create: `app/src/components/reading/ReadingFilters.tsx`

- [ ] **Step 1: Create the filter bar component**

```tsx
'use client';

import { useEffect, useRef } from 'react';

interface ReadingFiltersProps {
  search: string;
  spreadType: string;
  topic: string;
  dateFrom: string;
  dateTo: string;
  onSearchChange: (value: string) => void;
  onSpreadTypeChange: (value: string) => void;
  onTopicChange: (value: string) => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onClear: () => void;
  language?: 'en' | 'fa';
}

const SPREAD_OPTIONS = [
  { value: '', label: 'All Spreads' },
  { value: 'single', label: 'Single Card' },
  { value: 'three-card', label: 'Three Card' },
  { value: 'celtic-cross', label: 'Celtic Cross' },
];

const TOPIC_OPTIONS = [
  { value: '', label: 'All Topics' },
  { value: 'general', label: 'General' },
  { value: 'love', label: 'Love' },
  { value: 'career', label: 'Career' },
  { value: 'yes-or-no', label: 'Yes or No' },
];

export default function ReadingFilters({
  search,
  spreadType,
  topic,
  dateFrom,
  dateTo,
  onSearchChange,
  onSpreadTypeChange,
  onTopicChange,
  onDateFromChange,
  onDateToChange,
  onClear,
  language = 'en',
}: ReadingFiltersProps) {
  const searchRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const hasFilters = search || spreadType || topic || dateFrom || dateTo;

  function handleSearchInput(value: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSearchChange(value);
    }, 300);
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // Sync controlled search input when cleared externally
  useEffect(() => {
    if (!search && searchRef.current && searchRef.current.value !== '') {
      searchRef.current.value = '';
    }
  }, [search]);

  const selectClass = "bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400/50 appearance-none cursor-pointer";
  const inputClass = "bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-400/50";

  return (
    <div className="sticky top-14 z-40 bg-black/90 backdrop-blur-sm py-3 -mx-4 px-4 flex flex-wrap items-center gap-3" dir={language === 'fa' ? 'rtl' : 'ltr'}>
      {/* Search */}
      <input
        ref={searchRef}
        type="text"
        placeholder="Search by question..."
        defaultValue={search}
        onChange={(e) => handleSearchInput(e.target.value)}
        className={`${inputClass} w-full sm:w-48`}
      />

      {/* Spread type */}
      <select
        value={spreadType}
        onChange={(e) => onSpreadTypeChange(e.target.value)}
        className={selectClass}
      >
        {SPREAD_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>

      {/* Topic */}
      <select
        value={topic}
        onChange={(e) => onTopicChange(e.target.value)}
        className={selectClass}
      >
        {TOPIC_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>

      {/* Date from */}
      <input
        type="date"
        value={dateFrom}
        onChange={(e) => onDateFromChange(e.target.value)}
        className={`${inputClass} w-36`}
        placeholder="From"
      />

      {/* Date to */}
      <input
        type="date"
        value={dateTo}
        onChange={(e) => onDateToChange(e.target.value)}
        className={`${inputClass} w-36`}
        placeholder="To"
      />

      {/* Clear filters */}
      {hasFilters && (
        <button
          onClick={onClear}
          className="text-xs text-gray-400 hover:text-amber-400 transition-colors px-2 py-1"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify build passes**

Run: `cd app && npx next build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add app/src/components/reading/ReadingFilters.tsx
git commit -m "feat: add ReadingFilters component with debounced search"
```

---

## Task 7: Create History Page

**Files:**
- Create: `app/src/app/(app)/history/page.tsx`

- [ ] **Step 1: Create the history page**

```tsx
'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ReadingTimeline from '@/components/reading/ReadingTimeline';
import ReadingFilters from '@/components/reading/ReadingFilters';
import type { ReadingRow } from '@/lib/db/queries';

// Wrapper with Suspense boundary required by Next.js for useSearchParams
export default function HistoryPage() {
  return (
    <Suspense fallback={
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold text-white">Reading History</h1></div>
        <div className="space-y-4 pl-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.08] animate-pulse">
              <div className="h-4 w-32 bg-white/10 rounded mb-2" />
              <div className="h-3 w-48 bg-white/5 rounded" />
            </div>
          ))}
        </div>
      </div>
    }>
      <HistoryContent />
    </Suspense>
  );
}

function HistoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [readings, setReadings] = useState<ReadingRow[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Read filters from URL
  const search = searchParams.get('search') || '';
  const spreadType = searchParams.get('spreadType') || '';
  const topic = searchParams.get('topic') || '';
  const dateFrom = searchParams.get('dateFrom') || '';
  const dateTo = searchParams.get('dateTo') || '';

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/history?${params.toString()}`, { scroll: false });
  }

  function clearFilters() {
    router.push('/history', { scroll: false });
  }

  const fetchReadings = useCallback(async (offset: number = 0, append: boolean = false) => {
    if (!append) setLoading(true);
    else setLoadingMore(true);

    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (spreadType) params.set('spreadType', spreadType);
      if (topic) params.set('topic', topic);
      if (dateFrom) params.set('dateFrom', dateFrom);
      if (dateTo) params.set('dateTo', dateTo);
      params.set('offset', String(offset));
      params.set('limit', '20');

      const res = await fetch(`/api/readings?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();

      if (append) {
        setReadings((prev) => [...prev, ...data.readings]);
      } else {
        setReadings(data.readings);
      }
      setTotal(data.total);
      setHasMore(data.hasMore);
    } catch {
      // silently fail — readings stay empty
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [search, spreadType, topic, dateFrom, dateTo]);

  useEffect(() => {
    fetchReadings(0, false);
  }, [fetchReadings]);

  function handleLoadMore() {
    fetchReadings(readings.length, true);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Reading History</h1>
        {!loading && (
          <p className="text-gray-500 text-sm mt-1">
            {total} {total === 1 ? 'reading' : 'readings'}
          </p>
        )}
      </div>

      {/* Filters */}
      <ReadingFilters
        search={search}
        spreadType={spreadType}
        topic={topic}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onSearchChange={(v) => updateParam('search', v)}
        onSpreadTypeChange={(v) => updateParam('spreadType', v)}
        onTopicChange={(v) => updateParam('topic', v)}
        onDateFromChange={(v) => updateParam('dateFrom', v)}
        onDateToChange={(v) => updateParam('dateTo', v)}
        onClear={clearFilters}
      />

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-4 pl-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.08] animate-pulse">
              <div className="h-4 w-32 bg-white/10 rounded mb-2" />
              <div className="h-3 w-48 bg-white/5 rounded mb-2" />
              <div className="h-3 w-64 bg-white/5 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Timeline */}
      {!loading && readings.length > 0 && (
        <>
          <ReadingTimeline readings={readings} />

          {hasMore && (
            <div className="text-center pt-4">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="px-6 py-2.5 bg-white/10 hover:bg-white/15 text-gray-200 font-medium rounded-xl text-sm transition-colors disabled:opacity-50"
              >
                {loadingMore ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </>
      )}

      {/* Empty state — no readings at all */}
      {!loading && readings.length === 0 && !search && !spreadType && !topic && !dateFrom && !dateTo && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No readings yet. Start your first one!</p>
          <Link
            href="/reading/new"
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-medium rounded-xl text-sm transition-colors"
          >
            New Reading
          </Link>
        </div>
      )}

      {/* Empty state — filters returned nothing */}
      {!loading && readings.length === 0 && (search || spreadType || topic || dateFrom || dateTo) && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No readings match your filters.</p>
          <button
            onClick={clearFilters}
            className="text-sm text-amber-400 hover:text-amber-300 transition-colors"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify build passes**

Run: `cd app && npx next build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add app/src/app/\(app\)/history/page.tsx
git commit -m "feat: add /history page with timeline, filters, and pagination"
```

---

## Task 8: Update Dashboard with Preview + "View All" Link

**Files:**
- Modify: `app/src/app/(app)/dashboard/page.tsx`

- [ ] **Step 1: Replace the Recent Readings section**

Add a helper function before the component's return statement:

```typescript
function formatRelativeDate(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}
```

Then replace the entire "Recent Readings" section (lines 76-113) with:

```tsx
      {/* Recent Readings */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Recent Readings</h2>
          {readings && readings.length > 0 && (
            <Link
              href="/history"
              className="text-sm text-amber-400 hover:text-amber-300 transition-colors"
            >
              View All History →
            </Link>
          )}
        </div>
        {readings && readings.length > 0 ? (
          <div className="space-y-2">
            {readings.map((reading) => (
              <Link
                key={reading.id}
                href={`/reading/${reading.id}`}
                className="block p-4 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-white/15 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white capitalize">
                        {reading.spread_type.replace('-', ' ')}
                      </span>
                      {reading.topic && (
                        <>
                          <span className="text-gray-600">·</span>
                          <span className="text-xs text-gray-400 capitalize">
                            {reading.topic === 'yes-or-no' ? 'Yes/No' : reading.topic}
                          </span>
                        </>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                      {reading.question || 'General reading'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                    <span className="text-xs text-gray-600">
                      {formatRelativeDate(reading.created_at)}
                    </span>
                    <DeleteReadingButton readingId={reading.id} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 py-8 text-center">
            No readings yet. Start your first one!
          </p>
        )}
      </div>
```

- [ ] **Step 2: Change the readings limit from 10 to 5**

Find line 13:
```typescript
const readings = await getRecentReadings(user.id, 10);
```
Change to:
```typescript
const readings = await getRecentReadings(user.id, 5);
```

- [ ] **Step 3: Verify build passes**

Run: `cd app && npx next build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add app/src/app/\(app\)/dashboard/page.tsx
git commit -m "feat: dashboard shows 5 readings with topic badge and View All link"
```

---

## Task 9: Add "History" Nav Link to Header

**Files:**
- Modify: `app/src/components/layout/Header.tsx`

- [ ] **Step 1: Add History link to desktop nav**

Find this line in the desktop nav (line 66-67):
```tsx
              <NavLink href="/spreads" current={pathname} label={language === 'en' ? 'Spreads' : 'گسترش‌ها'} />
              <NavLink href="/billing" current={pathname} label={language === 'en' ? 'Billing' : 'اشتراک'} />
```
Add History between them:
```tsx
              <NavLink href="/spreads" current={pathname} label={language === 'en' ? 'Spreads' : 'گسترش‌ها'} />
              <NavLink href="/history" current={pathname} label={language === 'en' ? 'History' : 'تاریخچه'} />
              <NavLink href="/billing" current={pathname} label={language === 'en' ? 'Billing' : 'اشتراک'} />
```

- [ ] **Step 2: Add History link to mobile nav**

Find this line in the mobile nav (line 133-134):
```tsx
              <NavLink href="/spreads" current={pathname} label={language === 'en' ? 'Spreads' : 'گسترش‌ها'} onClick={() => setMenuOpen(false)} />
              <NavLink href="/billing" current={pathname} label={language === 'en' ? 'Billing' : 'اشتراک'} onClick={() => setMenuOpen(false)} />
```
Add History between them:
```tsx
              <NavLink href="/spreads" current={pathname} label={language === 'en' ? 'Spreads' : 'گسترش‌ها'} onClick={() => setMenuOpen(false)} />
              <NavLink href="/history" current={pathname} label={language === 'en' ? 'History' : 'تاریخچه'} onClick={() => setMenuOpen(false)} />
              <NavLink href="/billing" current={pathname} label={language === 'en' ? 'Billing' : 'اشتراک'} onClick={() => setMenuOpen(false)} />
```

- [ ] **Step 3: Verify build passes**

Run: `cd app && npx next build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add app/src/components/layout/Header.tsx
git commit -m "feat: add History nav link to authenticated header"
```

---

## Task 10: Full Build Verification and Manual Testing

**Files:**
- None (verification only)

- [ ] **Step 1: Run production build**

Run: `cd app && npm run build`
Expected: Build succeeds with no TypeScript errors

- [ ] **Step 2: Manual testing**

Run: `cd app && npm run dev`

Test checklist:
1. Create a new reading with a topic — verify topic is saved (check DB or reading detail page)
2. Navigate to `/history` — verify timeline renders with date groups
3. Test search filter — type a question keyword, verify results filter
4. Test spread type dropdown — select "Single Card", verify only singles show
5. Test topic dropdown — select "Love", verify only love readings show
6. Test date range — set a date range, verify results are bounded
7. Test "Clear filters" — verify all filters reset
8. Test "Load more" — if you have >20 readings
9. Verify dashboard shows 5 readings with "View All History →" link
10. Click "View All History →" — verify navigates to `/history`
11. Verify "History" link appears in the nav bar
12. Verify URL params update when filtering (e.g., `/history?topic=love`)

- [ ] **Step 3: Final commit if any fixes were needed**

Only if fixes were applied. Otherwise skip.
