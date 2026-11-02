import Link from 'next/link'
import { Home, Compass, ArrowRight } from 'lucide-react'
import {
  DoodleRays,
  DoodleSmile,
  DoodleStar,
  DoodleSun,
  JoyEyebrow,
  JoyHeading,
} from '@/components/marketing/joy'

/**
 * Root Not Found page (Prerendered at `/_not-found`).
 *
 * NOTE: This page lives at the root outside of the `[locale]` segment and
 * outside `NextIntlClientProvider`. Therefore, it must use standard Next.js
 * `import Link from 'next/link'` and must NOT import components that call
 * `usePathname()` or other `next-intl` hooks.
 */
export default function RootNotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-paper)] text-[var(--color-ink)] selection:bg-[#FFDFC6] selection:text-[#1A1917]">
      {/* Floating Pill Header matching Joyloo navigation */}
      <div className="fixed top-0 left-0 right-0 z-50 px-3 sm:px-6 pt-3 sm:pt-4 pointer-events-none">
        <header className="pointer-events-auto max-w-[1200px] mx-auto rounded-full bg-white/95 dark:bg-[#1A1813]/95 backdrop-blur-md border border-[var(--color-rule)] dark:border-[#2D2A23] px-6 sm:px-8 py-3 sm:py-3.5 flex items-center justify-between gap-4 shadow-[0_4px_22px_rgba(26,25,23,0.06)]">
          <Link href="/en" className="flex items-center gap-2.5 group">
            <div className="relative shrink-0 overflow-hidden rounded-[10px] w-8 h-8 shadow-sm transition-transform duration-200 group-hover:scale-105">
              <img
                src="/logo.png"
                alt="Propella"
                width={32}
                height={32}
                className="h-full w-full object-cover"
              />
            </div>
            <span
              className="font-semibold text-[20px] text-[var(--color-ink)]"
              style={{ fontFamily: "'Parkinsans', sans-serif" }}
            >
              Propella
            </span>
          </Link>

          <nav className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/en"
              className="rounded-full px-3.5 py-1.5 text-[15px] sm:text-[17px] font-medium text-[var(--color-ink)] hover:text-[var(--color-accent)] transition-colors"
            >
              Home
            </Link>
            <Link
              href="/en/programs"
              className="rounded-full px-3.5 py-1.5 text-[15px] sm:text-[17px] font-medium text-[var(--color-ink)] hover:text-[var(--color-accent)] transition-colors hidden sm:inline-block"
            >
              Programs
            </Link>
            <Link
              href="/en/contact"
              className="rounded-full bg-[var(--color-accent)] px-5 sm:px-6 py-2 sm:py-2.5 text-[14px] sm:text-[15px] font-semibold text-white shadow-sm hover:bg-[var(--color-accent-2)] transition"
            >
              Contact Us
            </Link>
          </nav>
        </header>
      </div>

      {/* Main 404 Stage */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-32 sm:py-40 text-center relative overflow-hidden">
        {/* Decorative floating doodles */}
        <DoodleSmile className="absolute left-[12%] top-[14%] hidden w-16 sm:block animate-joy-float" />
        <DoodleRays className="absolute right-[14%] top-[16%] hidden w-14 sm:block" />
        <DoodleSun className="absolute left-[15%] bottom-[16%] hidden w-20 sm:block" />
        <DoodleStar className="absolute right-[14%] bottom-[18%] hidden w-16 sm:block animate-joy-float" />

        <div className="relative z-10 max-w-lg mx-auto">
          <JoyEyebrow className="mb-6">404 Error</JoyEyebrow>

          {/* Big playful 404 number matching Joyloo 404 */}
          <div className="relative mb-6 select-none">
            <span
              className="text-[110px] sm:text-[150px] font-extrabold leading-none tracking-tight text-[#1A1917]/20 dark:text-white/20"
              style={{ fontFamily: "'Parkinsans', sans-serif", fontWeight: 800 }}
            >
              404
            </span>
            <span
              className="absolute inset-0 flex items-center justify-center text-[34px] sm:text-[40px] text-[var(--color-accent)] rotate-[-6deg]"
              style={{ fontFamily: "'Caveat Brush', cursive" }}
            >
              Page Not Found
            </span>
          </div>

          <JoyHeading as="h1" size="h2" className="text-[28px] sm:text-[38px] mb-4">
            Oops! This page wandered off to play.
          </JoyHeading>

          <p className="text-[17px] leading-[26px] text-[var(--color-ink)]/75 dark:text-[var(--color-ink)]/75 mb-10 max-w-md mx-auto">
            Let&apos;s guide you back to something helpful and meaningful for you and your study journey today with care and support.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/en"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--color-accent)] px-8 py-3.5 text-[15px] font-semibold text-white shadow-md transition hover:bg-[var(--color-accent-2)] joy-btn-hover"
            >
              <Home size={16} /> Back to Home
            </Link>
            <Link
              href="/en/programs"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--color-rule-2)] dark:border-[#3A362D] bg-white dark:bg-[#1A1813] px-7 py-3.5 text-[15px] font-semibold text-[var(--color-ink)] hover:border-[var(--color-ink)] joy-btn-hover"
            >
              <Compass size={16} /> Explore Programs
            </Link>
          </div>
        </div>
      </main>

      {/* Self-contained clean Joyloo footer */}
      <footer className="border-t border-[var(--color-rule)] dark:border-[#2D2A23] bg-white dark:bg-[#16140F] py-8 px-6 text-center text-sm text-[var(--color-ink)]/60">
        <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Propella Study. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/en/privacy" className="hover:text-[var(--color-accent)] transition">
              Privacy Policy
            </Link>
            <Link href="/en/terms" className="hover:text-[var(--color-accent)] transition">
              Terms of Service
            </Link>
            <Link href="/en/contact" className="hover:text-[var(--color-accent)] transition">
              Contact Support
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
