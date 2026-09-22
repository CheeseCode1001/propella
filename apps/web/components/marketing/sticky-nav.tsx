'use client'

import { useEffect, useState } from 'react'
import { Link, usePathname } from '@/lib/i18n/navigation'
import { useTheme } from 'next-themes'
import { Logo } from '@/components/common/logo'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/marketing/theme-toggle'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export function StickyNav() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { resolvedTheme } = useTheme()
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const glassBg =
    resolvedTheme === 'dark' ? 'rgba(20,19,15,0.88)' : 'rgba(251,249,244,0.85)'

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/highschool', label: 'Highschool' },
    { href: '/undergraduate', label: 'Undergraduate' },
    { href: '/testimonials', label: 'Testimonials' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/contact', label: 'Contact' },
  ]

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled ? 'border-b border-[var(--color-rule)] shadow-sm' : '',
      )}
      style={
        scrolled
          ? {
              backdropFilter: 'blur(16px) saturate(130%)',
              backgroundColor: glassBg,
            }
          : {
              backgroundColor: 'transparent',
            }
      }
    >
      <div className="max-w-[1240px] mx-auto px-5 lg:px-8 h-16 flex items-center justify-between">
        <Logo href="/" />

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'text-[13.5px] font-medium transition-colors',
                  isActive
                    ? 'text-[var(--color-accent)] font-semibold'
                    : 'text-[var(--color-ink-2)] hover:text-[var(--color-ink)]',
                )}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Desktop Action Right */}
        <div className="hidden lg:flex items-center gap-3">
          <ThemeToggle />
          <div className="h-4 w-px bg-[var(--color-rule)] mx-1" />
          <Link
            href="/login"
            className="text-[13.5px] font-medium text-[var(--color-ink-2)] hover:text-[var(--color-ink)] px-2 transition-colors"
          >
            Sign in
          </Link>
          <Button size="sm" variant="accent" asChild>
            <Link href="/signup">Get started</Link>
          </Button>
        </div>

        {/* Mobile controls */}
        <div className="flex lg:hidden items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label="Toggle navigation menu"
            className="p-2 rounded-lg border border-[var(--color-rule)] bg-[var(--color-paper-2)] text-[var(--color-ink)]"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden border-b border-[var(--color-rule)] bg-[var(--color-paper-2)] px-6 py-5 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200"
          style={{ backdropFilter: 'blur(16px)' }}
        >
          <nav className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'text-[15px] py-1.5 font-medium transition-colors',
                  pathname === link.href
                    ? 'text-[var(--color-accent)] font-semibold'
                    : 'text-[var(--color-ink-2)] hover:text-[var(--color-ink)]',
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="h-px bg-[var(--color-rule)] my-2" />
            <div className="flex flex-col gap-2.5 pt-1">
              <Button variant="secondary" className="w-full justify-center" asChild>
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  Sign in
                </Link>
              </Button>
              <Button variant="accent" className="w-full justify-center" asChild>
                <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                  Get started free
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
