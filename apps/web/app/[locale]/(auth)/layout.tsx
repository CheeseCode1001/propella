'use client'

import { usePathname } from 'next/navigation'
import { Link } from '@/lib/i18n/navigation'
import { Logo } from '@/components/common/logo'
import { VIDEOS } from '@/components/marketing/joy'
import { JoyVideo } from '@/components/marketing/joy-client'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || ''
  const isSignup = pathname.includes('/signup')
  const isLogin = pathname.includes('/login')

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white dark:bg-[#12110E] text-[var(--color-ink)] selection:bg-[#FFDFC6] selection:text-[#1A1917]">
      {/* ── Left Pane: Video & Brand Showcase (Desktop / Tablet) ── */}
      <div className="relative w-full lg:w-1/2 min-h-[380px] lg:min-h-screen flex flex-col justify-between p-6 sm:p-10 lg:p-14 overflow-hidden bg-[#1A1917]">
        {/* Background Video with subtle dark overlay */}
        <div className="absolute inset-0 z-0">
          <JoyVideo
            src={VIDEOS.hero.src}
            poster={VIDEOS.hero.poster}
            label="Propella students studying together"
            className="h-full w-full object-cover"
          />
          {/* Multi-layer gradient overlay for optimal readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/35 backdrop-blur-[0.5px]" />
        </div>

        {/* Top-Left: Brand Pill matching reference */}
        <div className="relative z-10">
          <Link
            href="/"
            className="inline-flex items-center gap-3 rounded-full bg-white/90 dark:bg-[#1A1917]/90 backdrop-blur-md px-4 py-2 border border-white/20 shadow-md transition hover:scale-[1.02] group"
          >
            <div className="relative shrink-0 overflow-hidden rounded-[8px] w-7 h-7 shadow-sm">
              <img
                src="/logo.png"
                alt="Propella"
                width={28}
                height={28}
                className="h-full w-full object-cover"
              />
            </div>
            <span
              className="text-[17px] font-semibold text-[#1A1917] dark:text-white tracking-tight"
              style={{ fontFamily: "'Parkinsans', sans-serif" }}
            >
              Propella
            </span>
          </Link>
        </div>

        {/* Bottom-Left: Inspiring Tagline & Slider Dots */}
        <div className="relative z-10 max-w-lg mt-12 lg:mt-0">
          <h2
            className="text-white text-[28px] sm:text-[36px] lg:text-[40px] font-bold leading-[1.18] mb-3 tracking-tight drop-shadow-sm"
            style={{ fontFamily: "'Parkinsans', sans-serif" }}
          >
            Master your exams with joy &amp; confidence
          </h2>
          <p className="text-white/80 text-[15px] sm:text-[16.5px] leading-relaxed mb-6 font-normal drop-shadow-sm">
            Personalized syllabus roadmaps, timed CBT mocks, and 24/7 AI tutor guidance built for Nigerian scholars.
          </p>

          {/* Slider indicator dots matching reference image */}
          <div className="flex items-center gap-2">
            <span className="w-8 h-1.5 rounded-full bg-white transition-all duration-300" />
            <span className="w-2 h-1.5 rounded-full bg-white/40" />
            <span className="w-2 h-1.5 rounded-full bg-white/40" />
          </div>
        </div>
      </div>

      {/* ── Right Pane: Clean Shadowless Form & Actions ── */}
      <div className="w-full lg:w-1/2 min-h-screen flex flex-col justify-between bg-white dark:bg-[#14120F] px-6 sm:px-12 lg:px-16 py-8 sm:py-12 overflow-y-auto">
        {/* Top Navigation Row */}
        <div className="flex items-center justify-between w-full mb-8">
          <div className="lg:hidden">
            <Logo size={32} />
          </div>
          <div className="hidden lg:block" />

          {/* Action button at top-right (e.g. "Register" on Login, "Sign in" on Signup) */}
          <div>
            {isLogin ? (
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-full bg-[#1A1917] dark:bg-white text-white dark:text-[#1A1917] hover:bg-[var(--color-accent)] dark:hover:bg-[var(--color-accent)] dark:hover:text-white px-6 py-2 text-[14px] font-semibold transition-all shadow-sm"
              >
                Sign in
              </Link>
            ) : isSignup ? (
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-full bg-[#1A1917] dark:bg-white text-white dark:text-[#1A1917] hover:bg-[var(--color-accent)] dark:hover:bg-[var(--color-accent)] dark:hover:text-white px-6 py-2 text-[14px] font-semibold transition-all shadow-sm"
              >
                Sign in
              </Link>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-full border border-[var(--color-rule-2)] text-[var(--color-ink)] hover:border-[var(--color-ink)] px-5 py-2 text-[14px] font-semibold transition-all"
              >
                Back to Sign in
              </Link>
            )}
          </div>
        </div>

        {/* Center: The Form Container (Flat, Shadowless, Clean) */}
        <div className="w-full max-w-[440px] mx-auto my-auto py-4 sm:py-8">
          {children}
        </div>

        {/* Bottom Footer Note */}
        <div className="w-full text-center pt-8 border-t border-[var(--color-rule)]/40 text-[12.5px] text-[var(--color-ink-3)]">
          © {new Date().getFullYear()} Propella Study. Built with care for African scholars.
        </div>
      </div>
    </div>
  )
}
