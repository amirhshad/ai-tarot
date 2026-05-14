const SITE_URL = 'https://www.tarotveil.com';

/**
 * Build proper hreflang alternates for a page.
 * English has no prefix, Farsi gets /fa/ prefix.
 * The canonical always points to the page's own locale URL (self-referencing).
 */
export function buildAlternates(path: string, locale: string = 'en') {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const canonicalPath = locale === 'fa' ? `/fa${cleanPath}` : cleanPath;

  return {
    canonical: `${SITE_URL}${canonicalPath}`,
    languages: {
      'en': `${SITE_URL}${cleanPath}`,
      'fa': `${SITE_URL}/fa${cleanPath}`,
      'x-default': `${SITE_URL}${cleanPath}`,
    },
  };
}
