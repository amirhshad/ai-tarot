'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const FREE_READING_KEY = 'tarotveil_anonymous_reading';

export default function ClaimAnonymousReading() {
  const router = useRouter();

  useEffect(() => {
    async function claim() {
      try {
        const stored = localStorage.getItem(FREE_READING_KEY);
        if (!stored) return;

        const reading = JSON.parse(stored);
        if (!reading.cards || !reading.interpretation) return;

        const res = await fetch('/api/reading/claim', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            spreadType: reading.spreadType || 'three-card',
            cards: reading.cards,
            question: reading.question,
            interpretation: reading.interpretation,
          }),
        });

        if (res.ok) {
          const { readingId } = await res.json();
          localStorage.removeItem(FREE_READING_KEY);
          router.push(`/reading/${readingId}`);
        }
      } catch {
        // Silently fail — user can still use the dashboard
      }
    }

    claim();
  }, [router]);

  return null;
}
