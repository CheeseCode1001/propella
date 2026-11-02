import { Link } from '@/lib/i18n/navigation'
import { ArrowRight, ArrowUpRight, Check, Clock, Plus } from 'lucide-react'
import { StickyNav } from '@/components/marketing/sticky-nav'
import { MarketingFooter } from '@/components/marketing/footer'
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
  VIDEOS,
  px,
} from '@/components/marketing/joy'
import { JoyScroller, JoyVideo } from '@/components/marketing/joy-client'
import { JoyReveal, JoyStagger, JoyStaggerItem } from '@/components/marketing/joy-reveal'
import { JoyFaqSection } from '@/components/marketing/joy-faq'

// ─── Content ─────────────────────────────────────────────────────────────────

const features = [
  {
    photo: PHOTOS.universityGirl,
    shape: 'flower' as const,
    title: 'JAMB, WAEC & NECO',
    body: 'Every topic mapped to the official syllabus for all three boards.',
  },
  {
    photo: PHOTOS.teenNotebook,
    shape: 'scallop' as const,
    title: '11,404+ Past Questions',
    body: 'Real CBT questions across 15 subjects with worked solutions.',
  },
  {
    photo: PHOTOS.classroomDiscussion,
    shape: 'starburst' as const,
    title: '24/7 AI Tutor',
    body: 'Step-by-step help that stays strictly inside your syllabus.',
  },
  {
    photo: PHOTOS.examPrep,
    shape: 'cog' as const,
    title: 'Progress & Streaks',
    body: 'Daily roadmaps, mastery scores and streaks that keep you going.',
  },
]

const shapesRow = [
  { photo: PHOTOS.pathwayWalk, shape: 'scallop' as const, glow: JOY.green },
  { photo: PHOTOS.highschoolGirl, shape: 'starburst' as const, glow: JOY.amber },
  { photo: PHOTOS.quadStudy, shape: 'cog' as const, glow: JOY.blue },
  { photo: PHOTOS.libraryGroup, shape: 'hexagon' as const, glow: JOY.orange },
]

const approach = [
  {
    color: JOY.orange,
    photo: PHOTOS.duoMath,
    title: 'Syllabus-First Roadmap',
    body: 'Your exam date and subjects become a day-by-day plan — and you can always keep going after today’s schedule.',
    offset: '',
  },
  {
    color: JOY.green,
    photo: PHOTOS.scienceLab,
    title: 'Active Recall & CBT Practice',
    body: 'Study Mode explains every option; Exam Mode times you like the real CBT. Pause a mock and resume anytime.',
    offset: 'lg:mt-14',
  },
  {
    color: JOY.blue,
    photo: PHOTOS.headphonesStudy,
    title: 'Guided AI Discovery',
    body: 'Stuck on a formula at midnight? Your AI tutor breaks it down step by step, always within your syllabus.',
    offset: '',
  },
]

const programs = [
  {
    age: 'SS3 & School Leavers',
    title: 'JAMB UTME & Post-UTME',
    body: 'Four-subject UTME roadmaps, timed CBT mocks and score predictions to target 300+.',
    focus: 'Use of English · Sciences · Arts · Commercial',
    photo: PHOTOS.groupProblem,
    shape: 'flower' as const,
    href: '/programs/jamb-utme',
  },
  {
    age: 'SS1 – SS3',
    title: 'WAEC & NECO SSCE',
    body: 'Eight-subject theory and objective practice built around the exact board guidelines.',
    focus: 'Objectives · Theory · Practical revision',
    photo: PHOTOS.classNotes,
    shape: 'starburst' as const,
    href: '/programs/waec-ssce',
  },
  {
    age: '100L – 500L',
    title: 'Undergraduate Courses',
    body: 'Upload course files, generate summaries and practise with AI-built questions for every course.',
    focus: 'Course files · Document AI · Exam prep',
    photo: PHOTOS.projectTeam,
    shape: 'cog' as const,
    href: '/programs/undergraduate',
  },
  {
    age: 'Families & Friends',
    title: 'Shared Study Plan',
    body: 'Two separate accounts on one plan, each with independent progress, mocks and streaks.',
    focus: 'Two accounts · Separate progress',
    photo: PHOTOS.familyStudy,
    shape: 'hexagon' as const,
    href: '/programs/shared-plan',
  },
]

