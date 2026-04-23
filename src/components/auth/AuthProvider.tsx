'use client';

import { useAuthStore } from '@/store/auth.store';
import type { User } from '@/types';
import { useEffect } from 'react';

interface AuthProviderProps {
  user: User;
  accessToken: string;
  children: React.ReactNode;
}

export function AuthProvider({
  user,
  accessToken,
  children,
}: AuthProviderProps): React.JSX.Element {
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    hydrate(user, accessToken);
  }, [user, accessToken, hydrate]);

  return <>{children}</>;
}
