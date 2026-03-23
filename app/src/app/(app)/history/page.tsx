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
          <ReadingTimeline
            readings={readings}
            onDelete={(id) => {
              setReadings((prev) => prev.filter((r) => r.id !== id));
              setTotal((prev) => prev - 1);
            }}
          />

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
