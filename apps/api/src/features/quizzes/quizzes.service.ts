import type { ExamType, Quiz, QuizAttempt, QuizMode } from '../../config/db'
import { prisma } from '../../config/db'
import { NotFoundError, AppError } from '../../middleware/error-handler'
import { generateQuestions, PAST_QUESTION_BANK } from './quiz-generation'
import {
  bankIdsIn,
  drawPastQuestions,
  recentlySeenBankIds,
  shuffle,
  shuffleOptions,
} from '../../lib/question-bank'
import { calculateSM2, gradeFromPercentage } from '../../lib/spaced-repetition'
import { recordStreakActivity } from '../gamification/streak'
import { QUIZ_MODEL } from '../../lib/gemini'
import { notify } from '../notifications/notification.service'
import { logger } from '../../config/logger'
import {
  jsonArray,
  type ByTopicResult,
  type OptionId,
  type QuizAnswer,
  type QuizQuestion,
  type RoadmapNodeJson,
  type SubjectTopic,
} from '../../models/types'

export interface GenerateQuizInput {
  subjectSlug: string
  /** Required for every type except 'subject', which draws from the whole subject. */
  topicSlug?: string | undefined
  type: 'topic' | 'subject' | 'mixed' | 'weakness' | 'mock'
  difficulty: 'easy' | 'medium' | 'hard' | 'adaptive'
  mode: QuizMode
  questionCount: number
}

export interface SubmitQuizInput {
  quizId: string
  answers: Array<{
    questionId: string
    selectedOptionId: OptionId
    timeSpentSec: number
  }>
  durationSec: number
}

export async function generateQuiz(
  userId: string,
  input: GenerateQuizInput,
): Promise<Quiz> {
  // Fetch subject + topic info
  const subject = await prisma.subject.findUnique({ where: { slug: input.subjectSlug } })
  if (!subject) {
    throw new NotFoundError(`Subject not found: ${input.subjectSlug}`)
  }

  const topics = jsonArray<SubjectTopic>(subject.topics)
  const wholeSubject = input.type === 'subject' && !input.topicSlug
  const topic = wholeSubject ? undefined : topics.find((t) => t.slug === input.topicSlug)
  if (!wholeSubject && !topic) {
    throw new NotFoundError(`Topic not found: ${input.topicSlug ?? ''}`)
  }

  // The student's own exam first; the bank tops up from other exams' papers.
  const profile = await prisma.examProfile.findUnique({
    where: { userId },
    select: { examType: true },
  })
  const examType: ExamType =
    profile && subject.examTypes.includes(profile.examType)
      ? profile.examType
      : (subject.examTypes[0] ?? 'jamb')

  // Real past questions come first, drawn fresh and shuffled on every quiz.
  const seen = await recentlySeenBankIds(userId)
  const fromBank = await drawPastQuestions({
    exam: examType,
    subjectSlug: subject.slug,
    topicSlug: topic?.slug,
    count: input.questionCount,
    exclude: seen,
  })

  let questions: QuizQuestion[] = fromBank
  let usedAi = false
  const shortfall = input.questionCount - fromBank.length

  if (shortfall > 0) {
    // AI fills whatever the bank could not. A whole-subject quiz picks a topic
    // at random so the gap does not always come from the same one.
    const aiTopic = topic ?? shuffle(topics.filter((t) => t.examTypes.includes(examType)))[0]
    try {
      if (!aiTopic) throw new AppError(404, `No topics available for ${subject.name}`)
      const generated = await generateQuestions({
        examType,
        subjectName: subject.name,
        topicName: aiTopic.name,
        topicSlug: aiTopic.slug,
        difficulty: input.difficulty === 'adaptive' ? 'medium' : input.difficulty,
        count: shortfall,
        recentStems: await recentStemsFor(userId, aiTopic.slug),
      })
      questions = questions.concat(generated.map((q) => shuffleOptions(q)))
      usedAi = true
    } catch (err) {
      // Without the AI the quiz can still run on past questions - repeats
      // included - as long as the bank has any for this topic at all.
      const repeats = await drawPastQuestions({
        exam: examType,
        subjectSlug: subject.slug,
        topicSlug: topic?.slug,
        count: shortfall,
        exclude: new Set(bankIdsIn(fromBank)),
      })
      questions = questions.concat(repeats)
      if (questions.length === 0) throw err
      logger.warn({ err, subjectSlug: subject.slug }, 'AI top-up failed; serving past questions only')
    }
  }

  return prisma.quiz.create({
    data: {
      userId,
      type: input.type,
      topicSubjectSlug: input.subjectSlug,
      topicTopicSlug: topic?.slug ?? null,
      subjectSlug: input.subjectSlug,
      difficulty: input.difficulty,
      mode: input.mode,
      questionCount: questions.length,
      questions: shuffle(questions),
      generatedByModel: usedAi ? QUIZ_MODEL : PAST_QUESTION_BANK,
    },
  })
}

