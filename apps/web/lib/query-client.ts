import { QueryClient } from '@tanstack/react-query'

/**
 * Anything cached here is written to localStorage so a student on a bad
 * connection — or hitting the app while the server is down — still sees the
 * dashboard, syllabus and notes they loaded last time.
 */
export const CACHE_MAX_AGE = 7 * 24 * 60 * 60 * 1000 // a week

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      // Kept well past staleTime so the data is still there to show while a
      // refetch fails; without this the cache is dropped after 5 minutes.
      gcTime: CACHE_MAX_AGE,
      retry: 2,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
      refetchOnWindowFocus: false,
      // Coming back online is the one moment stale data is worth re-fetching.
      refetchOnReconnect: true,
      networkMode: 'offlineFirst',
    },
    mutations: {
      networkMode: 'offlineFirst',
    },
  },
})
