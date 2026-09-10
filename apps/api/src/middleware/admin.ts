import type { Request, Response, NextFunction } from 'express'
import { prisma } from '../config/db'

/**
 * Gate for the admin dashboard. Runs after `authenticate`.
 *
 * The role is re-read from the database rather than trusted from the JWT, so
 * revoking admin access takes effect immediately instead of when the token
 * happens to expire.
 */
export async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const userId = req.user?.id
  if (!userId) {
    res.status(401).json({ error: 'Not authenticated' })
    return
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  })

  if (!user || user.role !== 'admin') {
    res.status(403).json({ error: 'Administrator access required' })
    return
  }

  next()
}
