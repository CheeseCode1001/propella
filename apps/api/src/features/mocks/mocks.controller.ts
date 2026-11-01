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

    if (!['jamb', 'waec', 'neco'].includes(examType)) {
      throw new AppError(400, 'examType must be jamb, waec or neco')
    }
    if (!Array.isArray(subjectSlugs) || subjectSlugs.length === 0) {
      throw new AppError(400, 'Choose at least one subject')
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

/** Summary for the pre-start screen - includes any active/paused attempt so the student can resume. */
export async function getMock(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = requireUser(req)
    const { mock, activeAttempt } = await mocksService.getMock(userId, req.params.id)

    res.status(200).json({
      data: {
        mockId: mock.id,
        questionCount: mock.questionCount,
        timeLimit: mock.timeLimit,
        type: mock.type,
        createdAt: mock.createdAt.toISOString(),
        activeAttempt: activeAttempt
          ? {
              attemptId: activeAttempt.id,
              startedAt: activeAttempt.startedAt.toISOString(),
              durationSec: activeAttempt.durationSec,
              answeredCount: Array.isArray(activeAttempt.answers) ? activeAttempt.answers.length : 0,
              answers: activeAttempt.answers,
            }
          : null,
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
    const { forceRestart } = (req.body ?? {}) as { forceRestart?: boolean }
    const { attempt, resumed } = await mocksService.startMockAttempt(
      userId,
      req.params.id,
      Boolean(forceRestart),
    )

    res.status(201).json({
      data: {
        attemptId: attempt.id,
        startedAt: attempt.startedAt.toISOString(),
        durationSec: attempt.durationSec,
        answers: attempt.answers,
        resumed,
      },
    })
  } catch (err) {
    next(err)
  }
}

export async function saveMockProgress(
  req: Request<{ attemptId: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = requireUser(req)
    const { answers, durationSec } = req.body as {
      answers?: Array<{
        questionId: string
        selectedOptionId: string
        timeSpentSec?: number
      }>
      durationSec?: number
    }

    const updated = await mocksService.saveMockProgress(userId, req.params.attemptId, {
      answers: Array.isArray(answers) ? answers : [],
      durationSec: typeof durationSec === 'number' ? Math.max(0, Math.round(durationSec)) : 0,
    })

    res.status(200).json({
      data: {
        attemptId: updated.id,
        savedCount: Array.isArray(answers) ? answers.length : 0,
        durationSec: updated.durationSec,
        savedAt: new Date().toISOString(),
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
