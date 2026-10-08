import type { Request, Response, NextFunction } from 'express'
import { getEntitlementStatus } from './entitlements.service'
import { AppError } from '../../middleware/error-handler'

function requireUser(req: Request): string {
  if (!req.user?.id) throw new AppError(401, 'Not authenticated')
  return req.user.id
}

export async function getStatus(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = requireUser(req)
    const status = await getEntitlementStatus(userId)
    res.status(200).json({ data: status })
  } catch (err) {
    next(err)
  }
}