const routine = [
  {
    time: '06:30 – 07:00',
    title: 'Morning recall',
    body: 'Ten spaced-revision questions on topics you are about to forget.',
    color: JOY.orange,
  },
  {
    time: '16:00 – 16:45',
    title: 'Today’s topic',
    body: 'Bite-sized notes from your roadmap, then practise in Study Mode.',
    color: JOY.green,
  },
  {
    time: '19:00 – 19:30',
    title: 'Timed CBT sprint',
    body: 'Exam Mode practice under real timing — pause and resume anytime.',
    color: JOY.blue,
  },
  {
    time: 'Anytime',
    title: 'Keep going',
    body: 'Finished early? Continue the roadmap and get ahead of schedule.',
    color: JOY.yellow,
  },
]

const stats = [
  { value: '11,404+', label: 'Past questions' },
  { value: '15', label: 'Subjects covered' },
  { value: '319', label: 'Syllabus topics' },
  { value: '24/7', label: 'AI tutor access' },
]

const plans = [
  {
    name: 'Free Starter',
    price: '₦0',
    welcome: null as string | null,
    period: 'forever',
    blurb: 'Explore your syllabus map and test your baseline.',
    features: ['5 practice questions daily', 'Official syllabus topics', '3 AI tutor queries a day', 'Basic progress tracker'],
    href: '/signup',
    cta: 'Start free',
    color: '#FFFFFF',
    featured: false,
  },
  {
    name: 'Basic',
    price: '₦1,999',
    welcome: '₦999',
    period: '30 days',
    blurb: 'Full Scholar access for one student.',
    features: ['All 11,404+ past questions', 'Unlimited Study & Exam Mode', 'Pause-and-resume mock exams', 'AI tutor explanations'],
    href: '/signup?plan=scholar_basic',
    cta: 'Choose Basic',
    color: '#FFFFFF',
    featured: false,
  },
  {
    name: 'Shared',
    price: '₦2,999',
    welcome: '₦1,499',
    period: '30 days',
    blurb: 'Two separate accounts on one plan.',
    features: ['Full access for 2 students', 'Independent scores & streaks', 'All mocks & past questions', 'Unlimited AI tutor'],
    href: '/signup?plan=scholar_shared',
    cta: 'Get Shared',
    color: JOY.yellow,
    featured: true,
  },
  {
    name: 'Till Exam',
    price: '₦9,999',
    welcome: '₦4,999',
    period: 'first period',
    blurb: 'Complete access right up to exam day.',
    features: ['JAMB, WAEC & NECO tracks', 'Undergraduate course files', 'Priority AI responses', 'Score prediction engine'],
    href: '/signup?plan=scholar_full',
    cta: 'Get Till Exam',
    color: '#FFFFFF',
    featured: false,
  },
]

const testimonials = [
  {
    quote: 'I went from guessing answers to understanding why each one was correct. My mock scores jumped from 210 to 312 in six weeks.',
    name: 'Chiamaka O.',
    role: 'JAMB candidate, Lagos',
    color: JOY.orange,
    photo: PHOTOS.gradSmile,
  },
  {
    quote: 'The revision reminders sent me back to topics I thought I knew. It helped me clear 7 A1s in WAEC.',
    name: 'Tunde A.',
    role: 'WAEC candidate, Ibadan',
    color: JOY.green,
    photo: PHOTOS.classmatesSmile,
  },
  {
    quote: 'Pausing a mock and picking it up after church saved me. The AI tutor only answers from my syllabus — no distractions.',
    name: 'Blessing E.',
    role: 'NECO & JAMB, Jos',
    color: JOY.blue,
    photo: PHOTOS.distinctionLady,
  },
]

