const SITE_URL = 'https://www.tarotveil.com';

/**
 * Build proper hreflang alternates for a page.
 * English has no prefix, Farsi gets /fa/ prefix.
 * The canonical always points to the page's own locale URL (self-referencing).
 */
export function buildAlternates(path: string, locale: string = 'en') {
  // Normalise the root path to '' so we emit '/' and '/fa' rather than
  // '//' and '/fa/' — hreflang must match the live URL exactly.
  const raw = path.startsWith('/') ? path : `/${path}`;
  const cleanPath = raw === '/' ? '' : raw.replace(/\/$/, '');

  const enUrl = cleanPath === '' ? `${SITE_URL}/` : `${SITE_URL}${cleanPath}`;
  const faUrl = `${SITE_URL}/fa${cleanPath}`;

  return {
    canonical: locale === 'fa' ? faUrl : enUrl,
    languages: {
      'en': enUrl,
      'fa': faUrl,
      'x-default': enUrl,
    },
  };
}
