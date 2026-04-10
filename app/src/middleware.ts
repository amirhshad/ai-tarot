import { type NextRequest, NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const COOKIE_NAME = 'tarot_session';

const intlMiddleware = createIntlMiddleware(routing);

/**
 * Lightweight JWT check for Edge Runtime middleware.
 * Only decodes the payload to check expiry — no signature verification.
 * Full verification happens in API routes (Node.js runtime).
 */
function hasValidSession(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const payload = JSON.parse(atob(parts[1]));
    if (payload.exp && payload.exp * 1000 < Date.now()) return false;
    return !!payload.id;
  } catch {
    return false;
  }
}

export function middleware(request: NextRequest) {
  // Run next-intl middleware first (handles locale negotiation + rewrites)
  const response = intlMiddleware(request);

  // Strip locale prefix for route matching
  const pathname = request.nextUrl.pathname;
  const pathWithoutLocale = pathname.replace(/^\/(en|fa)/, '') || '/';

  // Protected routes — redirect to login if not authenticated
  const protectedPaths = ['/dashboard', '/reading', '/settings', '/billing'];
  const publicPaths = ['/reading/free', '/s/', '/api/auth/google', '/daily'];
  const isPublic = publicPaths.some((path) => pathWithoutLocale.startsWith(path));
  const isProtected =
    !isPublic && protectedPaths.some((path) => pathWithoutLocale.startsWith(path));

  if (isProtected) {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!token || !hasValidSession(token)) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (handled separately)
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, images, cards
     */
    '/((?!api|_next/static|_next/image|favicon.ico|cards/|images/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
