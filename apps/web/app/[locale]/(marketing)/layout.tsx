import { StickyNav } from '@/components/marketing/sticky-nav'
import { MarketingFooter } from '@/components/marketing/footer'

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-paper)]">
      <StickyNav />
      <main className="pt-16 flex-1">{children}</main>
      <MarketingFooter />
    </div>
  )
}
