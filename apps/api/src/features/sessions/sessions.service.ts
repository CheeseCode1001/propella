import type { StudySession } from '../../config/db'
import { prisma } from '../../config/db'
import { AppError, NotFoundError } from '../../middleware/error-handler'
import { notify } from '../notifications/notification.service'
import { jsonArray, type RoadmapNodeJson } from '../../models/types'
import { recordStreakActivity } from '../gamification/streak'
import { XP } from '@propella/shared'
import { logger } from '../../config/logger'

const STREAK_MILESTONES = new Set([7, 14, 30, 60, 100])

interface TopicRef {
  subjectSlug: string
  topicSlug: string
}

export async function startSession(
  userId: string,
  topicRef: TopicRef,
  isMarathon: boolean,
): Promise<StudySession> {
  return prisma.studySession.create({
    data: {
      userId,
      subjectSlug: topicRef.subjectSlug,
      topicSlug: topicRef.topicSlug,
      isMarathon,
      startedAt: new Date(),
      status: 'in-progress',
    },
  })
}

interface EndSessionResult {
  session: StudySession
  xpAwarded: number
}

export async function endSession(
  userId: string,
  sessionId: string,
  durationSec: number,
  notesMarkdown?: string,
): Promise<EndSessionResult> {
  const existing = await prisma.studySession.findFirst({
    where: { id: sessionId, userId },
  })

  if (!existing) {
    throw new NotFoundError('Session not found')
  }

  if (existing.status !== 'in-progress') {
    throw new AppError(400, 'Session is not in-progress')
  }

  // Calculate XP based on duration
  const durationMin = durationSec / 60
  let xpAwarded = 0
  let reason = ''

  if (durationMin >= 45) {
    xpAwarded = XP.SESSION_45_MIN
    reason = '45+ minute study session'
  } else if (durationMin >= 25) {
    xpAwarded = XP.SESSION_25_MIN
    reason = '25+ minute study session'
  } else if (durationMin >= 15) {
    xpAwarded = XP.SESSION_15_MIN
    reason = '15+ minute study session'
  } else {
    reason = 'Study session (< 15 min, no XP)'
  }

  const session = await prisma.studySession.update({
    where: { id: existing.id },
    data: {
      endedAt: new Date(),
      durationSec,
      status: 'completed',
      xpAwarded,
      ...(notesMarkdown !== undefined ? { notesMarkdown } : {}),
    },
  })

  // Create XPEvent if XP was awarded
  if (xpAwarded > 0) {
    await prisma.xPEvent.create({
      data: {
        userId,
        source: 'study_session',
        sourceId: session.id,
        amount: xpAwarded,
        reason,
      },
    })
  }

  await recordStreakActivity(userId)

  // Update roadmap node
  const roadmap = await prisma.roadmap.findUnique({ where: { userId } })
  if (roadmap) {
    const nodes = jsonArray<RoadmapNodeJson>(roadmap.nodes)
    const node = nodes.find(
      (n) => n.subjectSlug === session.subjectSlug && n.topicSlug === session.topicSlug,
    )
    if (node) {
      if (node.status === 'ready') {
        node.status = 'in-progress'
      }
      node.lastStudiedAt = new Date().toISOString()
      await prisma.roadmap.update({
        where: { userId },
        data: { nodes },
      })
    } else {
      logger.warn({ userId, sessionId }, 'No matching roadmap node found for session')
    }
  }

  // Check achievements and leaderboard standing
  const { checkAndAwardBadges } = await import('../badges/badges.service')
  const { checkLeaderboardTop5 } = await import('../leaderboard/leaderboard.service')
  await checkAndAwardBadges(userId)
  await checkLeaderboardTop5(userId)

  return { session, xpAwarded }
}

export async function abandonSession(userId: string, sessionId: string): Promise<void> {
  const session = await prisma.studySession.findFirst({
    where: { id: sessionId, userId },
    select: { id: true },
  })

  if (!session) {
    throw new NotFoundError('Session not found')
  }

  await prisma.studySession.update({
    where: { id: session.id },
    data: { status: 'abandoned' },
  })
}

interface PaginatedSessions {
  sessions: StudySession[]
  total: number
  page: number
  limit: number
}

export async function getSessions(
  userId: string,
  page: number,
  limit: number,
): Promise<PaginatedSessions> {
  const skip = (page - 1) * limit

  const [sessions, total] = await Promise.all([
    prisma.studySession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.studySession.count({ where: { userId } }),
  ])

  return { sessions, total, page, limit }
}
