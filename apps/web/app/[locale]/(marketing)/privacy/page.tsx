import type { Metadata } from 'next'
import Link from 'next/link'
import { ShieldCheck, Lock, Eye, FileText, Bell, Sparkles, Mail } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Privacy Policy | Propella — Student Data Protection & Privacy',
  description:
    'Learn how Propella collects, protects, and handles your educational and personal data. Full compliance with NDPR and global data privacy standards.',
  alternates: {
    canonical: 'https://propellastudy.com/en/privacy',
  },
}

export default function PrivacyPage() {
  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-12 border-b border-[var(--color-rule)] pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-[var(--color-paper-2)] border border-[var(--color-rule)] text-[var(--color-ink-2)] mb-4">
          <ShieldCheck size={14} className="text-[var(--color-accent)]" />
          <span>Privacy &amp; Data Protection</span>
          <span className="text-[var(--color-ink-3)]">•</span>
          <span>Updated October 2026</span>
        </div>
        <h1
          className="text-3xl sm:text-4xl font-semibold text-[var(--color-ink)] tracking-tight mb-4"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Privacy Policy
        </h1>
        <p className="text-base text-[var(--color-ink-2)] leading-relaxed max-w-2xl">
          At Propella, your academic success and privacy are our top priorities. This policy explains what information we collect, why we collect it, how your data is safeguarded, and how you can exercise your rights.
        </p>
      </div>

      {/* Quick summary highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
        <div className="p-4 rounded-xl border border-[var(--color-rule)] bg-[var(--color-paper-2)]">
          <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-[var(--color-ink)]">
            <Lock size={16} className="text-[var(--color-accent)]" />
            <span>Never Sold</span>
          </div>
          <p className="text-xs text-[var(--color-ink-2)] leading-relaxed">
            We never sell, rent, or monetize your personal or study data to advertisers or third parties.
          </p>
        </div>
        <div className="p-4 rounded-xl border border-[var(--color-rule)] bg-[var(--color-paper-2)]">
          <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-[var(--color-ink)]">
            <Sparkles size={16} className="text-[var(--color-accent)]" />
            <span>Private AI Tutoring</span>
          </div>
          <p className="text-xs text-[var(--color-ink-2)] leading-relaxed">
            Your questions and quiz explanations are processed securely and never used to train public foundation models.
          </p>
        </div>
        <div className="p-4 rounded-xl border border-[var(--color-rule)] bg-[var(--color-paper-2)]">
          <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-[var(--color-ink)]">
            <Eye size={16} className="text-[var(--color-accent)]" />
            <span>Full User Control</span>
          </div>
          <p className="text-xs text-[var(--color-ink-2)] leading-relaxed">
            You can access, modify, export, or permanently delete your account and study progress at any time.
          </p>
        </div>
      </div>

      {/* Policy Content */}
      <div className="space-y-10 text-[var(--color-ink)] leading-relaxed text-sm sm:text-base">
        <section>
          <h2 className="text-xl font-semibold mb-3 text-[var(--color-ink)]" style={{ fontFamily: 'var(--font-display)' }}>
            1. Introduction
          </h2>
          <p className="text-[var(--color-ink-2)] mb-3">
            Propella (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) provides an intelligent exam preparation and syllabus-tracking platform designed for students preparing for examinations including JAMB (UTME), WAEC (WASSCE), NECO (SSCE), and undergraduate university courses across Nigeria and Africa.
          </p>
          <p className="text-[var(--color-ink-2)]">
            By creating an account or accessing our services at propellastudy.com, you consent to the practices described in this Privacy Policy, formulated in accordance with the Nigeria Data Protection Act (NDPA) and international privacy frameworks.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-[var(--color-ink)]" style={{ fontFamily: 'var(--font-display)' }}>
            2. Information We Collect
          </h2>
          <div className="space-y-3 text-[var(--color-ink-2)]">
            <p>
              <strong className="text-[var(--color-ink)]">A. Account Credentials:</strong> When you register, we require your full name and valid email address. Passwords are cryptographically hashed using salted Bcrypt before storage; plain passwords are never stored.
            </p>
            <p>
              <strong className="text-[var(--color-ink)]">B. Academic &amp; Study Profiles:</strong> To personalize your roadmap, we collect your target examinations (JAMB, WAEC, NECO, Undergraduate), intended courses of study, institutions, subject selections, self-assessed strength levels, target exam dates, and daily study time preferences.
            </p>
            <p>
              <strong className="text-[var(--color-ink)]">C. Performance &amp; Activity Data:</strong> Quiz answers, mock exam scores, streak history, topic mastery indicators, time spent studying, and interactive notes.
            </p>
            <p>
              <strong className="text-[var(--color-ink)]">D. Technical &amp; Device Information:</strong> IP address (for rate-limiting and security), browser type, timezone, and device screen dimensions to optimize responsive layouts.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-[var(--color-ink)]" style={{ fontFamily: 'var(--font-display)' }}>
            3. How We Use Your Information
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-[var(--color-ink-2)]">
            <li>Generating personalized adaptive study roadmaps tailored to your weaknesses.</li>
            <li>Delivering real-time past question evaluations and step-by-step solutions.</li>
            <li>Tracking daily study streaks and awarding achievement badges to keep you motivated.</li>
            <li>Sending verification emails, password resets, study session reminders, and weekly revision digests.</li>
            <li>Detecting fraudulent activity and protecting the integrity of our platform.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-[var(--color-ink)]" style={{ fontFamily: 'var(--font-display)' }}>
            4. Artificial Intelligence &amp; Data Handling
          </h2>
          <p className="text-[var(--color-ink-2)] mb-3">
            Propella incorporates Google Gemini AI to assist students with question explanations, concept simplifications, and mock exam generation.
          </p>
          <p className="text-[var(--color-ink-2)]">
            Prompts submitted to the AI tutor contain educational queries and question context. No sensitive identity records (such as passwords or payment details) are ever forwarded to AI providers. Your academic interactions are governed under enterprise API agreements that prohibit provider training on user inputs.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-[var(--color-ink)]" style={{ fontFamily: 'var(--font-display)' }}>
            5. Data Storage &amp; Security
          </h2>
          <p className="text-[var(--color-ink-2)] mb-3">
            We enforce modern technical and organizational safeguards to preserve the confidentiality and integrity of student records:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-[var(--color-ink-2)]">
            <li>All communications between your device and Propella use encrypted Transport Layer Security (HTTPS/TLS).</li>
            <li>Databases are hosted in SOC 2-compliant data centers with strict connection-pooling and firewalls.</li>
            <li>Authentication employs JSON Web Tokens (JWT) and HTTP-only, SameSite-secured session tokens.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-[var(--color-ink)]" style={{ fontFamily: 'var(--font-display)' }}>
            6. Sharing with Third-Party Providers
          </h2>
          <p className="text-[var(--color-ink-2)] mb-3">
            We partner only with verified infrastructure providers who adhere to strict data processing standards:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-[var(--color-ink-2)]">
            <li><strong>Database Hosting:</strong> Supabase / PostgreSQL for high-reliability data persistence.</li>
            <li><strong>Email Delivery:</strong> Resend for sending transactional verification and reminder emails.</li>
            <li><strong>Cloud Hosting:</strong> Vercel and Render for serving our web application and API.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-[var(--color-ink)]" style={{ fontFamily: 'var(--font-display)' }}>
            7. Your Rights &amp; Choices
          </h2>
          <p className="text-[var(--color-ink-2)] mb-3">
            Under applicable data protection laws, you retain the following rights:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-[var(--color-ink-2)]">
            <li><strong>Review &amp; Edit:</strong> Update your profile, subjects, or study preferences at any time in Settings.</li>
            <li><strong>Notification Controls:</strong> Toggle email study reminders and push alerts on or off.</li>
            <li><strong>Data Deletion:</strong> Request full erasure of your account and associated quiz records.</li>
            <li><strong>Data Portability:</strong> Request an export of your study data and performance analytics.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-[var(--color-ink)]" style={{ fontFamily: 'var(--font-display)' }}>
            8. Contact Us
          </h2>
          <p className="text-[var(--color-ink-2)] mb-4">
            If you have questions, feedback, or concerns regarding your privacy or data handling, please reach out to our team:
          </p>
          <div className="p-4 rounded-xl border border-[var(--color-rule)] bg-[var(--color-paper-2)] inline-block">
            <p className="text-sm font-medium text-[var(--color-ink)]">Propella Data Protection Office</p>
            <p className="text-xs text-[var(--color-ink-2)] mt-1">Email: support@propellastudy.com</p>
            <p className="text-xs text-[var(--color-ink-2)]">Location: Lagos, Nigeria</p>
          </div>
        </section>
      </div>
    </div>
  )
}
