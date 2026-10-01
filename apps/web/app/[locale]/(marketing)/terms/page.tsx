import type { Metadata } from 'next'
import Link from 'next/link'
import { FileCheck, BookOpen, AlertCircle, Award, Scale, HelpCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Terms of Service | Propella — Exam Preparation Platform',
  description:
    'Review the terms of service governing access and use of Propella for JAMB, WAEC, NECO, and undergraduate study preparation.',
  alternates: {
    canonical: 'https://propellastudy.com/en/terms',
  },
}

export default function TermsPage() {
  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-12 border-b border-[var(--color-rule)] pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-[var(--color-paper-2)] border border-[var(--color-rule)] text-[var(--color-ink-2)] mb-4">
          <FileCheck size={14} className="text-[var(--color-accent)]" />
          <span>User Agreement</span>
          <span className="text-[var(--color-ink-3)]">•</span>
          <span>Updated October 2026</span>
        </div>
        <h1
          className="text-3xl sm:text-4xl font-semibold text-[var(--color-ink)] tracking-tight mb-4"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Terms of Service
        </h1>
        <p className="text-base text-[var(--color-ink-2)] leading-relaxed max-w-2xl">
          Welcome to Propella. These terms govern your access to and use of our web application, practice question bank, adaptive roadmaps, and AI study tools.
        </p>
      </div>

      {/* Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
        <div className="p-4 rounded-xl border border-[var(--color-rule)] bg-[var(--color-paper-2)]">
          <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-[var(--color-ink)]">
            <BookOpen size={16} className="text-[var(--color-accent)]" />
            <span>Academic Focus</span>
          </div>
          <p className="text-xs text-[var(--color-ink-2)] leading-relaxed">
            Propella is provided solely for educational preparation and personal study enhancement.
          </p>
        </div>
        <div className="p-4 rounded-xl border border-[var(--color-rule)] bg-[var(--color-paper-2)]">
          <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-[var(--color-ink)]">
            <Award size={16} className="text-[var(--color-accent)]" />
            <span>Fair Referral Rules</span>
          </div>
          <p className="text-xs text-[var(--color-ink-2)] leading-relaxed">
            Legitimate student invites qualify for cash and credit rewards under our anti-fraud rules.
          </p>
        </div>
        <div className="p-4 rounded-xl border border-[var(--color-rule)] bg-[var(--color-paper-2)]">
          <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-[var(--color-ink)]">
            <Scale size={16} className="text-[var(--color-accent)]" />
            <span>Fair Usage</span>
          </div>
          <p className="text-xs text-[var(--color-ink-2)] leading-relaxed">
            Automated scraping, bot activity, and account reselling are strictly prohibited.
          </p>
        </div>
      </div>

      {/* Terms Sections */}
      <div className="space-y-10 text-[var(--color-ink)] leading-relaxed text-sm sm:text-base">
        <section>
          <h2 className="text-xl font-semibold mb-3 text-[var(--color-ink)]" style={{ fontFamily: 'var(--font-display)' }}>
            1. Acceptance of Terms
          </h2>
          <p className="text-[var(--color-ink-2)]">
            By signing up, logging in, or browsing Propella at propellastudy.com, you agree to comply with and be legally bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please discontinue using the service immediately.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-[var(--color-ink)]" style={{ fontFamily: 'var(--font-display)' }}>
            2. Description of Service
          </h2>
          <p className="text-[var(--color-ink-2)] mb-3">
            Propella is an educational technology service providing:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-[var(--color-ink-2)]">
            <li>Interactive past questions for JAMB (UTME), WAEC, NECO, and undergraduate curricula.</li>
            <li>Timed Computer-Based Test (CBT) practice sessions with instant score breakdowns.</li>
            <li>Personalized adaptive syllabus roadmaps and spaced repetition revision schedules.</li>
            <li>AI-assisted study explanations powered by Google Gemini models.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-[var(--color-ink)]" style={{ fontFamily: 'var(--font-display)' }}>
            3. User Accounts &amp; Email Verification
          </h2>
          <div className="space-y-3 text-[var(--color-ink-2)]">
            <p>
              To maintain academic community standards and prevent automated abuse, a valid email address is mandatory. Accounts are registered and activated only upon confirmation of the 6-digit email verification code sent during registration.
            </p>
            <p>
              You are responsible for maintaining the confidentiality of your login credentials. You agree to notify us immediately of any unauthorized access to your account.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-[var(--color-ink)]" style={{ fontFamily: 'var(--font-display)' }}>
            4. Acceptable Use &amp; Academic Integrity
          </h2>
          <p className="text-[var(--color-ink-2)] mb-3">
            Propella is engineered to build authentic mastery. When using Propella, you agree NOT to:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-[var(--color-ink-2)]">
            <li>Use automated scrapers, crawlers, or scripts to bulk-download past questions or solutions.</li>
            <li>Attempt to bypass rate limits, authentication barriers, or security mechanisms.</li>
            <li>Share account credentials with multiple concurrent users.</li>
            <li>Employ the AI assistant to produce malicious, non-academic, or abusive content.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-[var(--color-ink)]" style={{ fontFamily: 'var(--font-display)' }}>
            5. Plans, Billing &amp; Referrals
          </h2>
          <div className="space-y-3 text-[var(--color-ink-2)]">
            <p>
              <strong className="text-[var(--color-ink)]">Free and Scholar Plans:</strong> We offer generous free access to past questions and syllabus roadmaps. Upgraded tiers (Scholar) grant additional AI tokens, unlimited mock exams, and advanced analytics.
            </p>
            <p>
              <strong className="text-[var(--color-ink)]">Referral Rewards:</strong> Candidates who refer peers receive referral credit upon the referred student completing email verification. Self-referrals, artificial dummy accounts, and referral botting will lead to immediate forfeiture of balances and account suspension.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-[var(--color-ink)]" style={{ fontFamily: 'var(--font-display)' }}>
            6. Intellectual Property &amp; Past Questions
          </h2>
          <p className="text-[var(--color-ink-2)]">
            The Propella name, logo, custom algorithms, adaptive progression engine, and visual interface are the intellectual property of Propella. Official examination questions referenced on the platform are public past examination materials utilized strictly under educational fair use.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-[var(--color-ink)]" style={{ fontFamily: 'var(--font-display)' }}>
            7. AI Study Assistant Disclaimer
          </h2>
          <p className="text-[var(--color-ink-2)]">
            Our AI tutor generates explanations and guidance based on academic syllabi. While engineered for high accuracy, AI models may occasionally provide inaccurate answers. Students are advised to cross-check complex calculations and official exam guidelines.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-[var(--color-ink)]" style={{ fontFamily: 'var(--font-display)' }}>
            8. Governing Law
          </h2>
          <p className="text-[var(--color-ink-2)]">
            These terms shall be governed by and construed in accordance with the laws of the Federal Republic of Nigeria. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts of Lagos State, Nigeria.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-[var(--color-ink)]" style={{ fontFamily: 'var(--font-display)' }}>
            9. Contact &amp; Inquiries
          </h2>
          <p className="text-[var(--color-ink-2)] mb-4">
            If you have questions regarding these terms, please contact our support team:
          </p>
          <div className="p-4 rounded-xl border border-[var(--color-rule)] bg-[var(--color-paper-2)] inline-block">
            <p className="text-sm font-medium text-[var(--color-ink)]">Propella Support</p>
            <p className="text-xs text-[var(--color-ink-2)] mt-1">Email: support@propellastudy.com</p>
            <p className="text-xs text-[var(--color-ink-2)]">Lagos, Nigeria</p>
          </div>
        </section>
      </div>
    </div>
  )
}
