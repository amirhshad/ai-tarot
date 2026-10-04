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
