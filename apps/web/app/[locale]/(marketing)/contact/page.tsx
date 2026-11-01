'use client'

import { useState } from 'react'
import { Link } from '@/lib/i18n/navigation'
import { cn } from '@/lib/utils/cn'
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageSquare,
  CheckCircle2,
  Send,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  HelpCircle,
  ChevronDown,
} from 'lucide-react'
import confetti from 'canvas-confetti'
import {
  DoodleRays,
  DoodleSmile,
  DoodleSquiggle,
  DoodleStar,
  DoodleSun,
  DoodleSwirl,
  JOY,
  JoyEdge,
  JoyEyebrow,
  JoyHeading,
  JoyMaskedImage,
  PHOTOS,
  VIDEOS,
  px,
} from '@/components/marketing/joy'
import { JoyVideo } from '@/components/marketing/joy-client'
import { JoyReveal, JoyStagger, JoyStaggerItem } from '@/components/marketing/joy-reveal'
import { JoyFaqSection } from '@/components/marketing/joy-faq'

const supportChannels = [
  {
    title: 'General inquiry',
    description: 'Have questions about our CBT mock simulator, syllabus roadmaps, or the 3-day welcome discount?',
    detail: '+234 (0) 812 345 6789',
    href: 'https://wa.me/2348123456789',
    badge: 'WhatsApp & Phone',
    cardBg: 'bg-[#FFF0E6] border-[#FFD3BE] dark:bg-[#2C1910] dark:border-[#522D1B]',
    iconBg: 'bg-[var(--color-accent)] text-white',
    badgeClass: 'bg-white/90 dark:bg-white/10 text-[var(--color-accent)] border border-[var(--color-accent)]/20',
    linkClass: 'text-[var(--color-accent)]',
    icon: Phone,
  },
  {
    title: 'Email Address',
    description: 'Reach out anytime with questions, and our academic support team will respond promptly.',
    detail: 'support@propellastudy.com',
    href: 'mailto:support@propellastudy.com',
    badge: 'Under 2-hour response',
    cardBg: 'bg-[#EAF8EE] border-[#BCE8CA] dark:bg-[#122A1A] dark:border-[#1E4D2C]',
    iconBg: 'bg-[#2EBB5E] text-white',
    badgeClass: 'bg-white/90 dark:bg-white/10 text-[#208341] dark:text-[#52D27E] border border-[#2EBB5E]/20',
    linkClass: 'text-[#208341] dark:text-[#52D27E]',
    icon: Mail,
  },
  {
    title: 'Visit Us',
    description: 'Propella HQ — Herbert Macaulay Way, Yaba Innovation District, Lagos, Nigeria.',
    detail: 'Yaba Innovation Hub, Lagos',
    href: 'https://maps.google.com',
    badge: 'Learning Center',
    cardBg: 'bg-[#EDF5FD] border-[#C4DEF8] dark:bg-[#112438] dark:border-[#1B3F63]',
    iconBg: 'bg-[#58A5EF] text-white',
    badgeClass: 'bg-white/90 dark:bg-white/10 text-[#2671BC] dark:text-[#76B5F4] border border-[#58A5EF]/20',
    linkClass: 'text-[#2671BC] dark:text-[#76B5F4]',
    icon: MapPin,
  },
  {
    title: 'Operating Hours',
    description: 'Monday – Friday: 8:00 AM – 7:00 PM WAT · Saturday: 9:00 AM – 4:00 PM · 24/7 AI Tutor Access',
    detail: 'Open 6 Days a Week',
    href: '#faq',
    badge: 'Live Academic Staff',
    cardBg: 'bg-[#FFFBEA] border-[#FDE89A] dark:bg-[#2F260C] dark:border-[#534316]',
    iconBg: 'bg-[#FFAD28] text-[#1A1917]',
    badgeClass: 'bg-white/90 dark:bg-white/10 text-[#8F5E00] dark:text-[#F3BA50] border border-[#FFAD28]/30',
    linkClass: 'text-[#8F5E00] dark:text-[#F3BA50]',
    icon: Clock,
  },
]

const contactFaqs = [
  {
    q: 'Who can use Propella for exam preparation?',
    a: 'Propella is built for Nigerian and African scholars preparing for JAMB UTME & Post-UTME, WAEC (WASSCE), NECO (SSCE), as well as 100L–500L university undergraduates revising departmental courses and past semester papers.',
  },
  {
    q: 'How does the 3-day welcome discount (from ₦999) work?',
    a: 'During the first 72 hours from user registration, all paid plans are 50% off (Basic is ₦999 instead of ₦1,999; Shared is ₦1,499 instead of ₦2,999). Your card is billed securely via Paystack and automatically renews next month at the standard rate so the discount is not abused by multi-account creation. You can cancel anytime before renewal from your billing settings.',
  },
  {
    q: 'Can I pause a timed CBT mock exam and resume later?',
    a: 'Yes! If you experience a power cut, slow internet, or need to step away, you can pause your mock exam anytime. All selected answers, remaining timer seconds, and question numbers are preserved so you never lose progress.',
  },
  {
    q: 'How does Study Mode differ from Exam Mode?',
    a: 'Study Mode provides immediate step-by-step explanations, formula breakdowns, and AI tutor hints after every single question. Exam Mode runs strict official countdown timing with the exact 8-key JAMB controls (A, B, C, D, P, N, S, R) and hides answers until final submission to simulate real exam pressure.',
  },
  {
    q: 'How do you ensure student safety and focused study?',
    a: 'Propella is a closed academic environment with zero third-party advertisements, unmoderated social feeds, or distracting algorithmic rabbit holes. Our AI tutor is strictly bounded to official Nigerian exam syllabi and never answers inappropriate queries.',
  },
  {
    q: 'Can two students share a single subscription?',
    a: 'Yes! The Shared Scholar Plan (from ₦1,499 welcome / ₦2,999 standard) provides two completely independent student accounts. Each learner has their own login, personal syllabus roadmap, private streaks, and separate CBT mock scorecards.',
  },
]

