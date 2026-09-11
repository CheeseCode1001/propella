import type { Request, Response, NextFunction } from 'express'
import * as referralsService from './referrals.service'
import { AppError } from '../../middleware/error-handler'
import { env } from '../../config/env'

function requireUser(req: Request): string {
  if (!req.user?.id) throw new AppError(401, 'Not authenticated')
  return req.user.id
}

export async function getSummary(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = requireUser(req)
    // Falls back to the request's own origin when FRONTEND_URL is not set yet,
    // so the share link is never "undefined/signup?ref=...".
    const base = env.FRONTEND_URL || `${req.protocol}://${req.get('host') ?? ''}`
    res.status(200).json({ data: await referralsService.getReferralSummary(userId, base) })
  } catch (err) {
    next(err)
  }
}

export async function getCredits(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = requireUser(req)
    res.status(200).json({ data: { balance: await referralsService.getCreditBalance(userId) } })
  } catch (err) {
    next(err)
  }
}
