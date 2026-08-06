import { MetadataRoute } from 'next';
import cardContent from '@/data/card-content.json';

// Use stable dates so Google trusts lastModified signals.
// Update these when actual content changes are deployed.
const CONTENT_LAST_MODIFIED = '2026-05-14';
const STATIC_LAST_MODIFIED = '2026-05-14';

const baseUrl = 'https://www.tarotveil.com';

// Regenerate daily so /daily's lastModified is truthful rather than frozen at
// build time. Google discounts lastmod signals it learns to distrust.
export const revalidate = 86400;

/**
 * Emit one sitemap entry per locale for a given path, each carrying the full
 * hreflang cluster.
 *
 * Both URLs need their own <loc>. Listing only the English URL and pointing at
 * the Farsi one via xhtml:link leaves /fa/* discoverable only by crawl, which
 * is why Search Console reported "URL is unknown to Google" for Farsi card
 * pages that have existed for months.
 */
function withAlternates(
  path: string,
  entry: Omit<MetadataRoute.Sitemap[0], 'url'>,
): MetadataRoute.Sitemap {
  const enUrl = path === '' ? `${baseUrl}/` : `${baseUrl}${path}`;
  const faUrl = `${baseUrl}/fa${path}`;
  const languages = { en: enUrl, fa: faUrl, 'x-default': enUrl };

  return [
    { url: enUrl, ...entry, alternates: { languages } },
    { url: faUrl, ...entry, alternates: { languages } },
  ];
}

export default function sitemap(): MetadataRoute.Sitemap {
  // Each withAlternates() call yields an en + fa pair, so this is a list of
  // pairs that gets flattened before it is returned.
  const staticPages: MetadataRoute.Sitemap[] = [
    withAlternates('', {
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: 'weekly',
      priority: 1,
    }),
    withAlternates('/reading/free', {
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: 'weekly',
      priority: 0.9,
    }),
    // Master hub
    withAlternates('/tarot-card-meanings', {
      lastModified: CONTENT_LAST_MODIFIED,
      changeFrequency: 'monthly',
      priority: 0.9,
    }),
    // Sub-hubs
    ...['major-arcana', 'suit-of-wands', 'suit-of-cups', 'suit-of-swords', 'suit-of-pentacles'].map(slug =>
      withAlternates(`/tarot-card-meanings/${slug}`, {
        lastModified: CONTENT_LAST_MODIFIED,
        changeFrequency: 'monthly' as const,
        priority: 0.85,
      }),
    ),
    withAlternates('/spreads', {
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: 'monthly',
      priority: 0.9,
    }),
    withAlternates('/spreads/single-card', {
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: 'monthly',
      priority: 0.8,
    }),
    withAlternates('/spreads/three-card', {
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: 'monthly',
      priority: 0.8,
    }),
    withAlternates('/spreads/celtic-cross', {
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: 'monthly',
      priority: 0.8,
    }),
    withAlternates('/spreads/horseshoe', {
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: 'monthly',
      priority: 0.8,
    }),
    withAlternates('/love-tarot', {
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: 'monthly',
      priority: 0.8,
    }),
    withAlternates('/yes-or-no', {
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: 'monthly',
      priority: 0.8,
    }),
    withAlternates('/career-tarot', {
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: 'monthly',
      priority: 0.8,
    }),
    withAlternates('/daily', {
      lastModified: new Date().toISOString().split('T')[0],
      changeFrequency: 'daily',
      priority: 0.85,
    }),
    withAlternates('/about', {
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: 'monthly',
      priority: 0.6,
    }),
    // /login, /signup, /privacy and /terms are intentionally omitted. They are
    // not search targets, and listing them dilutes the crawl signal on a site
    // where Google is already declining to index the pages that matter.
  ];

  // Generate entries for all 78 card meaning pages
  const cardPages: MetadataRoute.Sitemap[] = Object.keys(
    cardContent as Record<string, unknown>
  ).map(slug =>
    withAlternates(`/tarot-card-meanings/${slug}`, {
      lastModified: CONTENT_LAST_MODIFIED,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }),
  );

  return [...staticPages, ...cardPages].flat();
}
