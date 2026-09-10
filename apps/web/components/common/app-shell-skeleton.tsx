'use client'

import { Skeleton } from '@/components/ui/skeleton'

/**
 * Shown while the app works out who is signed in.
 *
 * It mirrors the real shell (sidebar + top bar + content) so the page does not
 * visibly jump once the session resolves.
 */
export function AppShellSkeleton() {
  return (
    <div className="flex min-h-screen bg-[var(--color-paper)]">
      {/* Sidebar */}
      <aside
        className="hidden md:flex flex-col shrink-0 border-r border-[var(--color-rule)] bg-[var(--color-paper-2)]"
        style={{ width: 220 }}
      >
        <div className="border-b border-[var(--color-rule)] px-6 py-5">
          <Skeleton className="h-5 w-24" />
        </div>
        <div className="flex flex-col gap-1 p-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full rounded-[var(--radius-sm)]" />
          ))}
        </div>
        <div className="mt-auto border-t border-[var(--color-rule)] p-4">
          <Skeleton className="h-10 w-full rounded-[var(--radius-md)]" />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <div
          className="hidden md:flex items-center justify-between border-b border-[var(--color-rule)] px-8"
          style={{ height: 65 }}
        >
          <Skeleton className="h-5 w-40" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-5 w-12" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-7 w-7 rounded-full" />
          </div>
        </div>

        {/* Content */}
        <main className="w-full p-4 lg:p-7">
          <Skeleton className="mb-2 h-8 w-56" />
          <Skeleton className="mb-6 h-4 w-72" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-[var(--radius-md)]" />
            ))}
          </div>
          <Skeleton className="mt-6 h-56 w-full rounded-[var(--radius-md)]" />
        </main>
      </div>
    </div>
  )
}