const mentors = [
  { name: 'Mrs. Adaeze N.', role: 'English & Literature Coach', color: JOY.green, photo: PHOTOS.teacherBoard },
  { name: 'Mr. Femi O.', role: 'CBT Exam Strategist', color: JOY.orange, photo: PHOTOS.teacherAfrican },
  { name: 'Dr. Ngozi K.', role: 'Sciences Curriculum Lead', color: JOY.blue, photo: PHOTOS.tutorCorner },
  { name: 'Emeka U.', role: 'Student Success Mentor', color: JOY.yellow, photo: PHOTOS.onlineTutor },
  { name: 'Kemi A.', role: 'Mathematics Coach', color: JOY.lime, photo: PHOTOS.mentorGuidance },
]

const faqs = [
  {
    q: 'Is Propella really free to start?',
    a: 'Yes. The Free Starter plan gives you a roadmap for your exam, 5 practice questions daily and basic AI tutor explanations. Upgrade whenever you are ready.',
  },
  {
    q: 'How does the 3-day welcome offer work?',
    a: 'For the first 3 days after you register, every paid plan is 50% off — Basic from ₦999. The first period is discounted and your card then renews automatically at the standard price; you can cancel any time before renewal.',
  },
  {
    q: 'What is the difference between Study Mode and Exam Mode?',
    a: 'Study Mode shows hints, instant feedback and full explanations as you go. Exam Mode hides answers, runs a strict timer and only reveals your results at the end — just like the real CBT.',
  },
  {
    q: 'Can I pause a mock exam and continue later?',
    a: 'Yes. Your answers, position and remaining time are saved automatically, so you can leave halfway and resume exactly where you stopped.',
  },
  {
    q: 'Does Propella cover JAMB, WAEC and NECO?',
    a: 'All three, plus 100L–500L for undergraduates who want to study. Each board has its own syllabus mapping, so topics, questions and mocks are fully aligned.',
  },
  {
    q: 'Can I study on my phone?',
    a: 'Absolutely. Propella runs smoothly on any mobile browser or laptop, with minimal data usage.',
  },
]

