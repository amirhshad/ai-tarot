import { LOCALES, DEFAULT_LOCALE, type Locale } from '@/i18n/locales';

function supported(value: string | undefined | null): Locale | undefined {
  return (LOCALES as readonly string[]).includes(value ?? '') ? (value as Locale) : undefined;
}

/**
 * Decide which language a reading is generated in.
 *
 * Precedence: an explicit request body value, then the locale of the page the
 * reader is on, then their stored preference, then English.
 *
 * The URL beats the stored profile deliberately. Someone reading /en with
 * `language: 'ar'` saved is reading English right now, and an Arabic
 * interpretation inside an English page is worse than ignoring the preference.
 *
 * `urlLocale` has no production caller today: every client already posts its
 * URL locale as `language`, so the first tier carries the behaviour. It is a
 * safety net for a caller that knows the page locale but not the body value —
 * not load-bearing, so do not plumb anything to reach it.
 */
export function resolveReadingLanguage(params: {
  requestLanguage?: string;
  urlLocale?: string;
  profileLanguage?: string;
}): Locale {
  return (
    supported(params.requestLanguage) ??
    supported(params.urlLocale) ??
    supported(params.profileLanguage) ??
    DEFAULT_LOCALE
  );
}
