import type { Request, Response, NextFunction } from 'express'
import * as plannerService from './planner.service'
import type { PlannerTaskStatus } from './planner.service'
import { AppError } from '../../middleware/error-handler'

function requireUser(req: Request): string {
  if (!req.user?.id) throw new AppError(401, 'Not authenticated')
  return req.user.id
}

export async function listTasks(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const tasks = await plannerService.listTasks(requireUser(req))
    res.status(200).json({ data: { tasks } })
  } catch (err) {
    next(err)
  }
}

export async function createTask(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = requireUser(req)
    const body = req.body as Record<string, unknown>

    if (typeof body.title !== 'string') {
      throw new AppError(400, 'A task needs a title')
    }

    const task = await plannerService.createTask(userId, {
      title: body.title,
      ...(typeof body.notes === 'string' ? { notes: body.notes } : {}),
      ...(typeof body.status === 'string'
        ? { status: body.status as PlannerTaskStatus }
        : {}),
      ...(typeof body.dueDate === 'string' || body.dueDate === null
        ? { dueDate: body.dueDate as string | null }
        : {}),
      ...(typeof body.subjectSlug === 'string' ? { subjectSlug: body.subjectSlug } : {}),
      ...(typeof body.topicSlug === 'string' ? { topicSlug: body.topicSlug } : {}),
    })

    res.status(201).json({ data: { task } })
  } catch (err) {
    next(err)
  }
}

export async function updateTask(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = requireUser(req)
    const body = req.body as Record<string, unknown>

    const task = await plannerService.updateTask(userId, req.params.id, {
      ...(typeof body.title === 'string' ? { title: body.title } : {}),
      ...(typeof body.notes === 'string' ? { notes: body.notes } : {}),
      ...(typeof body.status === 'string'
        ? { status: body.status as PlannerTaskStatus }
        : {}),
      ...(typeof body.position === 'number' ? { position: body.position } : {}),
      ...(typeof body.dueDate === 'string' || body.dueDate === null
        ? { dueDate: body.dueDate as string | null }
        : {}),
    })

    res.status(200).json({ data: { task } })
  } catch (err) {
    next(err)
  }
}

export async function deleteTask(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await plannerService.deleteTask(requireUser(req), req.params.id)
    res.status(204).send()
  } catch (err) {
    next(err)
  }
}

export async function reorderColumn(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = requireUser(req)
    const { status, orderedIds } = req.body as { status?: unknown; orderedIds?: unknown }

    if (typeof status !== 'string') {
      throw new AppError(400, 'A column is required')
    }
    if (!Array.isArray(orderedIds) || orderedIds.some((id) => typeof id !== 'string')) {
      throw new AppError(400, 'orderedIds must be an array of task ids')
    }

    const tasks = await plannerService.reorderColumn(
      userId,
      status as PlannerTaskStatus,
      orderedIds as string[],
    )

    res.status(200).json({ data: { tasks } })
  } catch (err) {
    next(err)
  }
}
