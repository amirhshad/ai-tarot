'use client';

import { NextIntlClientProvider, IntlErrorCode, type IntlError } from 'next-intl';
import type { ComponentProps, ReactNode } from 'react';
import type { Locale } from '@/i18n/locales';

type Messages = ComponentProps<typeof NextIntlClientProvider>['messages'];

/**
 * `NextIntlClientProvider` with the same missing-key behaviour `request.ts`
 * gives Server Components: in development a missing key throws instead of
 * silently rendering English mid-Arabic page.
 *
 * Why this wrapper exists: the provider is a Client Component, so `onError`
 * cannot reach it as a prop from the Server Component layout — a function does
 * not survive the RSC serialization boundary.
 *
 * Why `locale` must be passed in: the `locale ?? await getLocale()` injection
 * lives in next-intl's `react-server` entry, and a `'use client'` module never
 * resolves to that condition. What we get instead is
 * `shared/NextIntlClientProvider`, which throws when `locale` is absent — with
 * an empty message in the production build. So the layout forwards the locale
 * it has already validated.
 *
 * The same server entry also injects `timeZone`, `formats` and `now`. Those are
 * deliberately not forwarded: `request.ts` configures none of them, and nothing
 * in the codebase uses next-intl's formatter (no `useFormatter`,
 * `getFormatter`, or `format.*` call sites), so that injection carries nothing
 * here. Forwarding `locale` alone is lossless. Revisit if date or number
 * formatting is ever added.
 */
export default function IntlProvider({
  locale,
  messages,
  children,
}: {
  locale: Locale;
  messages: Messages;
  children: ReactNode;
}) {
  function onError(error: IntlError) {
    if (
      process.env.NODE_ENV === 'development' &&
      error.code === IntlErrorCode.MISSING_MESSAGE
    ) {
      throw error;
    }
    console.error(error);
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages} onError={onError}>
      {children}
    </NextIntlClientProvider>
  );
}
