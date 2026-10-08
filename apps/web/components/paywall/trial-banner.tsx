'use client'

import { useQuery } from '@tanstack/react-query'
import { Crown1, MagicStar, Lock1, ArrowRight } from 'iconsax-reactjs'
import { api } from '@/lib/api-client'
import { useAuthStore } from '@/lib/stores/auth-store'
import { usePaywallStore } from '@/lib/stores/paywall-store'
import type { EntitlementStatusDto } from '@propella/shared'

export function TrialBanner() {
  const user = useAuthStore((s) => s.user)
  const openPaywall = usePaywallStore((s) => s.openPaywall)

  const { data: entitlements } = useQuery({
    queryKey: ['entitlements-status'],
    queryFn: () =>
      api
        .get<{ data: EntitlementStatusDto }>('/entitlements/status')
        .then((r) => r.data),
    enabled: Boolean(user && user.plan === 'free'),
    staleTime: 1000 * 30, // 30 seconds
  })

  // Only free accounts see the trial banner
  if (!user || user.plan !== 'free') return null

  const isLocked = entitlements?.isPaywallLocked ?? false
  const remainingTopics = entitlements?.remaining?.topics ?? 1
  const remainingAi = entitlements?.remaining?.aiQuestions ?? 3

  if (isLocked) {
    return (
      <div className="w-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-white px-4 py-2.5 shadow-md flex items-center justify-between gap-3 text-xs sm:text-sm font-medium z-40 relative">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="p-1 rounded-lg bg-black/20 shrink-0">
            <Lock1 size={16} variant="Bold" />
          </span>
          <span className="truncate">
            <strong className="font-bold">Free Trial Sample Concluded:</strong> You have tried the platform. Subscribe to continue with unlimited access to all subjects, AI explanations & past questions.
          </span>
        </div>

        <button
          onClick={() => openPaywall('trial_locked', 'Your free sample has concluded. Subscribe to Scholar to continue studying.')}
          className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white text-amber-700 font-bold hover:bg-amber-50 transition-colors shadow-sm"
        >
          <Crown1 size={14} variant="Bold" />
          Upgrade Now
          <ArrowRight size={12} />
        </button>
      </div>
    )
  }

  return (
    <div className="w-full bg-[var(--color-paper-2)] border-b border-[var(--color-outline)] px-4 py-2 text-xs sm:text-sm flex items-center justify-between gap-3 text-[var(--color-ink)] z-40 relative">
      <div className="flex items-center gap-2 overflow-hidden">
        <span className="p-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
          <MagicStar size={16} variant="Bold" />
        </span>
        <span className="truncate text-[var(--color-ink-muted)]">
          <strong className="text-[var(--color-ink)] font-semibold">Free Trial Sample:</strong>{' '}
          {remainingTopics} {remainingTopics === 1 ? 'Topic' : 'Topics'} &bull;{' '}
          {remainingAi} AI {remainingAi === 1 ? 'Question' : 'Questions'} remaining
        </span>
      </div>

      <button
        onClick={() => openPaywall('trial_sample')}
        className="shrink-0 flex items-center gap-1 px-3 py-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 font-bold transition-colors"
      >
        <Crown1 size={14} variant="Bold" />
        <span>Unlock Unlimited</span>
      </button>
    </div>
  )
}
