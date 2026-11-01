'use client'

import { useEffect, useState } from 'react'
import { Link, usePathname } from '@/lib/i18n/navigation'
import { Logo } from '@/components/common/logo'
import { ThemeToggle } from '@/components/marketing/theme-toggle'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export function StickyNav() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="fixed top-0 left-0 right-0 z-50 px-3 sm:px-6 pt-3 sm:pt-4 pointer-events-none transition-all duration-300">
      <header
        className={cn(
          'pointer-events-auto max-w-[1200px] mx-auto rounded-full bg-white/95 dark:bg-[#1A1813]/95 backdrop-blur-md border border-[var(--color-rule)] dark:border-[#2D2A23] px-6 sm:px-8 py-3 sm:py-3.5 flex items-center justify-between gap-4 transition-all duration-300',
          scrolled
            ? 'shadow-[0_10px_35px_rgba(26,25,23,0.12)] border-[var(--color-ink)]/15 scale-[0.99]'
            : 'shadow-[0_4px_22px_rgba(26,25,23,0.06)]',
        )}
      >
        {/* Logo */}
        <Logo href="/" size={34} className="text-[22px] shrink-0" />

        {/* Desktop nav links matching Joyloo floating pill */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          <Link
            href="/"
            className={cn(
              'rounded-full px-3.5 py-1.5 text-[18px] font-medium transition-colors',
              pathname === '/'
                ? 'text-[var(--color-accent)] font-semibold'
                : 'text-[var(--color-ink)] hover:text-[var(--color-accent)]',
            )}
          >
            Home
          </Link>

          <Link
            href="/about-us"
            className={cn(
              'rounded-full px-3.5 py-1.5 text-[18px] font-medium transition-colors',
              pathname === '/about-us'
                ? 'text-[var(--color-accent)] font-semibold'
                : 'text-[var(--color-ink)] hover:text-[var(--color-accent)]',
            )}
          >
            About Us
          </Link>

          <Link
            href="/programs"
            className={cn(
              'rounded-full px-3.5 py-1.5 text-[18px] font-medium transition-colors',
              pathname === '/programs'
                ? 'text-[var(--color-accent)] font-semibold'
                : 'text-[var(--color-ink)] hover:text-[var(--color-accent)]',
            )}
          >
            Programs
          </Link>

          {/* Parents: Single direct link, no dropdown */}
          <Link
            href="/parents-resource"
            className={cn(
              'rounded-full px-3.5 py-1.5 text-[18px] font-medium transition-colors',
              pathname.startsWith('/parents')
                ? 'text-[var(--color-accent)] font-semibold'
                : 'text-[var(--color-ink)] hover:text-[var(--color-accent)]',
            )}
          >
            Parents
          </Link>

          <Link
            href="/testimonials"
            className={cn(
              'rounded-full px-3.5 py-1.5 text-[18px] font-medium transition-colors',
              pathname === '/testimonials'
                ? 'text-[var(--color-accent)] font-semibold'
                : 'text-[var(--color-ink)] hover:text-[var(--color-accent)]',
            )}
          >
            Testimonials
          </Link>

          <Link
            href="/pricing"
            className={cn(
              'rounded-full px-3.5 py-1.5 text-[18px] font-medium transition-colors',
              pathname === '/pricing'
                ? 'text-[var(--color-accent)] font-semibold'
                : 'text-[var(--color-ink)] hover:text-[var(--color-accent)]',
            )}
          >
            Pricing
          </Link>
        </nav>

        {/* Right CTA / Contact Us (Matching image) */}
        <div className="hidden lg:flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/login"
            className="px-3.5 py-1.5 text-[18px] font-medium text-[var(--color-ink)] hover:text-[var(--color-accent)] transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center rounded-full bg-[#1A1917] hover:bg-[var(--color-accent)] dark:bg-white dark:text-[#1A1917] dark:hover:bg-[var(--color-accent)] dark:hover:text-white px-6 py-2.5 text-[18px] font-semibold text-white transition-all duration-200 shadow-sm hover:scale-[1.02] active:scale-[0.98]"
          >
            Contact Us
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="flex lg:hidden items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1A1917] text-white dark:bg-white dark:text-[#1A1917] shadow-sm transition hover:scale-105"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="pointer-events-auto mt-2 max-w-[1200px] mx-auto rounded-3xl border border-[var(--color-rule)] dark:border-[#2D2A23] bg-white/98 dark:bg-[#1A1813]/98 backdrop-blur-md p-6 shadow-2xl lg:hidden">
          <nav className="flex flex-col gap-1.5">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                'rounded-xl px-4 py-2.5 text-[15px] font-medium transition-colors',
                pathname === '/'
                  ? 'bg-[var(--color-accent-tint)] text-[var(--color-accent)] font-semibold'
                  : 'text-[var(--color-ink)] hover:bg-[var(--color-paper-2)]',
              )}
            >
              Home
            </Link>
            <Link
              href="/about-us"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-xl px-4 py-2.5 text-[15px] font-medium text-[var(--color-ink)] hover:bg-[var(--color-paper-2)]"
            >
              About Us
            </Link>
            <Link
              href="/programs"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-xl px-4 py-2.5 text-[15px] font-medium text-[var(--color-ink)] hover:bg-[var(--color-paper-2)]"
            >
              Programs
            </Link>
            <Link
              href="/parents-resource"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-xl px-4 py-2.5 text-[15px] font-medium text-[var(--color-ink)] hover:bg-[var(--color-paper-2)]"
            >
              Parents Resource
            </Link>
            <Link
              href="/testimonials"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-xl px-4 py-2.5 text-[15px] font-medium text-[var(--color-ink)] hover:bg-[var(--color-paper-2)]"
            >
              Testimonials
            </Link>
            <Link
              href="/pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-xl px-4 py-2.5 text-[15px] font-medium text-[var(--color-ink)] hover:bg-[var(--color-paper-2)]"
            >
              Pricing (From ₦999)
            </Link>
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-xl px-4 py-2.5 text-[15px] font-semibold text-[var(--color-accent)] hover:bg-[var(--color-paper-2)]"
            >
              Contact Us &amp; FAQ
            </Link>

            <div className="mt-4 pt-4 border-t border-[var(--color-rule)] dark:border-[#2D2A23] grid grid-cols-2 gap-3">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-full border border-[var(--color-rule-2)] bg-[var(--color-paper)] py-2.5 text-center text-[14px] font-semibold text-[var(--color-ink)]"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-full bg-[var(--color-accent)] py-2.5 text-center text-[14px] font-semibold text-white shadow-sm"
              >
                Get Started
              </Link>
            </div>
          </nav>
        </div>
      )}
    </div>
  )
}
