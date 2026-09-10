import type { ExamType } from '@propella/shared'

/**
 * Shapes of the jsonb columns defined in prisma/schema.prisma.
 *
 * These were embedded sub-documents under MongoDB. In Postgres they are stored
 * as jsonb, which has no date type — every date inside a jsonb column is an
 * **ISO-8601 string**, not a `Date`. Parse with `new Date(...)` before doing any
 * date arithmetic, and write with `.toISOString()`.
 */

// ── Subject.topics ───────────────────────────────────────────────────

export type SubjectTopic = {
  slug: string
  name: string
  order: number
  description: string
  estimatedMinutes: number
  prerequisiteSlugs: string[]
  examWeight: number
  examTypes: ExamType[]
}

// ── ExamProfile.subjects ─────────────────────────────────────────────

export type ExamProfileSubject = {
  subjectId: string
  slug: string
  name: string
  isWeak: boolean
  isStrong: boolean
  currentMastery: number
  /** ISO-8601 */
  lastStudiedAt?: string
}

// ── Roadmap.nodes / Roadmap.weeklyTargets ────────────────────────────

export type Sm2State = {
  easeFactor: number
  interval: number
  repetitions: number
}

export type RoadmapNodeStatus =
  | 'locked'
  | 'ready'
  | 'in-progress'
  | 'completed'
  | 'needs-revision'

export type RoadmapNodeJson = {
  subjectSlug: string
  topicSlug: string
  /** ISO-8601 */
  plannedStartDate: string
  /** ISO-8601 */
  plannedEndDate: string
  status: RoadmapNodeStatus
  mastery: number
  revisionsCompleted: number
  revisionsScheduled: number
  /** ISO-8601 */
  lastStudiedAt?: string
  /** ISO-8601 */
  nextRevisionAt?: string
  sm2: Sm2State
  isMilestone: boolean
  milestoneLabel?: string
}

export type WeeklyTargetJson = {
  /** ISO-8601 */
  weekStartDate: string
  topicsToComplete: number
  minutesGoal: number
  quizzesTargeted: number
}

// ── Quiz.questions ───────────────────────────────────────────────────

export type OptionId = 'A' | 'B' | 'C' | 'D'

export type QuizOption = {
  id: OptionId
  text: string
}

export type QuizQuestion = {
  id: string
  stem: string
  options: QuizOption[]
  correctOptionId: OptionId
  explanation: string
  topicSlug: string
  difficulty: 'easy' | 'medium' | 'hard'
}

// ── QuizAttempt.answers / QuizAttempt.byTopic ────────────────────────

export type QuizAnswer = {
  questionId: string
  selectedOptionId: OptionId
  isCorrect: boolean
  timeSpentSec: number
}

export type ByTopicResult = {
  topicSlug: string
  correct: number
  total: number
  masteryDelta: number
}

// ── MarathonRun.topicsCovered / MarathonRun.pauses ───────────────────

export type TopicCovered = {
  subjectSlug: string
  topicSlug: string
  durationSec: number
}

export type MarathonPause = {
  /** ISO-8601 */
  at: string
  durationSec: number
}

// ── ChatThread.messages ──────────────────────────────────────────────

export type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  /** ISO-8601 */
  createdAt: string
  tokens?: number
  attachedTopic?: {
    subjectSlug: string
    topicSlug: string
  }
}

// ── Reminder.payload ─────────────────────────────────────────────────

export type ReminderPayload = {
  title: string
  body: string
  deeplink?: string
}

// ── jsonb helpers ────────────────────────────────────────────────────

/**
 * Reads a jsonb column that holds an array. Prisma types these as
 * `Prisma.JsonValue`, which is not directly indexable.
 */
export function jsonArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : []
}

/** Reads a jsonb column that holds a single object. */
export function jsonObject<T>(value: unknown, fallback: T): T {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as T)
    : fallback
}

/** A headed group of bullet points in generated topic content. */
export type TopicSection = {
  heading: string
  points: string[]
}

/** A worked example: the question, then how to get to the answer. */
export type TopicExample = {
  title: string
  problem: string
  walkthrough: string[]
  answer: string
}
