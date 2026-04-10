import { MetadataRoute } from 'next';
import cardContent from '@/data/card-content.json';

// Use stable dates so Google trusts lastModified signals.
// Update these when actual content changes are deployed.
const CONTENT_LAST_MODIFIED = '2026-04-10';
const STATIC_LAST_MODIFIED = '2026-04-10';

const baseUrl = 'https://www.tarotveil.com';

/** Add en + fa alternates to a sitemap entry */
function withAlternates(path: string, entry: Omit<MetadataRoute.Sitemap[0], 'url'>) {
  return {
    url: `${baseUrl}${path}`,
    ...entry,
    alternates: {
      languages: {
        en: `${baseUrl}${path}`,
        fa: `${baseUrl}/fa${path}`,
      },
    },
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
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
    withAlternates('/about', {
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: 'monthly',
      priority: 0.6,
    }),
    withAlternates('/login', {
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: 'monthly',
      priority: 0.5,
    }),
    withAlternates('/signup', {
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: 'monthly',
      priority: 0.7,
    }),
    withAlternates('/privacy', {
      lastModified: '2026-01-01',
      changeFrequency: 'yearly',
      priority: 0.3,
    }),
    withAlternates('/terms', {
      lastModified: '2026-01-01',
      changeFrequency: 'yearly',
      priority: 0.3,
    }),
  ];

  // Generate entries for all 78 card meaning pages
  const cardPages: MetadataRoute.Sitemap = Object.keys(
    cardContent as Record<string, unknown>
  ).map(slug =>
    withAlternates(`/tarot-card-meanings/${slug}`, {
      lastModified: CONTENT_LAST_MODIFIED,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }),
  );

  return [...staticPages, ...cardPages];
}