/** Stems from the student's recent quizzes on a topic, so the AI avoids them. */
async function recentStemsFor(userId: string, topicSlug: string): Promise<string[]> {
  const recentAttempts = await prisma.quizAttempt.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: { quizId: true },
  })

  const recentQuizzes = await prisma.quiz.findMany({
    where: {
      id: { in: recentAttempts.map((a) => a.quizId) },
      topicTopicSlug: topicSlug,
    },
    select: { questions: true },
  })

  return recentQuizzes
    .flatMap((q) => jsonArray<QuizQuestion>(q.questions).map((qu) => qu.stem))
    .slice(0, 10)
}

export async function startAttempt(userId: string, quizId: string): Promise<QuizAttempt> {
  const quiz = await prisma.quiz.findFirst({
    where: { id: quizId, userId },
    select: { id: true },
  })

  if (!quiz) {
    throw new NotFoundError('Quiz not found')
  }

  return prisma.quizAttempt.create({
    data: { quizId: quiz.id, userId, startedAt: new Date() },
  })
}

export async function submitAttempt(
  userId: string,
  attemptId: string,
  input: SubmitQuizInput,
): Promise<{
  attempt: QuizAttempt
  xpAwarded: number
  masteryUpdates: Array<{ topicSlug: string; mastery: number }>
}> {
  const [existingAttempt, quiz] = await Promise.all([
    prisma.quizAttempt.findFirst({ where: { id: attemptId, userId } }),
    prisma.quiz.findUnique({ where: { id: input.quizId } }),
  ])

  if (!existingAttempt) {
    throw new NotFoundError('Attempt not found')
  }
  if (!quiz) {
    throw new NotFoundError('Quiz not found')
  }
  if (existingAttempt.completedAt) {
    throw new AppError(400, 'Attempt already submitted')
  }

  // Build a question lookup map
  const questions = jsonArray<QuizQuestion>(quiz.questions)
  const questionMap = new Map(questions.map((q) => [q.id, q]))

  // Grade each answer
  const gradedAnswers: QuizAnswer[] = input.answers.map((a) => {
    const question = questionMap.get(a.questionId)
    return {
      questionId: a.questionId,
      selectedOptionId: a.selectedOptionId,
      isCorrect: question ? question.correctOptionId === a.selectedOptionId : false,
      timeSpentSec: a.timeSpentSec,
    }
  })

  // Calculate overall score
  const correctCount = gradedAnswers.filter((a) => a.isCorrect).length
  const totalCount = gradedAnswers.length
  const score = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0

  // Group by topic
  const topicGroups = new Map<string, { correct: number; total: number }>()
  for (const answer of gradedAnswers) {
    const question = questionMap.get(answer.questionId)
    const topicSlug = question?.topicSlug ?? quiz.topicTopicSlug ?? 'unknown'
    const group = topicGroups.get(topicSlug) ?? { correct: 0, total: 0 }
    group.total += 1
    if (answer.isCorrect) group.correct += 1
    topicGroups.set(topicSlug, group)
  }

  // Fetch existing mastery values from roadmap for delta calculation
  const roadmap = await prisma.roadmap.findUnique({ where: { userId } })
  const nodes = jsonArray<RoadmapNodeJson>(roadmap?.nodes)
  const quizSubjectSlug = quiz.topicSubjectSlug

  function findNode(topicSlug: string): RoadmapNodeJson | undefined {
    if (!quizSubjectSlug) return undefined
    return nodes.find((n) => n.topicSlug === topicSlug && n.subjectSlug === quizSubjectSlug)
  }

  const byTopic: ByTopicResult[] = Array.from(topicGroups.entries()).map(
    ([topicSlug, { correct, total }]) => {
      const correctness = total > 0 ? (correct / total) * 100 : 0
      const oldMastery = findNode(topicSlug)?.mastery ?? 0
      const newMastery = Math.round(oldMastery * 0.7 + correctness * 0.3)
      return { topicSlug, correct, total, masteryDelta: newMastery - oldMastery }
    },
  )

  // Award XP: 5 per correct, capped at 50
  const xpAwarded = Math.min(50, correctCount * 5)

  // Create XP event
  await prisma.xPEvent.create({
    data: {
      userId,
      source: 'quiz',
      sourceId: existingAttempt.id,
      amount: xpAwarded,
      reason: `Quiz: ${score}% score`,
    },
  })

  // Update streak if score >= 50%
  if (score >= 50) {
    await recordStreakActivity(userId)
  }

  // Update mastery and SM-2 for every affected node, then write the roadmap once.
  const masteryUpdates: Array<{ topicSlug: string; mastery: number }> = []
  let roadmapChanged = false

  for (const topicResult of byTopic) {
    const correctness =
      topicResult.total > 0 ? (topicResult.correct / topicResult.total) * 100 : 0

    const node = findNode(topicResult.topicSlug)
    if (!node) continue

    const newMastery = Math.round(node.mastery * 0.7 + correctness * 0.3)
    node.mastery = newMastery
    if (newMastery >= 80 && node.revisionsCompleted >= 1) {
      node.status = 'completed'
    }
    masteryUpdates.push({ topicSlug: topicResult.topicSlug, mastery: newMastery })

    const sm2Result = calculateSM2({
      easeFactor: node.sm2.easeFactor,
      interval: node.sm2.interval,
      repetitions: node.sm2.repetitions,
      grade: gradeFromPercentage(correctness),
    })
    node.sm2 = {
      easeFactor: sm2Result.easeFactor,
      interval: sm2Result.interval,
      repetitions: sm2Result.repetitions,
    }
    node.nextRevisionAt = sm2Result.nextReviewDate.toISOString()

    roadmapChanged = true
  }

  if (roadmapChanged) {
    try {
      await prisma.roadmap.update({ where: { userId }, data: { nodes } })
    } catch (err) {
      logger.warn({ err, userId }, 'Could not persist roadmap mastery/SM-2 updates')
    }
  }

  // Mark attempt as completed
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

  // In-app notification for quiz completion
  const isMock = quiz.type === 'mock'
  await notify(userId, 'quiz_result', {
    title: isMock ? `Mock Exam Complete — ${score}%! 🎯` : `Quiz Complete — ${score}%! 📝`,
    body: isMock
      ? `You scored ${score}% on your mock exam and earned ${xpAwarded} XP. Check your breakdown.`
      : `You completed your quiz with ${score}% and earned ${xpAwarded} XP. Keep up the momentum!`,
    deeplink: `/quizzes/${attempt.quizId}/results/${attempt.id}`,
    metadata: { quizId: attempt.quizId, attemptId: attempt.id, score, xpAwarded },
  })

  // Email notification
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true, notifyEmail: true },
  })
  if (user?.notifyEmail) {
    const { sendQuizCompletedEmail } = await import('../../lib/email')
    const quizTitle = quiz.topicTopicSlug
      ? quiz.topicTopicSlug.replace(/-/g, ' ')
      : quiz.subjectSlug
        ? quiz.subjectSlug.replace(/-/g, ' ')
        : `${quiz.type} practice`

    await sendQuizCompletedEmail(user.email, {
      name: user.name,
      quizTitle,
      score,
      totalQuestions: totalCount,
      correctCount,
      xpAwarded,
      quizId: attempt.quizId,
      attemptId: attempt.id,
    })
  }

  // Check achievements and leaderboard standing
  const { checkAndAwardBadges } = await import('../badges/badges.service')
  const { checkLeaderboardTop5 } = await import('../leaderboard/leaderboard.service')
  await checkAndAwardBadges(userId)
  await checkLeaderboardTop5(userId)

  return { attempt, xpAwarded, masteryUpdates }
}

