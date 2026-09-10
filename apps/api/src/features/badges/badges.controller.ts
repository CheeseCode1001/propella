import type { Request, Response, NextFunction } from 'express'
import * as badgesService from './badges.service'
import { AppError } from '../../middleware/error-handler'

function requireUser(req: Request): string {
  if (!req.user?.id) throw new AppError(401, 'Not authenticated')
  return req.user.id
}

export async function listBadges(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const badges = await badgesService.listBadges(requireUser(req))
    res.status(200).json({
      data: {
        badges,
        earnedCount: badges.filter((b) => b.earnedAt !== null).length,
        total: badges.length,
      },
    })
  } catch (err) {
    next(err)
  }
}
