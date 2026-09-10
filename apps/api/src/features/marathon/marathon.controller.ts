import type { Request, Response, NextFunction } from 'express'
import * as marathonService from './marathon.service'
import { AppError } from '../../middleware/error-handler'

function requireUser(req: Request): string {
  if (!req.user?.id) throw new AppError(401, 'Not authenticated')
  return req.user.id
}

export async function startMarathon(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = requireUser(req)
    const { plannedDurationMin, pomodoroLength, subjectSlugs } = req.body as {
      plannedDurationMin: number
      pomodoroLength: number
      subjectSlugs: string[]
    }

    const run = await marathonService.startMarathon(userId, {
      plannedDurationMin,
      pomodoroLength,
      subjectSlugs,
    })

    res.status(201).json({
      data: {
        runId: run.id,
        status: run.status,
        startedAt: run.startedAt.toISOString(),
        plannedDurationMin: run.plannedDurationMin,
        pomodoroLength: run.pomodoroLength,
      },
    })
  } catch (err) {
    next(err)
  }
}

export async function pauseMarathon(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = requireUser(req)
    const run = await marathonService.pauseMarathon(userId, req.params.id)
    res.status(200).json({ data: { status: run.status } })
  } catch (err) {
    next(err)
  }
}

export async function resumeMarathon(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = requireUser(req)
    const run = await marathonService.resumeMarathon(userId, req.params.id)
    res.status(200).json({ data: { status: run.status } })
  } catch (err) {
    next(err)
  }
}

export async function endMarathon(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = requireUser(req)
    const { actualDurationSec, pomodorosCompleted, topicsCovered } = req.body as {
      actualDurationSec: number
      pomodorosCompleted: number
      topicsCovered: Array<{ subjectSlug: string; topicSlug: string; durationSec: number }>
    }

    const result = await marathonService.endMarathon(
      userId,
      req.params.id,
      actualDurationSec,
      pomodorosCompleted,
      topicsCovered ?? [],
    )

    res.status(200).json({
      data: {
        run: {
          id: result.run.id,
          status: result.run.status,
          actualDurationSec: result.run.actualDurationSec,
          pomodorosCompleted: result.run.pomodorosCompleted,
          xpAwarded: result.run.xpAwarded,
          endedAt: result.run.endedAt?.toISOString(),
        },
        xpAwarded: result.xpAwarded,
      },
    })
  } catch (err) {
    next(err)
  }
}

export async function abandonMarathon(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = requireUser(req)
    const { actualDurationSec, pomodorosCompleted, topicsCovered } = req.body as {
      actualDurationSec: number
      pomodorosCompleted: number
      topicsCovered?: Array<{ subjectSlug: string; topicSlug: string; durationSec: number }>
    }

    const run = await marathonService.abandonMarathon(
      userId,
      req.params.id,
      actualDurationSec ?? 0,
      pomodorosCompleted ?? 0,
      topicsCovered ?? [],
    )

    res.status(200).json({
      data: {
        run: {
          id: run.id,
          status: run.status,
          actualDurationSec: run.actualDurationSec,
          pomodorosCompleted: run.pomodorosCompleted,
          xpAwarded: 0,
          endedAt: run.endedAt?.toISOString(),
        },
        xpAwarded: 0,
      },
    })
  } catch (err) {
    next(err)
  }
}

export async function getMarathonHistory(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = requireUser(req)
    const runs = await marathonService.getMarathonHistory(userId)

    res.status(200).json({
      data: {
        runs: runs.map((r) => ({
          id: r.id,
          status: r.status,
          startedAt: r.startedAt.toISOString(),
          endedAt: r.endedAt?.toISOString(),
          plannedDurationMin: r.plannedDurationMin,
          actualDurationSec: r.actualDurationSec,
          pomodorosCompleted: r.pomodorosCompleted,
          xpAwarded: r.xpAwarded,
        })),
      },
    })
  } catch (err) {
    next(err)
  }
}
