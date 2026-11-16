import { type NextRequest, NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { localePathPattern } from './i18n/locales';

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
  // Permanent redirects used to live in next.config, which cannot attach the
  // security headers. Handle them here so the response carries both.
  const permanent = redirectPermanent(request);
  if (permanent) return permanent;

  // Run next-intl middleware first (handles locale negotiation + rewrites)
  const response = intlMiddleware(request);

  // Strip locale prefix for route matching
  const pathname = request.nextUrl.pathname;
  const pathWithoutLocale = pathname.replace(localePathPattern(), '') || '/';

  // Protected routes — redirect to login if not authenticated
  const protectedPaths = ['/dashboard', '/reading', '/settings', '/billing', '/admin'];
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
      const redirect = NextResponse.redirect(url);
      // A cached 307 would keep sending a later signed-in visitor to /login.
      redirect.headers.set('Cache-Control', 'private, no-store');
      return withSecurityHeaders(redirect);
    }
  }

  return withSecurityHeaders(response);
}

const SECURITY_HEADERS: ReadonlyArray<readonly [string, string]> = [
  ['X-Content-Type-Options', 'nosniff'],
  ['Referrer-Policy', 'strict-origin-when-cross-origin'],
  ['X-Frame-Options', 'SAMEORIGIN'],
  // Frame protection only. A broader enforcing CSP would block Stripe,
  // PostHog, Vercel Analytics, or Google OAuth.
  ['Content-Security-Policy', "frame-ancestors 'self'"],
];

/**
 * `/en` used to be a next.config redirect, which cannot carry the security
 * headers. It runs here, before next-intl, so it stays a 308 and the response
 * includes the headers. `/cards` stays in next.config: the matcher skips
 * `cards/` so image files under public/cards are served as static files.
 */
function redirectPermanent(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl;
  const url = request.nextUrl.clone();

  // `/cards` and `/cards/:slug` stay in next.config. The matcher skips
  // `cards/` so public/cards images are not rewritten, which means middleware
  // never sees `/cards/the-fool`.

  // `/en` is the default locale with a prefix. 308, not next-intl's 307.
  if (pathname === '/en' || pathname.startsWith('/en/')) {
    const stripped = pathname.replace(/^\/en(?=\/|$)/, '');
    url.pathname = stripped === '' ? '/' : stripped;
    return withSecurityHeaders(NextResponse.redirect(url, 308));
  }

  return null;
}

function withSecurityHeaders(response: NextResponse): NextResponse {
  for (const [key, value] of SECURITY_HEADERS) {
    response.headers.set(key, value);
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
     * - file-based metadata routes. next-intl rewrites an unprefixed path to
     *   /<defaultLocale>/..., and these files live on the root segment, so
     *   the rewrite 404s /opengraph-image, /twitter-image, /icon, /apple-icon.
     * - sitemap.xml
     * - any .txt file in public/ (robots.txt, IndexNow key verification
     *   files, and any future .txt file placed in public/) — these must be
     *   served directly rather than routed through locale/auth middleware
     */
    '/((?!api|_next/static|_next/image|favicon.ico|opengraph-image|twitter-image|apple-icon|icon|cards/|images/|sitemap\\.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt)$).*)',
  ],
};
