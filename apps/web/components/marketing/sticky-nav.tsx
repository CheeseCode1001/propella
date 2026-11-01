'use client'

import { useEffect, useState, useRef } from 'react'
import { Link, usePathname } from '@/lib/i18n/navigation'
import { Logo } from '@/components/common/logo'
import { ThemeToggle } from '@/components/marketing/theme-toggle'
import { ChevronDown, Menu, X, ArrowRight, ShieldCheck, Heart, Users, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface DropdownItem {
  href: string
  label: string
  description?: string
  icon?: React.ElementType
}

const parentsDropdown: DropdownItem[] = [
  {
    href: '/parents-resource',
    label: 'Parents Resource',
    description: 'Daily progress updates, mock alerts & peace of mind.',
    icon: Users,
  },
  {
    href: '/parents-resource#safety',
    label: 'Safety & Focus',
    description: 'Syllabus-bounded AI and closed learning environment.',
    icon: ShieldCheck,
  },
]

const pagesDropdown: DropdownItem[] = [
  {
    href: '/programs/jamb-utme',
    label: 'JAMB UTME Track',
    description: 'Target 300+ with 8-key CBT simulation.',
    icon: BookOpen,
  },
  {
    href: '/programs/waec-ssce',
    label: 'WAEC / NECO Track',
    description: 'Distinction marking scheme solutions.',
    icon: BookOpen,
  },
  {
    href: '/programs/undergraduate',
    label: 'Undergraduate Vault',
    description: 'Course files & Document AI summaries.',
    icon: BookOpen,
  },
  {
    href: '/privacy',
    label: 'Privacy Policy',
    description: 'NDPA/NDPR compliant family data protection.',
  },
  {
    href: '/terms',
    label: 'Terms of Service',
    description: '3-day welcome discount & renewal policies.',
  },
]

export function StickyNav() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<'parents' | 'pages' | null>(null)
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function handleMouseEnter(menu: 'parents' | 'pages') {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current)
    setOpenDropdown(menu)
  }

  function handleMouseLeave() {
    dropdownTimeoutRef.current = setTimeout(() => {
      setOpenDropdown(null)
    }, 150)
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 px-3 sm:px-6 pt-3 sm:pt-4 pointer-events-none transition-all duration-300">
      <header
        className={cn(
          'pointer-events-auto max-w-[1180px] mx-auto rounded-full bg-white/95 dark:bg-[#1A1813]/95 backdrop-blur-md border border-[var(--color-rule)] px-4 sm:px-6 py-2 flex items-center justify-between gap-4 transition-all duration-300',
          scrolled
            ? 'shadow-[0_8px_30px_rgba(26,25,23,0.1)] border-[var(--color-ink)]/15 scale-[0.99]'
            : 'shadow-[0_4px_20px_rgba(26,25,23,0.06)]',
        )}
      >
        {/* Logo */}
        <Logo href="/" size={34} className="text-[19px] shrink-0" />

        {/* Desktop nav links matching Joyloo floating pill */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          <Link
            href="/"
            className={cn(
              'rounded-full px-3.5 py-1.5 text-[14.5px] font-medium transition-colors',
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
              'rounded-full px-3.5 py-1.5 text-[14.5px] font-medium transition-colors',
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
              'rounded-full px-3.5 py-1.5 text-[14.5px] font-medium transition-colors',
              pathname === '/programs'
                ? 'text-[var(--color-accent)] font-semibold'
                : 'text-[var(--color-ink)] hover:text-[var(--color-accent)]',
            )}
          >
            Programs
          </Link>

          {/* Parents Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => handleMouseEnter('parents')}
            onMouseLeave={handleMouseLeave}
          >
            <button
              type="button"
              onClick={() => setOpenDropdown(openDropdown === 'parents' ? null : 'parents')}
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-3.5 py-1.5 text-[14.5px] font-medium transition-colors',
                pathname.startsWith('/parents')
                  ? 'text-[var(--color-accent)] font-semibold'
                  : 'text-[var(--color-ink)] hover:text-[var(--color-accent)]',
              )}
            >
              Parents <ChevronDown size={14} className={cn('transition-transform duration-200', openDropdown === 'parents' && 'rotate-180')} />
            </button>

            {openDropdown === 'parents' && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-[280px]">
                <div className="rounded-2xl border border-[var(--color-rule)] bg-white dark:bg-[#1A1813] p-2.5 shadow-xl space-y-1">
                  {parentsDropdown.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpenDropdown(null)}
                      className="flex flex-col rounded-xl p-2.5 transition-colors hover:bg-[var(--color-paper-2)]"
                    >
                      <span className="text-[14px] font-semibold text-[var(--color-ink)]" style={{ fontFamily: 'var(--font-display)' }}>
                        {item.label}
                      </span>
                      {item.description && (
                        <span className="text-[12px] text-[var(--color-ink-3)] mt-0.5 leading-snug">
                          {item.description}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Link
            href="/testimonials"
            className={cn(
              'rounded-full px-3.5 py-1.5 text-[14.5px] font-medium transition-colors',
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
              'rounded-full px-3.5 py-1.5 text-[14.5px] font-medium transition-colors',
              pathname === '/pricing'
                ? 'text-[var(--color-accent)] font-semibold'
                : 'text-[var(--color-ink)] hover:text-[var(--color-accent)]',
            )}
          >
            Pricing
          </Link>

          {/* Pages Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => handleMouseEnter('pages')}
            onMouseLeave={handleMouseLeave}
          >
            <button
              type="button"
              onClick={() => setOpenDropdown(openDropdown === 'pages' ? null : 'pages')}
              className="inline-flex items-center gap-1 rounded-full px-3.5 py-1.5 text-[14.5px] font-medium text-[var(--color-ink)] hover:text-[var(--color-accent)] transition-colors"
            >
              Pages <ChevronDown size={14} className={cn('transition-transform duration-200', openDropdown === 'pages' && 'rotate-180')} />
            </button>

            {openDropdown === 'pages' && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-[300px]">
                <div className="rounded-2xl border border-[var(--color-rule)] bg-white dark:bg-[#1A1813] p-2.5 shadow-xl space-y-1">
                  {pagesDropdown.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpenDropdown(null)}
                      className="flex flex-col rounded-xl p-2.5 transition-colors hover:bg-[var(--color-paper-2)]"
                    >
                      <span className="text-[14px] font-semibold text-[var(--color-ink)]" style={{ fontFamily: 'var(--font-display)' }}>
                        {item.label}
                      </span>
                      {item.description && (
                        <span className="text-[12px] text-[var(--color-ink-3)] mt-0.5 leading-snug">
                          {item.description}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Right CTA / Contact Us (Matching image) */}
        <div className="hidden lg:flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/login"
            className="px-3 py-1.5 text-[14.5px] font-medium text-[var(--color-ink)] hover:text-[var(--color-accent)] transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center rounded-full bg-[#1A1917] hover:bg-[var(--color-accent)] px-5 py-2.5 text-[14px] font-semibold text-white transition-all duration-200 shadow-sm hover:scale-[1.02] active:scale-[0.98]"
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
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1A1917] text-white"
          >
            {mobileMenuOpen ? <X size={17} /> : <Menu size={17} />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="pointer-events-auto mt-2 max-w-[1180px] mx-auto rounded-3xl border border-[var(--color-rule)] bg-white/98 dark:bg-[#1A1813]/98 backdrop-blur-md p-6 shadow-2xl lg:hidden">
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

            <div className="mt-4 pt-4 border-t border-[var(--color-rule)] grid grid-cols-2 gap-3">
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
                className="rounded-full bg-[var(--color-accent)] py-2.5 text-center text-[14px] font-semibold text-white"
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
