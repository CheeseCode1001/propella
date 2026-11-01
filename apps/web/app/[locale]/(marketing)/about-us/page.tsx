import { Link } from '@/lib/i18n/navigation'
import { ArrowRight } from 'lucide-react'
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

export const metadata = {
  title: 'About Us — Where Care and Smart Learning Come Together | Propella',
  description:
    'Learn about Propella: Nigeria’s joyful, syllabus-guided study companion blending structured roadmaps, authentic CBT past questions, and 24/7 AI tutoring.',
}

const shapesRow = [
  { photo: PHOTOS.duoMath, shape: 'scallop' as const, glow: JOY.green },
  { photo: PHOTOS.libraryReading, shape: 'starburst' as const, glow: JOY.amber },
  { photo: PHOTOS.highschoolBoy, shape: 'cog' as const, glow: JOY.blue },
  { photo: PHOTOS.activeHands, shape: 'hexagon' as const, glow: JOY.orange },
]

const approach = [
  {
    color: JOY.orange,
    photo: PHOTOS.teenNotebook,
    title: 'Syllabus-First Roadmap',
    body: 'Your exam date and subjects become a day-by-day plan — and you can always keep going after today’s schedule.',
    offset: '',
  },
  {
    color: JOY.green,
    photo: PHOTOS.peerTutoring,
    title: 'Active Recall & CBT Practice',
    body: 'Study Mode explains every option; Exam Mode times you like the real CBT. Pause a mock and resume anytime.',
    offset: 'lg:mt-14',
  },
  {
    color: JOY.blue,
    photo: PHOTOS.onlineTutor,
    title: 'Guided AI Discovery',
    body: 'Stuck on a formula at midnight? Your AI tutor breaks it down step by step, always within your syllabus.',
    offset: '',
  },
]

const stats = [
  { value: '11,404+', label: 'Past questions' },
  { value: '15', label: 'Subjects covered' },
  { value: '319', label: 'Syllabus topics' },
  { value: '24/7', label: 'AI tutor access' },
]

const testimonials = [
  {
    quote: 'I went from guessing answers to understanding why each one was correct. My mock scores jumped from 210 to 312 in six weeks.',
    name: 'Chiamaka O.',
    role: 'JAMB candidate, Lagos',
    color: JOY.orange,
    photo: PHOTOS.proudGraduate,
  },
  {
    quote: 'The revision reminders sent me back to topics I thought I knew. It helped me clear 7 A1s in WAEC.',
    name: 'Tunde A.',
    role: 'WAEC candidate, Ibadan',
    color: JOY.green,
    photo: PHOTOS.readingJoy,
  },
  {
    quote: 'Pausing a mock and picking it up after church saved me. The AI tutor only answers from my syllabus — no distractions.',
    name: 'Blessing E.',
    role: 'NECO & JAMB, Jos',
    color: JOY.blue,
    photo: PHOTOS.honorsGroup,
  },
]

const mentors = [
  { name: 'Mrs. Adaeze N.', role: 'English & Literature Coach', color: JOY.green, photo: PHOTOS.teacherBoard },
  { name: 'Mr. Femi O.', role: 'CBT Exam Strategist', color: JOY.orange, photo: PHOTOS.teacherAfrican },
  { name: 'Dr. Ngozi K.', role: 'Sciences Curriculum Lead', color: JOY.blue, photo: PHOTOS.tutorSession },
  { name: 'Emeka U.', role: 'Student Success Mentor', color: JOY.yellow, photo: PHOTOS.mentorGuidance },
  { name: 'Kemi A.', role: 'Mathematics Coach', color: JOY.lime, photo: PHOTOS.tutorCorner },
]

