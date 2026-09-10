import type { XPSource } from '../../config/db'
import { prisma } from '../../config/db'
import { getRank, getNextRank } from '@propella/shared'
import { notify } from '../notifications/notification.service'
import { checkAndAwardBadges } from '../badges/badges.service'
import type { XPSummary, UserStreak } from '@propella/shared'

export type { XPSource }

/**
 * Total XP is always summed from the append-only ledger — there is no
 * denormalised total that can drift.
 */
export async function getTotalXP(userId: string): Promise<number> {
  const agg = await prisma.xPEvent.aggregate({
    where: { userId },
    _sum: { amount: true },
  })
  return agg._sum.amount ?? 0
}

export function buildXPSummary(totalXP: number): XPSummary {
  const rank = getRank(totalXP)
  const nextRank = getNextRank(totalXP)

  return {
    totalXP,
    rankName: rank.name,
    nextRankName: nextRank?.name ?? null,
    nextRankThreshold: nextRank?.threshold ?? null,
    xpToNextRank: nextRank ? nextRank.threshold - totalXP : null,
  }
}

export async function getXPSummary(userId: string): Promise<XPSummary> {
  return buildXPSummary(await getTotalXP(userId))
}

export async function getStreak(userId: string): Promise<UserStreak> {
  const existing = await prisma.streak.findUnique({ where: { userId } })

  if (existing) {
    return {
      currentStreak: existing.currentStreak,
      longestStreak: existing.longestStreak,
      lastActiveDate: existing.lastActiveDate.toISOString(),
      freezesAvailable: existing.freezesAvailable,
    }
  }

  const created = await prisma.streak.create({
    data: { userId, lastActiveDate: new Date() },
  })

  return {
    currentStreak: created.currentStreak,
    longestStreak: created.longestStreak,
    lastActiveDate: created.lastActiveDate.toISOString(),
    freezesAvailable: created.freezesAvailable,
  }
}

export async function awardXP(
  userId: string,
  source: XPSource,
  amount: number,
  sourceId?: string,
  reason?: string,
  multiplier?: number,
): Promise<number> {
  // Snapshot rank before
  const xpBefore = await getTotalXP(userId)
  const rankBefore = getRank(xpBefore)

  await prisma.xPEvent.create({
    data: {
      userId,
      source,
      amount,
      reason: reason ?? source,
      ...(sourceId ? { sourceId } : {}),
      ...(multiplier !== undefined ? { multiplier } : {}),
    },
  })

  const xpAfter = xpBefore + amount

  // Notify on rank-up
  const rankAfter = getRank(xpAfter)
  if (rankAfter.name !== rankBefore.name) {
    await notify(userId, 'rank_up', {
      title: `You reached ${rankAfter.name}`,
      body: `Your hard work paid off. You are now ranked ${rankAfter.name}.`,
      deeplink: '/progress',
    })
  }

  // Every XP award is a progress event, so this is the one place that catches
  // badges from quizzes, sessions, marathons and streaks alike. It never
  // throws, so a badge check cannot fail the action that earned the XP.
  await checkAndAwardBadges(userId)

  return xpAfter
}
