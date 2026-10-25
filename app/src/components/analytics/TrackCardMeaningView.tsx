'use client';

import { useEffect } from 'react';
import { trackCardMeaningViewed } from '@/lib/analytics/events';

/**
 * Reports a card-meaning page view with the card and locale attached.
 *
 * The card pages are server components, so they cannot call PostHog themselves.
 * `$pageview` already records the URL, but these 78 pages × 2 locales are the
 * site's SEO surface and the question asked of them is "which cards and which
 * language", which is far cheaper to answer from a property than by parsing
 * paths. Renders nothing.
 */
export default function TrackCardMeaningView({
  slug,
  locale,
}: {
  slug: string;
  locale: string;
}) {
  useEffect(() => {
    trackCardMeaningViewed(slug, locale);
  }, [slug, locale]);

  return null;
}
