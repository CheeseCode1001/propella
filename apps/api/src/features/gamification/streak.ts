import { prisma } from '../../config/db'
import type { UserStreak } from '@propella/shared'

/**
 * Study streaks: the number of calendar days in a row a student has studied.
 *
 * A day counts once. Studying the day after the last counted day continues
 * the streak; a single missed day is bridged by a freeze if one is left;
 * anything longer starts again at 1. A streak of 0 has not counted a day yet
 * (signup creates the row), so the first activity counts even on that day.
 */

export interface StreakState {
  currentStreak: number
  longestStreak: number
  lastActiveDate: Date
  freezesAvailable: number
  freezesUsed: Date[]
}

const DAY_MS = 24 * 60 * 60 * 1000

/** Calendar day on the server's clock, as a whole number. */
function dayNumber(date: Date): number {
  return Math.floor((date.getTime() - date.getTimezoneOffset() * 60_000) / DAY_MS)
}

/** The streak after studying at `now`. `changed` is false when today already counted. */
export function nextStreak(
  state: StreakState | null,
  now: Date,
): { state: StreakState; changed: boolean } {
  if (!state) {
    return {
      changed: true,
      state: { currentStreak: 1, longestStreak: 1, lastActiveDate: now, freezesAvailable: 1, freezesUsed: [] },
    }
  }

  const gap = dayNumber(now) - dayNumber(state.lastActiveDate)
  if (state.currentStreak > 0 && gap <= 0) return { state, changed: false }

  let currentStreak = 1
  let { freezesAvailable, freezesUsed } = state
  if (state.currentStreak > 0 && gap === 1) {
    currentStreak = state.currentStreak + 1
  } else if (state.currentStreak > 0 && gap === 2 && freezesAvailable > 0) {
    currentStreak = state.currentStreak + 1
    freezesAvailable -= 1
    freezesUsed = [...freezesUsed, new Date(now.getTime() - DAY_MS)]
  }

  return {
    changed: true,
    state: {
      currentStreak,
      longestStreak: Math.max(currentStreak, state.longestStreak),
      lastActiveDate: now,
      freezesAvailable,
      freezesUsed,
    },
  }
}

/**
 * The streak as the student should see it right now: one that has already
 * lapsed (and cannot be bridged by a freeze) shows as 0 until they study again.
 */
export function liveStreak(state: StreakState | null, now: Date): number {
  if (!state || state.currentStreak === 0) return 0
  const gap = dayNumber(now) - dayNumber(state.lastActiveDate)
  if (gap <= 1) return state.currentStreak
  if (gap === 2 && state.freezesAvailable > 0) return state.currentStreak
  return 0
}

/** API shape of a streak row (or of a student who has none yet). */
export function toUserStreak(row: StreakState | null, now = new Date()): UserStreak {
  return {
    currentStreak: liveStreak(row, now),
    longestStreak: row?.longestStreak ?? 0,
    lastActiveDate: (row?.lastActiveDate ?? now).toISOString(),
    freezesAvailable: row?.freezesAvailable ?? 1,
  }
}

/**
 * Counts today towards the student's streak. Returns the streak and whether
 * this call extended it (for milestone notifications).
 */
export async function recordStreakActivity(
  userId: string,
  now = new Date(),
): Promise<{ currentStreak: number; extended: boolean }> {
  const existing = await prisma.streak.findUnique({ where: { userId } })
  const { state, changed } = nextStreak(existing, now)
  if (!changed) return { currentStreak: state.currentStreak, extended: false }

  const data = {
    currentStreak: state.currentStreak,
    longestStreak: state.longestStreak,
    lastActiveDate: state.lastActiveDate,
    freezesAvailable: state.freezesAvailable,
    freezesUsed: state.freezesUsed,
  }
  // Upsert: two requests finishing at once must not both try to create the row.
  await prisma.streak.upsert({ where: { userId }, create: { userId, ...data }, update: data })

  // Trigger streak notifications and emails
  try {
    const STREAK_MILESTONES = [3, 7, 14, 21, 30, 50, 100]
    const isMilestone = STREAK_MILESTONES.includes(state.currentStreak)

    const { notify } = await import('../notifications/notification.service')

    if (isMilestone) {
      await notify(userId, 'streak_milestone', {
        title: `${state.currentStreak}-Day Streak Milestone! 🔥`,
        body: `You have studied ${state.currentStreak} days in a row! Your consistency is inspiring.`,
        deeplink: '/dashboard',
        metadata: { streak: state.currentStreak, isMilestone: true },
      })

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, name: true, notifyEmail: true, notifyStreakReminders: true },
      })

      if (user?.notifyEmail && user.notifyStreakReminders) {
        const { sendStreakMilestoneEmail } = await import('../../lib/email')
        await sendStreakMilestoneEmail(user.email, {
          name: user.name,
          streakDays: state.currentStreak,
        })
      }
    } else if (state.currentStreak > 1) {
      // Daily streak continuation notification
      await notify(userId, 'streak_milestone', {
        title: `Streak Extended! 🔥 ${state.currentStreak} Days`,
        body: `You checked in and studied today! You are on a ${state.currentStreak}-day roll.`,
        deeplink: '/dashboard',
        metadata: { streak: state.currentStreak },
      })
    }
  } catch (err) {
    // Non-blocking
    const { logger } = await import('../../config/logger')
    logger.warn({ err, userId }, 'Failed to dispatch streak notification')
  }

  return { currentStreak: state.currentStreak, extended: true }
}