export async function getAttempt(
  userId: string,
  attemptId: string,
): Promise<{ attempt: QuizAttempt; quiz: Quiz }> {
  const attempt = await prisma.quizAttempt.findFirst({
    where: { id: attemptId, userId },
    include: { quiz: true },
  })

  if (!attempt) {
    throw new NotFoundError('Attempt not found')
  }

  const { quiz, ...rest } = attempt
  return { attempt: rest, quiz }
}

export async function listQuizzes(userId: string): Promise<
  Array<{
    quizId: string
    attemptId: string | null
    mode: QuizMode
    topicSlug: string
    subjectSlug: string
    difficulty: string
    score: number | null
    questionCount: number
    createdAt: string
  }>
> {
  const quizzes = await prisma.quiz.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 20,
    include: {
      // Most recent attempt per quiz.
      attempts: {
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { id: true, score: true, completedAt: true },
      },
    },
  })

  return quizzes.map((q) => {
    const attempt = q.attempts[0]
    return {
      quizId: q.id,
      attemptId: attempt?.id ?? null,
      mode: q.mode,
      topicSlug: q.topicTopicSlug ?? '',
      subjectSlug: q.topicSubjectSlug ?? q.subjectSlug ?? '',
      difficulty: q.difficulty,
      score: attempt?.completedAt ? attempt.score : null,
      questionCount: q.questionCount,
      createdAt: q.createdAt.toISOString(),
    }
  })
}
