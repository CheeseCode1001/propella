
import Image from 'next/image'
import { Link } from '@/lib/i18n/navigation'
import {
  Compass,
  Sparkles,
  FileText,
  Timer,
  Check,
  CalendarDays,
  Activity,
  RotateCcw,
  TrendingUp,
  Zap,
  Smartphone,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { StickyNav } from '@/components/marketing/sticky-nav'

// ─── Hero topic card ─────────────────────────────────────────────────────────

function HeroTopicCard() {
  return (
    <div
      className="bg-[var(--color-card)] border border-[var(--color-rule)] rounded-[var(--radius-md)] overflow-hidden shadow-[var(--shadow-md)] max-w-[340px] w-full"
      style={{ boxShadow: 'var(--shadow-md)' }}
    >
      {/* accent left bar */}
      <div className="flex">
        <div className="w-[3px] bg-[var(--color-accent)] shrink-0" />
        <div className="flex-1 p-5">
          <div className="mb-3">
            <h3
              className="text-[18px] leading-[1.3] tracking-[-0.01em] text-[var(--color-ink)] mb-1"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Quadratic Equations
            </h3>
            <p className="text-[12px] text-[var(--color-ink-3)] font-mono">
              Mathematics · Topic 8 of 15
            </p>
          </div>

          {/* mastery bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] text-[var(--color-ink-3)] font-mono uppercase tracking-[0.06em]">
                Mastery
              </span>
              <span className="text-[11px] text-[var(--color-ink-2)] font-mono">67%</span>
            </div>
            <div className="h-1.5 bg-[var(--color-paper-3)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--color-accent)] rounded-full"
                style={{ width: '67%' }}
              />
            </div>
          </div>

          {/* next revision */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <CalendarDays size={12} strokeWidth={1.5} className="text-[var(--color-ink-3)]" />
              <span className="text-[12px] text-[var(--color-ink-3)]">Next revision in 2 days</span>
            </div>
            <Badge variant="warning">In progress</Badge>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Landing page ─────────────────────────────────────────────────────────────

export default function HomePage() {
  const year = new Date().getFullYear()

  return (
    <div className="min-h-screen bg-[var(--color-paper)]">
      <StickyNav />

      {/* ── 1. Hero ────────────────────────────────────────────────────────── */}
      <section className="pt-24 pb-20 lg:pt-32 lg:pb-28">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-12 lg:items-center">
            {/* Left col */}
            <div className="lg:col-span-7">
              {/* eyebrow */}
              <p
                className="text-[11px] font-mono font-medium tracking-[0.12em] uppercase text-[var(--color-accent)] mb-6"
              >
                Propella — Pass JAMB in one sitting. Turn distractions into distinctions.
              </p>

              {/* headline */}
              <h1
                className="text-[var(--color-ink)] mb-6 leading-[0.95] tracking-[-0.02em]"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
                  fontWeight: 500,
                }}
              >
                Stop trying to cram<br />
                to pass JAMB.
              </h1>

              {/* subhead */}
              <p
                className="text-[17px] leading-[1.6] text-[var(--color-ink-2)] mb-6"
                style={{ maxWidth: '520px' }}
              >
                Boost your score and confidence with a system that breaks down your syllabus
                into a simplified study guide to help you pass JAMB.
              </p>

              {/* punch lines */}
              <div className="mb-8 space-y-1.5">
                <p className="text-[15px] leading-[1.6] text-[var(--color-ink-2)] italic">
                  No more random reading.
                </p>
                <p className="text-[15px] leading-[1.6] text-[var(--color-ink-2)] italic">
                  No more forgetting everything before exam.
                </p>
                <p className="text-[15px] leading-[1.6] text-[var(--color-ink-2)] italic">
                  Block social media until you answer questions to earn scrolling time.
                </p>
                <p className="text-[15px] leading-[1.6] text-[var(--color-ink-2)] italic">
                  Propella is built for students who want to pass JAMB once.
                </p>
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <Button variant="accent" size="lg" asChild>
                  <Link href="/signup">Help me pass JAMB</Link>
                </Button>
                <Button variant="ghost" size="lg" asChild>
                  <a href="#how-it-works">See how it works</a>
                </Button>
              </div>

              {/* caption */}
              <p className="text-[13px] text-[var(--color-ink-3)]">
                Finish your syllabus with a simplified AI system that works. Answer questions
                daily and boost your chances to score 300+.
              </p>
            </div>

            {/* Right col — topic card */}
            <div className="hidden lg:flex lg:col-span-5 lg:justify-center lg:items-center mt-12 lg:mt-0">
              <HeroTopicCard />
            </div>
          </div>
        </div>
      </section>

      <Separator />

      {/* ── 2. The repetition problem ───────────────────────────────────────── */}
      <section className="py-24 bg-[var(--color-paper-2)]">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-start">
            {/* Left — headline */}
            <div>
              <h2
                className="text-[var(--color-ink)] leading-[1.1] tracking-[-0.02em]"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
                  fontWeight: 500,
                }}
              >
                The problem isn&apos;t that you didn&apos;t study. It&apos;s that you didn&apos;t
                study correctly with the right methods — let Propella help you this time.
              </h2>
            </div>

            {/* Right — body copy */}
            <div className="mt-8 lg:mt-0 space-y-5">
              <p className="text-[15px] leading-[1.6] text-[var(--color-ink-2)]">
                Most candidates read a topic once — maybe twice — and move on. By exam day, the
                early material has faded. The connections between topics never form. The confidence
                was never real.
              </p>
              <p className="text-[15px] leading-[1.6] text-[var(--color-ink-2)]">
                If you are preparing for JAMB, Propella creates a personalised study experience
                based on your strengths, weaknesses and goals.
              </p>
              <p className="text-[15px] leading-[1.6] text-[var(--color-ink-2)]">
                Propella automates your study with ease and does the heavy lifting for you. All you
                need to do is simply show up.
              </p>
              <p className="text-[15px] leading-[1.6] text-[var(--color-ink-2)] font-medium">
                Study with structure. Practice with confidence. Walk into your exam prepared.
              </p>
            </div>
          </div>

          {/* Photograph under both columns. Fixed aspect ratio so the section
              height does not jump while the image loads. */}
          <div
            className="mt-12 overflow-hidden rounded-[var(--radius-lg)]"
            style={{ backgroundColor: 'var(--color-paper-3)' }}
          >
            <Image
              src="/images/students-group.jpg"
              alt="Secondary school students together outside their classroom"
              width={2000}
              height={1335}
              className="h-full w-full object-cover"
              style={{ aspectRatio: '16 / 7' }}
              sizes="(max-width: 1200px) 100vw, 1200px"
              priority={false}
            />
          </div>
        </div>
      </section>

      <Separator />

      {/* ── 3. How it works ────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          {/* section label */}
          <p className="text-[11px] font-mono font-medium tracking-[0.12em] uppercase text-[var(--color-ink-3)] mb-12">
            How it works
          </p>

          <div className="lg:grid lg:grid-cols-3 lg:divide-x lg:divide-[var(--color-rule)]">
            {/* Step 01 */}
            <div className="pb-12 lg:pb-0 lg:pr-10">
              <p className="text-[11px] font-mono font-medium tracking-[0.12em] uppercase text-[var(--color-ink-3)] mb-4">
                01
              </p>
              <h3
                className="text-[18px] leading-[1.3] tracking-[-0.01em] text-[var(--color-ink)] mb-3"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Tell us your exam and subjects
              </h3>
              <p className="text-[15px] leading-[1.6] text-[var(--color-ink-2)]">
                Select your exam (JAMB, WAEC, or NECO), your target subjects, your exam date, and
                how many hours a day you can study. Propella builds a roadmap from the official
                syllabus — not from someone&apos;s guess at what might come up.
              </p>
            </div>

            {/* Step 02 */}
            <div className="py-12 lg:py-0 lg:px-10 border-t border-[var(--color-rule)] lg:border-t-0">
              <p className="text-[11px] font-mono font-medium tracking-[0.12em] uppercase text-[var(--color-ink-3)] mb-4">
                02
              </p>
              <h3
                className="text-[18px] leading-[1.3] tracking-[-0.01em] text-[var(--color-ink)] mb-3"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Study and get tested
              </h3>
              <p className="text-[15px] leading-[1.6] text-[var(--color-ink-2)]">
                Each session delivers concise topic notes, practice questions drawn from past papers,
                and instant feedback. The AI study companion answers questions about specific topics
                — within the scope of your syllabus. No distractions, no rabbit holes.
              </p>
            </div>

            {/* Step 03 */}
            <div className="pt-12 lg:pt-0 lg:pl-10 border-t border-[var(--color-rule)] lg:border-t-0">
              <p className="text-[11px] font-mono font-medium tracking-[0.12em] uppercase text-[var(--color-ink-3)] mb-4">
                03
              </p>
              <h3
                className="text-[18px] leading-[1.3] tracking-[-0.01em] text-[var(--color-ink)] mb-3"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                The system schedules your reviews
              </h3>
              <p className="text-[15px] leading-[1.6] text-[var(--color-ink-2)]">
                After every session, the algorithm calculates when each topic needs revisiting.
                Topics you struggled with come back sooner. Topics you mastered rest longer. Over
                time, your entire syllabus shifts from &ldquo;seen once&rdquo; to &ldquo;properly
                memorised.&rdquo;
              </p>
            </div>
          </div>
        </div>
      </section>

      <Separator />

      {/* ── 4. Features ──────────────────────────────────────────────────────── */}
      <section className="py-24 bg-[var(--color-paper-2)]">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <p className="text-[11px] font-mono font-medium tracking-[0.12em] uppercase text-[var(--color-ink-3)] mb-4">
            Why choose Propella?
          </p>
          <h2
            className="text-[var(--color-ink)] leading-[1.15] tracking-[-0.02em] mb-12"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.5rem, 2.5vw, 2.25rem)',
              fontWeight: 500,
            }}
          >
            Everything you need to pass JAMB this year, all in one place.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 divide-y divide-[var(--color-rule)] md:divide-y-0 md:divide-x">
            {/* AI Diagnostic Test */}
            <div className="py-8 md:px-8 md:first:pl-0 md:last:pr-0">
              <Activity
                size={20}
                strokeWidth={1.5}
                className="text-[var(--color-accent)] mb-4"
              />
              <h3
                className="text-[17px] leading-[1.3] tracking-[-0.01em] text-[var(--color-ink)] mb-2"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                AI Diagnostic Test
              </h3>
              <p className="text-[14px] leading-[1.6] text-[var(--color-ink-2)]">
                Discover the topics you understand and the ones that need more attention.
              </p>
            </div>

            {/* Personalized Study Plan */}
            <div className="py-8 md:px-8 md:first:pl-0 md:last:pr-0">
              <Compass
                size={20}
                strokeWidth={1.5}
                className="text-[var(--color-accent)] mb-4"
              />
              <h3
                className="text-[17px] leading-[1.3] tracking-[-0.01em] text-[var(--color-ink)] mb-2"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Personalized Study Plan
              </h3>
              <p className="text-[14px] leading-[1.6] text-[var(--color-ink-2)]">
                Get a smart reading roadmap tailored to your exam and target score.
              </p>
            </div>

            {/* Daily Practice Questions */}
            <div className="py-8 md:px-8 md:first:pl-0 md:last:pr-0">
              <FileText
                size={20}
                strokeWidth={1.5}
                className="text-[var(--color-accent)] mb-4"
              />
              <h3
                className="text-[17px] leading-[1.3] tracking-[-0.01em] text-[var(--color-ink)] mb-2"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Daily Practice Questions
              </h3>
              <p className="text-[14px] leading-[1.6] text-[var(--color-ink-2)]">
                Practice real exam questions daily and improve step by step.
              </p>
            </div>
          </div>

          {/* Row 2 — separator on mobile + a top border on desktop to divide the two rows */}
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y divide-[var(--color-rule)] md:divide-y-0 md:divide-x border-t border-[var(--color-rule)] md:mt-0">
            {/* Smart Revision System */}
            <div className="py-8 md:px-8 md:first:pl-0 md:last:pr-0">
              <RotateCcw
                size={20}
                strokeWidth={1.5}
                className="text-[var(--color-accent)] mb-4"
              />
              <h3
                className="text-[17px] leading-[1.3] tracking-[-0.01em] text-[var(--color-ink)] mb-2"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Smart Revision System
              </h3>
              <p className="text-[14px] leading-[1.6] text-[var(--color-ink-2)]">
                Propella brings back topics at the right time so you remember them longer.
              </p>
            </div>

            {/* AI Tutor */}
            <div className="py-8 md:px-8 md:first:pl-0 md:last:pr-0">
              <Sparkles
                size={20}
                strokeWidth={1.5}
                className="text-[var(--color-accent)] mb-4"
              />
              <h3
                className="text-[17px] leading-[1.3] tracking-[-0.01em] text-[var(--color-ink)] mb-2"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                AI Tutor
              </h3>
              <p className="text-[14px] leading-[1.6] text-[var(--color-ink-2)]">
                Learn with interactive AI tutors that make studying easier and more engaging.
              </p>
            </div>

            {/* Progress Tracking */}
            <div className="py-8 md:px-8 md:first:pl-0 md:last:pr-0">
              <TrendingUp
                size={20}
                strokeWidth={1.5}
                className="text-[var(--color-accent)] mb-4"
              />
              <h3
                className="text-[17px] leading-[1.3] tracking-[-0.01em] text-[var(--color-ink)] mb-2"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Progress Tracking
              </h3>
              <p className="text-[14px] leading-[1.6] text-[var(--color-ink-2)]">
                Track your consistency, mastery level, and overall improvement.
              </p>
            </div>
          </div>

          {/* Row 3 — the differentiator */}
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y divide-[var(--color-rule)] md:divide-y-0 md:divide-x border-t border-[var(--color-rule)]">
            <div className="py-8 md:px-8 md:first:pl-0 md:last:pr-0">
              <Smartphone
                size={20}
                strokeWidth={1.5}
                className="text-[var(--color-accent)] mb-4"
              />
              <h3
                className="text-[17px] leading-[1.3] tracking-[-0.01em] text-[var(--color-ink)] mb-2"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Use distracting apps to your advantage
              </h3>
              <p className="text-[14px] leading-[1.6] text-[var(--color-ink-2)]">
                Earn your scrolling time by answering questions daily and build a study habit.
              </p>
            </div>
          </div>

          {/* Section CTA */}
          <div className="pt-10">
            <Button variant="accent" size="lg" asChild>
              <Link href="/signup">Start now for free</Link>
            </Button>
          </div>
        </div>
      </section>

      <Separator />

      {/* ── 5. Testimonials ──────────────────────────────────────────────────── */}
      <section className="py-24 bg-[var(--color-paper-2)]">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <p className="text-[11px] font-mono font-medium tracking-[0.12em] uppercase text-[var(--color-ink-3)] mb-4">
            What students are saying
          </p>
          <h2
            className="text-[var(--color-ink)] leading-[1.15] tracking-[-0.02em] mb-12"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.5rem, 2.5vw, 2.25rem)',
              fontWeight: 500,
            }}
          >
            Real results from real candidates
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                quote:
                  "I went from guessing answers to actually understanding why each one was correct. My mock scores jumped from 210 to 287 in six weeks.",
                name: 'Chiamaka O.',
                detail: 'JAMB candidate, Lagos',
              },
              {
                quote:
                  "The revision reminders forced me to go back to topics I thought I already knew. Turns out I didn't know them as well as I thought.",
                name: 'Tunde A.',
                detail: 'WAEC candidate, Ibadan',
              },
              {
                quote:
                  'I liked that the AI tutor only answered questions from my syllabus. No distractions, no random internet rabbit holes.',
                name: 'Blessing E.',
                detail: 'NECO candidate, Jos',
              },
            ].map((t) => (
              <div
                key={t.name}
                className="bg-[var(--color-card)] border border-[var(--color-rule)] rounded-[var(--radius-md)] p-7"
              >
                <p className="text-[15px] leading-[1.6] text-[var(--color-ink-2)] mb-6">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div>
                  <p className="text-[14px] font-medium text-[var(--color-ink)]">{t.name}</p>
                  <p className="text-[13px] text-[var(--color-ink-3)]">{t.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Separator />

      {/* ── 6. Quiz section ──────────────────────────────────────────────────── */}
      <section className="py-24">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-12 lg:items-center">
            {/* Left — copy */}
            <div className="lg:col-span-6">
              <div className="flex items-center gap-2 mb-4">
                <Zap size={18} strokeWidth={1.5} className="text-[var(--color-accent)]" />
                <p className="text-[11px] font-mono font-medium tracking-[0.12em] uppercase text-[var(--color-ink-3)]">
                  Quiz
                </p>
              </div>
              <h2
                className="text-[var(--color-ink)] leading-[1.1] tracking-[-0.02em] mb-5"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
                  fontWeight: 500,
                }}
              >
                Practice one question at a time.
              </h2>
              <p className="text-[15px] leading-[1.6] text-[var(--color-ink-2)] mb-8 max-w-[440px]">
                Improve daily with quick quizzes, instant feedback, and smarter revision. Small
                wins, every single day, until the syllabus stops feeling like a mountain.
              </p>
              <Button variant="accent" size="lg" asChild>
                <Link href="/signup">Try a quiz now</Link>
              </Button>
            </div>

            {/* Right — quiz preview card */}
            <div className="lg:col-span-6 mt-12 lg:mt-0">
              <div
                className="bg-[var(--color-card)] border border-[var(--color-rule)] rounded-[var(--radius-md)] p-6 max-w-[420px] mx-auto"
                style={{ boxShadow: 'var(--shadow-md)' }}
              >
                <div className="flex items-center justify-between mb-5">
                  <span className="text-[11px] font-mono text-[var(--color-ink-3)] uppercase tracking-[0.06em]">
                    Chemistry · Question 4 of 10
                  </span>
                  <Badge variant="warning">00:42</Badge>
                </div>
                <p className="text-[15px] leading-[1.6] text-[var(--color-ink)] mb-6">
                  Which of the following is the correct IUPAC name for CH₃CH₂OH?
                </p>
                <div className="space-y-2.5">
                  {['Methanol', 'Ethanol', 'Propanol', 'Ethanoic acid'].map((option, i) => (
                    <div
                      key={option}
                      className={`flex items-center gap-3 p-3 rounded-[var(--radius-sm)] border text-[14px] ${
                        i === 1
                          ? 'border-[var(--color-accent)] bg-[var(--color-accent-tint)] text-[var(--color-ink)]'
                          : 'border-[var(--color-rule)] text-[var(--color-ink-2)]'
                      }`}
                    >
                      <span className="font-mono text-[12px] text-[var(--color-ink-3)]">
                        {String.fromCharCode(65 + i)}
                      </span>
                      {option}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Separator />

      {/* ── 7. Pricing ───────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-24 bg-[var(--color-paper-2)]">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          {/* heading */}
          <div className="mb-12">
            <p className="text-[11px] font-mono font-medium tracking-[0.12em] uppercase text-[var(--color-ink-3)] mb-4">
              Pricing
            </p>
            <h2
              className="text-[var(--color-ink)] leading-[1.1] tracking-[-0.02em]"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.5rem, 2.5vw, 2rem)',
                fontWeight: 500,
              }}
            >
              Free until you decide it&apos;s worth paying for.
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-[840px]">
            {/* Free plan */}
            <div className="border border-[var(--color-rule)] rounded-[var(--radius-md)] p-8 bg-[var(--color-card)]">
              <div className="mb-6">
                <p
                  className="text-[11px] font-mono font-medium tracking-[0.12em] uppercase text-[var(--color-ink-3)] mb-3"
                >
                  Free
                </p>
                <div className="flex items-baseline gap-1 mb-2">
                  <span
                    className="text-[40px] leading-none tracking-[-0.02em] text-[var(--color-ink)]"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    ₦0
                  </span>
                </div>
                <p className="text-[14px] text-[var(--color-ink-3)]">Forever free, no card required.</p>
              </div>

              <Separator className="mb-6" />

              <ul className="space-y-3 mb-8">
                {[
                  'Full roadmap for one exam',
                  'Up to 20 AI assistant messages per day',
                  '5 quizzes per day, unlimited mocks per month',
                  '1 streak freeze per month',
                  'All core features',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <Check
                      size={14}
                      strokeWidth={1.5}
                      className="text-[var(--color-ink-3)] mt-0.5 shrink-0"
                    />
                    <span className="text-[14px] text-[var(--color-ink-2)]">{item}</span>
                  </li>
                ))}
              </ul>

              <Button variant="secondary" size="lg" className="w-full" asChild>
                <Link href="/signup">Start free</Link>
              </Button>
            </div>

            {/* Scholar plan */}
            <div className="border border-[var(--color-rule)] rounded-[var(--radius-md)] p-8 bg-[var(--color-card)]">
              <div className="mb-6">
                <p
                  className="text-[11px] font-mono font-medium tracking-[0.12em] uppercase text-[var(--color-ink-3)] mb-3"
                >
                  Scholar
                </p>
                <div className="flex items-baseline gap-1 mb-2">
                  <span
                    className="text-[40px] leading-none tracking-[-0.02em] text-[var(--color-ink)]"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    ₦2,500
                  </span>
                  <span className="text-[14px] text-[var(--color-ink-3)]">/month</span>
                </div>
                <p className="text-[14px] text-[var(--color-ink-3)]">
                  ₦18,000/year (40% off)
                </p>
              </div>

              <Separator className="mb-6" />

              <ul className="space-y-3 mb-8">
                {[
                  'Everything in Free',
                  'Unlimited AI assistant',
                  'Unlimited quizzes',
                  'Advanced analytics & weakness breakdown',
                  '4 streak freezes per month',
                  'Marathon mode with 50-min pomodoros',
                  'Priority access to new features',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <Check
                      size={14}
                      strokeWidth={1.5}
                      className="text-[var(--color-accent)] mt-0.5 shrink-0"
                    />
                    <span className="text-[14px] text-[var(--color-ink-2)]">{item}</span>
                  </li>
                ))}
              </ul>

              <Button variant="accent" size="lg" className="w-full" asChild>
                <Link href="/signup">Start free, upgrade anytime</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Separator />

      {/* ── 8. FAQ ───────────────────────────────────────────────────────────── */}
      <section className="py-24">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-12">
            {/* Left — heading */}
            <div className="lg:col-span-4 mb-10 lg:mb-0">
              <p className="text-[11px] font-mono font-medium tracking-[0.12em] uppercase text-[var(--color-ink-3)] mb-4">
                FAQ
              </p>
              <h2
                className="text-[var(--color-ink)] leading-[1.15] tracking-[-0.02em]"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(1.5rem, 2.5vw, 2.25rem)',
                  fontWeight: 500,
                }}
              >
                Questions candidates ask us
              </h2>
            </div>

            {/* Right — accordion-style list */}
            <div className="lg:col-span-8 divide-y divide-[var(--color-rule)]">
              {[
                {
                  q: 'Is Propella really free?',
                  a: 'Yes. The Free plan gives you a full roadmap for one exam, daily quizzes, and 20 AI assistant messages a day — no card required. Scholar adds unlimited usage and deeper analytics for students who want more.',
                },
                {
                  q: 'Does Propella cover JAMB, WAEC, and NECO?',
                  a: 'Yes, all three. Each exam has its own syllabus mapping, so the topics, practice questions, and mock exams you see are matched to the specific exam and subjects you select.',
                },
                {
                  q: "How is this different from just reading past questions?",
                  a: "Past questions show you what was asked before — they don't tell you which topics you're actually weak in, or when to revisit them. Propella tracks your performance per topic and schedules revision automatically, so weak areas get more attention without you having to plan that yourself.",
                },
                {
                  q: 'Can I use Propella on my phone?',
                  a: 'Yes. Propella works in any mobile browser, so you can study, take quizzes, and chat with the AI tutor from your phone without installing anything.',
                },
                {
                  q: "What if I'm preparing for more than one exam?",
                  a: "You can add multiple exams to your account. Each one gets its own roadmap and revision schedule, so studying for WAEC and JAMB at the same time doesn't mean mixing up your syllabi.",
                },
                {
                  q: 'Do I need internet access to study?',
                  a: 'Yes, Propella requires an internet connection since your progress, quizzes, and AI tutor responses are generated and saved in real time.',
                },
              ].map((item) => (
                <details key={item.q} className="group py-5">
                  <summary className="flex items-center justify-between cursor-pointer list-none">
                    <span className="text-[15px] font-medium text-[var(--color-ink)] pr-4">
                      {item.q}
                    </span>
                    <span className="text-[var(--color-ink-3)] text-[20px] leading-none shrink-0 group-open:rotate-45 transition-transform">
                      +
                    </span>
                  </summary>
                  <p className="text-[14px] leading-[1.6] text-[var(--color-ink-2)] mt-3 max-w-[600px]">
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Separator />

      {/* ── 9. Final CTA ─────────────────────────────────────────────────────── */}
      <section className="py-28">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          {/* Text beside the photograph on desktop; stacked on a phone, with the
              words first so the call to action is never below the fold. */}
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
            <div className="max-w-[640px]">
              <h2
                className="text-[var(--color-ink)] leading-[1.05] tracking-[-0.02em] mb-6"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)',
                  fontWeight: 500,
                }}
              >
                Your exam success starts here.
              </h2>
              <p className="text-[17px] leading-[1.6] text-[var(--color-ink-2)] mb-8 max-w-[480px]">
                Join students preparing smarter with Propella.
              </p>
              <Button variant="accent" size="lg" asChild>
                <Link href="/signup">Build my roadmap</Link>
              </Button>
            </div>

            <div
              className="mt-12 overflow-hidden rounded-[var(--radius-lg)] lg:mt-0"
              style={{ backgroundColor: 'var(--color-paper-3)' }}
            >
              <Image
                src="/images/student-studying.jpg"
                alt="A student working through past questions on a laptop"
                width={2000}
                height={1333}
                className="h-full w-full object-cover"
                style={{ aspectRatio: '4 / 3' }}
                sizes="(max-width: 1024px) 100vw, 560px"
              />
            </div>
          </div>
        </div>
      </section>

      <Separator />

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer className="py-16 bg-[var(--color-paper)]">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
            {/* Wordmark */}
            <div className="col-span-2 md:col-span-1">
              <p
                className="text-[20px] leading-none tracking-[-0.02em] text-[var(--color-ink)] mb-3"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Propella
              </p>
              <p className="text-[13px] text-[var(--color-ink-3)] leading-[1.6] max-w-[200px]">
                Structured exam preparation for JAMB, WAEC, and NECO candidates.
              </p>
            </div>

            {/* Product */}
            <div>
              <p className="text-[11px] font-mono font-medium tracking-[0.1em] uppercase text-[var(--color-ink-3)] mb-4">
                Product
              </p>
              <ul className="space-y-2.5">
                {[
                  { label: 'How it works', href: '#how-it-works' },
                  { label: 'Pricing', href: '/pricing' },
                  { label: 'Mock exams', href: '/signup' },
                  { label: 'Study roadmap', href: '/signup' },
                ].map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-[14px] text-[var(--color-ink-2)] hover:text-[var(--color-ink)] transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <p className="text-[11px] font-mono font-medium tracking-[0.1em] uppercase text-[var(--color-ink-3)] mb-4">
                Company
              </p>
              <ul className="space-y-2.5">
                {[
                  { label: 'About', href: '/about' },
                  { label: 'Blog', href: '/blog' },
                  { label: 'Contact', href: '/contact' },
                ].map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-[14px] text-[var(--color-ink-2)] hover:text-[var(--color-ink)] transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <p className="text-[11px] font-mono font-medium tracking-[0.1em] uppercase text-[var(--color-ink-3)] mb-4">
                Legal
              </p>
              <ul className="space-y-2.5">
                {[
                  { label: 'Privacy policy', href: '/privacy' },
                  { label: 'Terms of use', href: '/terms' },
                  { label: 'Support', href: 'mailto:support@propella.app' },
                ].map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-[14px] text-[var(--color-ink-2)] hover:text-[var(--color-ink)] transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <Separator className="mb-6" />

          <p className="text-[13px] text-[var(--color-ink-3)]">
            &copy; {year} Propella. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}