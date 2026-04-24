import { env } from '@/config/env';
import { type NextRequest, NextResponse } from 'next/server';

const IS_PROD = env.NODE_ENV === 'production';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = request.nextUrl;
  const accessToken = searchParams.get('access_token');

  if (!accessToken) {
    return NextResponse.redirect(new URL('/login?error=oauth_failed', request.url));
  }

  // Pass access_token to the client via a short-lived non-httpOnly cookie
  // The AuthProvider will read it once, hydrate Zustand, then the cookie is discarded
  const response = NextResponse.redirect(new URL('/dashboard', request.url));

  response.cookies.set('oauth_access_token', accessToken, {
    httpOnly: false, // Must be readable by JS to hydrate Zustand
    secure: IS_PROD,
    sameSite: 'lax',
    path: '/',
    maxAge: 30, // 30 seconds — one-time use
  });

  return response;
}
