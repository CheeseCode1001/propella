import { Link } from '@/lib/i18n/navigation'
import { Logo } from '@/components/common/logo'
import { ArrowRight, Mail } from 'lucide-react'
import { JoyEdge, JoyEyebrow, JOY, VIDEOS } from '@/components/marketing/joy'
import { JoyVideo } from '@/components/marketing/joy-client'

const columns = [
  {
    title: 'Quick Links',
    links: [
      { label: 'Home', href: '/' },
      { label: 'About Us', href: '/about-us' },
      { label: 'Academic Programs', href: '/programs' },
      { label: 'Pricing & Plans', href: '/pricing' },
      { label: 'Student Testimonials', href: '/testimonials' },
      { label: 'Contact Us', href: '/contact' },
    ],
  },
  {
    title: 'For Students & Parents',
    links: [
      { label: 'JAMB / UTME Prep', href: '/programs/jamb-utme' },
      { label: 'WAEC & NECO Mocks', href: '/programs/waec-ssce' },
      { label: 'Undergraduate (100L–500L)', href: '/programs/undergraduate' },
      { label: 'Shared Study Plan', href: '/programs/shared-plan' },
      { label: 'Parents Resource', href: '/parents-resource' },
    ],
  },
  {
    title: 'Resources & Legal',
    links: [
      { label: 'Student Login', href: '/login' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
    ],
  },
]

function SocialIcon({ label, d }: { label: string; d: string }) {
  return (
    <a
      href="#"
      aria-label={label}
      className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-ink)] dark:text-black/80 text-[#FFE494] transition hover:bg-[var(--color-accent)] hover:text-white"
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
        <path d={d} />
      </svg>
    </a>
  )
}

