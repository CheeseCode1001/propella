import { prisma } from '../../config/db'
import { evaluateBadges, getBadge, BADGES, type BadgeMetrics } from '@propella/shared'
import { logger } from '../../config/logger'
import * as notificationService from '../notifications/notification.service'

export interface EarnedBadge {
  id: string
  badgeId: string
  earnedValue: number
  earnedAt: string
}

/** Gathers everything the badge rules measure, in one pass. */
async function collectMetrics(userId: string): Promise<BadgeMetrics> {
  const [streak, sessions, quizAttempts, xpAgg, roadmap] = await Promise.all([
    prisma.streak.findUnique({
      where: { userId },
      select: { currentStreak: true },
    }),
    prisma.studySession.aggregate({
      where: { userId, status: 'completed' },
      _count: { _all: true },
      _sum: { durationSec: true },
    }),
    prisma.quizAttempt.findMany({
      where: { userId, completedAt: { not: null } },
      select: { score: true },
    }),
    prisma.xPEvent.aggregate({ where: { userId }, _sum: { amount: true } }),
    prisma.roadmap.findUnique({ where: { userId }, select: { nodes: true } }),
  ])

  // Roadmap nodes are stored as a json array; count the completed ones.
  let topicsCompleted = 0
  if (Array.isArray(roadmap?.nodes)) {
    topicsCompleted = (roadmap.nodes as { status?: string }[]).filter(
      (n) => n?.status === 'completed',
    ).length
  }

  return {
    currentStreak: streak?.currentStreak ?? 0,
    studySessions: sessions._count._all,
    studyMinutes: Math.floor((sessions._sum.durationSec ?? 0) / 60),
    quizzesCompleted: quizAttempts.length,
    quizPerfectScores: quizAttempts.filter((a) => a.score >= 100).length,
    topicsCompleted,
    totalXP: xpAgg._sum.amount ?? 0,
  }
}

/**
 * Awards any badges the student now qualifies for.
 *
 * Safe to call after any progress event — it is idempotent, because the unique
 * (userId, badgeId) index means a re-award is a no-op rather than a duplicate.
 * Never throws: a badge is a reward, and failing to grant one must not fail the
 * quiz submission or study session that triggered the check.
 */
export async function checkAndAwardBadges(userId: string): Promise<EarnedBadge[]> {
  try {
    const [metrics, existing] = await Promise.all([
      collectMetrics(userId),
      prisma.userBadge.findMany({ where: { userId }, select: { badgeId: true } }),
    ])

    const newlyEarned = evaluateBadges(
      metrics,
      existing.map((b) => b.badgeId),
    )
    if (newlyEarned.length === 0) return []

    const created: EarnedBadge[] = []

    for (const { badge, value } of newlyEarned) {
      try {
        const row = await prisma.userBadge.create({
          data: { userId, badgeId: badge.id, earnedValue: value },
        })

        created.push({
          id: row.id,
          badgeId: row.badgeId,
          earnedValue: row.earnedValue,
          earnedAt: row.earnedAt.toISOString(),
        })

        // Tells the student, in-app and (where enabled) as a push.
        await notificationService.notify(userId, 'badge_earned', {
          title: `Badge earned: ${badge.name}`,
          body: badge.description,
          deeplink: '/progress?tab=badges',
          metadata: { badgeId: badge.id, earnedValue: value },
        })
      } catch (err) {
        // Most likely two requests raced to award the same badge.
        logger.debug({ err, userId, badgeId: badge.id }, 'Badge award skipped')
      }
    }

    return created
  } catch (err) {
    logger.warn({ err, userId }, 'Badge check failed')
    return []
  }
}

export interface BadgeListItem {
  badgeId: string
  name: string
  description: string
  category: string
  icon: string
  threshold: number
  /** Null when the student has not earned it yet. */
  earnedAt: string | null
  earnedValue: number | null
  /** How far along they are, 0-100, for badges still to come. */
  progress: number
}

/** The full catalogue, marked with what this student has earned. */
export async function listBadges(userId: string): Promise<BadgeListItem[]> {
  const [earned, metrics] = await Promise.all([
    prisma.userBadge.findMany({ where: { userId } }),
    collectMetrics(userId),
  ])

  const earnedById = new Map(earned.map((b) => [b.badgeId, b]))

  return BADGES.map((badge) => {
    const row = earnedById.get(badge.id)
    const current = metrics[badge.metric]

    return {
      badgeId: badge.id,
      name: badge.name,
      description: badge.description,
      category: badge.category,
      icon: badge.icon,
      threshold: badge.threshold,
      earnedAt: row?.earnedAt.toISOString() ?? null,
      earnedValue: row?.earnedValue ?? null,
      progress: row
        ? 100
        : Math.min(100, Math.round((current / badge.threshold) * 100)),
    }
  })
}

export { getBadge }
