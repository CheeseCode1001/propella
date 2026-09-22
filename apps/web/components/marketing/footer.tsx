import { Link } from '@/lib/i18n/navigation'
import { Logo } from '@/components/common/logo'

export function MarketingFooter() {
  return (
    <footer className="border-t border-[var(--color-rule)] bg-[var(--color-paper-2)] text-[var(--color-ink-2)]">
      <div className="max-w-[1240px] mx-auto px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand info */}
          <div className="lg:col-span-2">
            <Logo href="/" />
            <p className="mt-4 text-sm text-[var(--color-ink-3)] max-w-sm leading-relaxed">
              Propella is Nigeria&apos;s leading intelligent study platform for secondary school candidates and university undergraduates. Master your syllabus, simulate official CBT exams, and learn faster with AI.
            </p>
            <p className="mt-4 text-xs font-mono text-[var(--color-ink-3)]">
              © {new Date().getFullYear()} Propella EdTech Ltd. Built for African Scholars.
            </p>
          </div>

          {/* Academic Tracks */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink)] mb-4">
              Academic Tracks
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/highschool" className="hover:text-[var(--color-ink)] transition-colors">
                  JAMB / UTME Prep
                </Link>
              </li>
              <li>
                <Link href="/highschool" className="hover:text-[var(--color-ink)] transition-colors">
                  WAEC & SSCE Mocks
                </Link>
              </li>
              <li>
                <Link href="/highschool" className="hover:text-[var(--color-ink)] transition-colors">
                  NECO Syllabus
                </Link>
              </li>
              <li>
                <Link href="/undergraduate" className="hover:text-[var(--color-ink)] transition-colors">
                  Undergraduate Files (100L–500L)
                </Link>
              </li>
              <li>
                <Link href="/undergraduate" className="hover:text-[var(--color-ink)] transition-colors">
                  AI Course Tutor
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink)] mb-4">
              Platform
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/pricing" className="hover:text-[var(--color-ink)] transition-colors">
                  Subscription Plans
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-[var(--color-ink)] transition-colors">
                  Gift a Subscription
                </Link>
              </li>
              <li>
                <Link href="/testimonials" className="hover:text-[var(--color-ink)] transition-colors">
                  Student Testimonials
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-[var(--color-ink)] transition-colors">
                  Student Login
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-[var(--color-ink)] transition-colors">
                  Referral Program (Earn ₦1,000)
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & Legal */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink)] mb-4">
              Support
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/contact" className="hover:text-[var(--color-ink)] transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <a href="mailto:support@propella.ng" className="hover:text-[var(--color-ink)] transition-colors">
                  support@propella.ng
                </a>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[var(--color-ink)] transition-colors">
                  WhatsApp Student Community
                </Link>
              </li>
              <li>
                <span className="text-xs text-[var(--color-ink-3)] block pt-2">
                  Lagos, Nigeria · Mon–Sat 8am–7pm
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
}
