import { Link } from '@/lib/i18n/navigation'
import { ArrowRight, Bell, Check, Clock, Heart, Lock, ShieldCheck, Smartphone, Users } from 'lucide-react'
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
  px,
} from '@/components/marketing/joy'
import { JoyReveal, JoyStagger, JoyStaggerItem } from '@/components/marketing/joy-reveal'
import { JoyFaqSection } from '@/components/marketing/joy-faq'

export const metadata = {
  title: 'Parents & Guardians Resource — Trusted Support for Your Scholar | Propella',
  description:
    'Guidance, safety standards, study routines, and supervision tools for Nigerian parents supporting students preparing for JAMB, WAEC, and university exams.',
}

const parentFaqs = [
  {
    q: 'How can I supervise my child’s study progress on Propella?',
    a: 'Parents receive regular study progress notifications and summary reports. You can view completed syllabus topics, mock exam scores, and time spent practicing each day directly from your child’s dashboard.',
  },
  {
    q: 'How does the 3-day welcome discount (from ₦999) work?',
    a: 'During the first 72 hours after registration, every paid plan is 50% off (Basic is ₦999 instead of ₦1,999; Shared is ₦1,499 instead of ₦2,999). It is billed securely to your card and auto-renews at the standard rate the following month. You can cancel at any time before renewal.',
  },
  {
    q: 'Can I purchase the Shared Plan for my children or relatives?',
    a: 'Yes! The Shared Plan gives you two independent scholar accounts for just ₦2,999 (₦1,500 per student). Both learners get separate logins, separate roadmaps, and independent mock histories.',
  },
  {
    q: 'Is Propella safe from harmful online content and social media distractions?',
    a: 'Yes. Propella is a strictly closed academic environment. There is no open-web browsing, unmoderated chat, or external advertisements. The AI tutor is strictly bounded to the official Nigerian syllabus.',
  },
  {
    q: 'What if we experience power outages or network interruptions during practice?',
    a: 'All answers and mock exam progress are saved automatically in real-time. If the light goes out or network drops, your child can pause and resume their mock exam without losing a single mark.',
  },
]

