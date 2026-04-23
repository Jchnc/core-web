'use server';

import { cookies } from 'next/headers';

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refresh_token')?.value;

  if (refreshToken) {
    try {
      await fetch(`${process.env.BACKEND_URL!}/auth/logout`, {
        method: 'POST',
        headers: {
          Cookie: `refresh_token=${refreshToken}`,
        },
        cache: 'no-store',
      });
    } catch {
      // silent, always clear cookie regardless
    }
  }

  cookieStore.delete('refresh_token');
}
