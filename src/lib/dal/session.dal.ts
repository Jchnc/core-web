import 'server-only';

import { cache } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import type { Session, User } from '@/types';
import { backend } from '@/lib/api/backend';

/**
 * Fetch session from backend
 * @returns Session or null
 */
async function fetchSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refresh_token')?.value;

  if (!refreshToken) return null;

  try {
    const { data } = await backend.post<{
      data: { access_token: string; user: User };
    }>('/auth/refresh', null, {
      headers: {
        Cookie: `refresh_token=${refreshToken}`,
      },
    });

    return {
      user: data.data.user,
      accessToken: data.data.access_token,
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