export default function ParentsResourcePage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[var(--color-paper)] text-[var(--color-ink)]">
      {/* ── 1. Top Banner ─────────────────────────────────────────────────── */}
      <section className="relative pt-12 lg:pt-20 pb-20">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-8 text-center relative">
          <DoodleSmile className="absolute left-[8%] -top-4 hidden w-16 md:block animate-joy-float" />
          <DoodleRays className="absolute right-[12%] -top-2 hidden w-14 md:block" />
          <div className="mx-auto max-w-[800px]">
            <JoyEyebrow className="mb-5">Parents &amp; Guardians</JoyEyebrow>
            <JoyHeading as="h1" size="h1" className="text-[var(--color-ink)]">
              Trusted Support for Your Parenting Journey
            </JoyHeading>
            <p className="mx-auto mt-6 max-w-[640px] text-[18px] leading-[28px] text-[var(--color-ink)]/75">
              Everything parents, guardians, and sponsors need to understand, supervise, and celebrate
              their scholar’s path toward distinction scores in JAMB, WAEC, NECO, and university finals.
            </p>
          </div>
        </div>
      </section>

      {/* ── 2. Stay Connected All Day ─────────────────────────────────────── */}
      <section className="pb-32">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-8">
          <div className="rounded-[32px] border border-[var(--color-rule)] bg-white p-8 lg:p-14 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7">
              <JoyEyebrow tone="accent" className="mb-4">Live Supervision</JoyEyebrow>
              <JoyHeading as="h2" size="h2" className="text-[28px] text-black/70 sm:text-[36px] mb-5">
                Stay connected all day
              </JoyHeading>
              <p className="text-[17px] leading-[27px] mb-8 text-black/70">
                You never have to wonder whether your child is actually studying or just scrolling on their phone.
                Propella provides transparent metrics, daily completed topic logs, and instant mock exam alerts.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 shrink-0 rounded-full bg-[var(--color-accent)] text-white flex items-center justify-center font-bold">
                    <Bell size={20} />
                  </div>
                  <div>
                    <h3 className="text-[18px] text-black/70 font-semibold " style={{ fontFamily: "'Parkinsans', sans-serif", fontWeight: 600 }}>
                      Daily Study Updates
                    </h3>
                    <p className="text-[15px] text-black/70 leading-[23px] mt-1">
                      See which syllabus topics were completed, number of questions answered, and accuracy rates.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 shrink-0 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
                    <Check size={20} />
                  </div>
                  <div>
                    <h3 className="text-[18px] text-black/70 font-semibold " style={{ fontFamily: "'Parkinsans', sans-serif", fontWeight: 600 }}>
                      Automated Mock Exam Scorecards
                    </h3>
                    <p className="text-[15px] text-black/70 leading-[23px] mt-1">
                      Receive detailed breakdown cards showing strengths and topics that need immediate attention.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 shrink-0 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                    <Users size={20} />
                  </div>
                  <div>
                    <h3 className="text-[18px] text-black/70 font-semibold " style={{ fontFamily: "'Parkinsans', sans-serif", fontWeight: 600 }}>
                      Shared Sibling &amp; Partner Accounts
                    </h3>
                    <p className="text-[15px] text-black/70 leading-[23px] mt-1">
                      Manage two children under one subscription while maintaining totally private profiles for each.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 flex justify-center">
              <div className="w-[300px] sm:w-[340px]">
                <JoyMaskedImage src={px(PHOTOS.familyStudy, 600)} alt="African mother supporting daughter in studying" shape="scallop" glow={JOY.green} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Safety and Focus You Trust ─────────────────────────────────── */}
      <section className="pb-32 bg-[var(--color-paper-2)] py-24 border-y border-[var(--color-rule)] dark:border-[#2D2A23]">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-8">
          <div className="mx-auto max-w-[680px] text-center mb-16">
            <JoyEyebrow className="mb-4">Safety &amp; Focus</JoyEyebrow>
            <JoyHeading>Safety and focus you can trust completely</JoyHeading>
            <p className="mt-4 text-[17px] text-[var(--color-ink)]/75">
              Built specifically to create a distraction-free, encouraging academic space for African youths.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-[24px] border border-[var(--color-rule)] dark:border-[#2D2A23] bg-white dark:bg-[#1A1813] p-8 shadow-sm">
              <div className="h-12 w-12 rounded-2xl bg-[var(--color-accent-tint)] text-[var(--color-accent)] flex items-center justify-center mb-6">
                <Lock size={22} />
              </div>
              <h3 className="text-[20px] font-semibold text-[var(--color-ink)] mb-3" style={{ fontFamily: "'Parkinsans', sans-serif", fontWeight: 600 }}>
                Closed Learning Garden
              </h3>
              <p className="text-[15px] leading-[24px] text-[var(--color-ink)]/70">
                No third-party advertisements, unvetted video feeds, or algorithmic rabbit holes. Your child’s focus remains 100% on their exams.
              </p>
            </div>

            <div className="rounded-[24px] border border-[var(--color-rule)] dark:border-[#2D2A23] bg-white dark:bg-[#1A1813] p-8 shadow-sm">
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 flex items-center justify-center mb-6">
                <ShieldCheck size={22} />
              </div>
              <h3 className="text-[20px] font-semibold text-[var(--color-ink)] mb-3" style={{ fontFamily: "'Parkinsans', sans-serif", fontWeight: 600 }}>
                Syllabus-Bounded AI
              </h3>
              <p className="text-[15px] leading-[24px] text-[var(--color-ink)]/70">
                The AI tutor will never answer inappropriate, irrelevant, or non-educational queries. It only teaches from official Nigerian exam guidelines.
              </p>
            </div>

            <div className="rounded-[24px] border border-[var(--color-rule)] dark:border-[#2D2A23] bg-white dark:bg-[#1A1813] p-8 shadow-sm">
              <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 flex items-center justify-center mb-6">
                <Smartphone size={22} />
              </div>
              <h3 className="text-[20px] font-semibold text-[var(--color-ink)] mb-3" style={{ fontFamily: "'Parkinsans', sans-serif", fontWeight: 600 }}>
                Bank-Grade Billing
              </h3>
              <p className="text-[15px] leading-[24px] text-[var(--color-ink)]/70">
                All transactions are processed by Paystack with 256-bit encryption. Card tokens are never exposed or stored insecurely.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Clear Answers (FAQ) ────────────────────────────────────────── */}
      <JoyFaqSection
        eyebrow="Parent FAQs"
        title="Clear answers to help you feel confident"
        subtitle={
          <>
            Have specific questions about sponsoring your child’s preparation or setting up multiple accounts?{' '}
            <a href="mailto:support@propellastudy.com" className="font-semibold text-[var(--color-accent)] hover:underline inline-flex items-center gap-1">
              Contact Parent Support →
            </a>
          </>
        }
        faqs={parentFaqs}
        tone="paper"
      />
    </div>
  )
}

