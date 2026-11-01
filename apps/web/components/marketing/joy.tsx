/**
 * Joy design-system primitives for Propella's marketing surfaces.
 *
 * Visual language modelled on the Joyloo system: warm cream paper, charcoal ink,
 * coral-orange accent, playful colour blocks, organic masked portraits
 * (scallop / starburst / cog / hexagon / flower), hand-drawn doodles and
 * angled section edges. All doodles are original inline SVGs so we don't
 * depend on third-party CDNs.
 */
import type { CSSProperties, ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

// ─── Media catalogue (Pexels — African / Black students & educators) ─────────

export const px = (id: number, w = 900) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`

export const pxVideoPoster = (id: number, w = 1600) =>
  `https://images.pexels.com/videos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`

export const PHOTOS = {
  // Campus & University students
  campusLaughing: 6146970, // students laughing & studying on campus lawn
  campusGroup: 6146978, // group studying on campus lawn
  pairStudying: 6147369, // two students working through notes
  pairLawn: 6147010, // pair studying on the grass
  studentNotebooks: 6147076, // students with notebooks outside a hall
  studentWriting: 6147003, // student writing notes
  studentFocused: 6147134, // student focused on a textbook
  studentLaughing: 6146928, // student laughing with a friend
  studentsWalking: 6147160, // students walking to class
  studentsChatting: 6147240, // two students chatting on campus
  universityGirl: 6146973, // female university student smiling with tablet
  quadStudy: 6146961, // students gathered in quad
  libraryGroup: 6146975, // students discussing in library
  pathwayWalk: 6147000, // students walking on campus pathway
  lectureHall: 6147111, // scholars attending a lecture
  projectTeam: 6147120, // students collaborating on project
  tutorCorner: 6147372, // student receiving guidance

  // High school & Secondary scholars
  girlBooks: 3762800, // student holding books outside
  girlLaptop: 3769021, // smiling student at a laptop
  boyLaptop: 5905700, // young student learning on a laptop
  girlOnlineClass: 5905709, // student in an online class
  kidsStudying: 5905480, // children studying together
  kidsHomework: 5905850, // children doing homework at a table
  teenNotebook: 5905710, // teenage scholar taking detailed notes
  boyStudying: 5905701, // young boy studying attentively
  girlDesk: 5905705, // young girl writing at desk
  studentScreen: 5905708, // student looking at screen thoughtfully
  duoMath: 5905488, // two students solving a problem together
  classNotes: 5905497, // students sharing notes
  studyDesk: 5905860, // scholar at study desk with books

  // Secondary Classroom & Exams
  classroomDiscussion: 7092614, // secondary school students discussing in classroom
  examPrep: 7092336, // student practicing exam test paper
  teacherBoard: 7092340, // teacher explaining formula on board
  scienceLab: 7092615, // secondary students in science lab
  groupProblem: 7092617, // students solving problem around table
  examHall: 7092620, // students seated in timed test

  // High school scholars & mentors
  highschoolGirl: 5212345, // secondary school girl smiling with textbook
  highschoolBoy: 5212348, // student listening attentively
  teacherAfrican: 5212703, // African teacher mentoring student
  classmatesSmile: 5212359, // friends smiling after successful mock test
  classroomLecture: 5212361, // teacher presenting lesson to classroom

  // Library & Achievement
  libraryReading: 8199563, // quiet study at library desk
  libraryDesk: 8199565, // student with reference books
  bookStack: 8199600, // library book stack with student
  readingJoy: 8199143, // student enjoying study progress
  tutorSession: 8199166, // tutor helping scholar with tricky question
  libraryCheer: 8199562, // students cheering in a library

  // Distinction & Success
  gradSmile: 4145153, // graduate holding certificate proudly
  gradCheer: 4145155, // successful scholars celebrating
  distinctionLady: 4145190, // smiling high-achiever
  proudGraduate: 4144923, // scholar looking forward with confidence
  honorsGroup: 4144222, // university honors students

  // Digital Learning & Contact
  headphonesStudy: 7972743, // student learning with headphones
  onlineTutor: 7972740, // scholar interacting with tutor online
  laptopSmiling: 7972738, // young Nigerian student smiling at laptop
  studySupport: 7972742, // student receiving online study assistance

  // Classroom Collaboration
  activeHands: 8466775, // students raising hands in class
  peerTutoring: 8466778, // students explaining concept to peer
  mentorGuidance: 8466780, // teacher guiding a student

  // Educators & Mentors
  tutorLaptop: 5905740, // educator working on a laptop
  teacherSmiling: 1181519, // smiling educator by a whiteboard
  teacherExam: 7092613, // teacher explaining exam rules
  mentorsTalking: 935949, // students in conversation at a study hall
  familyStudy: 4260325, // parent helping a learner study
} as const

export const VIDEOS = {
  hero: {
    src: 'https://videos.pexels.com/video-files/8199326/8199326-hd_1280_720_25fps.mp4',
    poster: pxVideoPoster(8199326),
  },
  classroom: {
    src: 'https://videos.pexels.com/video-files/7092068/7092068-hd_1280_720_30fps.mp4',
    poster: pxVideoPoster(7092068),
  },
  studyGroup: {
    src: 'https://videos.pexels.com/video-files/8199325/8199325-hd_1280_720_25fps.mp4',
    poster: pxVideoPoster(8199325),
  },
  library: {
    src: 'https://videos.pexels.com/video-files/8199327/8199327-hd_1280_720_25fps.mp4',
    poster: pxVideoPoster(8199327),
  },
  celebration: {
    src: 'https://videos.pexels.com/video-files/8199329/8199329-hd_1280_720_25fps.mp4',
    poster: pxVideoPoster(8199329),
  },
  teacher: {
    src: 'https://videos.pexels.com/video-files/7092069/7092069-hd_1280_720_30fps.mp4',
    poster: pxVideoPoster(7092069),
  },
  mentorship: {
    src: 'https://videos.pexels.com/video-files/7092070/7092070-hd_1280_720_30fps.mp4',
    poster: pxVideoPoster(7092070),
  },
} as const

// ─── Joy palette ─────────────────────────────────────────────────────────────

export const JOY = {
  orange: '#FF8555',
  green: '#2EBB5E',
  blue: '#58A5EF',
  yellow: '#FFE494',
  amber: '#FFAD28',
  brown: '#381D0F',
  lime: '#D6F48F',
  accent: '#F8642B',
  ink: '#1A1917',
  paper: '#F8F6F1',
} as const

// ─── Organic shape masks ─────────────────────────────────────────────────────

export type JoyShape = 'scallop' | 'flower' | 'starburst' | 'cog' | 'hexagon' | 'circle' | 'arch'

function polar(fn: (t: number) => number, steps = 180) {
  const pts: string[] = []
  for (let i = 0; i < steps; i++) {
    const t = (i / steps) * Math.PI * 2
    const r = fn(t)
    pts.push(`${(50 + r * Math.cos(t)).toFixed(2)},${(50 + r * Math.sin(t)).toFixed(2)}`)
  }
  return `M${pts.join('L')}Z`
}

function roundedPolygon(sides: number, r: number, corner: number, rotation = -Math.PI / 2) {
  const verts = Array.from({ length: sides }, (_, i) => {
    const a = rotation + (i / sides) * Math.PI * 2
    return [50 + r * Math.cos(a), 50 + r * Math.sin(a)] as const
  })
  let d = ''
  verts.forEach((v, i) => {
    const prev = verts[(i - 1 + sides) % sides]
    const next = verts[(i + 1) % sides]
    const toward = (a: readonly [number, number], b: readonly [number, number], k: number) => {
      const dx = b[0] - a[0]
      const dy = b[1] - a[1]
      const len = Math.hypot(dx, dy)
      return [a[0] + (dx / len) * k, a[1] + (dy / len) * k]
    }
    const p1 = toward(v, prev, corner)
    const p2 = toward(v, next, corner)
    d += `${i === 0 ? 'M' : 'L'}${p1[0].toFixed(2)},${p1[1].toFixed(2)}Q${v[0].toFixed(2)},${v[1].toFixed(2)} ${p2[0].toFixed(2)},${p2[1].toFixed(2)}`
  })
  return `${d}Z`
}

export const SHAPE_PATHS: Record<JoyShape, string> = {
  scallop: polar((t) => 45 + 4 * Math.cos(12 * t)),
  flower: polar((t) => 41 + 9 * Math.pow(Math.abs(Math.cos(4 * t)), 0.7)),
  starburst: polar((t) => 43 + 6.5 * Math.tanh(3 * Math.cos(10 * t))),
  cog: polar((t) => 43 + 6 * Math.tanh(6 * Math.cos(8 * t)), 360),
  hexagon: roundedPolygon(6, 49, 9, 0),
  circle: polar(() => 49),
  arch: 'M2,50C2,23.5 23.5,2 50,2C76.5,2 98,23.5 98,50L98,92Q98,98 92,98L8,98Q2,98 2,92Z',
}

interface JoyMaskedImageProps {
  src: string
  alt: string
  shape: JoyShape
  /** Optional colour that washes up from the bottom of the shape (Joyloo glow). */
  glow?: string
  className?: string
  style?: CSSProperties
}

/** An image clipped into one of the organic Joy shapes. */
export function JoyMaskedImage({ src, alt, shape, glow, className, style }: JoyMaskedImageProps) {
  const id = `joy-${shape}-${Math.abs(hash(src + (glow ?? '')))}`
  return (
    <svg
      viewBox="0 0 100 100"
      role="img"
      aria-label={alt}
      className={cn('block w-full h-auto', className)}
      style={style}
    >
      <defs>
        <clipPath id={`${id}-clip`}>
          <path d={SHAPE_PATHS[shape]} />
        </clipPath>
        {glow && (
          <linearGradient id={`${id}-glow`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="45%" stopColor={glow} stopOpacity="0" />
            <stop offset="100%" stopColor={glow} stopOpacity="0.92" />
          </linearGradient>
        )}
      </defs>
      <g clipPath={`url(#${id}-clip)`}>
        <rect width="100" height="100" fill="#E6E0D3" />
        <image href={src} width="100" height="100" preserveAspectRatio="xMidYMid slice" />
        {glow && <rect width="100" height="100" fill={`url(#${id}-glow)`} />}
      </g>
    </svg>
  )
}

function hash(s: string) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  return h
}

// ─── Eyebrow pill ────────────────────────────────────────────────────────────

export function JoyEyebrow({
  children,
  tone = 'light',
  className,
}: {
  children: ReactNode
  tone?: 'light' | 'dark' | 'accent'
  className?: string
}) {
  const tones = {
    light: 'bg-white text-[var(--color-accent)] border border-[var(--color-rule)]',
    dark: 'bg-white/10 text-[#FFAD28] border border-white/15',
    accent: 'bg-[var(--color-accent)] text-white border border-transparent',
  }
  return (
    <span
      data-slot="badge"
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-4 py-1 font-[family-name:var(--font-hand)] text-[16px] leading-tight font-normal uppercase tracking-wide shadow-sm',
        tones[tone],
        className,
      )}
      style={{ fontFamily: 'var(--font-hand)' }}
    >
      <SparkleWand className="h-4 w-4 shrink-0" />
      {children}
    </span>
  )
}

