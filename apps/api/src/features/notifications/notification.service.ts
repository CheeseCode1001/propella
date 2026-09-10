import type { NotificationType, Prisma } from '../../config/db'
import { prisma } from '../../config/db'
import { NotFoundError } from '../../middleware/error-handler'
import { logger } from '../../config/logger'
import { sendPushToUser } from '../../lib/push'

export type { NotificationType }

export interface NotifyInput {
  type: NotificationType
  title: string
  body: string
  deeplink?: string | null
  metadata?: Record<string, unknown>
  expiresAt?: Date | null
}

// Anti-flood: skip if same type + overlapping metadata within 30 minutes
async function isDuplicate(
  userId: string,
  type: NotificationType,
  metadata: Record<string, unknown>,
): Promise<boolean> {
  const windowStart = new Date(Date.now() - 30 * 60 * 1000)

  const metadataFilters: Prisma.NotificationWhereInput[] = []
  if (metadata['topicId'] !== undefined) {
    metadataFilters.push({
      metadata: { path: ['topicId'], equals: metadata['topicId'] as Prisma.InputJsonValue },
    })
  }
  if (metadata['quizId'] !== undefined) {
    metadataFilters.push({
      metadata: { path: ['quizId'], equals: metadata['quizId'] as Prisma.InputJsonValue },
    })
  }

  const existing = await prisma.notification.findFirst({
    where: {
      userId,
      type,
      createdAt: { gte: windowStart },
      ...(metadataFilters.length > 0 ? { AND: metadataFilters } : {}),
    },
    select: { id: true },
  })

  return existing !== null
}

export async function notify(
  userId: string,
  type: NotificationType,
  data: Omit<NotifyInput, 'type'>,
): Promise<void> {
  try {
    const metadata = data.metadata ?? {}

    if (await isDuplicate(userId, type, metadata)) {
      logger.debug({ userId, type }, 'Notification suppressed (anti-flood)')
      return
    }

    const title = data.title.slice(0, 80)
    const body = data.body.slice(0, 200)

    await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        body,
        deeplink: data.deeplink ?? null,
        metadata: metadata as Prisma.InputJsonValue,
        expiresAt: data.expiresAt ?? null,
      },
    })

    // Mirror it to the student's devices. Awaited so a push failure is logged
    // against this notification, but it can never fail the caller — the in-app
    // record is already saved, and sendPushToUser swallows per-device errors.
    if (await wantsPush(userId, type)) {
      await sendPushToUser(userId, {
        title,
        body,
        url: data.deeplink ?? '/dashboard',
        // One tag per type, so a second streak warning replaces the first
        // rather than stacking up on the lock screen.
        tag: type,
      }).catch((err: unknown) => {
        logger.warn({ err, userId, type }, 'Push mirror failed')
      })
    }
  } catch (err) {
    logger.error({ err, userId, type }, 'Failed to create notification')
  }
}

/** Honours the student's notification preferences before pushing. */
async function wantsPush(userId: string, type: NotificationType): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      notifyPush: true,
      notifyStudyReminders: true,
      notifyStreakReminders: true,
    },
  })

  if (!user?.notifyPush) return false

  if (type === 'study_reminder' || type === 'revision_due') {
    return user.notifyStudyReminders
  }
  if (type === 'streak_warning' || type === 'streak_milestone') {
    return user.notifyStreakReminders
  }
  return true
}

export interface ListNotificationsResult {
  items: Array<{
    id: string
    type: NotificationType
    title: string
    body: string
    deeplink: string | null
    metadata: Record<string, unknown>
    readAt: string | null
    createdAt: string
  }>
  nextCursor: string | null
  unreadCount: number
}

export async function listNotifications(
  userId: string,
  limit: number,
  cursor?: string,
): Promise<ListNotificationsResult> {
  const safeLimit = Math.min(limit, 50)

  const [items, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      // Newest first, with id as a stable tiebreak so the cursor never skips or
      // repeats rows created in the same millisecond.
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: safeLimit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    }),
    prisma.notification.count({ where: { userId, readAt: null } }),
  ])

  const hasMore = items.length > safeLimit
  const page = hasMore ? items.slice(0, safeLimit) : items
  const nextCursor = hasMore ? (page[page.length - 1]?.id ?? null) : null

  return {
    items: page.map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      body: n.body,
      deeplink: n.deeplink,
      metadata: (n.metadata ?? {}) as Record<string, unknown>,
      readAt: n.readAt ? n.readAt.toISOString() : null,
      createdAt: n.createdAt.toISOString(),
    })),
    nextCursor,
    unreadCount,
  }
}

export async function getUnreadCount(userId: string): Promise<number> {
  return prisma.notification.count({ where: { userId, readAt: null } })
}

export async function markRead(userId: string, notificationId: string): Promise<void> {
  const result = await prisma.notification.updateMany({
    where: { id: notificationId, userId, readAt: null },
    data: { readAt: new Date() },
  })
  if (result.count === 0) {
    throw new NotFoundError('Notification not found')
  }
}

export async function markAllRead(userId: string): Promise<void> {
  await prisma.notification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() },
  })
}

export async function deleteNotification(
  userId: string,
  notificationId: string,
): Promise<void> {
  const result = await prisma.notification.deleteMany({
    where: { id: notificationId, userId },
  })
  if (result.count === 0) {
    throw new NotFoundError('Notification not found')
  }
}

/**
 * Notifications carry an optional TTL. Mongo enforced it with an index; in
 * Postgres the scheduler sweeps them.
 */
export async function purgeExpiredNotifications(): Promise<number> {
  const result = await prisma.notification.deleteMany({
    where: { expiresAt: { not: null, lte: new Date() } },
  })
  return result.count
}
