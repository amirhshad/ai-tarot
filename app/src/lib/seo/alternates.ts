const SITE_URL = 'https://www.tarotveil.com';

/**
 * Build proper hreflang alternates for a page.
 * English has no prefix, Farsi gets /fa/ prefix.
 */
export function buildAlternates(path: string) {
  // Ensure path starts with /
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  return {
    canonical: `${SITE_URL}${cleanPath}`,
    languages: {
      'en': `${SITE_URL}${cleanPath}`,
      'fa': `${SITE_URL}/fa${cleanPath}`,
      'x-default': `${SITE_URL}${cleanPath}`,
    },
  };
}
