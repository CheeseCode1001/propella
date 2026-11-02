import { Link } from '@/lib/i18n/navigation'
import { ArrowRight, ArrowUpRight, BookOpen, Check, Sparkles } from 'lucide-react'
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
  RatingStars,
  px,
} from '@/components/marketing/joy'

export const metadata = {
  title: 'Academic Programs — JAMB, WAEC, NECO & University | Propella',
  description:
    'Explore Propella academic programs: UTME target 300+, WAEC/NECO 8-subject mastery, 100L-500L course accelerator, and shared study plans.',
}

const programs = [
  {
    slug: 'jamb-utme',
    title: 'JAMB UTME & Post-UTME Track',
    age: 'SS3 & Pre-Varsity (Ages 15+)',
    badge: 'Target 300+ in UTME',
    desc: 'Complete 4-subject official syllabus coverage, 8-key CBT simulation, past question drills from 2000–2025, and AI question breakdowns.',
    focus: 'Use of English · Mathematics · Physics · Chemistry · Biology · Economics · Government',
    details: [
      'Full CBT timed mock simulator with 8-key controls (A, B, C, D, P, N, S, R)',
      'Pause-and-resume mock tests anytime without losing answers',
      'Diagnostic baseline test to calculate readiness for your first-choice varsity',
    ],
    photo: PHOTOS.examHall,
    shape: 'flower' as const,
  },
  {
    slug: 'waec-ssce',
    title: 'WAEC & NECO Senior School Certificate',
    age: 'SS1 – SS3 Scholars (Ages 14–18)',
    badge: 'Distinction in 8 Subjects',
    desc: 'Structured objective and theory marking scheme practices. Master difficult topics step by step with step-by-step diagrammatic proofs.',
    focus: 'Objectives · Theory · Practical papers · Step-by-step marking schemes',
    details: [
      'Comprehensive topic-by-topic breakdowns for science, arts, and commercial tracks',
      'Automated spaced revision reminders right before you forget earlier terms',
      'Worked solutions written strictly in WAEC/NECO marking scheme standards',
    ],
    photo: PHOTOS.classroomLecture,
    shape: 'starburst' as const,
  },
  {
    slug: 'undergraduate',
    title: 'Undergraduate Course Accelerator',
    age: '100L – 500L University Scholars',
    badge: 'Semester First-Class Prep',
    desc: 'Upload PDF lecture slides, departmental past tests, and course materials. Generate summaries, flashcards, and practice quiz questions on demand.',
    focus: 'Course files · Document AI · Semester exam simulations · Flashcards',
    details: [
      'Document AI vault to query slides, notes, and past semester question papers',
      'Instant study summaries and high-yield concept extraction',
      'Departmental study groups to collaborate and benchmark with classmates',
    ],
    photo: PHOTOS.lectureHall,
    shape: 'cog' as const,
  },
  {
    slug: 'shared-plan',
    title: 'Shared Scholar Study Plan',
    age: 'Study Partners & Siblings',
    badge: 'Two Accounts · Save 25%',
    desc: 'Buy one subscription and share with a friend, sibling, or study partner. Each scholar gets independent progress, scores, and AI tutor access.',
    focus: 'Independent progress · Shared bill · ₦1,500/student · Full access',
    details: [
      'Two separate private logins with independent streaks and scoreboards',
      'Full access to all 11,404+ past questions and timed CBT mock exams',
      'First 30 days welcome discount from ₦1,499 (only ₦750/student)',
    ],
    photo: PHOTOS.duoMath,
    shape: 'hexagon' as const,
  },
]

const parentReviews = [
  {
    quote:
      'My daughter struggled with Physics calculations until she started Propella’s daily bites. Her JAMB score was 318 and she got into UNILAG Medicine!',
    author: 'Mrs. Folashade A.',
    child: 'Parent of JAMB 2025 Scholar',
    color: JOY.green,
  },
  {
    quote:
      'The Shared Plan was a blessing for my twins. One was preparing for WAEC, the other for JAMB, and both studied with zero complaints.',
    author: 'Engr. Emeka O.',
    child: 'Parent of Twin Scholars',
    color: JOY.orange,
  },
  {
    quote:
      'The ability to pause a mock exam when NEPA takes light or chores call, and resume right where they stopped, makes this unbeatable in Nigeria.',
    author: 'Dr. (Mrs.) Kemi B.',
    child: 'Parent & Secondary School Principal',
    color: JOY.blue,
  },
]

