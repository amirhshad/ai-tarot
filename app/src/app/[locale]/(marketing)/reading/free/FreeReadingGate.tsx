'use client';

import { useSearchParams } from 'next/navigation';
import FreeReadingClient from '@/components/reading/FreeReadingClient';
import type { Locale } from '@/i18n/locales';

const VALID_TOPICS = new Set(['general', 'love', 'yes-or-no', 'career']);

/**
 * `?topic=` starts the interactive reading. Reading that query in the server
 * page would opt /reading/free out of the static cache. The picker is the
 * Suspense fallback (and the SEO body); this swaps in the client flow once
 * the browser knows the query, including after a soft navigation.
 */
export default function FreeReadingGate({
  language,
  children,
}: {
  language: Locale;
  children: React.ReactNode;
}) {
  const topic = useSearchParams().get('topic');
  if (topic && VALID_TOPICS.has(topic)) {
    return <FreeReadingClient language={language} />;
  }
  return children;
}
