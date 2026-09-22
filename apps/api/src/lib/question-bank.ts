import crypto from 'crypto'
import type { ExamType, Prisma } from '../config/db'
import { prisma } from '../config/db'
import { jsonArray, type OptionId, type QuizOption, type QuizQuestion } from '../models/types'

/**
 * Serving real past questions from the admin-managed bank.
 *
 * Every draw is shuffled twice over: which questions come out, and the order
 * of the options within each one. A student who sits the same topic twice
 * gets a different paper, and cannot learn "the answer is always C".
 */

const OPTION_IDS: OptionId[] = ['A', 'B', 'C', 'D']

/** Quiz question ids for bank questions carry this prefix plus the row id. */
export const BANK_ID_PREFIX = 'pq_'

export type RandomInt = (maxExclusive: number) => number

const cryptoRandomInt: RandomInt = (max) => crypto.randomInt(max)

/** Fisher-Yates. Returns a new array; the input is left alone. */
export function shuffle<T>(items: readonly T[], randomInt: RandomInt = cryptoRandomInt): T[] {
  const out = items.slice()
  for (let i = out.length - 1; i > 0; i--) {
    const j = randomInt(i + 1)
    const tmp = out[i]!
    out[i] = out[j]!
    out[j] = tmp
  }
  return out
}

// "All of the above", "A and C", "B only" - these point at option letters or
// positions, so moving the options around would change their meaning.
const POSITIONAL_OPTION = /\b(all|none|both) of the (above|options|foregoing)\b/i
const LETTER_REFERENCE = /\b[A-D]\s*(,|and|&|or)\s*[A-D]\b|^\s*[A-D]\s*only\s*$/

export function hasPositionalOptions(options: readonly QuizOption[]): boolean {
  return options.some((o) => POSITIONAL_OPTION.test(o.text) || LETTER_REFERENCE.test(o.text))
}

/**
 * Re-orders the options and relabels them A-D, moving the correct answer
 * with its text. Questions whose options refer to each other keep their order.
 */
export function shuffleOptions(
  question: QuizQuestion,
  randomInt: RandomInt = cryptoRandomInt,
): QuizQuestion {
  if (question.options.length !== OPTION_IDS.length || hasPositionalOptions(question.options)) {
    return question
  }
  const correct = question.options.find((o) => o.id === question.correctOptionId)
  if (!correct) return question

  const shuffled = shuffle(question.options, randomInt)
  return {
    ...question,
    options: shuffled.map((o, i) => ({ id: OPTION_IDS[i]!, text: o.text })),
    correctOptionId: OPTION_IDS[shuffled.indexOf(correct)]!,
  }
}

type BankRow = {
  id: string
  exam: ExamType
  year: number
  subjectSlug: string
  topicSlug: string | null
  stem: string
  options: Prisma.JsonValue
  correctOptionId: string
  explanation: string | null
  source: string | null
  imageUrl?: string | null
}

/**
 * The bank stores options in their printed order; quizzes get a copy.
 *
 * The fallback explanation names the answer by its text, never its letter,
 * because the letter changes once the options are shuffled.
 */
export function toQuizQuestion(row: BankRow): QuizQuestion {
  const options = jsonArray<QuizOption>(row.options)
  const correct = options.find((o) => o.id === row.correctOptionId)
  const paper = row.source?.trim() || `${row.exam.toUpperCase()} ${row.year}`
  return {
    id: `${BANK_ID_PREFIX}${row.id}`,
    stem: row.stem,
    options,
    correctOptionId: row.correctOptionId as OptionId,
    explanation:
      row.explanation?.trim() ||
      `The correct answer is "${correct?.text ?? row.correctOptionId}". (${paper} past question)`,
    topicSlug: row.topicSlug ?? row.subjectSlug,
    difficulty: 'medium',
    source: paper,
    ...(row.imageUrl ? { imageUrl: row.imageUrl } : {}),
  }
}

/**
 * Chooses which ids to serve: unseen ones first, in random order, then - only
 * when allowed - recently seen ones to make up the count.
 */
export function pickIds(
  candidateIds: readonly string[],
  count: number,
  options: {
    exclude?: ReadonlySet<string> | undefined
    allowRepeats?: boolean | undefined
    randomInt?: RandomInt | undefined
  } = {},
): string[] {
  if (count <= 0) return []
  const exclude = options.exclude ?? new Set<string>()
  const fresh = candidateIds.filter((id) => !exclude.has(id))
  const picked = shuffle(fresh, options.randomInt).slice(0, count)
  if (picked.length < count && options.allowRepeats) {
    const seen = candidateIds.filter((id) => exclude.has(id))
    picked.push(...shuffle(seen, options.randomInt).slice(0, count - picked.length))
  }
  return picked
}

export interface DrawOptions {
  exam: ExamType
  subjectSlug: string
  /** Omit to draw from the whole subject. */
  topicSlug?: string | undefined
  count: number
  /** Bank row ids the student has seen recently. */
  exclude?: ReadonlySet<string> | undefined
  /** Fall back to recently seen questions when there are not enough new ones. */
  allowRepeats?: boolean | undefined
}

/**
 * Draws up to `count` questions, preferring the requested exam and topping up
 * from the other exams' papers - a JAMB biology question is still good WAEC
 * practice. Returns fewer than `count` when the bank runs dry; callers decide
 * whether to fill the gap.
 */
export async function drawPastQuestions(options: DrawOptions): Promise<QuizQuestion[]> {
  if (options.count <= 0) return []

  const base: Prisma.PastQuestionWhereInput = {
    subjectSlug: options.subjectSlug,
    ...(options.topicSlug ? { topicSlug: options.topicSlug } : {}),
  }

  const [sameExam, otherExams] = await Promise.all([
    prisma.pastQuestion.findMany({ where: { ...base, exam: options.exam }, select: { id: true } }),
    prisma.pastQuestion.findMany({
      where: { ...base, exam: { not: options.exam } },
      select: { id: true },
    }),
  ])

  const pickOptions = { exclude: options.exclude, allowRepeats: options.allowRepeats }
  const ids = pickIds(sameExam.map((r) => r.id), options.count, pickOptions)
  if (ids.length < options.count) {
    ids.push(...pickIds(otherExams.map((r) => r.id), options.count - ids.length, pickOptions))
  }
  if (ids.length === 0) return []

  const rows = await prisma.pastQuestion.findMany({ where: { id: { in: ids } } })
  const byId = new Map(rows.map((r) => [r.id, r]))

  // findMany does not keep the `in` order, and that order is the shuffle.
  return ids
    .map((id) => byId.get(id))
    .filter((row): row is NonNullable<typeof row> => row !== undefined)
    .map((row) => shuffleOptions(toQuizQuestion(row)))
}

/** Bank row ids behind a stored quiz's questions. */
export function bankIdsIn(questions: readonly QuizQuestion[]): string[] {
  return questions
    .filter((q) => q.id.startsWith(BANK_ID_PREFIX))
    .map((q) => q.id.slice(BANK_ID_PREFIX.length))
}

/** Past questions the student met in their last few quizzes and mocks. */
export async function recentlySeenBankIds(userId: string, quizzes = 15): Promise<Set<string>> {
  const recent = await prisma.quiz.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: quizzes,
    select: { questions: true },
  })
  return new Set(recent.flatMap((q) => bankIdsIn(jsonArray<QuizQuestion>(q.questions))))
}