// ─── Page ────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[var(--color-paper)] text-[var(--color-ink)] selection:bg-[var(--color-accent-tint)] selection:text-[var(--color-accent)]">
      <StickyNav />

      {/* ── 1. Hero ───────────────────────────────────────────────────────── */}
      <section className="relative pt-[124px] lg:pt-[150px] pb-14">
        <div className="relative max-w-[1240px] mx-auto px-6 lg:px-8">
          {/* floating masked portraits + doodles */}
          <div className="pointer-events-none absolute inset-0 hidden md:block" aria-hidden>
            <DoodleSmile className="absolute left-[14%] top-[2%] w-16 animate-joy-float" />
            <DoodleRays className="absolute right-[21%] top-[-4%] w-12" />
            <div className="absolute right-[6%] top-[4%] w-[120px] lg:w-[150px] rotate-6 animate-joy-float">
              <JoyMaskedImage src={px(PHOTOS.girlLaptop, 400)} alt="" shape="scallop" glow={JOY.blue} />
            </div>
            <div className="absolute left-[4%] top-[46%] w-[110px] lg:w-[140px] -rotate-6 animate-joy-float [animation-delay:1.5s]">
              <JoyMaskedImage src={px(PHOTOS.studentLaughing, 400)} alt="" shape="starburst" glow={JOY.green} />
            </div>
          </div>

          <div className="relative mx-auto max-w-[780px] text-center">
            <JoyEyebrow className="mb-6">Nigeria&apos;s joyful exam-prep platform</JoyEyebrow>
            <JoyHeading as="h1" size="h1" className="text-[var(--color-ink)]">
              Where bright minds grow through structure, practice, and confidence.
            </JoyHeading>
            <p className="mx-auto mt-6 max-w-[600px] text-[18px] leading-[26px] text-[var(--color-ink)]/70">
              Syllabus-first roadmaps, 11,404+ real past questions and a 24/7 AI tutor — guiding
              JAMB, WAEC, NECO and university students to distinction, one joyful day at a time.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-full bg-[var(--color-accent)] px-7 py-3.5 text-[16px] font-semibold text-white shadow-[0_10px_24px_-10px_rgba(248,100,43,0.8)] transition hover:bg-[var(--color-accent-2)]"
              >
                Start Learning Free <ArrowRight size={17} />
              </Link>
              <Link
                href="#programs"
                className="inline-flex items-center rounded-full border border-[var(--color-rule-2)] bg-white dark:bg-[#1A1813] text-[var(--color-ink)] px-7 py-3.5 text-[16px] font-semibold transition hover:border-[var(--color-ink)] joy-btn-hover"
              >
                View Programs
              </Link>
            </div>
            <p className="mt-5 text-[14px] text-[var(--color-ink)]/60">
              🎉 New students get <strong className="text-[var(--color-accent)]">50% off</strong> any plan for 3 days — from ₦999.
            </p>
          </div>
        </div>

        {/* hero video */}
        <div className="mx-auto mt-14 max-w-[1400px] px-4 lg:px-6">
          <JoyVideo
            src={VIDEOS.hero.src}
            poster={VIDEOS.hero.poster}
            label="Students celebrating together while studying in a library"
            className="rounded-[30px] aspect-[4/3] sm:aspect-[16/8] lg:aspect-[16/7]"
          />
        </div>
      </section>

      {/* ── 2. Feature strip ─────────────────────────────────────────────── */}
      <section className="pb-24 pt-6">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-8 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title} className="flex flex-col items-center text-center">
              <div className="mb-5 w-[78px]">
                <JoyMaskedImage src={px(f.photo, 240)} alt={f.title} shape={f.shape} />
              </div>
              <h3 className="text-[20px] font-semibold leading-[28px]" style={{ fontFamily: 'var(--font-display)' }}>
                {f.title}
              </h3>
              <p className="mt-2 max-w-[260px] text-[16px] leading-[24px] text-[var(--color-ink)]/70">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 3. Masked shapes row ─────────────────────────────────────────── */}
      <section className="pb-28">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-8">
          <div className="relative mx-auto max-w-[720px] text-center">
            <DoodleSmile className="absolute -left-4 -top-10 hidden w-14 sm:block" />
            <JoyEyebrow className="mb-5">About Propella</JoyEyebrow>
            <JoyHeading>Where ambition and smart preparation come together</JoyHeading>
            <p className="mx-auto mt-5 max-w-[560px] text-[18px] leading-[26px] text-[var(--color-ink)]/70">
              We believe every Nigerian student deserves a calm, structured and encouraging space to
              prepare — and the confidence to walk into any exam hall.
            </p>
          </div>
          <div className="mt-14 grid grid-cols-2 gap-6 lg:grid-cols-4 lg:gap-8">
            {shapesRow.map((s, i) => (
              <div key={s.photo} className={i % 2 === 1 ? 'lg:translate-y-6' : ''}>
                <JoyMaskedImage
                  src={px(s.photo, 600)}
                  alt="Students preparing for exams together"
                  shape={s.shape}
                  glow={s.glow}
                  className="transition-transform duration-500 hover:scale-[1.03]"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. Our approach ──────────────────────────────────────────────── */}
      <section id="how-it-works" className="pb-32">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-8">
          <div className="mx-auto max-w-[880px] text-center">
            <JoyEyebrow className="mb-5">Our approach to smart learning</JoyEyebrow>
            <JoyHeading size="h3" className="!text-[26px] !leading-[36px] sm:!text-[32px] sm:!leading-[44px]">
              We know students thrive when they have structure, clarity and the freedom to go further.
              Our approach blends daily roadmaps with real exam practice, so every scholar grows at
              their own pace while building lasting confidence.
            </JoyHeading>
          </div>

          <div className="mx-auto mt-16 grid max-w-[1040px] grid-cols-1 gap-6 md:grid-cols-3">
            {approach.map((a, i) => (
              <div
                key={a.title}
                className={`relative overflow-hidden rounded-[24px] p-7 text-white ${a.offset}`}
                style={{ backgroundColor: a.color }}
              >
                <DoodleSwirl className="absolute -right-6 -top-4 w-36 text-white/35" />
                <div className="relative w-[72px]">
                  <JoyMaskedImage src={px(a.photo, 240)} alt={a.title} shape="circle" />
                </div>
                <h3
                  className="relative mt-16 text-[22px] font-semibold leading-[30px]"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {a.title}
                </h3>
                <p className="relative mt-3 text-[16px] leading-[24px] text-white/90">{a.body}</p>
                <span className="absolute bottom-5 right-6 font-[family-name:var(--font-hand)] text-[44px] leading-none text-white/25">
                  0{i + 1}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-12 flex justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--color-ink)] px-7 py-3.5 text-[15px] font-semibold text-[var(--color-paper)] transition hover:bg-[var(--color-accent)] hover:text-white"
            >
              Explore How It Works <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── 5. Programs (espresso brown) ─────────────────────────────────── */}
      <section id="programs" className="relative py-24 text-white" style={{ backgroundColor: JOY.brown }}>
        <JoyEdge color={JOY.brown} variant="a" />
        <div className="max-w-[1240px] mx-auto px-6 lg:px-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-[640px]">
              <JoyEyebrow tone="accent" className="mb-5">Our programs</JoyEyebrow>
              <JoyHeading className="text-white">
                At Propella our programs blend structure and practice to build distinction scholars
              </JoyHeading>
            </div>
            <Link
              href="/pricing"
              className="inline-flex shrink-0 items-center gap-2 self-start rounded-full bg-[var(--color-accent)] px-7 py-3.5 text-[15px] font-semibold text-white transition hover:bg-[var(--color-accent-2)] lg:self-auto"
            >
              View All Programs <ArrowRight size={16} />
            </Link>
          </div>

          <JoyScroller tone="dark" className="mt-14">
            {programs.map((p) => (
              <div
                key={p.title}
                className="flex w-[88%] shrink-0 snap-start flex-col items-center gap-6 sm:w-[600px] sm:flex-row"
              >
                <div className="flex-1 rounded-[20px] bg-white p-6 ">
                  <span className="inline-block rounded-full bg-[var(--color-paper-2)] px-3 py-1 text-[13px] font-semibold">
                    {p.age}
                  </span>
                  <h3
                    className="mt-4 text-[22px] font-semibold leading-[30px]"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {p.title}
                  </h3>
                  <p className="mt-2 text-[15px] leading-[23px]">{p.body}</p>
                  <p className="mt-4 text-[13px] font-semibold uppercase tracking-[0.06em]">
                    Key focus
                  </p>
                  <p className="text-[14px]">{p.focus}</p>
                  <Link
                    href={p.href}
                    className="mt-5 inline-flex items-center gap-1.5 text-[15px] font-semibold ver:text-[var(--color-accent)]"
                  >
                    Learn more <ArrowUpRight size={16} />
                  </Link>
                </div>
                <div className="w-[180px] shrink-0 sm:w-[200px]">
                  <JoyMaskedImage src={px(p.photo, 500)} alt={p.title} shape={p.shape} />
                </div>
              </div>
            ))}
          </JoyScroller>
        </div>
      </section>

      {/* ── 6. Story & rating (espresso brown) ───────────────────────────── */}
      <section className="relative pb-28 pt-10 text-white" style={{ backgroundColor: JOY.brown }}>
        <div className="max-w-[1240px] mx-auto px-6 lg:px-8 grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          <div>
            <JoyEyebrow tone="accent" className="mb-5">Our story</JoyEyebrow>
            <JoyHeading className="text-white">Growing together joyfully from the very first topic</JoyHeading>
            <p className="mt-6 text-[17px] leading-[26px] text-white/75">
              Propella started with a simple belief: preparing for exams should feel encouraging, not
              frightening. We built a space where students follow a clear roadmap, practise with real
              questions and get patient help the moment they are stuck.
            </p>
            <p className="mt-4 text-[17px] leading-[26px] text-white/75">
              Every detail — from pause-and-resume mocks to roadmaps you can push past — is designed to
              respect each student&apos;s pace, celebrate progress and build genuine mastery.
            </p>
          </div>
          <div className="relative mx-auto w-full max-w-[520px]">
            <DoodleStar className="absolute -right-4 -top-8 z-10 w-20 animate-joy-float" />
            <div className="rotate-[3deg] overflow-hidden rounded-[24px] border-[6px] border-white shadow-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={px(PHOTOS.mentorsTalking, 1000)}
                alt="Students discussing their studies together"
                className="aspect-[5/4] w-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="absolute -bottom-8 -left-4 rounded-[18px] bg-white px-5 py-4 text-[var(--color-ink)] shadow-xl sm:-left-10">
              <p className="text-[32px] font-semibold leading-none" style={{ fontFamily: 'var(--font-display)' }}>
                5.0
              </p>
              <RatingStars className="mt-1.5" />
              <p className="mt-1 text-[13px] text-[var(--color-ink)]/60">Loved by our students</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. Mission & vision ──────────────────────────────────────────── */}
      <section className="relative bg-[var(--color-paper)] py-28">
        <JoyEdge color="var(--color-paper)" variant="c" />
        <div className="max-w-[1240px] mx-auto px-6 lg:px-8 grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          <div className="relative">
            <DoodleSquiggle className="absolute -left-4 -top-8 z-10 w-32" />
            <div className="overflow-hidden rounded-[30px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={px(PHOTOS.libraryCheer, 1000)}
                alt="Students cheering in a library"
                className="aspect-[4/3] w-full object-cover"
                loading="lazy"
              />
            </div>
            <DoodleSun className="absolute -bottom-8 right-6 w-20" />
          </div>
          <div className="space-y-12">
            {[
              {
                title: 'Our mission',
                body: 'To give every Nigerian student a structured, encouraging and affordable path to exam success — combining official syllabi, real practice and patient AI guidance.',
                photo: PHOTOS.campusLaughing,
                shape: 'scallop' as const,
              },
              {
                title: 'Our vision',
                body: 'A generation of confident, curious scholars who walk into JAMB, WAEC, NECO and university exams prepared, calm and proud of the work they have done.',
                photo: PHOTOS.pairLawn,
                shape: 'flower' as const,
              },
            ].map((m) => (
              <div key={m.title} className="flex items-start gap-6">
                <div className="w-[96px] shrink-0">
                  <JoyMaskedImage src={px(m.photo, 300)} alt={m.title} shape={m.shape} />
                </div>
                <div>
                  <JoyHeading as="h3" size="h3">
                    {m.title}
                  </JoyHeading>
                  <p className="mt-3 text-[17px] leading-[26px] text-[var(--color-ink)]/70">{m.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8. Daily routine ─────────────────────────────────────────────── */}
      <section className="pb-28">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-8">
          <JoyReveal className="mx-auto max-w-[680px] text-center">
            <JoyEyebrow className="mb-5">A day with Propella</JoyEyebrow>
            <JoyHeading>Small daily habits that build big exam scores</JoyHeading>
          </JoyReveal>
          <JoyStagger className="mt-14 grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-4">
            {routine.map((r) => {
              const dark = r.color !== JOY.yellow
              return (
                <JoyStaggerItem key={r.title} className="h-full">
                  <div
                    className="relative overflow-hidden rounded-[24px] p-6 sm:p-7 min-h-[250px] h-full flex flex-col justify-between joy-card-hover shadow-sm"
                    style={{ backgroundColor: r.color, color: dark ? '#fff' : JOY.ink }}
                  >
                    <DoodleSwirl className={`absolute -bottom-10 -right-10 w-40 ${dark ? 'text-white/25' : 'text-black/10'}`} />
                    <div className="flex flex-col items-center justify-between w-full h-full">
                      <span
                        className={`relative inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-[13px] font-semibold ${dark ? 'bg-white/20' : 'bg-black/10'}`}
                      >
                        <Clock size={13} /> {r.time}
                      </span>
                      <h3 className="relative mt-6 text-[21px] sm:text-[22px] leading-[28px] font-semibold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                        {r.title}
                      </h3>
                      <p className={`relative mt-2.5 text-[15px] sm:text-[15.5px] leading-[23px] ${dark ? 'text-white/90' : 'text-black/75'}`}>
                        {r.body}
                      </p>
                    </div>
                  </div>
                </JoyStaggerItem>
              )
            })}
          </JoyStagger>
        </div>
      </section>

      {/* ── 9. Impact in action (video stats) ────────────────────────────── */}
      <section className="pb-28">
        <div className="mx-auto max-w-[1400px] px-4 lg:px-6">
          <JoyVideo
            src={VIDEOS.hero.src}
            poster={VIDEOS.hero.poster}
            label="Students studying together"
            className="rounded-[30px]"
            overlay="linear-gradient(0deg, rgba(56,29,15,0.92) 0%, rgba(56,29,15,0.55) 60%, rgba(56,29,15,0.35) 100%)"
            controlsPosition="top-right"
          >
            <div className="relative z-[1] px-6 py-20 sm:px-12 lg:py-28">
              <div className="mx-auto max-w-[640px] text-center text-white">
                <JoyEyebrow tone="dark" className="mb-5">Propella in action</JoyEyebrow>
                <JoyHeading className="text-white">Real practice. Real progress. Every single day.</JoyHeading>
              </div>
              <div className="mx-auto mt-14 grid max-w-[1000px] grid-cols-2 gap-4 lg:grid-cols-4">
                {stats.map((s) => (
                  <div key={s.label} className="rounded-[20px] bg-white/10 px-5 py-7 text-center text-white backdrop-blur-md">
                    <p className="text-[38px] font-semibold leading-none lg:text-[46px]" style={{ fontFamily: 'var(--font-display)' }}>
                      {s.value}
                    </p>
                    <p className="mt-2 text-[15px] text-white/75">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </JoyVideo>
        </div>
      </section>

      {/* ── 10. Pricing ──────────────────────────────────────────────────── */}
      <section id="pricing" className="pb-28">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-8">
          <div className="mx-auto max-w-[680px] text-center">
            <JoyEyebrow className="mb-5">Simple student pricing</JoyEyebrow>
            <JoyHeading>Start free. Upgrade when you&apos;re ready.</JoyHeading>
            <p className="mt-5 text-[18px] leading-[26px] text-[var(--color-ink)]/70">
              New here? Every paid plan is <strong className="text-[var(--color-accent)]">50% off for your first 3 days</strong>.
              Your first period is discounted, then renews at the standard price.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 lg:grid-cols-4">
            {plans.map((p) => (
              <div
                key={p.name}
                className={`relative flex flex-col rounded-[24px] border p-7 ${p.featured ? 'border-[var(--color-ink)] shadow-[6px_6px_0_0_#1A1917]' : 'border-[var(--color-rule)]'}`}
                style={{ backgroundColor: p.color }}
              >
                {p.featured && (
                  <span className="absolute -top-3.5 left-7 rounded-full bg-[var(--color-accent)] px-3 py-1 text-[12px] font-semibold text-white">
                    Most popular
                  </span>
                )}
                <p className="text-[18px] font-semibold text-[#1A1917]" style={{ fontFamily: 'var(--font-display)' }}>
                  {p.name}
                </p>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-[38px] font-semibold leading-none text-[#1A1917]" style={{ fontFamily: 'var(--font-display)' }}>
                    {p.welcome ?? p.price}
                  </span>
                  {p.welcome && <span className="text-[16px] text-[#1A1917]/45 line-through">{p.price}</span>}
                </div>
                <p className="mt-1 text-[14px] text-[#1A1917]/60">
                  {p.welcome ? `first ${p.period === 'first period' ? 'period' : p.period} · then ${p.price}` : p.period}
                </p>
                <p className="mt-4 text-[15px] leading-[22px] text-[#1A1917]/75">{p.blurb}</p>
                <ul className="mt-6 flex-1 space-y-3">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-[15px] text-[#1A1917]">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)] text-white">
                        <Check size={12} strokeWidth={3} />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={p.href}
                  className={`mt-8 inline-flex items-center justify-center rounded-full px-6 py-3 text-[15px] font-semibold transition ${p.featured ? 'bg-[#1A1917] text-white hover:bg-[var(--color-accent)]' : 'border border-[#1A1917]/20 bg-white text-[#1A1917] hover:border-[#1A1917]'}`}
                >
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-[14px] text-[var(--color-ink)]/60">
            Paid plans renew automatically on a saved card via Paystack. Cancel anytime before renewal.{' '}
            <Link href="/pricing" className="font-semibold text-[var(--color-accent)] hover:underline">
              Compare all features →
            </Link>
          </p>
        </div>
      </section>

      {/* ── 11. Testimonials ─────────────────────────────────────────────── */}
      <section className="pb-28">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-8">
          <div className="mx-auto max-w-[680px] text-center">
            <JoyEyebrow className="mb-5">Student stories</JoyEyebrow>
            <JoyHeading>Real students, real distinction scores</JoyHeading>
          </div>
          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="relative flex flex-col overflow-hidden rounded-[24px] p-8 text-white"
                style={{ backgroundColor: t.color }}
              >
                <DoodleSwirl className="absolute -right-8 -top-8 w-40 text-white/30" />
                <RatingStars color="#FFFFFF" className="relative" />
                <p className="relative mt-5 flex-1 text-[18px] leading-[27px]">&ldquo;{t.quote}&rdquo;</p>
                <div className="relative mt-8 flex items-center gap-3">
                  <div className="w-12">
                    <JoyMaskedImage src={px(t.photo, 160)} alt={t.name} shape="circle" />
                  </div>
                  <div>
                    <p className="font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
                      {t.name}
                    </p>
                    <p className="text-[14px] text-white/80">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 12. Mentors ──────────────────────────────────────────────────── */}
      <section className="pb-28">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-8">
          <JoyEyebrow className="mb-5">Caring educators</JoyEyebrow>
          <JoyHeading className="max-w-[560px]">Warm guidance helps scholars feel confident.</JoyHeading>
          <JoyScroller className="mt-12">
            {mentors.map((m) => (
              <div key={m.name} className="w-[260px] shrink-0 snap-start sm:w-[280px]">
                <div className="overflow-hidden rounded-[20px]" style={{ backgroundColor: m.color }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={px(m.photo, 600)}
                    alt={m.name}
                    className="aspect-[4/5] w-full object-cover mix-blend-normal"
                    loading="lazy"
                  />
                </div>
                <div className="-mt-10 relative mx-3 rounded-[16px] bg-white dark:bg-[#1A1813] border border-[var(--color-rule)] dark:border-[#2D2A23] px-4 py-3 shadow-md">
                  <p className="font-semibold text-[var(--color-ink)]" style={{ fontFamily: "'Parkinsans', sans-serif", fontWeight: 600 }}>
                    {m.name}
                  </p>
                  <p className="text-[14px] text-[var(--color-ink-3)]">{m.role}</p>
                </div>
              </div>
            ))}
          </JoyScroller>
        </div>
      </section>

      {/* ── 13. FAQ ──────────────────────────────────────────────────────── */}
      <JoyFaqSection
        eyebrow="FAQ"
        title="Questions students and parents ask"
        faqs={faqs}
      />

      <MarketingFooter />
    </div>
  )
}
