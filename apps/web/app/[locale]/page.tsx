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
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Award,
  Star,
  BookOpen,
  Users,
  Crown,
  Heart,
  Gift,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { StickyNav } from '@/components/marketing/sticky-nav'

// ─── Hero topic card ─────────────────────────────────────────────────────────

function HeroTopicCard() {
  return (
    <div
      className="bg-[var(--color-card)]/95 backdrop-blur-md border border-[var(--color-rule)] rounded-2xl overflow-hidden shadow-xl max-w-[340px] w-full"
    >
      {/* accent top/left bar */}
      <div className="flex">
        <div className="w-1.5 bg-[var(--color-accent)] shrink-0" />
        <div className="flex-1 p-5">
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-mono font-medium text-[var(--color-accent)] uppercase tracking-wider">
                Active Topic
              </span>
              <span className="text-[11px] font-mono text-[var(--color-ink-3)]">Topic 8 of 15</span>
            </div>
            <h3
              className="text-[18px] leading-[1.3] font-semibold tracking-[-0.01em] text-[var(--color-ink)]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Quadratic Equations
            </h3>
            <p className="text-[12px] text-[var(--color-ink-3)] font-mono">
              Mathematics · JAMB &amp; WAEC
            </p>
          </div>

          {/* mastery bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] text-[var(--color-ink-3)] font-mono uppercase tracking-[0.06em]">
                Mastery Score
              </span>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                84% · Ready
              </span>
            </div>
            <div className="h-2 bg-[var(--color-paper-3)] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[var(--color-accent)] to-emerald-500 rounded-full"
                style={{ width: '84%' }}
              />
            </div>
          </div>

          {/* next revision */}
          <div className="flex items-center justify-between pt-2 border-t border-[var(--color-rule)]">
            <div className="flex items-center gap-1.5">
              <CalendarDays size={13} strokeWidth={1.5} className="text-[var(--color-accent)]" />
              <span className="text-[12px] text-[var(--color-ink-2)] font-medium">Review in 2 days</span>
            </div>
            <Badge variant="success" className="text-[10px] px-2 py-0.5">
              Spaced Recall Active
            </Badge>
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
    <div className="min-h-screen bg-[var(--color-paper)] text-[var(--color-ink)] selection:bg-[var(--color-accent-tint)] selection:text-[var(--color-accent)]">
      <StickyNav />

      {/* ── 1. Hero ────────────────────────────────────────────────────────── */}
      <section className="relative pt-24 pb-20 lg:pt-36 lg:pb-28 overflow-hidden border-b border-[var(--color-rule)]">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-14 lg:items-center">
            {/* Left col */}
            <div className="lg:col-span-7">
              {/* eyebrow badge */}
              <div className="inline-flex items-center gap-2 mb-6">
                <Badge variant="accent" className="px-3.5 py-1 text-xs font-mono tracking-wide shadow-sm">
                  ✨ Nigeria&apos;s #1 AI CBT &amp; Exam Prep Platform
                </Badge>
              </div>

              {/* headline */}
              <h1
                className="text-[var(--color-ink)] mb-6 leading-[1.05] tracking-[-0.025em] font-semibold"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(2.5rem, 5vw, 4.25rem)',
                }}
              >
                Stop trying to cram<br />
                to pass JAMB.
              </h1>

              {/* subhead */}
              <p
                className="text-[17px] sm:text-[18px] leading-[1.65] text-[var(--color-ink-2)] mb-8"
                style={{ maxWidth: '560px' }}
              >
                Boost your score and confidence with a system that breaks down your official
                syllabus into daily bite-sized topics, 6,994+ real CBT past questions, and automated spaced revision.
              </p>

              {/* value pillars */}
              <div className="mb-8 space-y-2.5 max-w-[540px]">
                <div className="flex items-center gap-2.5 text-[14.5px] text-[var(--color-ink-2)]">
                  <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span><strong>No more random reading</strong> — complete official JAMB, WAEC &amp; NECO syllabi.</span>
                </div>
                <div className="flex items-center gap-2.5 text-[14.5px] text-[var(--color-ink-2)]">
                  <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span><strong>No more forgetting before exams</strong> — automated spaced review schedules.</span>
                </div>
                <div className="flex items-center gap-2.5 text-[14.5px] text-[var(--color-ink-2)]">
                  <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span><strong>Distractions into distinctions</strong> — earn scrolling time by answering questions daily.</span>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 mb-8">
                <Button variant="accent" size="lg" className="shadow-lg shadow-[var(--color-accent)]/20 text-base" asChild>
                  <Link href="/signup">
                    Help me pass JAMB
                    <ArrowRight size={16} className="ml-2" />
                  </Link>
                </Button>
                <Button variant="secondary" size="lg" className="text-base" asChild>
                  <a href="#how-it-works">See how it works</a>
                </Button>
              </div>

              {/* Trust Badges Bar */}
              <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-[var(--color-rule)] text-xs text-[var(--color-ink-3)] font-mono">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                  6,994 Past Questions
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                  Real CBT Exam Simulation
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                  Target 300+ Score Engine
                </span>
              </div>
            </div>

            {/* Right col — hero student image with floating cards */}
            <div className="hidden lg:flex lg:col-span-5 lg:justify-center lg:items-center mt-12 lg:mt-0">
              <div className="relative w-full max-w-[440px] pb-10">
                <div className="relative rounded-2xl overflow-hidden aspect-[4/3] border border-[var(--color-rule)] shadow-2xl bg-[var(--color-paper-2)]">
                  <Image
                    src="https://images.unsplash.com/photo-1531545514256-b1400bc00f31?auto=format&fit=crop&w=1000&q=80"
                    alt="African student studying with laptop preparing for JAMB exam"
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-mono text-emerald-400 border border-white/10 flex items-center gap-2 shadow-lg">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Live CBT Simulation
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 bg-white/95 dark:bg-black/90 backdrop-blur-md p-3.5 rounded-xl border border-white/20 shadow-md">
                    <div className="flex items-center justify-between text-xs font-semibold text-[var(--color-ink)]">
                      <span>UTME 2026 Prediction</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">Predicted Score: 318 / 400</span>
                    </div>
                    <div className="w-full h-1.5 bg-[var(--color-paper-3)] rounded-full mt-2 overflow-hidden">
                      <div className="h-full bg-emerald-500 w-[79.5%]" />
                    </div>
                  </div>
                </div>

                {/* Floating topic card */}
                <div className="absolute -bottom-4 -left-6 right-6 z-10">
                  <HeroTopicCard />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. The repetition problem ───────────────────────────────────────── */}
      <section className="py-24 bg-[var(--color-paper-2)] border-b border-[var(--color-rule)]">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-start mb-16">
            {/* Left — headline */}
            <div>
              <p className="text-[11px] font-mono font-medium tracking-[0.12em] uppercase text-[var(--color-accent)] mb-4">
                The Science of Exam Retention
              </p>
              <h2
                className="text-[var(--color-ink)] leading-[1.1] tracking-[-0.02em]"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)',
                  fontWeight: 500,
                }}
              >
                The problem isn&apos;t that you didn&apos;t study. It&apos;s that cramming doesn&apos;t last until exam day.
              </h2>
            </div>

            {/* Right — body copy */}
            <div className="mt-8 lg:mt-0 space-y-4">
              <p className="text-[15.5px] leading-[1.65] text-[var(--color-ink-2)]">
                Most candidates read a topic once — maybe twice — and move on. By exam day, the
                early material has faded. The connections between topics never form, and unexpected questions throw you off.
              </p>
              <p className="text-[15.5px] leading-[1.65] text-[var(--color-ink-2)]">
                Propella replaces frantic cramming with a personalised algorithm that tracks your performance
                across every topic, automatically resurfacing difficult questions right before you forget them.
              </p>
              <p className="text-[15.5px] leading-[1.65] text-[var(--color-ink-2)] font-medium">
                Study with structure. Practice with confidence. Walk into your exam with total peace of mind.
              </p>
            </div>
          </div>

          {/* 3 Pillar Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="rounded-2xl border border-[var(--color-rule)] bg-[var(--color-paper)] p-6 shadow-sm hover:border-[var(--color-accent)]/50 transition-all">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
                <RotateCcw size={20} />
              </div>
              <h3 className="text-lg font-semibold text-[var(--color-ink)] mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                The Cramming Trap
              </h3>
              <p className="text-sm text-[var(--color-ink-2)] leading-relaxed">
                Reading 100 pages the week before the exam causes immediate mental fatigue and poor question recall during real CBT exams.
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--color-rule)] bg-[var(--color-paper)] p-6 shadow-sm hover:border-[var(--color-accent)]/50 transition-all">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
                <Activity size={20} />
              </div>
              <h3 className="text-lg font-semibold text-[var(--color-ink)] mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                Active Recall Testing
              </h3>
              <p className="text-sm text-[var(--color-ink-2)] leading-relaxed">
                Testing yourself on verified past questions forces your brain to retrieve knowledge, cementing it permanently into long-term memory.
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--color-rule)] bg-[var(--color-paper)] p-6 shadow-sm hover:border-[var(--color-accent)]/50 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                <TrendingUp size={20} />
              </div>
              <h3 className="text-lg font-semibold text-[var(--color-ink)] mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                Spaced Revision Engine
              </h3>
              <p className="text-sm text-[var(--color-ink-2)] leading-relaxed">
                Propella calculates your forgetting curve for each subject. Topics you struggle with reappear sooner; mastered topics rest longer.
              </p>
            </div>
          </div>

          {/* Photograph */}
          <div
            className="overflow-hidden rounded-2xl border border-[var(--color-rule)] shadow-lg"
            style={{ backgroundColor: 'var(--color-paper-3)' }}
          >
            <Image
              src="/images/students-group.jpg"
              alt="Secondary school students together outside their classroom preparing for exams"
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

      {/* ── 3. How it works ────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 border-b border-[var(--color-rule)]">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-8">
          {/* section label */}
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-[11px] font-mono font-medium tracking-[0.12em] uppercase text-[var(--color-accent)] mb-3">
              Step-by-step roadmap
            </p>
            <h2
              className="text-[var(--color-ink)] leading-[1.1] tracking-[-0.02em]"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
                fontWeight: 500,
              }}
            >
              How Propella Guides You to 300+
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 01 */}
            <div className="rounded-2xl border border-[var(--color-rule)] bg-[var(--color-paper-2)] p-8 relative flex flex-col justify-between shadow-sm">
              <div>
                <div className="w-10 h-10 rounded-full bg-[var(--color-accent-tint)] text-[var(--color-accent)] font-mono font-bold text-sm flex items-center justify-center mb-6 border border-[var(--color-accent)]/20">
                  01
                </div>
                <h3
                  className="text-[19px] leading-[1.3] font-semibold text-[var(--color-ink)] mb-3"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Select Exam &amp; Subjects
                </h3>
                <p className="text-[14.5px] leading-[1.65] text-[var(--color-ink-2)]">
                  Pick JAMB UTME, WAEC SSCE, or NECO, enter your 4 or 8 subjects, and set your target date.
                  Propella automatically structures a personalized roadmap mapped to official syllabi.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[var(--color-rule)] text-xs font-mono text-[var(--color-ink-3)]">
                JAMB · WAEC · NECO · Undergraduate
              </div>
            </div>

            {/* Step 02 */}
            <div className="rounded-2xl border border-[var(--color-rule)] bg-[var(--color-paper-2)] p-8 relative flex flex-col justify-between shadow-sm">
              <div>
                <div className="w-10 h-10 rounded-full bg-[var(--color-accent-tint)] text-[var(--color-accent)] font-mono font-bold text-sm flex items-center justify-center mb-6 border border-[var(--color-accent)]/20">
                  02
                </div>
                <h3
                  className="text-[19px] leading-[1.3] font-semibold text-[var(--color-ink)] mb-3"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Daily Bites &amp; Real CBT Practice
                </h3>
                <p className="text-[14.5px] leading-[1.65] text-[var(--color-ink-2)]">
                  Study concise topic notes, tackle verified past questions, and chat with your AI study companion
                  for step-by-step problem breakdowns — always strictly within your syllabus.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[var(--color-rule)] text-xs font-mono text-[var(--color-ink-3)]">
                Instant Explanations · Step-by-Step AI
              </div>
            </div>

            {/* Step 03 */}
            <div className="rounded-2xl border border-[var(--color-rule)] bg-[var(--color-paper-2)] p-8 relative flex flex-col justify-between shadow-sm">
              <div>
                <div className="w-10 h-10 rounded-full bg-[var(--color-accent-tint)] text-[var(--color-accent)] font-mono font-bold text-sm flex items-center justify-center mb-6 border border-[var(--color-accent)]/20">
                  03
                </div>
                <h3
                  className="text-[19px] leading-[1.3] font-semibold text-[var(--color-ink)] mb-3"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Automated Spaced Retention
                </h3>
                <p className="text-[14.5px] leading-[1.65] text-[var(--color-ink-2)]">
                  The algorithm tracks your weakness score per topic. Tricky topics reappear just when you need them.
                  Your entire syllabus moves from &ldquo;seen once&rdquo; to complete mastery.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[var(--color-rule)] text-xs font-mono text-[var(--color-ink-3)]">
                Zero Forgetting · Confident Recall
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Features ──────────────────────────────────────────────────────── */}
      <section className="py-24 bg-[var(--color-paper-2)] border-b border-[var(--color-rule)]">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-8">
          <div className="max-w-2xl mb-14">
            <p className="text-[11px] font-mono font-medium tracking-[0.12em] uppercase text-[var(--color-accent)] mb-3">
              Platform Features
            </p>
            <h2
              className="text-[var(--color-ink)] leading-[1.15] tracking-[-0.02em]"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
                fontWeight: 500,
              }}
            >
              Everything you need to pass in one sitting.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="rounded-2xl border border-[var(--color-rule)] bg-[var(--color-paper)] p-7 shadow-sm hover:border-[var(--color-accent)]/50 transition-all">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-tint)] text-[var(--color-accent)] flex items-center justify-center mb-4">
                <Activity size={20} />
              </div>
              <h3 className="text-[17px] font-semibold text-[var(--color-ink)] mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                AI Diagnostic Test
              </h3>
              <p className="text-[14px] leading-[1.6] text-[var(--color-ink-2)]">
                Pinpoint your exact strengths and hidden syllabus weaknesses across all subjects in 15 minutes.
              </p>
            </div>

            {/* Card 2 */}
            <div className="rounded-2xl border border-[var(--color-rule)] bg-[var(--color-paper)] p-7 shadow-sm hover:border-[var(--color-accent)]/50 transition-all">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-tint)] text-[var(--color-accent)] flex items-center justify-center mb-4">
                <Compass size={20} />
              </div>
              <h3 className="text-[17px] font-semibold text-[var(--color-ink)] mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                Personalized Study Roadmap
              </h3>
              <p className="text-[14px] leading-[1.6] text-[var(--color-ink-2)]">
                A daily reading and practice planner that calculates exactly how many topics you must cover per week.
              </p>
            </div>

            {/* Card 3 */}
            <div className="rounded-2xl border border-[var(--color-rule)] bg-[var(--color-paper)] p-7 shadow-sm hover:border-[var(--color-accent)]/50 transition-all">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-tint)] text-[var(--color-accent)] flex items-center justify-center mb-4">
                <FileText size={20} />
              </div>
              <h3 className="text-[17px] font-semibold text-[var(--color-ink)] mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                6,994+ CBT Question Bank
              </h3>
              <p className="text-[14px] leading-[1.6] text-[var(--color-ink-2)]">
                Real JAMB and WAEC past questions with verified step-by-step solutions and diagrammatic breakdowns.
              </p>
            </div>

            {/* Card 4 */}
            <div className="rounded-2xl border border-[var(--color-rule)] bg-[var(--color-paper)] p-7 shadow-sm hover:border-[var(--color-accent)]/50 transition-all">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-tint)] text-[var(--color-accent)] flex items-center justify-center mb-4">
                <RotateCcw size={20} />
              </div>
              <h3 className="text-[17px] font-semibold text-[var(--color-ink)] mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                Smart Spaced Revision
              </h3>
              <p className="text-[14px] leading-[1.6] text-[var(--color-ink-2)]">
                Never wonder &ldquo;what should I revise today?&rdquo; Propella queues the exact questions you need to review.
              </p>
            </div>

            {/* Card 5 */}
            <div className="rounded-2xl border border-[var(--color-rule)] bg-[var(--color-paper)] p-7 shadow-sm hover:border-[var(--color-accent)]/50 transition-all">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-tint)] text-[var(--color-accent)] flex items-center justify-center mb-4">
                <Sparkles size={20} />
              </div>
              <h3 className="text-[17px] font-semibold text-[var(--color-ink)] mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                Syllabus-Trained AI Tutor
              </h3>
              <p className="text-[14px] leading-[1.6] text-[var(--color-ink-2)]">
                Stuck on a tricky math formula or chemistry equation? Get simplified answers with zero distractions.
              </p>
            </div>

            {/* Card 6 */}
            <div className="rounded-2xl border border-[var(--color-rule)] bg-[var(--color-paper)] p-7 shadow-sm hover:border-[var(--color-accent)]/50 transition-all">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-tint)] text-[var(--color-accent)] flex items-center justify-center mb-4">
                <Smartphone size={20} />
              </div>
              <h3 className="text-[17px] font-semibold text-[var(--color-ink)] mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                Distraction-to-Distinction Lock
              </h3>
              <p className="text-[14px] leading-[1.6] text-[var(--color-ink-2)]">
                Earn scrolling time on social media by answering practice questions daily and maintaining study streaks.
              </p>
            </div>
          </div>

          {/* Section CTA */}
          <div className="mt-12 text-center">
            <Button variant="accent" size="lg" asChild>
              <Link href="/signup">
                Start Practicing Free Now
                <ArrowRight size={16} className="ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── 5. Testimonials ──────────────────────────────────────────────────── */}
      <section className="py-24 border-b border-[var(--color-rule)]">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-[11px] font-mono font-medium tracking-[0.12em] uppercase text-[var(--color-accent)] mb-3">
              Success Stories
            </p>
            <h2
              className="text-[var(--color-ink)] leading-[1.15] tracking-[-0.02em]"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
                fontWeight: 500,
              }}
            >
              Real Nigerian candidates, real distinction scores.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote:
                  "I went from guessing answers to actually understanding why each one was correct. My mock scores jumped from 210 to 312 in six weeks.",
                name: 'Chiamaka O.',
                detail: 'JAMB UTME · Scored 312',
                score: '312 / 400',
                exam: 'JAMB Candidate, Lagos',
              },
              {
                quote:
                  "The revision reminders forced me to go back to topics I thought I already knew. It helped me clear 7 A1s in my WAEC results.",
                name: 'Tunde A.',
                detail: 'WAEC SSCE · 7 A1s',
                score: '7 A1s Distinction',
                exam: 'WAEC Candidate, Ibadan',
              },
              {
                quote:
                  "I loved that the AI tutor only answered questions from my syllabus. No random internet distractions, just laser-focused prep.",
                name: 'Blessing E.',
                detail: 'NECO & JAMB · Scored 298',
                score: '298 / 400',
                exam: 'Pre-Varsity Student, Jos',
              },
            ].map((t) => (
              <div
                key={t.name}
                className="bg-[var(--color-paper-2)] border border-[var(--color-rule)] rounded-2xl p-7 shadow-sm flex flex-col justify-between hover:border-[var(--color-accent)]/40 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex text-amber-500 gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} className="fill-amber-400 text-amber-500" />
                      ))}
                    </div>
                    <Badge variant="accent" className="text-[10px] font-mono">
                      {t.score}
                    </Badge>
                  </div>
                  <p className="text-[15px] leading-[1.65] text-[var(--color-ink-2)] mb-6 italic">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </div>
                <div className="pt-4 border-t border-[var(--color-rule)] flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--color-accent-tint)] text-[var(--color-accent)] font-bold text-sm flex items-center justify-center font-mono">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-[var(--color-ink)]">{t.name}</p>
                    <p className="text-[12px] text-[var(--color-ink-3)] font-mono">{t.exam}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. Live Quiz preview ──────────────────────────────────────────────── */}
      <section className="py-24 bg-[var(--color-paper-2)] border-b border-[var(--color-rule)]">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-14 lg:items-center">
            {/* Left — copy */}
            <div className="lg:col-span-6">
              <div className="flex items-center gap-2 mb-4">
                <Zap size={18} strokeWidth={1.5} className="text-[var(--color-accent)]" />
                <p className="text-[11px] font-mono font-medium tracking-[0.12em] uppercase text-[var(--color-accent)]">
                  Active CBT Practice
                </p>
              </div>
              <h2
                className="text-[var(--color-ink)] leading-[1.1] tracking-[-0.02em] mb-5 font-semibold"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
                }}
              >
                Practice one authentic past question at a time.
              </h2>
              <p className="text-[15.5px] leading-[1.65] text-[var(--color-ink-2)] mb-8 max-w-[480px]">
                Test your knowledge under real exam timing conditions. Get immediate diagnostic feedback,
                explanations for every option, and watch your readiness score climb daily.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Button variant="accent" size="lg" asChild>
                  <Link href="/signup">Try a free quiz now</Link>
                </Button>
                <span className="text-xs font-mono text-[var(--color-ink-3)]">
                  ⚡ 5 questions/day on Free Plan
                </span>
              </div>
            </div>

            {/* Right — quiz preview card */}
            <div className="lg:col-span-6 mt-12 lg:mt-0">
              <div
                className="bg-[var(--color-card)] border border-[var(--color-rule)] rounded-2xl p-7 max-w-[460px] mx-auto shadow-xl"
              >
                <div className="flex items-center justify-between mb-5 pb-3 border-b border-[var(--color-rule)]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[12px] font-mono text-[var(--color-ink-2)] font-semibold uppercase tracking-wider">
                      JAMB Chemistry · 2024 Past Question
                    </span>
                  </div>
                  <Badge variant="warning" className="font-mono text-xs">
                    ⏱️ 00:42
                  </Badge>
                </div>
                <p className="text-[15.5px] font-medium leading-[1.5] text-[var(--color-ink)] mb-6">
                  Which of the following is the correct IUPAC name for CH₃CH₂OH?
                </p>
                <div className="space-y-3 mb-6">
                  {[
                    { label: 'A', text: 'Methanol', correct: false },
                    { label: 'B', text: 'Ethanol', correct: true },
                    { label: 'C', text: 'Propanol', correct: false },
                    { label: 'D', text: 'Ethanoic acid', correct: false },
                  ].map((option) => (
                    <div
                      key={option.label}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border text-[14px] transition-all ${
                        option.correct
                          ? 'border-[var(--color-accent)] bg-[var(--color-accent-tint)] text-[var(--color-ink)] font-semibold shadow-sm ring-1 ring-[var(--color-accent)]/30'
                          : 'border-[var(--color-rule)] bg-[var(--color-paper)] text-[var(--color-ink-2)] opacity-80'
                      }`}
                    >
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs ${
                        option.correct
                          ? 'bg-[var(--color-accent)] text-white'
                          : 'bg-[var(--color-paper-2)] text-[var(--color-ink-3)]'
                      }`}>
                        {option.label}
                      </span>
                      <span>{option.text}</span>
                      {option.correct && (
                        <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 ml-auto" />
                      )}
                    </div>
                  ))}
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
                  <Sparkles size={14} className="shrink-0 mt-0.5" />
                  <span>
                    <strong>AI Tutor Note:</strong> Ethanol is a primary alcohol with 2 carbon atoms (eth-) and a single bond (-an-) with an -OH functional group (-ol).
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. PRICING (Updated to fit official subscriptions) ────────────────── */}
      <section id="pricing" className="py-24 border-b border-[var(--color-rule)] bg-[var(--color-paper)]">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-8">
          {/* heading */}
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="accent" className="mb-3 px-3 py-1 text-xs font-mono">
              Transparent Student Pricing
            </Badge>
            <h2
              className="text-[var(--color-ink)] leading-[1.1] tracking-[-0.02em] font-semibold mb-4"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2rem, 4vw, 3rem)',
              }}
            >
              Start free. Upgrade when you are ready.
            </h2>
            <p className="text-[15.5px] text-[var(--color-ink-2)]">
              Choose the study plan that fits your preparation timetable. No hidden fees, instant activation via Paystack.
            </p>
          </div>

          {/* 4 Plan Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {/* 1. Free Starter */}
            <div className="flex flex-col justify-between rounded-2xl border border-[var(--color-rule)] bg-[var(--color-card)] p-6 shadow-sm hover:border-[var(--color-accent)]/40 transition-all">
              <div>
                <p className="text-xs font-mono font-bold tracking-wider uppercase text-[var(--color-ink-3)] mb-2">
                  Free Starter
                </p>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl font-extrabold text-[var(--color-ink)] font-mono">₦0</span>
                  <span className="text-xs text-[var(--color-ink-3)]">/ forever</span>
                </div>
                <p className="text-xs text-[var(--color-ink-3)] mb-5">
                  Explore official syllabus topic maps and test your baseline knowledge.
                </p>

                <div className="h-px bg-[var(--color-rule)] mb-5" />

                <ul className="space-y-3 mb-6">
                  {[
                    { text: '5 practice questions per day', included: true },
                    { text: 'Access to official syllabus topics', included: true },
                    { text: 'Basic AI tutor explanations (3 queries/day)', included: true },
                    { text: 'Standard progress tracker', included: true },
                    { text: 'Full timed CBT mock simulations', included: false },
                    { text: '6,994 past questions library', included: false },
                  ].map((f, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs">
                      <Check
                        size={14}
                        className={f.included ? 'text-emerald-500 shrink-0 mt-0.5' : 'text-gray-300 dark:text-gray-600 shrink-0 mt-0.5'}
                      />
                      <span className={f.included ? 'text-[var(--color-ink)]' : 'text-[var(--color-ink-3)] line-through'}>
                        {f.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button variant="secondary" className="w-full font-semibold" asChild>
                <Link href="/signup">Get Started Free</Link>
              </Button>
            </div>

            {/* 2. Basic Plan */}
            <div className="flex flex-col justify-between rounded-2xl border border-[var(--color-rule)] bg-[var(--color-card)] p-6 shadow-sm hover:border-[var(--color-accent)] transition-all">
              <div>
                <p className="text-xs font-mono font-bold tracking-wider uppercase text-[var(--color-accent)] mb-2">
                  Basic Plan
                </p>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl font-extrabold text-[var(--color-ink)] font-mono">₦1,999</span>
                  <span className="text-xs text-[var(--color-ink-3)]">/ 30 days</span>
                </div>
                <p className="text-xs text-[var(--color-ink-3)] mb-5">
                  Full Scholar access for 1 student account for a productive 30-day sprint.
                </p>

                <div className="h-px bg-[var(--color-rule)] mb-5" />

                <ul className="space-y-3 mb-6">
                  {[
                    'Full Scholar access for 1 student (30 days)',
                    '6,994+ CBT past questions with solutions',
                    'Unlimited timed JAMB, WAEC & NECO mocks',
                    'AI tutor explanations & hints on tricky questions',
                    'Spaced revision planner & study roadmap',
                  ].map((text, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-[var(--color-ink)]">
                      <Check size={14} className="text-[var(--color-accent)] shrink-0 mt-0.5" />
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button variant="secondary" className="w-full font-semibold border-[var(--color-accent)]/30 hover:bg-[var(--color-accent)]/10" asChild>
                <Link href="/signup?plan=scholar_basic">Choose Basic (₦1,999)</Link>
              </Button>
            </div>

            {/* 3. Shared Plan (Two Accounts) */}
            <div className="flex flex-col justify-between rounded-2xl border-2 border-[var(--color-accent)] bg-[var(--color-card)] p-6 shadow-xl relative">
              <Badge variant="accent" className="absolute -top-3 right-4 shadow-sm text-[10px] font-mono">
                👥 Two Accounts (Save 25%)
              </Badge>

              <div>
                <p className="text-xs font-mono font-bold tracking-wider uppercase text-[var(--color-accent)] mb-2">
                  Shared Plan
                </p>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl font-extrabold text-[var(--color-ink)] font-mono">₦2,999</span>
                  <span className="text-xs text-[var(--color-ink-3)]">/ 30 days</span>
                </div>
                <p className="text-xs text-[var(--color-ink-3)] mb-5">
                  Buy one plan and share with a friend or family member (<strong>only ₦1,500/student</strong>).
                </p>

                <div className="h-px bg-[var(--color-rule)] mb-5" />

                <ul className="space-y-3 mb-6">
                  {[
                    '👥 Full Scholar access for 2 separate accounts',
                    'Buy once and share with friend or family',
                    'Independent progress & scores for each student',
                    '6,994+ CBT past questions & timed mock exams',
                    'Unlimited AI tutor explanations on every device',
                  ].map((text, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-[var(--color-ink)] font-medium">
                      <Check size={14} className="text-[var(--color-accent)] shrink-0 mt-0.5" />
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button variant="accent" className="w-full font-semibold shadow-md" asChild>
                <Link href="/signup?plan=scholar_shared">Get Shared Plan (₦2,999)</Link>
              </Button>
            </div>

            {/* 4. Pay Once Till Exam (Best Value) */}
            <div className="flex flex-col justify-between rounded-2xl border-2 border-amber-400 dark:border-amber-500 bg-gradient-to-b from-amber-500/5 via-[var(--color-card)] to-[var(--color-card)] p-6 shadow-xl relative">
              <Badge className="absolute -top-3 right-4 shadow-sm text-[10px] font-mono bg-amber-500 hover:bg-amber-600 text-white border-0">
                ⭐ Most Popular · Till Exam
              </Badge>

              <div>
                <p className="text-xs font-mono font-bold tracking-wider uppercase text-amber-600 dark:text-amber-400 mb-2">
                  Pay Once Till Exam
                </p>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl font-extrabold text-[var(--color-ink)] font-mono">₦9,999</span>
                  <span className="text-xs text-[var(--color-ink-3)]">/ one-time</span>
                </div>
                <p className="text-xs text-[var(--color-ink-3)] mb-5">
                  Complete Scholar access right up until your exam day — zero recurring renewals.
                </p>

                <div className="h-px bg-[var(--color-rule)] mb-5" />

                <ul className="space-y-3 mb-6">
                  {[
                    '⭐ Complete access until your exam day (full year)',
                    'Zero recurring renewals — pay once and relax',
                    'All 3 major exam tracks (JAMB, WAEC & NECO)',
                    'Undergraduate Course Files & Document AI included',
                    'Priority AI tutor responses & exam prediction engine',
                  ].map((text, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-[var(--color-ink)] font-medium">
                      <Check size={14} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button className="w-full font-semibold bg-amber-500 hover:bg-amber-600 text-white shadow-md border-0" asChild>
                <Link href="/signup?plan=scholar_full">Get Till Exam (₦9,999)</Link>
              </Button>
            </div>
          </div>

          {/* Gifting & Details link */}
          <div className="mt-12 text-center flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 font-semibold text-[var(--color-accent)] hover:underline"
            >
              <Heart size={15} className="text-rose-500" />
              Looking to subscribe for a friend or view full feature comparisons? View Pricing Details &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* ── 8. FAQ ───────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-[var(--color-paper-2)] border-b border-[var(--color-rule)]">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-14">
            {/* Left — heading */}
            <div className="lg:col-span-4 mb-10 lg:mb-0">
              <Badge variant="accent" className="mb-3 px-3 py-1 text-xs font-mono">
                Common Questions
              </Badge>
              <h2
                className="text-[var(--color-ink)] leading-[1.15] tracking-[-0.02em] font-semibold"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
                }}
              >
                Everything you need to know about Propella.
              </h2>
            </div>

            {/* Right — accordion-style list */}
            <div className="lg:col-span-8 divide-y divide-[var(--color-rule)]">
              {[
                {
                  q: 'Is Propella really free to start?',
                  a: 'Yes. The Free Starter plan gives you a full roadmap for your exam, 5 practice questions daily, and basic AI tutor explanations with zero card details required. You can upgrade to Scholar anytime.',
                },
                {
                  q: 'How does the Shared Plan (₦2,999) work?',
                  a: 'The Shared Plan allows 2 students to get full Scholar access for just ₦2,999 (₦1,500 each). Once activated, you receive an invite link to grant your friend or family member their own independent account with separate scores, mock histories, and progress tracking.',
                },
                {
                  q: 'What is the Pay Once Till Exam (₦9,999) package?',
                  a: 'Till Exam is our best value, one-time payment plan. It gives you 365 days of full Scholar access with no monthly renewals, covering all exams (JAMB, WAEC, NECO) and even 100L–500L Undergraduate courses.',
                },
                {
                  q: 'Does Propella cover JAMB, WAEC, and NECO?',
                  a: 'Yes, all three. Each exam has its own verified syllabus mapping, so the topics, practice questions, and mock exams you see are 100% aligned with the exact board guidelines.',
                },
                {
                  q: 'Can I study on my phone or low-end device?',
                  a: 'Yes! Propella is fully responsive and optimized to run smoothly on any mobile browser or laptop with minimal data usage.',
                },
                {
                  q: 'How does the distraction blocker / scrolling time reward work?',
                  a: 'Propella motivates consistent study habits: as you answer daily practice questions and maintain your revision streak, you unlock earned screen time, transforming social media distraction into academic distinction.',
                },
              ].map((item) => (
                <details key={item.q} className="group py-5">
                  <summary className="flex items-center justify-between cursor-pointer list-none">
                    <span className="text-[15.5px] font-semibold text-[var(--color-ink)] pr-4">
                      {item.q}
                    </span>
                    <span className="text-[var(--color-accent)] text-[22px] font-bold leading-none shrink-0 group-open:rotate-45 transition-transform">
                      +
                    </span>
                  </summary>
                  <p className="text-[14.5px] leading-[1.65] text-[var(--color-ink-2)] mt-3 max-w-[640px]">
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. Final CTA ─────────────────────────────────────────────────────── */}
      <section className="py-28 bg-[var(--color-paper)]">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-8">
          <div className="rounded-3xl border border-[var(--color-rule)] bg-gradient-to-br from-[var(--color-paper-2)] via-[var(--color-paper)] to-[var(--color-paper-2)] p-8 sm:p-14 shadow-lg">
            <div className="lg:grid lg:grid-cols-2 lg:gap-14 lg:items-center">
              <div>
                <Badge variant="accent" className="mb-4 px-3.5 py-1 text-xs font-mono">
                  Your Future Awaits
                </Badge>
                <h2
                  className="text-[var(--color-ink)] leading-[1.05] tracking-[-0.02em] mb-5 font-semibold"
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(2rem, 4vw, 3.25rem)',
                  }}
                >
                  Turn distractions into distinctions today.
                </h2>
                <p className="text-[16.5px] leading-[1.65] text-[var(--color-ink-2)] mb-8 max-w-[500px]">
                  Join thousands of Nigerian students building real confidence and aiming for 300+ in JAMB with Propella.
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  <Button variant="accent" size="lg" className="shadow-lg shadow-[var(--color-accent)]/25 text-base" asChild>
                    <Link href="/signup">
                      Build my study roadmap free
                      <ArrowRight size={16} className="ml-2" />
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="mt-10 lg:mt-0 overflow-hidden rounded-2xl border border-[var(--color-rule)] shadow-xl aspect-[4/3] relative">
                <Image
                  src="/images/student-studying.jpg"
                  alt="A student working through past questions on a laptop"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 560px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 dark:bg-black/90 backdrop-blur-md p-4 rounded-xl border border-white/20">
                  <p className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                    ✓ 6,994 Past Questions · Instant CBT Feedback
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer className="py-16 bg-[var(--color-paper-2)] border-t border-[var(--color-rule)]">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
            {/* Wordmark */}
            <div className="col-span-2 md:col-span-1">
              <p
                className="text-[22px] leading-none tracking-[-0.02em] text-[var(--color-ink)] mb-3 font-semibold"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Propella
              </p>
              <p className="text-[13px] text-[var(--color-ink-3)] leading-[1.6] max-w-[220px]">
                Nigeria&apos;s intelligent study companion for JAMB, WAEC, NECO, and Undergraduate scholars.
              </p>
            </div>

            {/* Product */}
            <div>
              <p className="text-[11px] font-mono font-medium tracking-[0.1em] uppercase text-[var(--color-ink-3)] mb-4">
                Exams &amp; Tools
              </p>
              <ul className="space-y-2.5">
                {[
                  { label: 'Highschool (JAMB & WAEC)', href: '/highschool' },
                  { label: 'Undergraduate Prep', href: '/undergraduate' },
                  { label: 'CBT Mock Simulations', href: '/signup' },
                  { label: 'Pricing & Plans', href: '/pricing' },
                ].map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-[14px] text-[var(--color-ink-2)] hover:text-[var(--color-accent)] transition-colors"
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
                Resources
              </p>
              <ul className="space-y-2.5">
                {[
                  { label: 'Student Testimonials', href: '/testimonials' },
                  { label: 'Design System', href: '/design-system' },
                  { label: 'Contact Support', href: '/contact' },
                ].map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-[14px] text-[var(--color-ink-2)] hover:text-[var(--color-accent)] transition-colors"
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
                Legal &amp; Trust
              </p>
              <ul className="space-y-2.5">
                {[
                  { label: 'Privacy Policy', href: '/privacy' },
                  { label: 'Terms of Service', href: '/terms' },
                  { label: 'Support Desk', href: 'mailto:support@propella.app' },
                ].map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-[14px] text-[var(--color-ink-2)] hover:text-[var(--color-accent)] transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <Separator className="mb-6" />

          <div className="flex flex-col sm:flex-row items-center justify-between text-[13px] text-[var(--color-ink-3)] gap-3">
            <p>&copy; {year} Propella. All rights reserved.</p>
            <p className="font-mono text-xs">Built for distinction in Nigerian Examinations.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}