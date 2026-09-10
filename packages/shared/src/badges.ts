/**
 * The achievement catalogue.
 *
 * Lives in code rather than the database: the definitions are the same for
 * everyone, and both apps need to render a badge from just its id. Only who
 * earned what is stored (the UserBadge table).
 *
 * Copy follows the brand voice — every badge celebrates effort, and none of
 * them imply a student is behind.
 */

export type BadgeCategory = 'streak' | 'study' | 'quiz' | 'mastery' | 'milestone'

export interface BadgeDefinition {
  id: string
  name: string
  /** One line, addressed to the student, saying what they did. */
  description: string
  category: BadgeCategory
  /** Iconsax glyph name, resolved by the badge component. */
  icon: string
  /** What has to reach `threshold` for this badge to be awarded. */
  metric:
    | 'currentStreak'
    | 'studySessions'
    | 'studyMinutes'
    | 'quizzesCompleted'
    | 'quizPerfectScores'
    | 'topicsCompleted'
    | 'totalXP'
  threshold: number
}

export const BADGES: BadgeDefinition[] = [
  // ── Streaks ──────────────────────────────────────────────────────────
  {
    id: 'streak-3',
    name: 'Getting going',
    description: 'You studied three days in a row.',
    category: 'streak',
    icon: 'Flash',
    metric: 'currentStreak',
    threshold: 3,
  },
  {
    id: 'streak-7',
    name: 'One week strong',
    description: 'Seven days in a row. The habit is forming.',
    category: 'streak',
    icon: 'Flash',
    metric: 'currentStreak',
    threshold: 7,
  },
  {
    id: 'streak-30',
    name: 'A month of showing up',
    description: 'Thirty days in a row. That is real consistency.',
    category: 'streak',
    icon: 'Flash',
    metric: 'currentStreak',
    threshold: 30,
  },

  // ── Study sessions ───────────────────────────────────────────────────
  {
    id: 'first-session',
    name: 'First step',
    description: 'You finished your first study session.',
    category: 'study',
    icon: 'Book1',
    metric: 'studySessions',
    threshold: 1,
  },
  {
    id: 'sessions-25',
    name: 'Twenty-five sessions',
    description: 'Twenty-five study sessions completed.',
    category: 'study',
    icon: 'Book1',
    metric: 'studySessions',
    threshold: 25,
  },
  {
    id: 'minutes-600',
    name: 'Ten hours in',
    description: 'Ten hours of focused study behind you.',
    category: 'study',
    icon: 'Clock',
    metric: 'studyMinutes',
    threshold: 600,
  },
  {
    id: 'minutes-3000',
    name: 'Fifty hours in',
    description: 'Fifty hours of study. That adds up.',
    category: 'study',
    icon: 'Clock',
    metric: 'studyMinutes',
    threshold: 3000,
  },

  // ── Quizzes ──────────────────────────────────────────────────────────
  {
    id: 'first-quiz',
    name: 'First quiz done',
    description: 'You completed your first quiz.',
    category: 'quiz',
    icon: 'TaskSquare',
    metric: 'quizzesCompleted',
    threshold: 1,
  },
  {
    id: 'quizzes-50',
    name: 'Fifty quizzes',
    description: 'Fifty quizzes completed. Practice is paying off.',
    category: 'quiz',
    icon: 'TaskSquare',
    metric: 'quizzesCompleted',
    threshold: 50,
  },
  {
    id: 'perfect-1',
    name: 'Full marks',
    description: 'You scored 100% on a quiz.',
    category: 'quiz',
    icon: 'Medal',
    metric: 'quizPerfectScores',
    threshold: 1,
  },
  {
    id: 'perfect-10',
    name: 'Ten perfect scores',
    description: 'Ten quizzes with every question right.',
    category: 'quiz',
    icon: 'Medal',
    metric: 'quizPerfectScores',
    threshold: 10,
  },

  // ── Syllabus progress ────────────────────────────────────────────────
  {
    id: 'topics-10',
    name: 'Ten topics down',
    description: 'Ten syllabus topics completed.',
    category: 'mastery',
    icon: 'BookSquare',
    metric: 'topicsCompleted',
    threshold: 10,
  },
  {
    id: 'topics-50',
    name: 'Fifty topics down',
    description: 'Fifty topics completed. You are covering real ground.',
    category: 'mastery',
    icon: 'BookSquare',
    metric: 'topicsCompleted',
    threshold: 50,
  },

  // ── XP milestones ────────────────────────────────────────────────────
  {
    id: 'xp-1000',
    name: '1,000 XP',
    description: 'You have earned your first thousand XP.',
    category: 'milestone',
    icon: 'Star1',
    metric: 'totalXP',
    threshold: 1000,
  },
  {
    id: 'xp-10000',
    name: '10,000 XP',
    description: 'Ten thousand XP earned.',
    category: 'milestone',
    icon: 'Star1',
    metric: 'totalXP',
    threshold: 10000,
  },
]

const BADGES_BY_ID = new Map(BADGES.map((b) => [b.id, b]))

export function getBadge(id: string): BadgeDefinition | undefined {
  return BADGES_BY_ID.get(id)
}

/** The metrics a badge check runs against. */
export interface BadgeMetrics {
  currentStreak: number
  studySessions: number
  studyMinutes: number
  quizzesCompleted: number
  quizPerfectScores: number
  topicsCompleted: number
  totalXP: number
}

/**
 * Which badges these metrics qualify for, excluding ones already held.
 *
 * Pure so both the awarding job and any preview UI can use the same rules.
 */
export function evaluateBadges(
  metrics: BadgeMetrics,
  alreadyEarned: readonly string[],
): { badge: BadgeDefinition; value: number }[] {
  const held = new Set(alreadyEarned)

  return BADGES.filter((badge) => !held.has(badge.id))
    .map((badge) => ({ badge, value: metrics[badge.metric] }))
    .filter(({ badge, value }) => value >= badge.threshold)
}
