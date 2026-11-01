import { Link } from '@/lib/i18n/navigation'
import { ArrowRight, Home, Compass } from 'lucide-react'
import {
  DoodleRays,
  DoodleSmile,
  DoodleStar,
  DoodleSun,
  JOY,
  JoyEyebrow,
  JoyHeading,
} from '@/components/marketing/joy'

export const metadata = {
  title: '404 — Page Wandered Off | Propella',
  description: 'The page you are looking for does not exist. Return to Propella study roadmaps or explore our programs.',
}

export default function Custom404Page() {
  return (
    <div className="py-24 px-6 text-center relative overflow-hidden bg-[var(--color-paper)]">
      {/* Decorative floating doodles */}
      <DoodleSmile className="absolute left-[15%] top-[12%] hidden w-16 sm:block animate-joy-float" />
      <DoodleRays className="absolute right-[18%] top-[14%] hidden w-14 sm:block" />
      <DoodleSun className="absolute left-[20%] bottom-[16%] hidden w-20 sm:block" />
      <DoodleStar className="absolute right-[16%] bottom-[18%] hidden w-16 sm:block animate-joy-float" />

      <div className="relative z-10 max-w-lg mx-auto">
        <JoyEyebrow className="mb-6">404 Error</JoyEyebrow>

        {/* Big playful 404 number */}
        <div className="relative mb-6 select-none">
          <span
            className="text-[110px] sm:text-[150px] font-extrabold leading-none tracking-tight text-[#1A1917]/20"
            style={{ fontFamily: 'var(--font-display)', WebkitTextStroke: '2px #1A1917' }}
          >
            404
          </span>
          <span className="absolute inset-0 flex items-center justify-center font-[family-name:var(--font-hand)] text-[38px] text-[var(--color-accent)] rotate-[-6deg]">
            Page Not Found
          </span>
        </div>

        <JoyHeading as="h1" size="h2" className="text-[28px] sm:text-[38px] mb-4">
          Oops! This page wandered off to play.
        </JoyHeading>

        <p className="text-[17px] leading-[26px] text-[var(--color-ink)]/75 mb-10 max-w-md mx-auto">
          Let&apos;s guide you back to something helpful and meaningful for you and your study journey today with care and support.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--color-accent)] px-8 py-3.5 text-[15px] font-semibold text-white shadow-md transition hover:bg-[var(--color-accent-2)]"
          >
            <Home size={16} /> Back to Home
          </Link>
          <Link
            href="/programs"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--color-rule-2)] bg-white px-7 py-3.5 text-[15px] font-semibold text-[var(--color-ink)] hover:border-[var(--color-ink)]"
          >
            <Compass size={16} /> Explore Programs
          </Link>
        </div>
      </div>
    </div>
  )
}

