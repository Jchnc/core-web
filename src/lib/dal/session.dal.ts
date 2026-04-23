import 'server-only';

import { cache } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import type { Session, User } from '@/types';
import { env } from '@/config/env';

async function fetchSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refresh_token')?.value;

  if (!refreshToken) return null;

  try {
    const res = await fetch(`${env.BACKEND_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        Cookie: `refresh_token=${refreshToken}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!res.ok) return null;

    const { data } = (await res.json()) as {
      data: { access_token: string; user: User };
    };

    return {
      user: data.user,
      accessToken: data.access_token,
    };
  } catch {
    return null;
  }
}

/**
 * Memoized per render pass via React.cache.
 * Multiple Server Components calling this in one request share one fetch.
 */
export const verifySession = cache(fetchSession);

/**
 * Use in protected layouts and pages.
 * Redirects to /login if no valid session exists.
 */
export const requireSession = cache(async (): Promise<Session> => {
  const session = await verifySession();
  if (!session) redirect('/login');
  return session;
});

/**
 * Use in admin-only layouts and pages.
 * Redirects to /dashboard if authenticated but not ADMIN.
 */
export const requireAdmin = cache(async (): Promise<Session> => {
  const session = await requireSession();
  if (session.user.role !== 'ADMIN') redirect('/dashboard');
  return session;
});

/**
 * Use in auth layouts (login, register).
 * Redirects to /dashboard if user is already authenticated.
 */
export const redirectIfAuthenticated = cache(async (): Promise<void> => {
  const session = await verifySession();
  if (session) redirect('/dashboard');
});
