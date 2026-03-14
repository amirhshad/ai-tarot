'use client';

import { useState } from 'react';

export default function ReadingFeedback({
  readingId,
  initialFeedback,
}: {
  readingId?: string;
  initialFeedback?: boolean | null;
}) {
  const [submitted, setSubmitted] = useState<boolean | null>(initialFeedback ?? null);
  const [loading, setLoading] = useState(false);

  async function handleFeedback(helpful: boolean) {
    setLoading(true);
    try {
      const res = await fetch('/api/reading/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ readingId, helpful }),
      });
      if (res.ok) {
        setSubmitted(helpful);
      }
    } catch {
      // Silently fail — feedback is non-critical
    } finally {
      setLoading(false);
    }
  }

  if (submitted !== null) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-stone-400">
          {submitted ? 'Glad it resonated with you!' : 'Thanks for your honesty — we\u2019ll keep improving.'}
        </p>
      </div>
    );
  }

  return (
    <div className="text-center py-4 space-y-2">
      <p className="text-sm text-stone-400">Was this reading helpful?</p>
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => handleFeedback(true)}
          disabled={loading}
          className="px-4 py-2 text-sm rounded-lg border border-white/10 bg-white/[0.03] hover:border-green-500/30 hover:bg-green-500/[0.06] text-stone-300 hover:text-green-400 transition-all disabled:opacity-50"
        >
          Yes
        </button>
        <button
          onClick={() => handleFeedback(false)}
          disabled={loading}
          className="px-4 py-2 text-sm rounded-lg border border-white/10 bg-white/[0.03] hover:border-red-400/30 hover:bg-red-400/[0.06] text-stone-300 hover:text-red-400 transition-all disabled:opacity-50"
        >
          No
        </button>
      </div>
    </div>
  );
}
