import type { Request, Response, NextFunction } from 'express'
import * as usersService from './users.service'
import { AppError } from '../../middleware/error-handler'

function requireUser(req: Request): string {
  if (!req.user?.id) throw new AppError(401, 'Not authenticated')
  return req.user.id
}

export async function getMe(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = requireUser(req)
    const data = await usersService.getMe(userId)
    res.status(200).json({ data })
  } catch (err) {
    next(err)
  }
}

export async function updateMe(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = requireUser(req)
    const data = await usersService.updateProfile(userId, req.body as {
      name?: string
      theme?: 'system' | 'light' | 'dark'
      timezone?: string
      locale?: 'en' | 'yo' | 'ha' | 'ig'
      avatarUrl?: string | null
      notifications?: {
        email?: boolean
        push?: boolean
        studyReminders?: boolean
        streakReminders?: boolean
        weeklyDigest?: boolean
      }
    })
    res.status(200).json({ data })
  } catch (err) {
    next(err)
  }
}