// ─── Headings ────────────────────────────────────────────────────────────────

export function JoyHeading({
  as: Tag = 'h2',
  children,
  className,
  size = 'h2',
}: {
  as?: 'h1' | 'h2' | 'h3'
  children: ReactNode
  className?: string
  size?: 'h1' | 'h2' | 'h3'
}) {
  const sizes = {
    h1: 'text-[40px] leading-[48px] sm:text-[52px] sm:leading-[60px] lg:text-[62px] lg:leading-[72px]',
    h2: 'text-[32px] leading-[40px] sm:text-[40px] sm:leading-[50px] lg:text-[48px] lg:leading-[58px]',
    h3: 'text-[24px] leading-[32px] lg:text-[32px] lg:leading-[42px]',
  }
  return (
    <Tag
      className={cn('font-semibold tracking-[-0.02em]', sizes[size], className)}
      style={{ fontFamily: 'var(--font-display)' }}
    >
      {children}
    </Tag>
  )
}

// ─── Section edges ───────────────────────────────────────────────────────────

/** Angled, hand-cut edge used where Joyloo sections meet. */
export function JoyEdge({
  color,
  position = 'top',
  variant = 'a',
  className,
}: {
  color: string
  position?: 'top' | 'bottom'
  variant?: 'a' | 'b' | 'c'
  className?: string
}) {
  const paths = {
    a: 'M0,38 L22,14 L48,30 L74,6 L100,24 L100,40 L0,40 Z',
    b: 'M0,20 L18,34 L44,10 L70,28 L100,8 L100,40 L0,40 Z',
    c: 'M0,30 C20,6 40,6 55,22 C70,38 85,30 100,10 L100,40 L0,40 Z',
  }
  return (
    <svg
      aria-hidden
      viewBox="0 0 100 40"
      preserveAspectRatio="none"
      className={cn(
        'pointer-events-none absolute left-0 w-full h-[44px] sm:h-[64px] lg:h-[80px]',
        position === 'top' ? 'bottom-full -mb-px' : 'top-full -mt-px rotate-180',
        className,
      )}
    >
      <path d={paths[variant]} fill={color} />
    </svg>
  )
}

