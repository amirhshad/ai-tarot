import { notFound } from 'next/navigation';
import { LOCALES, toLocale, DEFAULT_LOCALE, type Locale } from '@/i18n/locales';

const SITE_URL = 'https://www.tarotveil.com';

/**
 * Locales with authored card-meaning content.
 *
 * Arabic joined on 2026-10-25 with the Phase 2 cohort of 8 cards. It is no
 * longer the whole story: this constant is now the *site-wide* half of the
 * gate, and `cardLocales()` below intersects it with each card's authored
 * locales. A locale listed here with content for only some cards publishes
 * only those cards — which is exactly the cohort's shape, 8 live and 70 still
 * 404ing as the control group.
 *
 * Every card-meaning surface reads one of the two halves: routes, the sitemap,
 * hreflang sets, nav links, the hub and sub-hub listings, and the ~20 in-body
 * links through `CardMeaningLink`. Per-card membership comes from
 * `published-cards.json`, regenerated from the database — so publishing the
 * remaining 70 is a content operation with no code change at all.
 */
export const CARD_CONTENT_LOCALES: readonly Locale[] = ['en', 'fa', 'ar'];

/**
 * The Phase-1 gate for every card-meaning route. Calls `notFound()` when the
 * given locale is outside `CARD_CONTENT_LOCALES`.
 *
 * This is the single implementation of the gate — the seven card-meaning
 * route files each call it once instead of repeating
 * `if (!CARD_CONTENT_LOCALES.includes(toLocale(locale))) notFound();`
 * verbatim. It reads `CARD_CONTENT_LOCALES` rather than restating the list,
 * so Phase 2 still ships by editing that one constant.
 */
export function assertCardContentLocale(locale: string): void {
  if (!CARD_CONTENT_LOCALES.includes(toLocale(locale))) notFound();
}

/**
 * The locales one card is actually live in.
 *
 * `CARD_CONTENT_LOCALES` is a per-locale switch, so it can say "Arabic is on"
 * or "Arabic is off" but not "8 Arabic cards are on and 70 are not" — which is
 * the exact shape of the Phase 2 cohort. This intersects the site-wide switch
 * with each card's authored locales from `published-cards.json`, so a
 * locale is live for a card only when **both** agree.
 *
 * Two consequences worth stating, because they are the design:
 *
 * - Adding `'ar'` to `CARD_CONTENT_LOCALES` turns on exactly the cards that
 *   have Arabic, and no others. The 70 without it keep 404ing and stay a clean
 *   control group. No cohort list is hardcoded anywhere.
 * - `authored === undefined` (an unknown card, or a database read that failed)
 *   means "no per-card opinion" and falls back to the site-wide set. A Turso
 *   blip therefore degrades this to the old behaviour rather than 404ing every
 *   card page or emptying the sitemap.
 */
export function cardLocales(authored: readonly Locale[] | undefined): Locale[] {
  if (!authored) return [...CARD_CONTENT_LOCALES];
  return CARD_CONTENT_LOCALES.filter(l => authored.includes(l));
}

/**
 * The per-card half of the Phase 2 gate: `notFound()` unless this card is live
 * in this locale. Call it after `assertCardContentLocale`, which rejects the
 * locale outright; this one rejects a locale the card itself has no content in.
 */
export function assertCardPublished(
  locale: string,
  authored: readonly Locale[] | undefined,
): void {
  if (!cardLocales(authored).includes(toLocale(locale))) notFound();
}

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