export default function ProgramsPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[var(--color-paper)] text-[var(--color-ink)]">
      {/* ── 1. Top Banner ─────────────────────────────────────────────────── */}
      <section className="relative pt-12 lg:pt-20 pb-20">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-8 text-center relative">
          <DoodleSmile className="absolute left-[10%] -top-4 hidden w-16 md:block animate-joy-float" />
          <DoodleRays className="absolute right-[12%] -top-2 hidden w-14 md:block" />
          <div className="mx-auto max-w-[760px]">
            <JoyEyebrow className="mb-5">Our academic tracks</JoyEyebrow>
            <JoyHeading as="h1" size="h1" className="text-[var(--color-ink)]">
              Programs that nurture joyful growth
            </JoyHeading>
            <p className="mx-auto mt-6 max-w-[620px] text-[18px] leading-[28px] text-[var(--color-ink)]/75">
              Every student learns differently. Propella’s programs combine official Nigerian exam syllabi,
              active CBT recall, and AI tutoring into a structured, cheerful study experience.
            </p>
          </div>
        </div>
      </section>

      {/* ── 2. Programs List ──────────────────────────────────────────────── */}
      <section className="pb-32">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-8 space-y-16">
          {programs.map((p, idx) => (
            <div
              key={p.slug}
              className={`rounded-[30px] border border-[var(--color-rule)] bg-white p-8 lg:p-12 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-10 items-center joy-card-hover ${
                idx % 2 === 1 ? 'lg:flex-row-reverse' : ''
              }`}
            >
              <div className="lg:col-span-7">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="rounded-full bg-[var(--color-paper-2)] px-3.5 py-1 text-[13px] font-semibold">
                    {p.age}
                  </span>
                  <JoyEyebrow tone="accent">{p.badge}</JoyEyebrow>
                </div>
                <JoyHeading as="h2" size="h2" className="text-[28px] text-black/80 sm:text-[34px] leading-tight">
                  {p.title}
                </JoyHeading>
                <p className="mt-4 text-[16.5px] leading-[26px] text-black/80">{p.desc}</p>
                <div className="mt-6 space-y-2.5">
                  {p.details.map((d, i) => (
                    <div key={i} className="flex items-start gap-3 text-black/80 text-[15px]">
                      <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)] text-white">
                        <Check size={11} strokeWidth={3} />
                      </span>
                      <span>{d}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <Link
                    href={`/programs/${p.slug}`}
                    className="inline-flex items-center gap-2 rounded-full bg-black/90 px-6 py-3 text-[15px] font-semibold text-[var(--color-paper)] transition hover:bg-[var(--color-accent)] hover:text-white"
                  >
                    Program Details <ArrowUpRight size={16} />
                  </Link>
                  <Link
                    href="/signup"
                    className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-6 py-3 text-[15px] text-black/8 0 font-semibold hover:border-[var(--color-ink)]"
                  >
                    Start Free Trial
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-5 flex justify-center">
                <div className="w-[280px] sm:w-[320px] transition-transform duration-500 hover:scale-105">
                  <JoyMaskedImage src={px(p.photo, 700)} alt={p.title} shape={p.shape} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 3. Honest Words From Parents ──────────────────────────────────── */}
      <section className="pb-32">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-8">
          <div className="mx-auto max-w-[680px] text-center">
            <JoyEyebrow className="mb-5">Trusted by families</JoyEyebrow>
            <JoyHeading>Honest words from parents who have seen growth</JoyHeading>
          </div>
          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
            {parentReviews.map((r, i) => (
              <div
                key={i}
                className="relative flex flex-col justify-between overflow-hidden rounded-[24px] p-8 text-white shadow-sm"
                style={{ backgroundColor: r.color }}
              >
                <DoodleSwirl className="absolute -right-8 -top-8 w-40 text-white/25" />
                <div>
                  <RatingStars color="#FFFFFF" />
                  <p className="mt-5 text-[17px] leading-[26px]">&ldquo;{r.quote}&rdquo;</p>
                </div>
                <div className="mt-8 pt-4 border-t border-white/20">
                  <p className="font-semibold text-[17px]" style={{ fontFamily: 'var(--font-display)' }}>
                    {r.author}
                  </p>
                  <p className="text-[13.5px] text-white/80">{r.child}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

