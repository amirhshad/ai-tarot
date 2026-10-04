import { getRequestConfig } from 'next-intl/server';
import { hasLocale, IntlErrorCode } from 'next-intl';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
    /**
     * A missing key silently falling back is how English text ends up mid-page
     * in a translated locale. `parity.test.ts` is the real gate; this makes a
     * gap visible the moment it is introduced locally.
     *
     * Only MISSING_MESSAGE throws. Other IntlErrors are environmental rather
     * than content gaps — an unconfigured `timeZone` raises
     * ENVIRONMENT_FALLBACK on every render, and throwing on that would 500 the
     * dev page for a reason unrelated to translation coverage.
     */
    onError(error) {
      if (
        process.env.NODE_ENV === 'development' &&
        error.code === IntlErrorCode.MISSING_MESSAGE
      ) {
        throw error;
      }
      console.error(error);
    },
  };
});
