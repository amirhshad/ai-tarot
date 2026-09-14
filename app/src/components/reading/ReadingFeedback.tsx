'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

export default function ReadingFeedback({
  readingId,
  initialFeedback,
}: {
  readingId?: string;
  initialFeedback?: boolean | null;
}) {
  const t = useTranslations('reading.feedback');
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
          {submitted ? t('thanksPositive') : t('thanksNegative')}
        </p>
      </div>
    );
  }

  return (
    <div className="text-center py-4 space-y-2">
      <p className="text-sm text-stone-400">{t('question')}</p>
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => handleFeedback(true)}
          disabled={loading}
          className="px-4 py-2 text-sm rounded-lg border border-white/10 bg-white/[0.03] hover:border-green-500/30 hover:bg-green-500/[0.06] text-stone-300 hover:text-green-400 transition-all disabled:opacity-50"
        >
          {t('yes')}
        </button>
        <button
          onClick={() => handleFeedback(false)}
          disabled={loading}
          className="px-4 py-2 text-sm rounded-lg border border-white/10 bg-white/[0.03] hover:border-red-400/30 hover:bg-red-400/[0.06] text-stone-300 hover:text-red-400 transition-all disabled:opacity-50"
        >
          {t('no')}
        </button>
      </div>
    </div>
  );
}