export default function AboutUsPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[var(--color-paper)] text-[var(--color-ink)]">
      {/* ── 1. Hero Banner ─────────────────────────────────────────────────── */}
      <section className="relative pt-12 lg:pt-20 pb-20">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-8 text-center relative">
          <DoodleSmile className="absolute left-[8%] -top-4 hidden w-16 md:block animate-joy-float" />
          <DoodleRays className="absolute right-[12%] -top-2 hidden w-14 md:block" />
          <div className="mx-auto max-w-[760px]">
            <JoyEyebrow className="mb-5">About Propella</JoyEyebrow>
            <JoyHeading as="h1" size="h1" className="text-[var(--color-ink)]">
              Where care and learning come together
            </JoyHeading>
            <p className="mx-auto mt-6 max-w-[620px] text-[18px] leading-[28px] text-[var(--color-ink)]/75">
              At Propella, we believe every African scholar deserves a nurturing, structured space
              where they feel safe, capable, and inspired to explore, master their syllabus, and grow joyfully.
            </p>
          </div>

          {/* 4 Custom Masked Student Portraits Row */}
          <div className="mt-16 grid grid-cols-2 gap-6 lg:grid-cols-4 lg:gap-8">
            {shapesRow.map((s, i) => (
              <div key={s.photo} className={i % 2 === 1 ? 'lg:translate-y-8' : ''}>
                <JoyMaskedImage
                  src={px(s.photo, 600)}
                  alt="African students studying with structure and joy"
                  shape={s.shape}
                  glow={s.glow}
                  className="transition-transform duration-500 hover:scale-[1.03]"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 2. Our Story (Deep espresso brown) ─────────────────────────────── */}
      <section className="relative py-28 text-white" style={{ backgroundColor: JOY.brown }}>
        <JoyEdge color={JOY.brown} variant="a" />
        <div className="max-w-[1240px] mx-auto px-6 lg:px-8 grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          <div>
            <JoyEyebrow tone="accent" className="mb-5">Our story &amp; purpose</JoyEyebrow>
            <JoyHeading className="text-white">Growing together joyfully from the very start</JoyHeading>
            <p className="mt-6 text-[17px] leading-[27px] text-white/80">
              Propella was born from a simple belief: preparing for Nigerian examinations like JAMB, WAEC,
              and university finals shouldn&apos;t feel frightening or chaotic. Too many bright students fail
              not from lack of intelligence, but from lack of syllabus structure, guidance, and active practice.
            </p>
            <p className="mt-4 text-[17px] leading-[27px] text-white/80">
              We set out to create a calm, encouraging system where learners follow a clear day-by-day roadmap,
              solve authentic CBT past questions, and receive patient, 24/7 AI tutoring the moment they encounter
              a tricky concept.
            </p>
            <div className="mt-8">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-full bg-[var(--color-accent)] px-7 py-3.5 text-[15px] font-semibold text-white transition hover:bg-[var(--color-accent-2)]"
              >
                Join Our Family Free <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[500px]">
            <DoodleStar className="absolute -right-4 -top-8 z-10 w-20 animate-joy-float" />
            <div className="rotate-[3deg] overflow-hidden rounded-[26px] border-[6px] border-white shadow-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={px(PHOTOS.libraryDesk, 1000)}
                alt="Nigerian scholars and mentors working through study materials"
                className="aspect-[5/4] w-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="absolute -bottom-8 -left-4 rounded-[20px] bg-white px-5 py-4 text-[var(--color-ink)] shadow-xl sm:-left-8">
              <p className="text-[34px] font-semibold leading-none" style={{ fontFamily: 'var(--font-display)' }}>
                5.0
              </p>
              <RatingStars className="mt-1.5" />
              <p className="mt-1 text-[13px] text-[var(--color-ink)]/60">Loved by Nigerian scholars</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Mission & Vision ────────────────────────────────────────────── */}
      <section className="relative bg-[var(--color-paper)] py-28">
        <JoyEdge color="var(--color-paper)" variant="c" />
        <div className="max-w-[1240px] mx-auto px-6 lg:px-8 grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          <div className="relative">
            <DoodleSquiggle className="absolute -left-4 -top-8 z-10 w-32" />
            <div className="overflow-hidden rounded-[30px] border-4 border-white shadow-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={px(PHOTOS.libraryCheer, 1000)}
                alt="African students cheering and celebrating high scores in a library"
                className="aspect-[4/3] w-full object-cover"
                loading="lazy"
              />
            </div>
            <DoodleSun className="absolute -bottom-8 right-6 w-20" />
          </div>

          <div className="space-y-12">
            <div className="flex items-start gap-6">
              <div className="w-[100px] shrink-0">
                <JoyMaskedImage src={px(PHOTOS.campusLaughing, 320)} alt="Our mission" shape="scallop" />
              </div>
              <div>
                <JoyHeading as="h3" size="h3">
                  Our mission
                </JoyHeading>
                <p className="mt-3 text-[17px] leading-[27px] text-[var(--color-ink)]/75">
                  To give every Nigerian student an accessible, inspiring, and scientifically proven pathway
                  to academic distinction — combining official syllabus breakdowns, verified CBT past questions,
                  and 24/7 AI mentorship.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="w-[100px] shrink-0">
                <JoyMaskedImage src={px(PHOTOS.pairLawn, 320)} alt="Our vision" shape="flower" />
              </div>
              <div>
                <JoyHeading as="h3" size="h3">
                  Our vision
                </JoyHeading>
                <p className="mt-3 text-[17px] leading-[27px] text-[var(--color-ink)]/75">
                  A continent where examination anxiety is replaced by joyful mastery, where any scholar can
                  target 300+ in JAMB or 8 A1s in WAEC regardless of location or background.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Our Approach ────────────────────────────────────────────────── */}
      <section className="pb-32">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-8">
          <div className="mx-auto max-w-[880px] text-center">
            <JoyEyebrow className="mb-5">Our approach to smart learning</JoyEyebrow>
            <JoyHeading size="h3" className="!text-[26px] !leading-[36px] sm:!text-[32px] sm:!leading-[44px]">
              We know students thrive when they have structure, clarity, and the freedom to explore.
              Our playful approach blends care with discipline, letting each scholar grow at their own pace
              while building lasting confidence and curiosity.
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
        </div>
      </section>

      {/* ── 5. Impact Video Numbers ────────────────────────────────────────── */}
      <section className="pb-28">
        <div className="mx-auto max-w-[1400px] px-4 lg:px-6">
          <JoyVideo
            src={VIDEOS.library.src}
            poster={VIDEOS.library.poster}
            label="Students studying in library"
            className="rounded-[30px]"
            overlay="linear-gradient(0deg, rgba(56,29,15,0.92) 0%, rgba(56,29,15,0.55) 60%, rgba(56,29,15,0.35) 100%)"
            controlsPosition="top-right"
          >
            <div className="relative z-[1] px-6 py-20 sm:px-12 lg:py-28">
              <div className="mx-auto max-w-[640px] text-center text-white">
                <JoyEyebrow tone="dark" className="mb-5">Care in action</JoyEyebrow>
                <JoyHeading className="text-white">Small numbers that reflect big student growth</JoyHeading>
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

      {/* ── 6. Testimonials ─────────────────────────────────────────────────── */}
      <section className="pb-28">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-8">
          <div className="mx-auto max-w-[680px] text-center">
            <JoyEyebrow className="mb-5">Student voices</JoyEyebrow>
            <JoyHeading>Real words from scholars who have grown with us</JoyHeading>
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

      {/* ── 7. Caring Mentors ───────────────────────────────────────────────── */}
      <section className="pb-28">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-8">
          <JoyEyebrow className="mb-5">Caring educators</JoyEyebrow>
          <JoyHeading className="max-w-[580px]">Warm guidance helps children feel safe and confident.</JoyHeading>
          <JoyScroller className="mt-12">
            {mentors.map((m) => (
              <div key={m.name} className="w-[260px] shrink-0 snap-start sm:w-[280px]">
                <div className="overflow-hidden rounded-[20px]" style={{ backgroundColor: m.color }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={px(m.photo, 600)}
                    alt={m.name}
                    className="aspect-[4/5] w-full object-cover"
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
    </div>
  )
}

