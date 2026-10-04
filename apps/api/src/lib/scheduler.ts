import cron from 'node-cron'
import { prisma } from '../config/db'
import { logger } from '../config/logger'
import { liveStreak } from '../features/gamification/streak'
import {
  sendStudyReminderEmail,
  sendStreakWarningEmail,
  sendWeeklyDigestEmail,
  sendInactivityReminderEmail,
  sendPendingTodosEmail,
} from './email'
import {
  notify,
  purgeExpiredNotifications,
} from '../features/notifications/notification.service'
import { jsonArray, jsonObject, type ByTopicResult, type ReminderPayload } from '../models/types'

const EMPTY_PAYLOAD: ReminderPayload = { title: '', body: '' }

// Every 5 minutes: process due reminders
cron.schedule('*/5 * * * *', async () => {
  try {
    const due = await prisma.reminder.findMany({
      where: { status: 'scheduled', scheduledFor: { lte: new Date() } },
      take: 50,
      include: { user: { select: { email: true } } },
    })

    for (const reminder of due) {
      const payload = jsonObject<ReminderPayload>(reminder.payload, EMPTY_PAYLOAD)

      try {
        if (reminder.channel === 'email') {
          if (reminder.type === 'streak_warning') {
            const streak = await prisma.streak.findUnique({
              where: { userId: reminder.userId },
              select: { currentStreak: true },
            })
            await sendStreakWarningEmail(reminder.user.email, { streak: streak?.currentStreak ?? 1 })
          } else {
            await sendStudyReminderEmail(reminder.user.email, payload)
          }
        }

        // Also create an in-app notification for every reminder sent
        const notifType =
          reminder.type === 'streak_warning'
            ? 'streak_warning'
            : reminder.type === 'weekly_review'
              ? 'weekly_review'
              : 'study_reminder'

        await notify(reminder.userId, notifType, {
          title: payload.title,
          body: payload.body,
          deeplink: payload.deeplink ?? null,
        })

        await prisma.reminder.update({
          where: { id: reminder.id },
          data: { status: 'sent', sentAt: new Date() },
        })
      } catch (err) {
        await prisma.reminder.update({
          where: { id: reminder.id },
          data: { status: 'failed' },
        })
        logger.error({ err, reminderId: reminder.id }, 'Reminder failed')
      }
    }
  } catch (err) {
    logger.error({ err }, 'Reminder scheduler error')
  }
})

// Daily at 18:00 UTC: streak warning for users at risk
cron.schedule('0 18 * * *', async () => {
  try {
    const today = new Date(new Date().toDateString())
    // Older streaks have lapsed already - there is nothing left to save.
    const twoDaysAgo = new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000)
    const atRisk = await prisma.streak.findMany({
      where: { currentStreak: { gt: 0 }, lastActiveDate: { lt: today, gte: twoDaysAgo } },
      take: 500,
    })

    for (const streak of atRisk) {
      if (liveStreak(streak, new Date()) === 0) continue

      // Avoid duplicate reminders for the same day
      const existing = await prisma.reminder.findFirst({
        where: {
          userId: streak.userId,
          type: 'streak_warning',
          scheduledFor: { gte: today },
        },
        select: { id: true },
      })
      if (existing) continue

      const payload: ReminderPayload = {
        title: 'Your streak is at risk',
        body: `You have a ${streak.currentStreak}-day streak. Study today to keep it.`,
      }

      await prisma.reminder.create({
        data: {
          userId: streak.userId,
          type: 'streak_warning',
          scheduledFor: new Date(),
          channel: 'email',
          payload,
          status: 'scheduled',
        },
      })

      // Immediate in-app notification (the email fires later when scheduler processes it)
      await notify(streak.userId, 'streak_warning', {
        title: payload.title,
        body: payload.body,
        deeplink: '/dashboard',
      })
    }

    logger.info({ count: atRisk.length }, 'Streak warning reminders scheduled')
  } catch (err) {
    logger.error({ err }, 'Streak warning scheduler error')
  }
})

// Weekly on Sunday at 19:00 UTC: send weekly digest emails
cron.schedule('0 19 * * 0', async () => {
  try {
    const users = await prisma.user.findMany({
      where: { notifyWeeklyDigest: true },
      select: {
        id: true,
        email: true,
        name: true,
        streak: { select: { currentStreak: true } },
      },
      take: 1000,
    })

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    for (const user of users) {
      try {
        const [sessionAgg, attempts] = await Promise.all([
          prisma.studySession.aggregate({
            where: { userId: user.id, status: 'completed', startedAt: { gte: weekAgo } },
            _sum: { durationSec: true },
          }),
          prisma.quizAttempt.findMany({
            where: { userId: user.id, completedAt: { gte: weekAgo } },
            select: { score: true, byTopic: true },
          }),
        ])

        const studyHours = (sessionAgg._sum.durationSec ?? 0) / 3600

        const avgScore =
          attempts.length > 0
            ? Math.round(attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length)
            : 0

        // Collect weak topics (score < 50%) from this week's attempts
        const weakMap: Record<string, { correct: number; total: number }> = {}
        for (const attempt of attempts) {
          for (const t of jsonArray<ByTopicResult>(attempt.byTopic)) {
            const entry = (weakMap[t.topicSlug] ??= { correct: 0, total: 0 })
            entry.correct += t.correct
            entry.total += t.total
          }
        }
        const weakTopics = Object.entries(weakMap)
          .filter(([, v]) => v.total > 0 && v.correct / v.total < 0.5)
          .map(([slug]) => slug.replace(/-/g, ' '))

        await sendWeeklyDigestEmail(user.email, {
          name: user.name,
          studyHours,
          currentStreak: user.streak?.currentStreak ?? 0,
          topicsMastered: 0, // mastery updates are tracked on Roadmap nodes
          avgScore,
          weakTopics,
        })
      } catch (err) {
        logger.error({ err, userId: user.id }, 'Weekly digest failed for user')
      }
    }

    logger.info({ count: users.length }, 'Weekly digest emails dispatched')
  } catch (err) {
    logger.error({ err }, 'Weekly digest scheduler error')
  }
})

