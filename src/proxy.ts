/**
 * NOTE: proxy.ts only checks for cookie presence.
 * Cryptographic validation and integrity checks are performed
 * within the Data Access Layer (DAL) of each protected layout.
 */
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const PROTECTED_PATHS = ['/dashboard', '/profile', '/admin'];
const AUTH_PATHS = ['/login', '/register', '/forgot-password', '/reset-password'];

export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const hasRefreshCookie = request.cookies.has('refresh_token');

  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  const isAuth = AUTH_PATHS.some((p) => pathname.startsWith(p));

  if (isProtected && !hasRefreshCookie) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  if (isAuth && hasRefreshCookie) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};
