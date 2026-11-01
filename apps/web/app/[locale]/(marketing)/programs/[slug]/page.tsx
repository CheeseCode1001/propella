import { notFound } from 'next/navigation'
import { Link } from '@/lib/i18n/navigation'
import { ArrowRight, ArrowUpRight, Check, Clock, Sparkles } from 'lucide-react'
import {
  DoodleRays,
  DoodleSmile,
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

interface ProgramData {
  title: string
  age: string
  badge: string
  subtitle: string
  overview: string
  whatItMeans: string
  howLearn: string
  typicalDay: string[]
  approach: string
  outcomes: string[]
  photo: number
  shape: 'flower' | 'starburst' | 'cog' | 'hexagon' | 'scallop'
}

const programsData: Record<string, ProgramData> = {
  'jamb-utme': {
    title: 'JAMB UTME & Post-UTME Mastery Track',
    age: 'SS3 Candidates & Pre-Varsity (Ages 15+)',
    badge: 'Target 300+ in UTME',
    subtitle:
      'Structured 4-subject official syllabus mastery, timed CBT simulations matching the exact 8-key JAMB keyboard layout, and automated spaced revision.',
    overview:
      'The Joint Admissions and Matriculation Board (JAMB) UTME determines university admission for over 1.8 million candidates yearly. Propella’s JAMB track breaks the official 2026/2027 syllabus into digestible daily topics, verified past questions from 2000–2025, and high-frequency formula drills.',
    whatItMeans:
      'Rather than random reading, syllabus-first prep means every single day targets an official sub-topic. Your weakness score is tracked per subject so that difficult topics (like Calculus in Math or Organic Chemistry in Chemistry) resurface before you forget them.',
    howLearn:
      'Students learn through active recall in two modes: Study Mode provides immediate explanations and AI tutor hints; Exam Mode runs a strict countdown timer with no answers until completion, mirroring the tension and pacing of the actual exam hall.',
    typicalDay: [
      '06:30 — 10-minute spaced revision quiz on topics you studied 3 and 7 days ago.',
      '16:00 — Core daily syllabus topic notes with step-by-step formula breakdowns.',
      '19:00 — 40-question timed CBT sprint with instant performance and pacing analysis.',
      '21:00 — Ask the AI tutor for clarification on tricky options without leaving your syllabus.',
    ],
    approach:
      'Our AI study companion is strictly trained on official JAMB guidelines and past examinations. It avoids internet distractions, explaining complex questions step by step and illustrating organic reactions, physics force vectors, and literary allusions.',
    outcomes: [
      'Target score of 300+ across your four official subject combinations',
      'Instant confidence with the 8-key CBT keyboard controls (A, B, C, D, P, N, S, R)',
      'Zero syllabus gaps — 100% of required topics revised and tested',
      'Realistic pace management: average 45 seconds per question without panic',
    ],
    photo: PHOTOS.examPrep,
    shape: 'flower',
  },
  'waec-ssce': {
    title: 'WAEC & NECO Senior School Certificate Track',
    age: 'SS1 – SS3 Scholars (Ages 14–18)',
    badge: 'Distinction in 8 Subjects',
    subtitle:
      'Curriculum-aligned preparation for West African Senior School Certificate Examination (WASSCE) and National Examinations Council (NECO) tests.',
    overview:
      'Clearing your 8 or 9 SSCE papers in one sitting requires balancing both objective multiple-choice and multi-part theoretical questions. Propella guides senior secondary students through core sciences, commercial subjects, and the arts with worked marking schemes.',
    whatItMeans:
      'Secondary school candidates often read entire textbooks without knowing how points are awarded. Propella teaches students how official examiners mark theory papers — highlighting key terms, intermediate steps in math, and structured essay paragraphs.',
    howLearn:
      'Candidates alternate between rapid-fire objective past question drills and structured theory practice. Spaced repetition ensures early SS1 and SS2 topics are fresh and top-of-mind when mock and final exam season arrives.',
    typicalDay: [
      'Morning: 15-minute quick revision of English grammatical structures and idioms.',
      'Afternoon: Deep dive into the scheduled weekly subject syllabus topic.',
      'Evening: Timed practice of past WAEC/NECO questions with diagrammatic analysis.',
    ],
    approach:
      'Our curriculum team collaborates with experienced Nigerian classroom teachers to ensure all topic explanations meet West African Examinations Council requirements.',
    outcomes: [
      'High probability of clearing 7 to 9 A1/B2 grades in one single sitting',
      'Mastery of theory problem solving and diagram presentation',
      'Reduced pre-exam stress through automated weekly review cycles',
    ],
    photo: PHOTOS.teenNotebook,
    shape: 'starburst',
  },
  undergraduate: {
    title: 'Undergraduate Course Accelerator',
    age: '100L – 500L University Scholars',
    badge: 'First-Class Semester Prep',
    subtitle:
      'Upload departmental lecture slides, past semester tests, and textbook chapters for instant synthesis, practice quizzes, and 24/7 AI document tutoring.',
    overview:
      'University semesters in African institutions move fast. Large class sizes and dense 80-page slide decks can overwhelm students. Propella’s Undergraduate Vault allows scholars to upload course PDFs and extract high-yield concepts in seconds.',
    whatItMeans:
      'Document AI turns passive reading into active quizzing. The system generates practice questions directly from your lecturer’s notes, helping you test your recall before continuous assessment tests and exams.',
    howLearn:
      'Students query their documents naturally: ask for summaries of tough theorems, request real-world examples, or generate flashcards to study between lectures.',
    typicalDay: [
      'After lecture: Upload PDF slide deck to your course file vault.',
      'Study session: Review auto-generated 5-point summaries and key term flashcards.',
      'Weekend: Take a 20-question practice test created straight from past departmental papers.',
    ],
    approach:
      'Our AI operates strictly within the context of your uploaded files, ensuring answers are tailored to your department’s syllabus without external hallucination.',
    outcomes: [
      'Comprehensive preparation for mid-semester Continuous Assessments and exams',
      'Significant time savings on summary writing and manual note making',
      'Higher GPA trajectories targeting First Class and Second Class Upper degrees',
    ],
    photo: PHOTOS.honorsGroup,
    shape: 'cog',
  },
  'shared-plan': {
    title: 'Shared Scholar Study Plan',
    age: 'Study Partners & Siblings',
    badge: 'Two Accounts · Save 25%',
    subtitle:
      'Two independent scholar accounts on a single subscription. Study with your friend, sibling, or classmate while keeping separate scores and streaks.',
    overview:
      'Studying with an accountability partner doubles motivation and retention. The Shared Scholar Plan provides two distinct student profiles for just ₦2,999/month (or ₦1,499 during your 3-day welcome window — only ₦750/student).',
    whatItMeans:
      'Both learners have their own private dashboard, study roadmap, mock exam histories, and AI tutor conversation threads. Neither account interferes with the other’s progress or personal settings.',
    howLearn:
      'Partners can benchmark each other’s streaks, review past questions together, and keep each other motivated through friendly leaderboard rivalry.',
    typicalDay: [
      'Morning: Check in on each other’s study streak and planned topics for the day.',
      'Day: Work independently through your personal roadmap topics and quizzes.',
      'Evening: Compare CBT mock scores and challenge each other to beat high scores.',
    ],
    approach:
      'Designed to reduce financial pressure on Nigerian parents and students while fostering healthy peer collaboration.',
    outcomes: [
      '25% monthly savings compared to two separate Basic subscriptions',
      'High retention through peer accountability and shared streaks',
      'Independent records and individual preparation for separate exam targets',
    ],
    photo: PHOTOS.peerTutoring,
    shape: 'hexagon',
  },
  // Alias for reference URL
  'early-language-communication': {
    title: 'Early Language & Communication Track',
    age: 'Foundational English & Communication (All Levels)',
    badge: 'Core Literacy & Vocabulary',
    subtitle:
      'Master the Use of English, comprehension passages, lexis and structure, oral English, and grammatical registers for distinction in all Nigerian exams.',
    overview:
      'Use of English is compulsory for all 1.8+ million JAMB candidates and every WAEC/NECO scholar. It carries the highest weight and often determines whether you cross the cut-off mark. Propella’s language program equips students with rapid comprehension strategies and grammatical mastery.',
    whatItMeans:
      'Rather than memorising dictionary definitions, students learn how words function in context, understand nuances in registers, and master phonetic transcriptions for oral English tests.',
    howLearn:
      'Daily bite-sized passage breakdowns, vocabulary in context drills, and audio-assisted stress and intonation exercises.',
    typicalDay: [
      'Morning: 5-minute idiom and synonym recall challenge.',
      'Afternoon: Reading comprehension passage with timed speed tests.',
      'Evening: Oral English vowel and consonant identification practice.',
    ],
    approach:
      'Combines step-by-step grammatical explanations with authentic past question papers from 2000 to 2025.',
    outcomes: [
      'Aim for 80+ marks in JAMB Use of English',
      'A1 grade in WAEC / NECO English Language',
      'Strong communication confidence in university interviews and essays',
    ],
    photo: PHOTOS.readingJoy,
    shape: 'flower',
  },
}

export function generateStaticParams() {
  return Object.keys(programsData).map((slug) => ({ slug }))
}

export default async function ProgramDetailPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>
}) {
  const { slug } = await params
  const program = programsData[slug] ?? programsData['jamb-utme']

  const otherPrograms = Object.entries(programsData)
    .filter(([s]) => s !== slug && s !== 'early-language-communication')
    .slice(0, 3)

  return (
    <div className="min-h-screen overflow-x-hidden bg-[var(--color-paper)] text-[var(--color-ink)]">
      {/* ── 1. Header Banner ─────────────────────────────────────────────────── */}
      <section className="relative pt-12 lg:pt-20 pb-16">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-8 text-center relative">
          <DoodleSmile className="absolute left-[8%] -top-4 hidden w-16 md:block animate-joy-float" />
          <DoodleRays className="absolute right-[12%] -top-2 hidden w-14 md:block" />
          <div className="mx-auto max-w-[800px]">
            <div className="flex flex-wrap items-center justify-center gap-3 mb-5">
              <span className="rounded-full bg-[var(--color-paper-2)] px-4 py-1 text-[13px] font-semibold text-[var(--color-ink)]">
                {program.age}
              </span>
              <JoyEyebrow tone="accent">{program.badge}</JoyEyebrow>
            </div>
            <JoyHeading as="h1" size="h1" className="text-[var(--color-ink)]">
              {program.title}
            </JoyHeading>
            <p className="mx-auto mt-6 max-w-[640px] text-[18px] leading-[28px] text-[var(--color-ink)]/75">
              {program.subtitle}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-full bg-[var(--color-accent)] px-8 py-3.5 text-[16px] font-semibold text-white shadow-md transition hover:bg-[var(--color-accent-2)]"
              >
                Enrol In Program Free <ArrowRight size={17} />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center rounded-full border border-[var(--color-rule-2)] dark:border-[#3A362D] bg-white dark:bg-[#1A1813] px-7 py-3.5 text-[16px] font-semibold text-[var(--color-ink)] hover:border-[var(--color-ink)]"
              >
                View Plans from ₦999
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Hero Video / Media Showcase ──────────────────────────────────── */}
      <section className="pb-24">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-8">
          <div className="rounded-[30px] overflow-hidden border border-[var(--color-rule)] dark:border-[#2D2A23] shadow-xl bg-[var(--color-paper-2)]">
            <JoyVideo
              src={VIDEOS.classroom.src}
              poster={px(program.photo, 1400)}
              label="African students studying with structure and purpose"
              className="rounded-[30px] min-h-[360px] sm:min-h-[460px] lg:min-h-[520px]"
              overlay="linear-gradient(180deg, rgba(26,25,23,0.1) 0%, rgba(26,25,23,0.4) 100%)"
            />
          </div>
        </div>
      </section>

      {/* ── 3. Program Details Breakdown ────────────────────────────────────── */}
      <section className="pb-32">
        <div className="max-w-[1000px] mx-auto px-6 lg:px-8 space-y-16">
          {/* Overview */}
          <div className="rounded-[24px] border border-[var(--color-rule)] dark:border-[#2D2A23] bg-white dark:bg-[#1A1813] p-8 sm:p-12 shadow-sm">
            <JoyHeading as="h2" size="h2" className="text-[26px] sm:text-[32px] mb-4">
              Program Overview
            </JoyHeading>
            <p className="text-[17px] leading-[28px] text-[var(--color-ink)]/80">{program.overview}</p>
          </div>

          {/* What it means */}
          <div className="rounded-[24px] border border-[var(--color-rule)] dark:border-[#2D2A23] bg-white dark:bg-[#1A1813] p-8 sm:p-12 shadow-sm">
            <JoyHeading as="h2" size="h2" className="text-[26px] sm:text-[32px] mb-4">
              What Syllabus-First Learning Means
            </JoyHeading>
            <p className="text-[17px] leading-[28px] text-[var(--color-ink)]/80">{program.whatItMeans}</p>
          </div>

          {/* How Students Master Topics */}
          <div className="rounded-[24px] border border-[var(--color-rule)] dark:border-[#2D2A23] bg-white dark:bg-[#1A1813] p-8 sm:p-12 shadow-sm">
            <JoyHeading as="h2" size="h2" className="text-[26px] sm:text-[32px] mb-4">
              How Students Master Topics Through Active CBT Recall
            </JoyHeading>
            <p className="text-[17px] leading-[28px] text-[var(--color-ink)]/80">{program.howLearn}</p>
          </div>

          {/* Typical Day */}
          <div
            className="rounded-[28px] p-8 sm:p-12 text-white shadow-md"
            style={{ backgroundColor: JOY.brown }}
          >
            <JoyEyebrow tone="accent" className="mb-4">Daily Study Habits</JoyEyebrow>
            <JoyHeading as="h2" size="h2" className="text-white text-[26px] sm:text-[32px] mb-6">
              A Typical Day in the Program
            </JoyHeading>
            <div className="space-y-4">
              {program.typicalDay.map((item, idx) => (
                <div key={idx} className="flex items-start gap-4">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)] text-xs font-bold text-white mt-1">
                    {idx + 1}
                  </span>
                  <p className="text-[16.5px] leading-[26px] text-white/90">{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Teaching Approach */}
          <div className="rounded-[24px] border border-[var(--color-rule)] dark:border-[#2D2A23] bg-white dark:bg-[#1A1813] p-8 sm:p-12 shadow-sm">
            <JoyHeading as="h2" size="h2" className="text-[26px] sm:text-[32px] mb-4">
              Our AI Teaching Approach
            </JoyHeading>
            <p className="text-[17px] leading-[28px] text-[var(--color-ink)]/80">{program.approach}</p>
          </div>

          {/* Expected Outcomes */}
          <div className="rounded-[24px] border border-[var(--color-rule)] dark:border-[#2D2A23] bg-white dark:bg-[#1A1813] p-8 sm:p-12 shadow-sm">
            <JoyHeading as="h2" size="h2" className="text-[26px] sm:text-[32px] mb-6">
              Expected Examination Outcomes
            </JoyHeading>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {program.outcomes.map((out, i) => (
                <div key={i} className="flex items-start gap-3 rounded-2xl bg-[var(--color-paper-2)] dark:bg-[#25221C] p-4">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white mt-0.5">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  <span className="text-[15px] font-medium text-[var(--color-ink)] leading-snug">{out}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Discover More Programs ──────────────────────────────────────── */}
      <section className="pb-32 bg-[var(--color-paper-2)] py-24 border-t border-[var(--color-rule)] dark:border-[#2D2A23]">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-8">
          <div className="mx-auto max-w-[680px] text-center mb-16">
            <JoyEyebrow className="mb-4">Other pathways</JoyEyebrow>
            <JoyHeading>Discover Our Programs</JoyHeading>
            <p className="mt-3 text-[17px] text-[var(--color-ink)]/75">
              Explore other tracks designed to guide scholars at every stage of their academic career.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {otherPrograms.map(([key, p]) => (
              <div
                key={key}
                className="rounded-[24px] border border-[var(--color-rule)] dark:border-[#2D2A23] bg-white dark:bg-[#1A1813] p-7 shadow-sm flex flex-col justify-between hover:shadow-md transition joy-card-hover"
              >
                <div>
                  <div className="w-[120px] mx-auto mb-6">
                    <JoyMaskedImage src={px(p.photo, 300)} alt={p.title} shape={p.shape} />
                  </div>
                  <span className="rounded-full bg-[var(--color-paper-2)] px-3 py-1 text-xs font-semibold">
                    {p.age}
                  </span>
                  <h3
                    className="mt-3 text-[20px] font-semibold leading-tight text-[var(--color-ink)]"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {p.title}
                  </h3>
                  <p className="mt-2 text-[14.5px] leading-[22px] text-[var(--color-ink)]/70">
                    {p.subtitle}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-[var(--color-rule)]">
                  <Link
                    href={`/programs/${key}`}
                    className="inline-flex items-center gap-1.5 text-[14.5px] font-semibold text-[var(--color-accent)] hover:underline"
                  >
                    Explore track <ArrowUpRight size={15} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

