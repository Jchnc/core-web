'use client';

import { useAuthStore } from '@/store/auth.store';
import { useEffect } from 'react';

function getCookieValue(name: string): string | null {
  if (typeof document === 'undefined') return null;

  const match = document.cookie.split('; ').find((row) => row.startsWith(`${name}=`));

  return match ? decodeURIComponent(match.split('=')[1] ?? '') : null;
}

function deleteCookie(name: string): void {
  document.cookie = `${name}=; Max-Age=0; path=/`;
}

export function OAuthHydrator(): null {
  const setAccessToken = useAuthStore((s) => s.setAccessToken);

  useEffect(() => {
    const token = getCookieValue('oauth_access_token');

    if (token) {
      setAccessToken(token);
      deleteCookie('oauth_access_token');
    }
  }, [setAccessToken]);

  return null;
}
