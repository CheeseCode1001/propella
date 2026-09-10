import type { Request, Response, NextFunction } from 'express'
import * as mocksService from './mocks.service'
import { AppError } from '../../middleware/error-handler'

function requireUser(req: Request): string {
  if (!req.user?.id) throw new AppError(401, 'Not authenticated')
  return req.user.id
}

export async function generateMock(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = requireUser(req)
    const { examType, subjectSlugs } = req.body as {
      examType: 'jamb' | 'waec' | 'neco'
      subjectSlugs: string[]
    }

    const mock = await mocksService.generateMock(userId, examType, subjectSlugs)

    res.status(201).json({
      data: {
        mockId: mock.id,
        questionCount: mock.questionCount,
        timeLimit: mock.timeLimit,
        type: mock.type,
        createdAt: mock.createdAt.toISOString(),
      },
    })
  } catch (err) {
    next(err)
  }
}

export async function startMockAttempt(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = requireUser(req)
    const attempt = await mocksService.startMockAttempt(userId, req.params.id)

    res.status(201).json({
      data: {
        attemptId: attempt.id,
        startedAt: attempt.startedAt.toISOString(),
      },
    })
  } catch (err) {
    next(err)
  }
}

export async function submitMock(
  req: Request<{ attemptId: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = requireUser(req)
    const { quizId, answers, durationSec } = req.body as {
      quizId: string
      answers: Array<{ questionId: string; selectedOptionId: string; timeSpentSec: number }>
      durationSec: number
    }

    const result = await mocksService.submitMock(userId, req.params.attemptId, {
      quizId,
      answers,
      durationSec,
    })

    res.status(200).json({
      data: {
        attemptId: result.attempt.id,
        score: result.attempt.score,
        xpAwarded: result.xpAwarded,
        completedAt: result.attempt.completedAt?.toISOString(),
      },
    })
  } catch (err) {
    next(err)
  }
}

export async function getMockAttemptResult(
  req: Request<{ attemptId: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = requireUser(req)
    const { attempt, quiz } = await mocksService.getMockAttemptResult(
      userId,
      req.params.attemptId,
    )

    res.status(200).json({
      data: {
        attempt: {
          id: attempt.id,
          score: attempt.score,
          xpAwarded: attempt.xpAwarded,
          durationSec: attempt.durationSec,
          answers: attempt.answers,
          byTopic: attempt.byTopic,
          completedAt: attempt.completedAt?.toISOString(),
        },
        quiz: {
          id: quiz.id,
          questionCount: quiz.questionCount,
          questions: quiz.questions,
          timeLimit: quiz.timeLimit,
        },
      },
    })
  } catch (err) {
    next(err)
  }
}

export async function getMockHistory(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = requireUser(req)
    const history = await mocksService.getMockHistory(userId)
    res.status(200).json({ data: { mocks: history } })
  } catch (err) {
    next(err)
  }
}