// ─── Hand-drawn doodles (original artwork) ───────────────────────────────────

export function SparkleWand({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M4 20 14.5 9.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="m13 8 3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M18 2.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7zM8 3l.5 1.2 1.2.5-1.2.5L8 6.4l-.5-1.2-1.2-.5 1.2-.5zM20 11l.5 1.2 1.2.5-1.2.5-.5 1.2-.5-1.2-1.2-.5 1.2-.5z"
        fill="currentColor"
      />
    </svg>
  )
}

export function DoodleSmile({ className, color = JOY.green }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 64 48" fill="none" className={className} aria-hidden>
      <path d="M14 10c-1 4-1 8 1 11" stroke={color} strokeWidth="4" strokeLinecap="round" />
      <path d="M30 6c-1 4-1 8 1 11" stroke={color} strokeWidth="4" strokeLinecap="round" />
      <path d="M6 28c8 14 34 18 50 2" stroke={color} strokeWidth="4.5" strokeLinecap="round" />
      <path d="M52 22l6 6-7 4" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function DoodleRays({ className, color = JOY.accent }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden>
      <path d="M10 30 4 34" stroke={color} strokeWidth="4" strokeLinecap="round" />
      <path d="M18 18 12 8" stroke={color} strokeWidth="4" strokeLinecap="round" />
      <path d="M30 14 32 3" stroke={color} strokeWidth="4" strokeLinecap="round" />
      <path d="M38 22 46 16" stroke={color} strokeWidth="4" strokeLinecap="round" />
    </svg>
  )
}

