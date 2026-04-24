import { setClientAccessToken } from '@/lib/api/client';
import type { User } from '@/types';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isHydrated: boolean;
  hydrate: (user: User, accessToken: string) => void;
  setAccessToken: (token: string) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools((set) => ({
    user: null,
    accessToken: null,
    isHydrated: false,

    hydrate(user: User, accessToken: string): void {
      setClientAccessToken(accessToken);
      set({ user, accessToken, isHydrated: true });
    },

    setAccessToken(token: string): void {
      setClientAccessToken(token);
      set({ accessToken: token });
    },

    clear(): void {
      setClientAccessToken(null);
      set({ user: null, accessToken: null, isHydrated: false });
    },
  })),
);
