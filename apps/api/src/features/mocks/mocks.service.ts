import type { Quiz, QuizAttempt, ExamType } from '../../config/db'
import { prisma } from '../../config/db'
import { NotFoundError, AppError } from '../../middleware/error-handler'
import { generateQuestions } from '../quizzes/quiz-generation'
import { QUIZ_MODEL } from '../../lib/gemini'
import { logger } from '../../config/logger'
import {
  jsonArray,
  type ByTopicResult,
  type OptionId,
  type QuizAnswer,
  type QuizQuestion,
  type SubjectTopic,
} from '../../models/types'

const JAMB_TIME_LIMIT = 7200 // 2 hours in seconds
const WAEC_NECO_TIME_LIMIT = 10800 // 3 hours in seconds
const JAMB_QUESTIONS_PER_SUBJECT = 40
const WAEC_NECO_TOTAL_QUESTIONS = 60

export async function generateMock(
  userId: string,
  examType: ExamType,
  subjectSlugs: string[],
): Promise<Quiz> {
  // Fetch subjects
  const subjects = await prisma.subject.findMany({
    where: { slug: { in: subjectSlugs }, examTypes: { has: examType } },
  })

  if (subjects.length === 0) {
    throw new NotFoundError('No matching subjects found for the given exam type')
  }

  const timeLimit = examType === 'jamb' ? JAMB_TIME_LIMIT : WAEC_NECO_TIME_LIMIT

  let allQuestions: QuizQuestion[] = []

  if (examType === 'jamb') {
    // 40 questions per subject
    for (const subject of subjects) {
      const topicsForExam = jsonArray<SubjectTopic>(subject.topics).filter((t) =>
        t.examTypes.includes(examType),
      )
      if (topicsForExam.length === 0) continue

      const questionsPerTopic = Math.ceil(JAMB_QUESTIONS_PER_SUBJECT / topicsForExam.length)

      for (const topic of topicsForExam.slice(0, Math.min(5, topicsForExam.length))) {
        try {
          const count = Math.min(questionsPerTopic, 10)
          const questions = await generateQuestions({
            examType,
            subjectName: subject.name,
            topicName: topic.name,
            topicSlug: topic.slug,
            difficulty: 'medium',
            count,
          })
          allQuestions = allQuestions.concat(questions)
        } catch (err) {
          logger.warn({ err, topicSlug: topic.slug }, 'Failed to generate questions for topic')
        }
      }
    }
  } else {
    // WAEC/NECO: 60 questions spread across all subjects
    const questionsPerSubject = Math.ceil(WAEC_NECO_TOTAL_QUESTIONS / subjects.length)

    for (const subject of subjects) {
      const topicsForExam = jsonArray<SubjectTopic>(subject.topics).filter((t) =>
        t.examTypes.includes(examType),
      )
      const firstTopic = topicsForExam[0]
      if (!firstTopic) continue

      try {
        const count = Math.min(questionsPerSubject, 20)
        const questions = await generateQuestions({
          examType,
          subjectName: subject.name,
          topicName: firstTopic.name,
          topicSlug: firstTopic.slug,
          difficulty: 'medium',
          count,
        })
        allQuestions = allQuestions.concat(questions)
      } catch (err) {
        logger.warn({ err, subjectSlug: subject.slug }, 'Failed to generate questions for subject')
      }
    }
  }

  if (allQuestions.length === 0) {
    throw new AppError(500, 'Failed to generate any questions for the mock exam')
  }

  return prisma.quiz.create({
    data: {
      userId,
      type: 'mock',
      difficulty: 'medium',
      questionCount: allQuestions.length,
      timeLimit,
      questions: allQuestions,
      generatedByModel: QUIZ_MODEL,
    },
  })
}

export async function startMockAttempt(userId: string, mockId: string): Promise<QuizAttempt> {
  const mock = await prisma.quiz.findFirst({
    where: { id: mockId, userId, type: 'mock' },
    select: { id: true },
  })

  if (!mock) throw new NotFoundError('Mock exam not found')

  return prisma.quizAttempt.create({
    data: { quizId: mock.id, userId, startedAt: new Date() },
  })
}

