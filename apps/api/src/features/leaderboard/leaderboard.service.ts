import type { Prisma } from '../../config/db'
import { prisma } from '../../config/db'
import { getRank } from '@propella/shared'

export interface LeaderboardEntry {
  rank: number
  userId: string
  name: string
  xp: number
  rankName: string
}

export interface LeaderboardResult {
  entries: LeaderboardEntry[]
  myEntry: LeaderboardEntry | null
}

function formatName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/)
  if (parts.length === 1) return parts[0] ?? fullName
  const first = parts[0] ?? ''
  const last = parts[parts.length - 1] ?? ''
  return `${first} ${last.charAt(0).toUpperCase()}.`
}

function periodFilter(period: 'week' | 'month' | 'all'): Prisma.XPEventWhereInput {
  if (period === 'all') return {}

  const start = new Date()
  start.setDate(start.getDate() - (period === 'week' ? 7 : 30))
  return { createdAt: { gte: start } }
}

export async function getLeaderboard(
  userId: string,
  period: 'week' | 'month' | 'all',
): Promise<LeaderboardResult> {
  const where = periodFilter(period)

  // Aggregate XP per user — top 100, plus one slot in case the caller sits at 101.
  const grouped = await prisma.xPEvent.groupBy({
    by: ['userId'],
    where,
    _sum: { amount: true },
    orderBy: { _sum: { amount: 'desc' } },
    take: 101,
  })

  const users = await prisma.user.findMany({
    where: { id: { in: grouped.map((g) => g.userId) } },
    select: { id: true, name: true },
  })

  const userMap = new Map(users.map((u) => [u.id, u.name]))

  const entries: LeaderboardEntry[] = grouped
    .map((g, idx) => {
      const xp = g._sum.amount ?? 0
      return {
        rank: idx + 1,
        userId: g.userId,
        name: formatName(userMap.get(g.userId) ?? 'Anonymous'),
        xp,
        rankName: getRank(xp).name,
      }
    })
    .slice(0, 100)

  // Find caller's entry
  let myEntry = entries.find((e) => e.userId === userId) ?? null

  if (!myEntry) {
    // Caller is outside the top 100 — compute their standing separately.
    const myAgg = await prisma.xPEvent.aggregate({
      where: { ...where, userId },
      _sum: { amount: true },
    })
    const myXP = myAgg._sum.amount ?? 0

    if (myXP > 0) {
      // Count users ahead of the caller. `having` filters post-aggregation, so
      // this returns one lightweight row per user ranked above them.
      const ahead = await prisma.xPEvent.groupBy({
        by: ['userId'],
        where,
        having: { amount: { _sum: { gt: myXP } } },
      })

      const me = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true },
      })

      myEntry = {
        rank: ahead.length + 1,
        userId,
        name: formatName(me?.name ?? 'You'),
        xp: myXP,
        rankName: getRank(myXP).name,
      }
    }
  }

  return { entries, myEntry }
}

/**
 * Checks if a student is currently ranked in the weekly Top 5.
 * If so and not already alerted this week, triggers in-app notification
 * and a celebratory email.
 */
export async function checkLeaderboardTop5(userId: string): Promise<void> {
  try {
    const { myEntry } = await getLeaderboard(userId, 'week')
    if (!myEntry || myEntry.rank > 5 || myEntry.xp <= 0) return

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const recentNotifs = await prisma.notification.findMany({
      where: {
        userId,
        type: 'rank_up',
        createdAt: { gte: weekAgo },
      },
      select: { metadata: true },
    })

    const alreadyNotified = recentNotifs.some(
      (n) => (n.metadata as Record<string, unknown> | null)?.isTop5 === true,
    )
    if (alreadyNotified) return

    const { notify } = await import('../notifications/notification.service')
    const { sendLeaderboardTop5Email } = await import('../../lib/email')

    await notify(userId, 'rank_up', {
      title: `You're in the Top 5! 🌟 Rank #${myEntry.rank}`,
      body: `Phenomenal work! You are now ranked #${myEntry.rank} on the weekly leaderboard with ${myEntry.xp} XP.`,
      deeplink: '/leaderboard',
      metadata: { isTop5: true, rank: myEntry.rank, xp: myEntry.xp },
    })

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true, notifyEmail: true },
    })

    if (user?.notifyEmail) {
      await sendLeaderboardTop5Email(user.email, {
        name: user.name,
        rank: myEntry.rank,
        xp: myEntry.xp,
      })
    }
  } catch (err) {
    // Non-blocking: leaderboard alert failure must never disrupt learning flow
    const { logger } = await import('../../config/logger')
    logger.warn({ err, userId }, 'Failed to check/notify leaderboard top 5')
  }
}

