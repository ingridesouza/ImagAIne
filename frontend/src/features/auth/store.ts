import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AuthSessionPayload, UserProfile } from '@/features/auth/types';

type AuthState = AuthSessionPayload & {
  hasHydrated: boolean;
  setSession: (payload: AuthSessionPayload) => void;
  setUser: (user: UserProfile | null) => void;
  logout: () => void;
  setHydrated: () => void;
};

const emptySession: AuthSessionPayload = {
  accessToken: null,
  refreshToken: null,
  user: null,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      ...emptySession,
      hasHydrated: false,
      setSession: (payload) => set(payload),
      setUser: (user) => set({ user }),
      logout: () => set(emptySession),
      setHydrated: () => set({ hasHydrated: true }),
    }),
    {
      name: 'imagaine-auth',
      storage: createJSONStorage(() => window.localStorage),
      partialize: ({ accessToken, refreshToken, user }) => ({
        accessToken,
        refreshToken,
        user,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (!error) {
          state?.setHydrated();
        }
      },
    },
  ),
);
