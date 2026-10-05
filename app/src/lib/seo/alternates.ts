import { LOCALES, toLocale, DEFAULT_LOCALE, type Locale } from '@/i18n/locales';

const SITE_URL = 'https://www.tarotveil.com';

/**
 * Locales with authored card-meaning content.
 *
 * Arabic is absent until Phase 2 fills the `_ar` columns. Those routes return
 * 404 for `ar`, so advertising an Arabic hreflang for them would point
 * crawlers at a dead URL — worse than advertising nothing.
 *
 * This constant is the single source of truth for the gate: the routes, the
 * sitemap, the hreflang sets, and the nav links all read it. Phase 2 ships by
 * adding 'ar' here and nowhere else.
 */
export const CARD_CONTENT_LOCALES: readonly Locale[] = ['en', 'fa'];

function localeUrl(locale: Locale, cleanPath: string): string {
  if (locale === DEFAULT_LOCALE) {
    return cleanPath === '' ? `${SITE_URL}/` : `${SITE_URL}${cleanPath}`;
  }
  return `${SITE_URL}/${locale}${cleanPath}`;
}

/**
 * Build hreflang alternates for a page. English has no prefix; other locales
 * are prefixed. The canonical always self-references the page's own locale.
 *
 * Pass `options.locales` for a page that exists in fewer locales than the site
 * does.
 */
export function buildAlternates(
  path: string,
  locale: string = DEFAULT_LOCALE,
  options: { locales?: readonly Locale[] } = {},
) {
  // Normalise the root path to '' so we emit '/' and '/ar' rather than '//'
  // and '/ar/' — hreflang must match the live URL exactly.
  const raw = path.startsWith('/') ? path : `/${path}`;
  const cleanPath = raw === '/' ? '' : raw.replace(/\/$/, '');

  const available = options.locales ?? LOCALES;
  const current = toLocale(locale);
  const effective = available.includes(current) ? current : DEFAULT_LOCALE;

  const languages: Record<string, string> = {};
  for (const candidate of available) {
    languages[candidate] = localeUrl(candidate, cleanPath);
  }
  languages['x-default'] = localeUrl(DEFAULT_LOCALE, cleanPath);

  return { canonical: localeUrl(effective, cleanPath), languages };
}
