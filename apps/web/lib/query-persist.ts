'use client'

import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import type { Persister } from '@tanstack/react-query-persist-client'

const STORAGE_KEY = 'propella-query-cache'

/**
 * Builds the localStorage persister for the query cache.
 *
 * Returns null during SSR and wherever storage is unavailable (private windows,
 * blocked site data) — the app then runs as a normal in-memory cache.
 */
export function createPersister(): Persister | null {
  if (typeof window === 'undefined') return null

  try {
    // Probe rather than trust: Safari's private mode throws only on write.
    const probe = '__propella_probe__'
    window.localStorage.setItem(probe, '1')
    window.localStorage.removeItem(probe)
  } catch {
    return null
  }

  return createSyncStoragePersister({
    storage: window.localStorage,
    key: STORAGE_KEY,
    throttleTime: 1000,
    // A cache that outgrows the quota would throw on every write; dropping it
    // is better than a persistently broken persister.
    retry: ({ persistedClient, error }) => {
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        try {
          window.localStorage.removeItem(STORAGE_KEY)
        } catch {
          /* nothing else to try */
        }
        return undefined
      }
      return persistedClient
    },
  })
}

/** Clears cached responses. Called on sign-out so nothing leaks between accounts. */
export function clearPersistedCache(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* storage unavailable — nothing was persisted anyway */
  }
}
