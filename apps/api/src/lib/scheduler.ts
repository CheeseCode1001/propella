import cron from 'node-cron'
import { prisma } from '../config/db'
import { logger } from '../config/logger'
import {
  sendStudyReminderEmail,
  sendStreakWarningEmail,
  sendWeeklyDigestEmail,
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
            await sendStreakWarningEmail(reminder.user.email, streak?.currentStreak ?? 1)
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
    const atRisk = await prisma.streak.findMany({
      where: { currentStreak: { gt: 0 }, lastActiveDate: { lt: today } },
      take: 500,
    })

    for (const streak of atRisk) {
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
      select: { id: true, email: true },
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
          studyHours,
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