export async function submitMock(
  userId: string,
  attemptId: string,
  input: {
    quizId: string
    answers: Array<{
      questionId: string
      selectedOptionId: string
      timeSpentSec: number
    }>
    durationSec: number
  },
): Promise<{ attempt: QuizAttempt; xpAwarded: number }> {
  const [existingAttempt, quiz] = await Promise.all([
    prisma.quizAttempt.findFirst({ where: { id: attemptId, userId } }),
    prisma.quiz.findUnique({ where: { id: input.quizId } }),
  ])

  if (!existingAttempt) throw new NotFoundError('Attempt not found')
  if (!quiz) throw new NotFoundError('Mock quiz not found')
  if (existingAttempt.completedAt) throw new AppError(400, 'Attempt already submitted')

  const questionMap = new Map(
    jsonArray<QuizQuestion>(quiz.questions).map((q) => [q.id, q]),
  )

  const gradedAnswers: QuizAnswer[] = input.answers.map((a) => {
    const question = questionMap.get(a.questionId)
    return {
      questionId: a.questionId,
      selectedOptionId: a.selectedOptionId as OptionId,
      isCorrect: question ? question.correctOptionId === a.selectedOptionId : false,
      timeSpentSec: a.timeSpentSec,
    }
  })

  const correctCount = gradedAnswers.filter((a) => a.isCorrect).length
  const totalCount = gradedAnswers.length
  const score = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0

  // Group by topic for byTopic results
  const topicGroups = new Map<string, { correct: number; total: number }>()
  for (const answer of gradedAnswers) {
    const topicSlug = questionMap.get(answer.questionId)?.topicSlug ?? 'unknown'
    const group = topicGroups.get(topicSlug) ?? { correct: 0, total: 0 }
    group.total += 1
    if (answer.isCorrect) group.correct += 1
    topicGroups.set(topicSlug, group)
  }

  const byTopic: ByTopicResult[] = Array.from(topicGroups.entries()).map(
    ([topicSlug, { correct, total }]) => ({ topicSlug, correct, total, masteryDelta: 0 }),
  )

  // XP: base 100 + 1 per percent
  const xpAwarded = 100 + score

  await prisma.xPEvent.create({
    data: {
      userId,
      source: 'mock',
      sourceId: existingAttempt.id,
      amount: xpAwarded,
      reason: `Mock exam: ${score}% score`,
    },
  })

  const attempt = await prisma.quizAttempt.update({
    where: { id: existingAttempt.id },
    data: {
      answers: gradedAnswers,
      score,
      byTopic,
      xpAwarded,
      durationSec: input.durationSec,
      completedAt: new Date(),
    },
  })

  return { attempt, xpAwarded }
}

export async function getMockAttemptResult(
  userId: string,
  attemptId: string,
): Promise<{ attempt: QuizAttempt; quiz: Quiz }> {
  const attempt = await prisma.quizAttempt.findFirst({
    where: { id: attemptId, userId },
    include: { quiz: true },
  })

  if (!attempt) throw new NotFoundError('Attempt not found')

  const { quiz, ...rest } = attempt
  return { attempt: rest, quiz }
}

export async function getMockHistory(userId: string): Promise<
  Array<{
    mockId: string
    attemptId: string | null
    score: number | null
    questionCount: number
    timeLimit: number
    createdAt: string
    completedAt: string | null
  }>
> {
  const mocks = await prisma.quiz.findMany({
    where: { userId, type: 'mock' },
    orderBy: { createdAt: 'desc' },
    take: 20,
    include: {
      attempts: {
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { id: true, score: true, completedAt: true },
      },
    },
  })

  return mocks.map((m) => {
    const attempt = m.attempts[0]
    return {
      mockId: m.id,
      attemptId: attempt?.id ?? null,
      score: attempt?.completedAt ? attempt.score : null,
      questionCount: m.questionCount,
      timeLimit: m.timeLimit ?? JAMB_TIME_LIMIT,
      createdAt: m.createdAt.toISOString(),
      completedAt: attempt?.completedAt ? attempt.completedAt.toISOString() : null,
    }
  })
}