/** Joyloo-style warm-yellow footer with an embedded video CTA banner. */
export function MarketingFooter() {
  return (
    <footer className="relative mt-[80px] text-[#1A1917] dark:text-[#1A1917] bg-[#FFE494]">
      <JoyEdge color="#FFE494" variant="b" />

      <div className="max-w-[1240px] mx-auto px-6 lg:px-8 pt-10 lg:pt-14">
        {/* CTA video banner */}
        <JoyVideo
          src={VIDEOS.classroom.src}
          poster={VIDEOS.classroom.poster}
          label="Students taking an exam preparation class"
          className="rounded-[30px] min-h-[380px] sm:min-h-[440px]"
          overlay="linear-gradient(90deg, rgba(26,25,23,0.82) 0%, rgba(26,25,23,0.45) 55%, rgba(26,25,23,0.1) 100%)"
          controlsPosition="top-right"
        >
          <div className="relative z-[1] flex h-full min-h-[380px] sm:min-h-[440px] flex-col justify-end p-7 sm:p-12 lg:p-14">
            <JoyEyebrow tone="dark" className="self-start mb-5">
              Start learning today
            </JoyEyebrow>
            <h2
              className="max-w-[560px] text-white text-[30px] leading-[38px] sm:text-[40px] sm:leading-[50px] font-semibold tracking-[-0.02em]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Start your journey today and see the joy of smart learning in action.
            </h2>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-full bg-[var(--color-accent)] px-7 py-3.5 text-[15px] font-semibold text-white transition hover:bg-[var(--color-accent-2)]"
              >
                Join Propella Free <ArrowRight size={16} />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center rounded-full bg-white px-7 py-3.5 text-[15px] font-semibold transition hover:bg-[#FFE494]"
              >
                See plans from ₦999
              </Link>
            </div>
          </div>
        </JoyVideo>

        {/* Link grid */}
        <div className="grid grid-cols-1 gap-12 py-16 md:grid-cols-2 lg:grid-cols-12">
          <div className="md:col-span-2 lg:col-span-6">
            <Logo href="/" size={36} className="text-[20px] [&_span]:text-[#1A1917]" />
            <p className="mt-5 max-w-[380px] text-[16px] leading-[24px] text-[#1A1917]/75">
              Nigeria&apos;s joyful, syllabus-first study companion for JAMB, WAEC, NECO and
              undergraduate scholars — guided by AI, built for distinction.
            </p>
            <a
              href="mailto:support@propellastudy.com"
              className="mt-5 inline-flex items-center gap-2 text-[15px] font-semibold text-[#1A1917] hover:text-[var(--color-accent)]"
            >
              <Mail size={16} /> support@propellastudy.com
            </a>
            <div className="mt-6 flex gap-2.5">
              <SocialIcon
                label="Facebook"
                d="M14 8h3V4h-3c-2.8 0-4 1.7-4 4.3V10H7v4h3v8h4v-8h3l1-4h-4V8.6c0-.4.3-.6.6-.6Z"
              />
              <SocialIcon
                label="Instagram"
                d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0 8a3 3 0 1 1 0-6 3 3 0 0 1 0 6Zm5.2-9.4a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4ZM12 2c-2.7 0-3 0-4.1.1C4.3 2.2 2.2 4.3 2.1 7.9 2 9 2 9.3 2 12s0 3 .1 4.1c.1 3.6 2.2 5.7 5.8 5.8 1.1.1 1.4.1 4.1.1s3 0 4.1-.1c3.6-.1 5.7-2.2 5.8-5.8.1-1.1.1-1.4.1-4.1s0-3-.1-4.1c-.1-3.6-2.2-5.7-5.8-5.8C15 2 14.7 2 12 2Z"
              />
              <SocialIcon
                label="X"
                d="M17.8 3h3.1l-6.8 7.7L22 21h-6.2l-4.9-6.4L5.3 21H2.2l7.2-8.3L2 3h6.4l4.4 5.8Zm-1.1 16.2h1.7L7.4 4.7H5.5Z"
              />
              <SocialIcon
                label="TikTok"
                d="M16.6 5.8A4.3 4.3 0 0 1 15.5 3h-3.1v12.4a2.6 2.6 0 1 1-2.6-2.6c.3 0 .5 0 .8.1V9.7a5.7 5.7 0 1 0 4.9 5.7V9.1a7.3 7.3 0 0 0 4.3 1.4V7.4a4.3 4.3 0 0 1-3.2-1.6Z"
              />
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title} className="lg:col-span-2">
              <h4
                className="mb-5 text-[18px] font-semibold text-[#1A1917]"
                style={{ fontFamily: "'Parkinsans', sans-serif", fontWeight: 600 }}
              >
                {col.title}
              </h4>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-[15px] text-[#1A1917]/75 transition-colors hover:text-[var(--color-accent)]"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-[#1A1917]/15 dark:border-white/15 py-7 text-[14px] text-[#1A1917]/70  sm:flex-row">
          <p>© {new Date().getFullYear()} Propella EdTech Ltd. Built for African scholars.</p>
          <p>Lagos, Nigeria · Mon–Sat 8am–7pm</p>
        </div>

        {/* ── Propella infinite scrolling ticker at bottom of footer ── */}
        <div className="overflow-hidden border-t border-[#1A1917]/15  py-8 -mx-6 lg:-mx-8">
          <div className="flex w-max animate-joy-marquee select-none items-center gap-12 whitespace-nowrap">
            {Array.from({ length: 10 }, (_, i) => (
              <div key={i} className="flex items-center gap-10 shrink-0">
                <span
                  className="text-[64px] sm:text-[88px] lg:text-[110px] font-extrabold uppercase tracking-tight text-[#1A1917]/20 hover:text-[var(--color-accent)] transition-colors duration-300"
                  style={{ fontFamily: "'Parkinsans', sans-serif", fontWeight: 800 }}
                >
                  Propella
                </span>
                <span className="inline-flex h-8 w-8 sm:h-12 sm:w-12 rounded-full bg-[var(--color-accent)] items-center justify-center text-white font-bold text-xs sm:text-base shadow-sm">
                  ★
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
