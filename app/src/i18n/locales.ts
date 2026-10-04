/**
 * The locale list and every constant derived from it.
 *
 * This module is the single source of truth: `routing.ts`, the middleware, the
 * tarot data accessors, and the prompt tables all derive from `LOCALES` rather
 * than repeating a literal union. Adding a locale means adding it here and
 * fixing the type errors that follow — which is the point.
 */

export const LOCALES = ['en', 'fa', 'ar'] as const;

export type Locale = (typeof LOCALES)[number];

/** Locales that need translated content. English is the canonical source. */
export type TranslatedLocale = Exclude<Locale, 'en'>;

export const DEFAULT_LOCALE: Locale = 'en';

const RTL_LOCALES = new Set<Locale>(['fa', 'ar']);

export function isRtl(locale: Locale): boolean {
  return RTL_LOCALES.has(locale);
}

/**
 * Narrow an untrusted string to a Locale, defaulting to English.
 *
 * Replaces the `(locale === 'fa' ? 'fa' : 'en')` coercions. Deliberately
 * total rather than throwing: a malformed cookie, request body, or URL should
 * degrade to English, not 500.
 */
export function toLocale(value: string | undefined | null): Locale {
  return (LOCALES as readonly string[]).includes(value ?? '')
    ? (value as Locale)
    : DEFAULT_LOCALE;
}

/**
 * Brand name per locale.
 *
 * Arabic keeps the Latin wordmark. Arabic has no clean transliteration of
 * "v" — ف yields "Tarotfil" and ڤ is Persian/dialectal — and Latin brand names
 * are standard for tech products in Arab markets. Farsi's transliteration is
 * already established, so it stays.
 */
export const BRAND: Record<Locale, string> = {
  en: 'TarotVeil',
  fa: 'تاروت‌ویل',
  ar: 'TarotVeil',
};

/**
 * BCP-47 tag for `Intl` formatting.
 *
 * Arabic pins `-u-nu-latn` because bare `ar` renders Arabic-Indic digits
 * (٢٠٢٦), while Arabic-language digital products overwhelmingly use Latin
 * digits. Farsi keeps `fa-IR`, whose Persian digits are expected there.
 */
export const HTML_LANG: Record<Locale, string> = {
  en: 'en-US',
  fa: 'fa-IR',
  ar: 'ar-u-nu-latn',
};

/** Language-switcher labels, each in its own script. */
export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  fa: 'فارسی',
  ar: 'العربية',
};

/**
 * Matches a leading `/<locale>` path segment, for stripping the prefix before
 * route matching. Anchored and segment-bounded so `/article` is not read as
 * the `ar` locale followed by `ticle`.
 */
export function localePathPattern(): RegExp {
  return new RegExp(`^/(?:${LOCALES.join('|')})(?=/|$)`);
}

const FSI = '⁨'; // First Strong Isolate
const PDI = '⁩'; // Pop Directional Isolate

/**
 * Bidi-isolate a Latin run so it can sit inside RTL text without dragging
 * neighbouring punctuation around it.
 *
 * The Arabic brand is the Latin wordmark, so `'%s | TarotVeil'` in an RTL
 * context renders the separator on the wrong side without this.
 */
export function isolateLtr(text: string): string {
  if (text === '') return '';
  if (text.startsWith(FSI) && text.endsWith(PDI)) return text;
  return `${FSI}${text}${PDI}`;
}
