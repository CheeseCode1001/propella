'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/lib/stores/auth-store'
import { api, setAccessToken } from '@/lib/api-client'
import type { AuthUser } from '@propella/shared'

/**
 * Rebuilds the session after a page load.
 *
 * The access token is deliberately kept in memory only (never localStorage), so
 * every refresh starts without one. The refresh token lives in an httpOnly
 * cookie, so this exchanges it for a fresh access token before anything
 * protected renders.
 *
 * `sessionChecked` flips true either way — AuthGuard waits on it so a slow
 * refresh cannot bounce a signed-in student to /login.
 */
export function useRestoreSession() {
  const setUser = useAuthStore((s) => s.setUser)
  const setToken = useAuthStore((s) => s.setAccessToken)
  const setSessionChecked = useAuthStore((s) => s.setSessionChecked)
  const sessionChecked = useAuthStore((s) => s.sessionChecked)

  useEffect(() => {
    let cancelled = false

    api
      .post<{ data: { accessToken: string; user?: AuthUser | null } }>('/auth/refresh')
      .then(async (res) => {
        if (cancelled) return
        setToken(res.data.accessToken)

        if (res.data.user) {
          setUser(res.data.user)
          return
        }

        // Refresh returned a token but no profile — fetch it so the guard has
        // onboarding and verification flags to work with.
        try {
          const me = await api.get<{ data: { user: AuthUser } }>('/users/me')
          if (!cancelled) setUser(me.data.user)
        } catch {
          /* the token is still valid; the profile will arrive with the next call */
        }
      })
      .catch(() => {
        // No usable refresh cookie: genuinely signed out.
        if (cancelled) return
        setAccessToken(null)
        useAuthStore.setState({ user: null, isAuthenticated: false })
      })
      .finally(() => {
        if (!cancelled) setSessionChecked(true)
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { loading: !sessionChecked }
}
