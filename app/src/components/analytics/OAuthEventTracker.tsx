'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { identifyUser, trackLogin, trackSignup } from '@/lib/analytics/events';

/**
 * Emits the signup/login event for the Google OAuth path.
 *
 * The email forms call `trackSignup` / `trackLogin` directly, but OAuth lands on
 * a server route that can't touch PostHog. `/api/auth/google/callback` therefore
 * appends `?auth=signup` or `?auth=login` to its redirect, and this component
 * converts that into the event — then strips the param so a refresh, a shared
 * link, or a back-navigation can't double-count it.
 *
 * Mounted inside PostHogProvider, so it is already behind a Suspense boundary
 * (useSearchParams needs one) and never renders when PostHog is unconfigured.
 */
export default function OAuthEventTracker() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // Strict Mode double-invokes effects in dev; the URL rewrite below is async,
  // so guard on a ref rather than relying on the param being gone in time.
  const handled = useRef(false);

  useEffect(() => {
    const outcome = searchParams?.get('auth');
    if (outcome !== 'signup' && outcome !== 'login') return;
    if (handled.current) return;
    handled.current = true;

    if (outcome === 'signup') {
      trackSignup('google');
    } else {
      trackLogin('google');
    }

    // Identity has to come from the session the callback just set, since the
    // id never travels through the URL. Failure here is non-critical: the
    // event above is already captured against the anonymous id.
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user?.id) {
          identifyUser(data.user.id, { email: data.user.email });
        }
      })
      .catch(() => {});

    const rest = new URLSearchParams(searchParams?.toString() ?? '');
    rest.delete('auth');
    const query = rest.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [searchParams, pathname, router]);

  return null;
}
