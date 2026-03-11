import { NextResponse, type NextRequest } from 'next/server';

const COOKIE_NAME = 'tarot_session';

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

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({ request });

  const token = request.cookies.get(COOKIE_NAME)?.value;
  const isAuthenticated = token ? hasValidSession(token) : false;

  // Protected routes — redirect to login if not authenticated
  const protectedPaths = ['/dashboard', '/reading', '/settings', '/billing'];
  const isProtected = protectedPaths.some(path =>
    request.nextUrl.pathname.startsWith(path),
  );

  if (isProtected && !isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return response;
}
