import type { Request, Response, NextFunction } from 'express'
import * as studyGroupsService from './study-groups.service'
import { AppError } from '../../middleware/error-handler'

function requireUser(req: Request): string {
  if (!req.user?.id) throw new AppError(401, 'Not authenticated')
  return req.user.id
}

export async function listStudyGroups(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = requireUser(req)
    const data = await studyGroupsService.listStudyGroups(userId)
    res.status(200).json({ data })
  } catch (err) {
    next(err)
  }
}

export async function createStudyGroup(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = requireUser(req)
    const { name, description, subject, targetExam, weeklyTargetQuestions } = req.body as {
      name: string
      description?: string
      subject?: string
      targetExam?: string
      weeklyTargetQuestions?: number
    }
    const data = await studyGroupsService.createStudyGroup(userId, {
      name,
      description,
      subject,
      targetExam,
      weeklyTargetQuestions,
    })
    res.status(201).json({ data })
  } catch (err) {
    next(err)
  }
}

export async function getStudyGroup(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = requireUser(req)
    const data = await studyGroupsService.getStudyGroup(userId, req.params.id)
    res.status(200).json({ data })
  } catch (err) {
    next(err)
  }
}

export async function joinStudyGroup(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = requireUser(req)
    const data = await studyGroupsService.joinStudyGroup(userId, req.params.id)
    res.status(200).json({ data })
  } catch (err) {
    next(err)
  }
}

export async function postGroupMessage(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = requireUser(req)
    const { content } = req.body as { content: string }
    const data = await studyGroupsService.postGroupMessage(userId, req.params.id, content)
    res.status(201).json({ data })
  } catch (err) {
    next(err)
  }
}

export async function startGroupFocus(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = requireUser(req)
    const { durationMinutes, topic } = req.body as { durationMinutes: number; topic: string }
    const data = await studyGroupsService.startGroupFocus(userId, req.params.id, { durationMinutes, topic })
    res.status(200).json({ data })
  } catch (err) {
    next(err)
  }
}