// Daily at 10:00 UTC: notify & email students inactive for 3+ days
cron.schedule('0 10 * * *', async () => {
  try {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)

    const users = await prisma.user.findMany({
      where: {
        onboardingCompleted: true,
        role: 'student',
      },
      select: {
        id: true,
        email: true,
        name: true,
        notifyEmail: true,
        notifyStudyReminders: true,
        examProfile: { select: { examType: true } },
        streak: { select: { currentStreak: true, lastActiveDate: true } },
      },
      take: 500,
    })

    for (const user of users) {
      const lastActive = user.streak?.lastActiveDate
      if (lastActive && lastActive > threeDaysAgo) continue

      // Anti-spam: skip if user was already notified of inactivity in the last 5 days
      const recentReminder = await prisma.notification.findFirst({
        where: {
          userId: user.id,
          type: 'study_reminder',
          createdAt: { gte: fiveDaysAgo },
        },
        select: { id: true, metadata: true },
      })

      const alreadyReminded =
        recentReminder &&
        (recentReminder.metadata as Record<string, unknown> | null)?.reason === 'inactivity_3d'
      if (alreadyReminded) continue

      const daysInactive = lastActive
        ? Math.max(3, Math.floor((Date.now() - lastActive.getTime()) / (24 * 60 * 60 * 1000)))
        : 3

      // In-app notification
      const firstName = user.name.split(' ')[0] || 'Scholar'
      await notify(user.id, 'study_reminder', {
        title: `We miss you, ${firstName}! 📚`,
        body: 'Your study goals are waiting for you. Spend 10 minutes studying or try a quick quiz today!',
        deeplink: '/dashboard',
        metadata: { reason: 'inactivity_3d', daysInactive },
      })

      // Email notification
      if (user.notifyEmail && user.notifyStudyReminders) {
        await sendInactivityReminderEmail(user.email, {
          name: user.name,
          daysInactive,
          targetExam: user.examProfile?.examType,
          currentStreak: user.streak?.currentStreak ?? 0,
        })
      }
    }
    logger.info('Inactivity study reminder check completed')
  } catch (err) {
    logger.error({ err }, 'Inactivity reminder scheduler error')
  }
})

// Daily at 14:00 UTC: remind students who created tasks on their planner that are still pending
cron.schedule('0 14 * * *', async () => {
  try {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)

    // Find users who have planner tasks created at least 24h ago that are still pending
    const pendingUsers = await prisma.plannerTask.groupBy({
      by: ['userId'],
      where: {
        status: { in: ['todo', 'doing'] },
        createdAt: { lte: yesterday },
      },
      _count: { id: true },
    })

    for (const group of pendingUsers) {
      const userId = group.userId

      // Anti-spam: check if a pending_todos notification was sent in the last 3 days
      const recentReminder = await prisma.notification.findFirst({
        where: {
          userId,
          type: 'study_reminder',
          createdAt: { gte: threeDaysAgo },
        },
        select: { metadata: true },
      })

      const alreadyReminded =
        recentReminder &&
        (recentReminder.metadata as Record<string, unknown> | null)?.reason === 'pending_todos'
      if (alreadyReminded) continue

      const [user, tasks] = await Promise.all([
        prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, email: true, name: true, notifyEmail: true, notifyStudyReminders: true },
        }),
        prisma.plannerTask.findMany({
          where: { userId, status: { in: ['todo', 'doing'] } },
          orderBy: [{ dueDate: 'asc' }, { position: 'asc' }],
          take: 5,
          select: { title: true, dueDate: true },
        }),
      ])

      if (!user || tasks.length === 0) continue

      // In-app notification
      await notify(userId, 'study_reminder', {
        title: 'You have pending study tasks 📋',
        body: `You have ${group._count.id} task${group._count.id === 1 ? '' : 's'} on your planner waiting for you. Check one off today!`,
        deeplink: '/planner',
        metadata: { reason: 'pending_todos', taskCount: group._count.id },
      })

      // Email notification
      if (user.notifyEmail && user.notifyStudyReminders) {
        await sendPendingTodosEmail(user.email, {
          name: user.name,
          tasks: tasks.map((t) => ({
            title: t.title,
            dueDate: t.dueDate ? t.dueDate.toISOString() : null,
          })),
        })
      }
    }
    logger.info('Pending tasks reminder scheduler completed')
  } catch (err) {
    logger.error({ err }, 'Pending tasks reminder scheduler error')
  }
})

// Hourly: drop notifications past their expiry. MongoDB did this with a TTL
// index; Postgres has no equivalent, so the sweep is explicit.
cron.schedule('30 * * * *', async () => {
  try {
    const removed = await purgeExpiredNotifications()
    if (removed > 0) {
      logger.info({ removed }, 'Purged expired notifications')
    }
  } catch (err) {
    logger.error({ err }, 'Notification purge error')
  }
})

export function startScheduler(): void {
  logger.info('Scheduler started')
}
