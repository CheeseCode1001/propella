import Image from 'next/image'
import { Link } from '@/lib/i18n/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Sparkles, BookOpen, Clock, Award, ShieldCheck, ArrowRight } from 'lucide-react'

export const metadata = {
  title: 'Highschool & Pre-Varsity Exam Prep — JAMB, WAEC, NECO | Propella',
  description: 'Master JAMB, WAEC and NECO with 6,994 authentic past questions, real CBT mock simulations, and AI-powered step-by-step explanations.',
}

export default function HighschoolPage() {
  const subjects = [
    'Mathematics', 'English Language', 'Physics', 'Chemistry',
    'Biology', 'Economics', 'Government', 'Literature in English',
    'Commerce', 'Principles of Accounts', 'Agricultural Science', 'Civic Education'
  ]

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 border-b border-[var(--color-rule)] bg-[var(--color-paper)]">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="accent" className="mb-4 px-3 py-1 text-xs">
                Nigeria&apos;s #1 Exam Prep Platform
              </Badge>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[var(--color-ink)] leading-[1.12]">
                Target 300+ in JAMB and Straight A&apos;s in WAEC.
              </h1>
              <p className="mt-6 text-base sm:text-lg text-[var(--color-ink-2)] leading-relaxed max-w-xl">
                Ditch outdated question booklets. Propella combines 6,994 verified past questions, official syllabus topic maps, and real CBT mock exams designed for Nigerian secondary school students and UTME candidates.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Button size="lg" variant="accent" asChild>
                  <Link href="/signup">
                    Start Practicing Free
                    <ArrowRight size={16} className="ml-2" />
                  </Link>
                </Button>
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/pricing">View Plans & Pricing</Link>
                </Button>
              </div>

              <div className="mt-8 flex items-center gap-6 text-xs text-[var(--color-ink-3)] font-mono">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-500" /> 6,994 Past Questions
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-500" /> Real CBT Timer
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-500" /> AI Explanations
                </span>
              </div>
            </div>

            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden border border-[var(--color-rule)] shadow-2xl aspect-[4/3] bg-[var(--color-paper-2)]">
                {/* High quality imagery of African students studying */}
                <Image
                  src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1000&q=80"
                  alt="African students studying together with books and laptops"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 bg-white/90 dark:bg-black/80 backdrop-blur-md p-4 rounded-xl border border-white/20">
                  <div className="flex items-center justify-between text-xs font-semibold text-[var(--color-ink)]">
                    <span>UTME 2026 Simulation</span>
                    <span className="text-emerald-600 font-mono">Score: 318 / 400</span>
                  </div>
                  <div className="w-full h-1.5 bg-[var(--color-paper-3)] rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[79.5%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Exam Tracks Cards */}
      <section className="py-20 bg-[var(--color-paper-2)] border-b border-[var(--color-rule)]">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-[var(--color-ink)]">
              Tailored for Every Major Nigerian Examination
            </h2>
            <p className="mt-3 text-sm text-[var(--color-ink-2)]">
              Whether you are preparing for your O-Level certification or university entrance screening, each board has a dedicated study path.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* JAMB */}
            <div className="rounded-2xl border border-[var(--color-rule)] bg-[var(--color-paper)] p-7 shadow-sm hover:border-[var(--color-accent)] transition-all">
              <div className="w-12 h-12 rounded-xl bg-[var(--color-accent-tint)] text-[var(--color-accent)] flex items-center justify-center font-bold text-lg mb-5">
                UTME
              </div>
              <h3 className="text-xl font-bold text-[var(--color-ink)] mb-2">JAMB / UTME</h3>
              <p className="text-xs text-[var(--color-ink-2)] leading-relaxed mb-6">
                Master 4 combination subjects with realistic 120-minute, 180-question mock exams matching the exact Joint Admissions and Matriculation Board layout and 8-key keyboard controls.
              </p>
              <ul className="space-y-2.5 text-xs text-[var(--color-ink-2)] mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[var(--color-accent)]" /> Official JAMB Syllabus topics
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[var(--color-accent)]" /> 2000–2025 past papers
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[var(--color-accent)]" /> Negative marking & speed metrics
                </li>
              </ul>
              <Button variant="secondary" className="w-full text-xs font-semibold" asChild>
                <Link href="/signup">Practice JAMB Mocks</Link>
              </Button>
            </div>

            {/* WAEC */}
            <div className="rounded-2xl border border-[var(--color-rule)] bg-[var(--color-paper)] p-7 shadow-sm hover:border-[var(--color-accent)] transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold text-lg mb-5">
                WAEC
              </div>
              <h3 className="text-xl font-bold text-[var(--color-ink)] mb-2">WAEC / SSCE</h3>
              <p className="text-xs text-[var(--color-ink-2)] leading-relaxed mb-6">
                Prepare for Senior School Certificate Examination papers with comprehensive objective practice and detailed theoretical working steps approved by examiners.
              </p>
              <ul className="space-y-2.5 text-xs text-[var(--color-ink-2)] mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-blue-500" /> May/June & GCE past papers
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-blue-500" /> Step-by-step marking rubrics
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-blue-500" /> Diagram labeling and math proofs
                </li>
              </ul>
              <Button variant="secondary" className="w-full text-xs font-semibold" asChild>
                <Link href="/signup">Practice WAEC Past Papers</Link>
              </Button>
            </div>

            {/* NECO */}
            <div className="rounded-2xl border border-[var(--color-rule)] bg-[var(--color-paper)] p-7 shadow-sm hover:border-[var(--color-accent)] transition-all">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold text-lg mb-5">
                NECO
              </div>
              <h3 className="text-xl font-bold text-[var(--color-ink)] mb-2">NECO SSCE</h3>
              <p className="text-xs text-[var(--color-ink-2)] leading-relaxed mb-6">
                National Examinations Council questions categorized strictly by curriculum standards, ensuring you never miss a trick in national certificate papers.
              </p>
              <ul className="space-y-2.5 text-xs text-[var(--color-ink-2)] mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-purple-500" /> Verified question archives
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-purple-500" /> Topic-by-topic drills
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-purple-500" /> Weak area diagnostic tests
                </li>
              </ul>
              <Button variant="secondary" className="w-full text-xs font-semibold" asChild>
                <Link href="/signup">Practice NECO Questions</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Deep Dive */}
      <section className="py-20 bg-[var(--color-paper)] border-b border-[var(--color-rule)]">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative rounded-2xl overflow-hidden border border-[var(--color-rule)] shadow-xl aspect-[4/3]">
              <Image
                src="https://images.unsplash.com/photo-1571260899304-425eee4c7efc?auto=format&fit=crop&w=1000&q=80"
                alt="Students in a modern computer laboratory taking a test"
                fill
                className="object-cover"
              />
            </div>

            <div>
              <Badge variant="accent" className="mb-3 px-3 py-1 text-xs">
                Real Simulation
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight text-[var(--color-ink)] leading-snug">
                The Exact Test-Center Feel, Before Exam Day.
              </h2>
              <p className="mt-4 text-sm text-[var(--color-ink-2)] leading-relaxed">
                Test anxiety ruins scores. That&apos;s why our mock test interface uses identical screen layouts, keyboard shortcuts (A, B, C, D, N for Next, P for Previous, S for Submit), timer countdowns, and question calculators so you walk into the exam hall completely in your element.
              </p>

              <div className="mt-6 space-y-4 text-sm">
                <div className="flex gap-3">
                  <div className="p-2 rounded-lg bg-[var(--color-accent-tint)] text-[var(--color-accent)] shrink-0 h-fit">
                    <Clock size={18} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[var(--color-ink)]">Pacing & Time Management Breakdown</h4>
                    <p className="text-xs text-[var(--color-ink-3)] mt-0.5">Know exactly how many seconds you spend on Mathematics versus Use of English.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 shrink-0 h-fit">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[var(--color-ink)]">AI Step-by-Step Solver</h4>
                    <p className="text-xs text-[var(--color-ink-3)] mt-0.5">Stuck on a tricky organic chemistry mechanism? Ask the AI tutor for an instant analogy and breakdown.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 shrink-0 h-fit">
                    <Award size={18} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[var(--color-ink)]">Predictive Score Engine</h4>
                    <p className="text-xs text-[var(--color-ink-3)] mt-0.5">Get statistical predictions of your actual JAMB aggregate based on your practice accuracy.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Subjects Grid */}
      <section className="py-20 bg-[var(--color-paper-2)]">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-[var(--color-ink)] mb-4">
            All Key Nigerian Secondary School Subjects
          </h2>
          <p className="text-sm text-[var(--color-ink-2)] max-w-xl mx-auto mb-10">
            Every subject includes full syllabus topic breakdowns, past questions, and flashcard summaries.
          </p>

          <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
            {subjects.map((s) => (
              <span
                key={s}
                className="px-4 py-2 rounded-full border border-[var(--color-rule)] bg-[var(--color-paper)] text-xs font-semibold text-[var(--color-ink)] shadow-sm"
              >
                {s}
              </span>
            ))}
          </div>

          <div className="mt-12">
            <Button size="lg" variant="accent" asChild>
              <Link href="/signup">Create Your Free Account</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
