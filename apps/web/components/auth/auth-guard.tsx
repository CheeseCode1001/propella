'use client'

import { useEffect } from 'react'
import { useRouter } from '@/lib/i18n/navigation'
import { useAuthStore, useAuthReady } from '@/lib/stores/auth-store'
import { AppShellSkeleton } from '@/components/common/app-shell-skeleton'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const user = useAuthStore((s) => s.user)
  const router = useRouter()

  // Two things have to settle before we can judge: localStorage rehydration and
  // the silent token refresh. Deciding early is what used to send people to
  // /login on every page refresh.
  const ready = useAuthReady()

  useEffect(() => {
    if (!ready) return

    if (!isAuthenticated) {
      router.replace('/login')
      return
    }
    // Email verification comes before anything else, including onboarding.
    if (user && user.emailVerified === false) {
      router.replace('/verify-email')
      return
    }
    if (user && !user.onboardingCompleted) {
      router.replace('/onboarding')
    }
  }, [ready, isAuthenticated, user, router])

  if (!ready || !isAuthenticated) {
    return <AppShellSkeleton />
  }

  return <>{children}</>
}
