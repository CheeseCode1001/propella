'use client'
import { usePathname } from 'next/navigation'
import { AuthGuard } from '@/components/auth/auth-guard'
import { Sidebar } from '@/components/shell/sidebar'
import { TopBar } from '@/components/shell/top-bar'
import { MobileTopBar } from '@/components/shell/mobile-top-bar'
import { MobileNav } from '@/components/shell/mobile-nav'
import { OfflineBanner } from '@/components/common/offline-banner'
import { TrialBanner } from '@/components/paywall/trial-banner'
import { PaywallModal } from '@/components/paywall/paywall-modal'
import { cn } from '@/lib/utils/cn'

const FULL_BLEED_ROUTES = ['/assistant']

function isFullBleed(pathname: string): boolean {
  return FULL_BLEED_ROUTES.some(
    (route) => pathname === route || pathname.endsWith(route) || pathname.includes(route + '/'),
  )
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const fullBleed = isFullBleed(pathname)

  return (
    <AuthGuard>
      <div
        className={cn(
          'flex bg-[var(--color-paper)]',
          fullBleed ? 'h-[100dvh] overflow-hidden' : 'min-h-[100dvh]',
        )}
      >
        {/* Desktop sidebar */}
        <Sidebar />

        {/* Main content area */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Tells the student when they are running on saved data */}
          <OfflineBanner />
          {/* Persistent Free Plan trial status and paywall notification */}
          <TrialBanner />
          {/* Desktop top bar — hidden on mobile */}
          <TopBar />
          {/* Mobile top bar — hidden on desktop */}
          <MobileTopBar />

          <main
            className={cn(
              'w-full min-w-0 bg-[var(--color-paper)]',
              fullBleed
                ? 'flex min-h-0 flex-1 flex-col pb-[calc(64px+env(safe-area-inset-bottom))] md:pb-0'
                : 'flex-1 p-4 lg:p-7 pb-[calc(64px+env(safe-area-inset-bottom))] md:pb-8',
            )}
          >
            {children}
          </main>
        </div>

        {/* Mobile bottom nav */}
        <MobileNav />

        {/* Global Paywall & Upgrade modal */}
        <PaywallModal />
      </div>
    </AuthGuard>
  )
}