export function DoodleStar({ className, color = JOY.green }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <path
        d="M32 3c2.6 10.6 7.5 17.8 14.6 21.4L61 32l-14.4 7.6C39.5 43.2 34.6 50.4 32 61c-2.6-10.6-7.5-17.8-14.6-21.4L3 32l14.4-7.6C24.5 20.8 29.4 13.6 32 3Z"
        fill={color}
        stroke={JOY.ink}
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function DoodleSquiggle({ className, color = JOY.accent }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 120 40" fill="none" className={className} aria-hidden>
      <path
        d="M4 28c8-16 16-16 22 0s14 16 22 0 16-16 22 0 14 16 22 0 14-16 22 0"
        stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function DoodleSun({ className, color = JOY.amber }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden>
      <circle cx="32" cy="32" r="12" fill={color} />
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2
        return (
          <path
            key={i}
            d={`M${32 + Math.cos(a) * 18} ${32 + Math.sin(a) * 18}L${32 + Math.cos(a) * 27} ${32 + Math.sin(a) * 27}`}
            stroke={color}
            strokeWidth="4.5"
            strokeLinecap="round"
          />
        )
      })}
    </svg>
  )
}

export function DoodleSwirl({ className, color = 'currentColor' }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" className={className} aria-hidden>
      <path
        d="M10 100C30 60 70 110 80 70S40 20 70 14s46 30 30 56"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}

/** Five filled stars, used on the rating badge. */
export function RatingStars({ className, color = JOY.amber }: { className?: string; color?: string }) {
  return (
    <span className={cn('inline-flex gap-0.5', className)} aria-label="5 out of 5 stars">
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} viewBox="0 0 20 20" className="h-4 w-4" aria-hidden>
          <path
            d="M10 1.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L10 14.8l-5.2 2.8 1-5.8L1.5 7.7l5.9-.8z"
            fill={color}
          />
        </svg>
      ))}
    </span>
  )
}

