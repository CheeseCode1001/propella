export const EXAM_TYPES = ['jamb', 'waec', 'neco', 'undergraduate'] as const
export type ExamType = (typeof EXAM_TYPES)[number]

export const PLAN_TYPES = ['free', 'scholar'] as const
export type PlanType = (typeof PLAN_TYPES)[number]

export const SUBSCRIPTION_PLANS = {
  scholar_basic: {
    id: 'scholar_basic',
    name: 'Basic Plan',
    price: 1999,
    priceKobo: 199900,
    durationDays: 30,
    currency: 'NGN',
    interval: 'monthly',
    description: 'Full Scholar access for 1 student for 30 days',
  },
  scholar_shared: {
    id: 'scholar_shared',
    name: 'Shared Plan (Two Accounts)',
    price: 2999,
    priceKobo: 299900,
    durationDays: 30,
    currency: 'NGN',
    interval: 'monthly',
    description: 'Buy one plan and share with your friend or family (2 accounts get full Scholar access for 30 days)',
  },
  scholar_full: {
    id: 'scholar_full',
    name: 'Pay Once Till Exam',
    price: 9999,
    priceKobo: 999900,
    durationDays: 365,
    currency: 'NGN',
    interval: 'exam_season',
    description: 'One-time payment for full Scholar access right up until your exam',
  },
  scholar_monthly: {
    id: 'scholar_monthly',
    name: 'Basic Plan',
    price: 1999,
    priceKobo: 199900,
    durationDays: 30,
    currency: 'NGN',
    interval: 'monthly',
    description: 'Full Scholar access for 1 student for 30 days',
  },
} as const

export type SubscriptionPlanId = keyof typeof SUBSCRIPTION_PLANS

export const TOPIC_STATUSES = ['locked', 'ready', 'in-progress', 'completed', 'needs-revision'] as const
export type TopicStatus = (typeof TOPIC_STATUSES)[number]

export const DIFFICULTY_LEVELS = ['easy', 'medium', 'hard', 'adaptive'] as const
export type DifficultyLevel = (typeof DIFFICULTY_LEVELS)[number]

export const QUIZ_MODES = ['study', 'exam'] as const
export type QuizMode = (typeof QUIZ_MODES)[number]

export const QUIZ_TYPES = ['topic', 'subject', 'mixed', 'weakness', 'mock'] as const
export type QuizType = (typeof QUIZ_TYPES)[number]

// XP amounts
export const XP = {
  SESSION_15_MIN: 10,
  SESSION_25_MIN: 25,
  SESSION_45_MIN: 50,
  QUIZ_PER_CORRECT: 5,
  QUIZ_MAX: 50,
  MOCK_BASE: 100,
  MOCK_PER_PERCENT: 1,
  MARATHON_PER_POMODORO: 30,
  MARATHON_4_PLUS_BONUS: 150,
  STREAK_DAILY_BASE: 15,
  STREAK_DAILY_MAX_MULTIPLIER: 5,
  TOPIC_COMPLETED: 75,
  ROADMAP_MILESTONE: 250,
  DAILY_CHALLENGE: 50,
  STREAK_7_DAYS: 200,
  STREAK_14_DAYS: 500,
  STREAK_30_DAYS: 1000,
  STREAK_60_DAYS: 2500,
  STREAK_100_DAYS: 5000,
} as const

// Rank thresholds (cumulative XP)
export const RANKS = [
  { name: 'Novice', threshold: 0 },
  { name: 'Apprentice', threshold: 500 },
  { name: 'Scholar', threshold: 2000 },
  { name: 'Senior', threshold: 6000 },
  { name: 'Honours', threshold: 15000 },
  { name: 'First Class', threshold: 35000 },
  { name: 'Distinction', threshold: 80000 },
] as const

export function getRank(totalXP: number) {
  let current: (typeof RANKS)[number] = RANKS[0]!
  for (const rank of RANKS) {
    if (totalXP >= rank.threshold) current = rank
    else break
  }
  return current
}

export function getNextRank(totalXP: number) {
  for (let i = 0; i < RANKS.length; i++) {
    if (totalXP < RANKS[i]!.threshold) return RANKS[i]!
  }
  return null
}

// Subject slugs
export const SUBJECT_SLUGS = [
  'english',
  'mathematics',
  'physics',
  'chemistry',
  'biology',
  'government',
  'economics',
  'literature',
  'geography',
  'commerce',
  'principles-of-accounts',
  'agricultural-science',
] as const
export type SubjectSlug = (typeof SUBJECT_SLUGS)[number]

// Study session minimum for streak
export const STREAK_MIN_QUIZ_SCORE = 50
