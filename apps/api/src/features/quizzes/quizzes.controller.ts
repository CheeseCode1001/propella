import type { Request, Response, NextFunction } from 'express'
import type { QuizAttempt, QuizMode } from '../../config/db'
import { QUIZ_MODES, QUIZ_TYPES } from '@propella/shared'
import { AppError } from '../../middleware/error-handler'
import { jsonArray, type ByTopicResult, type QuizAnswer, type QuizQuestion } from '../../models/types'
import * as quizzesService from './quizzes.service'

function requireUser(req: Request): string {
  if (!req.user?.id) throw new AppError(401, 'Not authenticated')
  return req.user.id
}

/** `answers` is a jsonb column, so it needs narrowing before it can be counted. */
function answersOf(attempt: QuizAttempt): QuizAnswer[] {
  return jsonArray<QuizAnswer>(attempt.answers)
}

export async function generateQuiz(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = requireUser(req)
    const {
      subjectSlug,
      topicSlug,
      type,
      difficulty,
      mode,
      questionCount,
      noteContent,
      documentName,
      format,
      arrangeBy,
    } = req.body as {
      subjectSlug?: string
      topicSlug?: string
      type?: 'topic' | 'subject' | 'mixed' | 'weakness' | 'mock'
      difficulty?: 'easy' | 'medium' | 'hard' | 'adaptive'
      mode?: QuizMode
      questionCount?: number
      noteContent?: string
      documentName?: string
      format?: 'objective' | 'theory'
      arrangeBy?: 'random' | 'topic'
    }

    if (type !== undefined && !QUIZ_TYPES.includes(type)) {
      throw new AppError(400, 'Invalid quiz type')
    }

    // A 'subject' quiz draws past questions from every topic in the subject.
    // When generating from notes/document, subjectSlug and topicSlug are optional.
    if (!noteContent && (!subjectSlug || (!topicSlug && type !== 'subject'))) {
      throw new AppError(400, 'subjectSlug and topicSlug are required when not uploading notes')
    }

    const validDifficulties = ['easy', 'medium', 'hard', 'adaptive']
    if (difficulty && !validDifficulties.includes(difficulty)) {
      throw new AppError(400, 'Invalid difficulty')
    }

    if (mode !== undefined && !QUIZ_MODES.includes(mode)) {
      throw new AppError(400, 'Invalid mode')
    }

    const quiz = await quizzesService.generateQuiz(userId, {
      subjectSlug,
      topicSlug,
      type: type ?? 'topic',
      difficulty: difficulty ?? 'medium',
      mode: mode ?? 'study',
      questionCount: Math.min(20, Math.max(1, questionCount ?? 10)),
      noteContent,
      documentName,
      format,
      arrangeBy,
    })

    res.status(201).json({
      data: {
        quizId: quiz.id,
        type: quiz.type,
        difficulty: quiz.difficulty,
        mode: quiz.mode,
        timeLimit: quiz.timeLimit,
        questionCount: quiz.questionCount,
        topicRef: {
          subjectSlug: quiz.topicSubjectSlug,
          topicSlug: quiz.topicTopicSlug,
        },
        createdAt: quiz.createdAt.toISOString(),
      },
    })
  } catch (err) {
    next(err)
  }
}

export async function startAttempt(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = requireUser(req)
    const quizId = req.params.id

    const attempt = await quizzesService.startAttempt(userId, quizId)

    res.status(201).json({
      data: {
        attemptId: attempt.id,
        quizId: attempt.quizId,
        startedAt: attempt.startedAt.toISOString(),
      },
    })
  } catch (err) {
    next(err)
  }
}

export async function submitAttempt(
  req: Request<{ attemptId: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = requireUser(req)
    const { attemptId } = req.params
    const { quizId, answers, durationSec } = req.body as {
      quizId: string
      answers: Array<{
        questionId: string
        selectedOptionId: 'A' | 'B' | 'C' | 'D'
        timeSpentSec: number
      }>
      durationSec: number
    }

    if (!quizId || !answers || !Array.isArray(answers)) {
      throw new AppError(400, 'quizId and answers array are required')
    }

    const result = await quizzesService.submitAttempt(userId, attemptId, {
      quizId,
      answers,
      durationSec: durationSec ?? 0,
    })

    const correctCount = answersOf(result.attempt).filter((a) => a.isCorrect).length
    const totalCount = answersOf(result.attempt).length

    res.status(200).json({
      data: {
        attemptId: result.attempt.id,
        score: result.attempt.score,
        correct: correctCount,
        total: totalCount,
        correctCount,
        totalCount,
        durationSec: result.attempt.durationSec,
        xpAwarded: result.xpAwarded,
        masteryUpdates: result.masteryUpdates,
        byTopic: result.attempt.byTopic,
      },
    })
  } catch (err) {
    next(err)
  }
}

export async function getAttempt(
  req: Request<{ attemptId: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = requireUser(req)
    const { attemptId } = req.params

    const { attempt, quiz } = await quizzesService.getAttempt(userId, attemptId)

    const questions = jsonArray<QuizQuestion>(quiz.questions)
    const questionMap = new Map(questions.map((q) => [q.id, q]))
    const rawAnswers = answersOf(attempt)
    const enrichedAnswers = rawAnswers.map((a) => {
      const q = questionMap.get(a.questionId)
      return {
        ...a,
        correctOptionId: q?.correctOptionId ?? 'A',
      }
    })
    const correctCount = enrichedAnswers.filter((a) => a.isCorrect).length
    const totalCount = questions.length || quiz.questionCount || enrichedAnswers.length

    const byTopicRecord: Record<string, { correct: number; total: number; masteryDelta?: number }> = {}
    for (const item of jsonArray<ByTopicResult>(attempt.byTopic)) {
      if (item && item.topicSlug) {
        byTopicRecord[item.topicSlug] = {
          correct: item.correct,
          total: item.total,
          masteryDelta: item.masteryDelta,
        }
      }
    }

    res.status(200).json({
      data: {
        attempt: {
          id: attempt.id,
          quizId: attempt.quizId,
          score: attempt.score,
          correct: correctCount,
          total: totalCount,
          correctCount,
          totalCount,
          durationSec: attempt.durationSec,
          xpAwarded: attempt.xpAwarded,
          answers: enrichedAnswers,
          byTopic: byTopicRecord,
          startedAt: attempt.startedAt.toISOString(),
          completedAt: attempt.completedAt?.toISOString() ?? null,
        },
        quiz: {
          id: quiz.id,
          type: quiz.type,
          difficulty: quiz.difficulty,
          mode: quiz.mode,
          timeLimit: quiz.timeLimit ?? (quiz.mode === 'exam' ? questions.length * 90 : null),
          topicRef: {
            subjectSlug: quiz.topicSubjectSlug,
            topicSlug: quiz.topicTopicSlug,
          },
          questions: quiz.questions,
        },
      },
    })
  } catch (err) {
    next(err)
  }
}

export async function listQuizzes(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = requireUser(req)
    const quizzes = await quizzesService.listQuizzes(userId)
    res.status(200).json({ data: quizzes })
  } catch (err) {
    next(err)
  }
}
