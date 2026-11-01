import type { Metadata } from 'next'
import { Link } from '@/lib/i18n/navigation'
import { CheckCircle2, ShieldAlert, Sparkles, BookOpen } from 'lucide-react'
import {
  DoodleRays,
  DoodleSmile,
  DoodleSun,
  JOY,
  JoyEdge,
  JoyEyebrow,
  JoyHeading,
} from '@/components/marketing/joy'

export const metadata: Metadata = {
  title: 'Guidelines for Scholars & Parents — Terms of Service | Propella',
  description:
    'Review the terms of service, subscription policies, welcome discount rules, and academic guidelines for Propella users.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[var(--color-paper)] text-[var(--color-ink)]">
      {/* ── Banner ─────────────────────────────────────────────────────────── */}
      <section className="relative pt-12 lg:pt-20 pb-16">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-8 text-center relative">
          <DoodleSmile className="absolute left-[10%] -top-4 hidden w-16 md:block animate-joy-float" />
          <DoodleRays className="absolute right-[12%] -top-2 hidden w-14 md:block" />
          <div className="mx-auto max-w-[760px]">
            <JoyEyebrow className="mb-5">Guidelines &amp; Terms</JoyEyebrow>
            <JoyHeading as="h1" size="h1" className="text-[var(--color-ink)]">
              Guidelines for families and children
            </JoyHeading>
            <p className="mx-auto mt-6 max-w-[620px] text-[18px] leading-[28px] text-[var(--color-ink)]/75">
              These guidelines protect the integrity of our learning community and clarify subscription rules,
              the 3-day welcome discount, and shared account terms.
            </p>
          </div>
        </div>
      </section>

      {/* ── Terms Cards ───────────────────────────────────────────────────── */}
      <section className="pb-32">
        <div className="max-w-[960px] mx-auto px-6 lg:px-8 space-y-10">
          {/* 1. Acceptance */}
          <div className="rounded-[28px] border border-[var(--color-rule)] bg-white p-8 sm:p-12 shadow-sm">
            <h2 className="text-[26px] font-semibold text-[var(--color-ink)] mb-4" style={{ fontFamily: 'var(--font-display)' }}>
              1. Acceptance of Terms
            </h2>
            <p className="text-[16.5px] leading-[27px] text-[var(--color-ink)]/80">
              By accessing or creating an account on Propella (via web or mobile app), you agree to comply with and be bound
              by these Terms of Service. If you are under the age of 18, you confirm that your parent, guardian, or school
              sponsor has reviewed and consented to these terms on your behalf.
            </p>
          </div>

          {/* 2. Welcome Discount & Subscriptions */}
          <div className="rounded-[28px] border border-[var(--color-rule)] bg-white p-8 sm:p-12 shadow-sm">
            <h2 className="text-[26px] font-semibold text-[var(--color-ink)] mb-4" style={{ fontFamily: 'var(--font-display)' }}>
              2. Subscriptions, 3-Day Welcome Discount &amp; Renewal
            </h2>
            <p className="text-[16.5px] leading-[27px] text-[var(--color-ink)]/80 mb-4">
              To lower entry barriers, Propella offers a 50% discount on all paid plans during a 3-day (72-hour) promotional window
              from the time of user registration (Basic Plan from ₦999/month; Shared Plan from ₦1,499/month; Full Pass from ₦4,999).
            </p>
            <ul className="space-y-3 text-[16px] text-[var(--color-ink)]/80">
              <li className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-[var(--color-accent)] shrink-0 mt-1" />
                <span><strong>Automatic Monthly Renewal:</strong> Subscriptions renew automatically at the standard price after the first discounted billing cycle to prevent promotional abuse.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-[var(--color-accent)] shrink-0 mt-1" />
                <span><strong>Cancellation Policy:</strong> You may cancel auto-renewal at any time from your Billing Settings prior to your next renewal date. You retain full Scholar access until the active period ends.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-[var(--color-accent)] shrink-0 mt-1" />
                <span><strong>No Hidden Surcharges:</strong> Stated prices in Nigerian Naira (₦) are all-inclusive with zero card tokenization charges.</span>
              </li>
            </ul>
          </div>

          {/* 3. License */}
          <div className="rounded-[28px] border border-[var(--color-rule)] bg-white p-8 sm:p-12 shadow-sm">
            <h2 className="text-[26px] font-semibold text-[var(--color-ink)] mb-4" style={{ fontFamily: 'var(--font-display)' }}>
              3. Limited License &amp; Permitted Use
            </h2>
            <p className="text-[16.5px] leading-[27px] text-[var(--color-ink)]/80">
              Propella grants each registered scholar a non-exclusive, non-transferable, revocable license to access our question bank,
              syllabus roadmaps, and AI tutoring services for personal academic preparation. Scraping questions, sharing single-user logins,
              or commercially redistributing Propella explanations without prior written consent is strictly prohibited.
            </p>
          </div>

          {/* 4. Content Liability */}
          <div className="rounded-[28px] border border-[var(--color-rule)] bg-white p-8 sm:p-12 shadow-sm">
            <h2 className="text-[26px] font-semibold text-[var(--color-ink)] mb-4" style={{ fontFamily: 'var(--font-display)' }}>
              4. Content Liability &amp; Academic Integrity
            </h2>
            <p className="text-[16.5px] leading-[27px] text-[var(--color-ink)]/80">
              Propella is an independent educational prep platform. Past examination questions are compiled from publicly available
              archive papers for study and review purposes. Propella is not affiliated with, endorsed by, or partnered with JAMB,
              WAEC, or NECO. Official syllabi belong to their respective exam boards.
            </p>
          </div>

          {/* 5. Disclaimers */}
          <div className="rounded-[28px] border border-[var(--color-rule)] bg-white p-8 sm:p-12 shadow-sm">
            <h2 className="text-[26px] font-semibold text-[var(--color-ink)] mb-4" style={{ fontFamily: 'var(--font-display)' }}>
              5. Disclaimers &amp; Examination Outcomes
            </h2>
            <p className="text-[16.5px] leading-[27px] text-[var(--color-ink)]/80">
              While our syllabus-first roadmaps, predictive scores, and active CBT drills are designed to maximise scores, individual
              examination performance depends on the candidate’s personal effort, attendance, and exam conditions. Propella makes no
              guarantee of specific university admission or final grades.
            </p>
          </div>

          {/* 6. Contact Support */}
          <div className="rounded-[28px] border border-[var(--color-rule)] bg-white p-8 sm:p-12 shadow-sm">
            <h2 className="text-[26px] font-semibold text-[var(--color-ink)] mb-4" style={{ fontFamily: 'var(--font-display)' }}>
              6. Contact Us
            </h2>
            <p className="text-[16.5px] leading-[27px] text-[var(--color-ink)]/80">
              For billing questions, subscription adjustments, or terms clarifications, please email our support team at{' '}
              <a href="mailto:support@propellastudy.com" className="font-semibold text-[var(--color-accent)] hover:underline">
                support@propellastudy.com
              </a>.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
