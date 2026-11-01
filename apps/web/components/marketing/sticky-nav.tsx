'use client'

import { useEffect, useState } from 'react'
import { Link, usePathname } from '@/lib/i18n/navigation'
import { Logo } from '@/components/common/logo'
import { ThemeToggle } from '@/components/marketing/theme-toggle'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about-us', label: 'About Us' },
  { href: '/programs', label: 'Programs' },
  { href: '/parents-resource', label: 'Parents' },
  { href: '/testimonials', label: 'Testimonials' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/contact', label: 'Contact' },
]

export function StickyNav() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 bg-[var(--color-paper)]/95 backdrop-blur-md transition-shadow duration-300',
        scrolled ? 'shadow-[0_1px_0_0_var(--color-rule)]' : '',
      )}
    >
      <div className="max-w-[1240px] mx-auto px-5 lg:px-8 h-[76px] flex items-center justify-between gap-6">
        <Logo href="/" size={34} className="text-[19px]" />

        {/* Desktop nav — centred, Joyloo style */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'rounded-full px-3.5 py-2 text-[15px] font-medium transition-colors',
                  isActive
                    ? 'text-[var(--color-accent)]'
                    : 'text-[var(--color-ink)] hover:text-[var(--color-accent)]',
                )}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Desktop actions */}
        <div className="hidden lg:flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/login"
            className="px-3 py-2 text-[15px] font-medium text-[var(--color-ink)] hover:text-[var(--color-accent)] transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center rounded-full bg-[var(--color-ink)] px-5 py-2.5 text-[15px] font-semibold text-[var(--color-paper)] transition hover:bg-[var(--color-accent)] hover:text-white"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile controls */}
        <div className="flex lg:hidden items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-ink)] text-[var(--color-paper)]"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[var(--color-rule)] bg-[var(--color-paper)] px-6 py-5 shadow-xl">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'rounded-xl px-3 py-2.5 text-[16px] font-medium transition-colors',
                  pathname === link.href
                    ? 'bg-[var(--color-accent-tint)] text-[var(--color-accent)]'
                    : 'text-[var(--color-ink)] hover:bg-[var(--color-paper-2)]',
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-3 grid grid-cols-2 gap-2.5">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-full border border-[var(--color-rule-2)] bg-white px-4 py-3 text-center text-[15px] font-semibold text-[var(--color-ink)]"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-full bg-[var(--color-accent)] px-4 py-3 text-center text-[15px] font-semibold text-white"
              >
                Get Started
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
