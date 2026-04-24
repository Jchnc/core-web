'use server';

import { cookies } from 'next/headers';

import { backend } from '@/lib/api/backend';

/**
 * Logout action — revokes session on backend and clears local cookie.
 */
export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refresh_token')?.value;

  if (refreshToken) {
    try {
      await backend.post('/auth/logout', null, {
        headers: { Cookie: `refresh_token=${refreshToken}` },
      });
    } catch {
      // silent, always clear cookie regardless
    }
  }

  cookieStore.delete('refresh_token');
}