export default function ContactEnrollmentPage() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [program, setProgram] = useState('jamb')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } })
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[var(--color-paper)] text-[var(--color-ink)]">
      {/* ── 1. Banner Section ───────────────────────────────────────────────── */}
      <section className="relative pt-12 lg:pt-20 pb-16">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-8 text-center relative">
          <DoodleSmile className="absolute left-[10%] -top-4 hidden w-16 md:block animate-joy-float" />
          <DoodleRays className="absolute right-[12%] -top-2 hidden w-14 md:block" />
          <JoyReveal className="mx-auto max-w-[820px]">
            <JoyEyebrow className="mb-5">Get In Touch</JoyEyebrow>
            <JoyHeading as="h1" size="h1" className="text-[var(--color-ink)]">
              Get in touch &amp; accelerate your exam success today
            </JoyHeading>
            <p className="mx-auto mt-6 max-w-[640px] text-[18px] leading-[28px] text-[var(--color-ink)]/75">
              We&apos;re here to answer questions, guide your syllabus roadmap, support your child,
              or help you activate your 3-day welcome discount (from ₦999).
            </p>
          </JoyReveal>
        </div>
      </section>

      {/* ── 2. Contact & Enrollment Section (Form + Support Channel Cards) ───── */}
      <section className="pb-32">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left: Enrollment / Contact Form */}
            <JoyReveal className="lg:col-span-7">
              <div className="rounded-[32px] border border-[var(--color-rule)] bg-white dark:bg-[#1A1813] p-8 sm:p-12 shadow-sm joy-card-hover">
                <JoyEyebrow tone="accent" className="mb-4">Admissions &amp; Help</JoyEyebrow>
                <h2
                  className="text-[28px] sm:text-[34px] font-semibold text-[var(--color-ink)] mb-3"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Secure your study spot now
                </h2>
                <p className="text-[16px] text-[var(--color-ink)]/70 mb-8 leading-relaxed">
                  Tell us about your target exams, and our academic advisors will reach out with your
                  personalized roadmap within 2 hours.
                </p>

                {submitted ? (
                  <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/30 p-8 text-center">
                    <div className="h-14 w-14 rounded-full bg-emerald-500 text-white mx-auto flex items-center justify-center mb-4 shadow-md">
                      <CheckCircle2 size={30} />
                    </div>
                    <h3 className="text-[22px] font-semibold text-emerald-800 dark:text-emerald-300" style={{ fontFamily: 'var(--font-display)' }}>
                      Thank you! We received your inquiry.
                    </h3>
                    <p className="text-[15px] text-emerald-700 dark:text-emerald-400 mt-2 max-w-md mx-auto">
                      An academic counselor has been assigned to your profile and will connect with you via WhatsApp or Email shortly.
                    </p>
                    <button
                      type="button"
                      onClick={() => setSubmitted(false)}
                      className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition"
                    >
                      Send another inquiry
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-[var(--color-ink)] mb-1.5">
                          First Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="e.g. Chinedu"
                          className="w-full rounded-2xl border border-[var(--color-rule-2)] bg-[var(--color-paper)] px-4 py-3 text-[15px] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-accent)]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[var(--color-ink)] mb-1.5">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="e.g. Adeleke"
                          className="w-full rounded-2xl border border-[var(--color-rule-2)] bg-[var(--color-paper)] px-4 py-3 text-[15px] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-accent)]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-[var(--color-ink)] mb-1.5">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="scholar@example.com"
                          className="w-full rounded-2xl border border-[var(--color-rule-2)] bg-[var(--color-paper)] px-4 py-3 text-[15px] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-accent)]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[var(--color-ink)] mb-1.5">
                          Phone Number (WhatsApp) *
                        </label>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="080 1234 5678"
                          className="w-full rounded-2xl border border-[var(--color-rule-2)] bg-[var(--color-paper)] px-4 py-3 text-[15px] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-accent)]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[var(--color-ink)] mb-1.5">
                        Program of Interest *
                      </label>
                      <select
                        value={program}
                        onChange={(e) => setProgram(e.target.value)}
                        className="w-full rounded-2xl border border-[var(--color-rule-2)] bg-[var(--color-paper)] px-4 py-3 text-[15px] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-accent)]"
                      >
                        <option value="jamb">JAMB UTME &amp; Post-UTME Track (Target 300+)</option>
                        <option value="waec">WAEC &amp; NECO SSCE Track (8 Distinctions)</option>
                        <option value="undergraduate">Undergraduate Course Vault (100L–500L)</option>
                        <option value="shared">Shared Scholar Study Plan (Two Accounts)</option>
                        <option value="discount">3-Day Welcome Discount Inquiry (₦999)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[var(--color-ink)] mb-1.5">
                        Your Questions or Notes (Optional)
                      </label>
                      <textarea
                        rows={4}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Tell us what subjects you are writing, or how we can help your study routine..."
                        className="w-full rounded-2xl border border-[var(--color-rule-2)] bg-[var(--color-paper)] px-4 py-3 text-[15px] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-accent)]"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full rounded-full bg-[var(--color-accent)] px-8 py-4 text-[16px] font-semibold text-white shadow-md transition hover:bg-[var(--color-accent-2)] joy-btn-hover flex items-center justify-center gap-2"
                    >
                      <Send size={18} /> Submit &amp; Receive Free Study Guide
                    </button>

                    <p className="text-[12.5px] text-center text-[var(--color-ink-3)]">
                      By submitting, you agree to our{' '}
                      <Link href="/privacy" className="underline hover:text-[var(--color-accent)]">
                        Privacy Policy
                      </Link>{' '}
                      and consent to academic follow-ups.
                    </p>
                  </form>
                )}
              </div>
            </JoyReveal>

            {/* Right: Support Channel Cards matching Joyloo contact-enorrlment */}
            <div className="lg:col-span-5 space-y-5">
              <JoyStagger className="space-y-5">
                {supportChannels.map((c) => {
                  const Icon = c.icon
                  return (
                    <JoyStaggerItem key={c.title}>
                      <div
                        className={cn(
                          'rounded-[26px] border p-7 shadow-sm joy-card-hover transition-all',
                          c.cardBg,
                        )}
                      >
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <div
                            className={cn(
                              'h-12 w-12 rounded-2xl flex items-center justify-center font-bold shrink-0 shadow-sm',
                              c.iconBg,
                            )}
                          >
                            <Icon size={22} />
                          </div>
                          <span
                            className={cn(
                              'rounded-full px-3.5 py-1 text-[13.5px] font-normal tracking-wide',
                              c.badgeClass,
                            )}
                            style={{ fontFamily: "'Caveat Brush', cursive" }}
                          >
                            {c.badge}
                          </span>
                        </div>

                        <h3
                          className="text-[20px] font-semibold text-[var(--color-ink)] mb-1.5"
                          style={{ fontFamily: "'Parkinsans', sans-serif", fontWeight: 600 }}
                        >
                          {c.title}
                        </h3>
                        <p className="text-[14.5px] text-[var(--color-ink)]/75 leading-relaxed mb-4">
                          {c.description}
                        </p>
                        <a
                          href={c.href}
                          className={cn(
                            'inline-flex items-center gap-2 text-[15px] font-semibold hover:underline',
                            c.linkClass,
                          )}
                        >
                          {c.detail} <ArrowRight size={15} />
                        </a>
                      </div>
                    </JoyStaggerItem>
                  )
                })}
              </JoyStagger>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. FAQ Section: Standardized unified Joyloo FAQ design ───────────── */}
      <JoyFaqSection
        id="faq"
        eyebrow="Questions Scholars & Parents Often Ask"
        title="Clear answers to help you feel confident."
        subtitle="Everything you need to know about our CBT practice, 3-day welcome discount, and syllabus roadmaps."
        faqs={contactFaqs}
        tone="paper-2"
      />

      {/* ── 4. CTA Bottom Banner ────────────────────────────────────────────── */}
      <section className="py-24">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-8">
          <JoyVideo
            src={VIDEOS.classroom.src}
            poster={VIDEOS.classroom.poster}
            label="African students studying in an exam prep classroom"
            className="rounded-[32px] min-h-[380px]"
            overlay="linear-gradient(90deg, rgba(26,25,23,0.85) 0%, rgba(26,25,23,0.45) 55%, rgba(26,25,23,0.15) 100%)"
          >
            <div className="relative z-[1] flex h-full min-h-[380px] flex-col justify-end p-8 sm:p-14">
              <JoyEyebrow tone="dark" className="self-start mb-4">Grow with Propella</JoyEyebrow>
              <h2
                className="max-w-[560px] text-white text-[32px] sm:text-[42px] font-semibold leading-tight tracking-tight"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Join thousands of scholars already preparing with joy and confidence.
              </h2>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--color-accent)] px-8 py-3.5 text-[15px] font-semibold text-white transition hover:bg-[var(--color-accent-2)] joy-btn-hover"
                >
                  Start Learning Free <ArrowRight size={16} />
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center rounded-full bg-white px-7 py-3.5 text-[15px] font-semibold text-[var(--color-ink)] transition hover:bg-[#FFE494] joy-btn-hover"
                >
                  See Plans from ₦999
                </Link>
              </div>
            </div>
          </JoyVideo>
        </div>
      </section>
    </div>
  )
}
