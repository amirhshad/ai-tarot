'use client';

import { NextIntlClientProvider, IntlErrorCode, type IntlError } from 'next-intl';
import type { ReactNode } from 'react';
import type { AbstractIntlMessages } from 'use-intl';

/**
 * `NextIntlClientProvider` with the same missing-key behaviour `request.ts`
 * gives Server Components: in development a missing key throws instead of
 * silently rendering English mid-Arabic page.
 *
 * This wrapper exists because the provider is a Client Component, so `onError`
 * cannot be passed to it from the Server Component layout — a function prop
 * does not survive the serialization boundary.
 */
export default function IntlProvider({
  messages,
  children,
}: {
  messages: AbstractIntlMessages;
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
    <NextIntlClientProvider messages={messages} onError={onError}>
      {children}
    </NextIntlClientProvider>
  );
}
