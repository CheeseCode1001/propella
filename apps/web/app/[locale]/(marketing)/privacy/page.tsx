import type { Metadata } from 'next'
import { Link } from '@/lib/i18n/navigation'
import { Lock, ShieldCheck, Sparkles, Mail, CheckCircle2 } from 'lucide-react'
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
  title: 'Your Privacy Matters — Data Protection & Privacy Policy | Propella',
  description:
    'Learn how Propella collects, protects, and respects the educational and personal data of African students and families under NDPR and international standards.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[var(--color-paper)] text-[var(--color-ink)]">
      {/* ── Banner ─────────────────────────────────────────────────────────── */}
      <section className="relative pt-12 lg:pt-20 pb-16">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-8 text-center relative">
          <DoodleSmile className="absolute left-[10%] -top-4 hidden w-16 md:block animate-joy-float" />
          <DoodleRays className="absolute right-[12%] -top-2 hidden w-14 md:block" />
          <div className="mx-auto max-w-[760px]">
            <JoyEyebrow className="mb-5">Legal &amp; Trust</JoyEyebrow>
            <JoyHeading as="h1" size="h1" className="text-[var(--color-ink)]">
              Your privacy matters for families
            </JoyHeading>
            <p className="mx-auto mt-6 max-w-[620px] text-[18px] leading-[28px] text-[var(--color-ink)]/75">
              At Propella, your academic success and privacy are sacred. This policy outlines how we handle,
              safeguard, and respect your personal and study records.
            </p>
          </div>
        </div>
      </section>

      {/* ── Privacy Cards ─────────────────────────────────────────────────── */}
      <section className="pb-32">
        <div className="max-w-[960px] mx-auto px-6 lg:px-8 space-y-10">
          {/* Introduction */}
          <div className="rounded-[28px] border border-[var(--color-rule)] bg-white p-8 sm:p-12 shadow-sm">
            <h2 className="text-[26px] font-semibold text-black mb-4" style={{ fontFamily: 'var(--font-display)' }}>
              1. Introduction
            </h2>
            <p className="text-[16.5px] leading-[27px] text-black/80">
              Propella EdTech Ltd (&ldquo;Propella&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) provides an intelligent digital study companion
              for candidates preparing for Joint Admissions and Matriculation Board (JAMB) UTME, West African Senior School
              Certificate Examination (WAEC), National Examinations Council (NECO), and tertiary undergraduate courses.
              We are deeply committed to complying with the Nigeria Data Protection Act (NDPA), Nigeria Data Protection
              Regulation (NDPR), and global best practices.
            </p>
          </div>

          {/* Personal Information */}
          <div className="rounded-[28px] border border-[var(--color-rule)] bg-white p-8 sm:p-12 shadow-sm">
            <h2 className="text-[26px] font-semibold text-black mb-4" style={{ fontFamily: 'var(--font-display)' }}>
              2. Personal Information We Collect
            </h2>
            <p className="text-[16.5px] leading-[27px] text-black/80 mb-4">
              To build an accurate syllabus roadmap and authenticate your account, we collect:
            </p>
            <ul className="space-y-3 text-[16px] text-black/80">
              <li className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-[var(--color-accent)] shrink-0 mt-1" />
                <span><strong>Account Credentials:</strong> Full name, email address, password hash, and optional phone number.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-[var(--color-accent)] shrink-0 mt-1" />
                <span><strong>Academic Preferences:</strong> Selected exam boards (JAMB, WAEC, NECO), target subjects, target exam dates, and daily study times.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-[var(--color-accent)] shrink-0 mt-1" />
                <span><strong>Performance History:</strong> Questions answered, time spent per topic, mock exam scores, and weak-topic diagnostics.</span>
              </li>
            </ul>
          </div>

          {/* Non-Personal Information & AI */}
          <div className="rounded-[28px] border border-[var(--color-rule)] bg-white p-8 sm:p-12 shadow-sm">
            <h2 className="text-[26px] font-semibold text-black mb-4" style={{ fontFamily: 'var(--font-display)' }}>
              3. AI Tutoring &amp; Document AI Protection
            </h2>
            <p className="text-[16.5px] leading-[27px] text-black/80 mb-4">
              Your conversations with the Propella AI tutor and any uploaded university lecture slides are strictly private.
            </p>
            <div className="rounded-2xl bg-[var(--color-accent)] p-5 text-[15.5px] leading-[25px] text-white">
              <strong>Zero Advertising or Selling:</strong> We never sell, monetize, or rent student questions, lecture files, or personal information to third-party advertisers or data brokers.
            </div>
          </div>

          {/* Payment Information & Paystack */}
          <div className="rounded-[28px] border border-[var(--color-rule)] bg-white p-8 sm:p-12 shadow-sm">
            <h2 className="text-[26px] font-semibold text-black mb-4" style={{ fontFamily: 'var(--font-display)' }}>
              4. Payment Security &amp; Saved Cards
            </h2>
            <p className="text-[16.5px] leading-[27px] text-black/80">
              When activating a paid scholar plan (including the 3-day welcome discount from ₦999), all card payments
              are processed directly through Paystack (PCI-DSS Level 1 certified). Propella does not store full 16-digit card
              numbers or CVV codes on our servers. Encrypted authorization tokens are used to execute monthly renewals,
              and you may cancel your auto-renewal at any time before the next billing cycle.
            </p>
          </div>

          {/* Cookies & Tracking */}
          <div className="rounded-[28px] border border-[var(--color-rule)] bg-white p-8 sm:p-12 shadow-sm">
            <h2 className="text-[26px] font-semibold text-black mb-4" style={{ fontFamily: 'var(--font-display)' }}>
              5. Cookies and Local Storage
            </h2>
            <p className="text-[16.5px] leading-[27px] text-black/80">
              We use essential cookies and browser local storage strictly to keep you securely signed in, preserve your
              quiz answers if your network drops, and remember your visual display preferences. We do not use third-party
              cross-site tracking cookies.
            </p>
          </div>

          {/* Contact */}
          <div className="rounded-[28px] border border-[var(--color-rule)] bg-white p-8 sm:p-12 shadow-sm">
            <h2 className="text-[26px] font-semibold text-black mb-4" style={{ fontFamily: 'var(--font-display)' }}>
              6. Contact Our Privacy Office
            </h2>
            <p className="text-[16.5px] leading-[27px] text-black/80">
              If you have any questions, wish to request data deletion, or want to export your study records, contact our
              Data Protection Team at{' '}
              <a href="mailto:privacy@propellastudy.com" className="font-semibold text-[var(--color-accent)] hover:underline">
                privacy@propellastudy.com
              </a>{' '}
              or write to Propella EdTech Ltd, Lagos, Nigeria.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
