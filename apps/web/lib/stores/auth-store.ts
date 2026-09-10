import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthUser } from '@propella/shared'
import { setAccessToken } from '../api-client'

interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean

  /**
   * localStorage is read *after* the first render, so until this flips true the
   * store still holds its initial (logged-out) values. Redirecting before then
   * is what used to bounce people to /login on every refresh.
   */
  hasHydrated: boolean

  /**
   * The access token lives in memory only, so a refresh loses it. This turns
   * true once the silent /auth/refresh attempt has finished — succeeded or not.
   */
  sessionChecked: boolean

  setUser: (user: AuthUser | null) => void
  setAccessToken: (token: string) => void
  setHydrated: () => void
  setSessionChecked: (checked: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      hasHydrated: false,
      sessionChecked: false,

      setUser: (user) => set({ user, isAuthenticated: user !== null }),
      setAccessToken: (token) => {
        setAccessToken(token)
      },
      setHydrated: () => set({ hasHydrated: true }),
      setSessionChecked: (checked) => set({ sessionChecked: checked }),

      logout: () => {
        setAccessToken(null)
        set({ user: null, isAuthenticated: false, sessionChecked: true })
      },
    }),
    {
      name: 'propella-auth',
      // Only the identity is persisted. hasHydrated / sessionChecked are
      // per-page-load facts and must always start false.
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated()
      },
    },
  ),
)

/** True once the app knows who (if anyone) is signed in. */
export function useAuthReady(): boolean {
  return useAuthStore((s) => s.hasHydrated && s.sessionChecked)
}
