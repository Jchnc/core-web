import 'server-only';

import { cache } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import type { Session, User } from '@/types';
import { backend } from '@/lib/api/backend';

async function fetchSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refresh_token')?.value;

  if (!refreshToken) return null;

  try {
    const { data } = await backend.post<{
      data: { access_token: string; user: User };
    }>(
      '/auth/session',
      {},
      {
        headers: { Cookie: `refresh_token=${refreshToken}` },
      },
    );

    return {
      user: data.data.user,
      accessToken: data.data.access_token,
    };
  } catch {
    return null;
  }
}

export const verifySession = cache(fetchSession);

export const requireSession = cache(async (): Promise<Session> => {
  const session = await verifySession();

  if (!session) {
    redirect('/api/auth/logout');
  }

  return session;
});

export const requireAdmin = cache(async (): Promise<Session> => {
  const session = await requireSession();

  if (session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  return session;
});

export const redirectIfAuthenticated = cache(async (): Promise<void> => {
  const session = await verifySession();

  if (session) {
    redirect('/dashboard');
  }
});
