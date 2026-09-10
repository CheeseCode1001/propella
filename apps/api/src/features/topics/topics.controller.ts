import type { Request, Response, NextFunction } from 'express'
import * as topicsService from './topics.service'
import { AppError } from '../../middleware/error-handler'

function requireUser(req: Request): string {
  if (!req.user?.id) throw new AppError(401, 'Not authenticated')
  return req.user.id
}

export async function getTopicReader(
  req: Request<{ subjectSlug: string; topicSlug: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = requireUser(req)
    const data = await topicsService.getTopicReader(
      userId,
      req.params.subjectSlug,
      req.params.topicSlug,
    )
    res.status(200).json({ data })
  } catch (err) {
    next(err)
  }
}
