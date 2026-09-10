'use client'

import { useEffect, useMemo, useSyncExternalStore } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import type { Persister } from '@tanstack/react-query-persist-client'
import { queryClient, CACHE_MAX_AGE } from '@/lib/query-client'
import { createPersister, clearPersistedCache } from '@/lib/query-persist'
import { useAuthStore } from '@/lib/stores/auth-store'
import { SessionRestorer } from '@/components/session-restorer'

export function Providers({ children }: { children: React.ReactNode }) {
  const logout = useAuthStore((s) => s.logout)

  // localStorage is only reachable on the client. useSyncExternalStore gives
  // false during SSR and true from the first client render, so the persisting
  // provider mounts without an extra render pass.
  const canPersist = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )

  // Built once, and only where storage actually works.
  const persister: Persister | null = useMemo(
    () => (canPersist ? createPersister() : null),
    [canPersist],
  )

  useEffect(() => {
    const handler = () => {
      // Cached responses belong to the account that just signed out.
      clearPersistedCache()
      queryClient.clear()
      logout()
    }
    window.addEventListener('propella:logout', handler)
    return () => window.removeEventListener('propella:logout', handler)
  }, [logout])

  const persistOptions = useMemo(
    () =>
      persister
        ? {
            persister,
            maxAge: CACHE_MAX_AGE,
            // Bump when a cached response shape changes, to drop stale entries.
            buster: 'v1',
          }
        : null,
    [persister],
  )

  if (!persistOptions) {
    return (
      <QueryClientProvider client={queryClient}>
        <SessionRestorer />
        {children}
      </QueryClientProvider>
    )
  }

  return (
    <PersistQueryClientProvider client={queryClient} persistOptions={persistOptions}>
      <SessionRestorer />
      {children}
    </PersistQueryClientProvider>
  )
}
