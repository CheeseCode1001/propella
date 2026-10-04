import type { MarathonRun } from '../../config/db'
import { prisma } from '../../config/db'
import { NotFoundError, AppError } from '../../middleware/error-handler'
import { jsonArray, type MarathonPause, type TopicCovered } from '../../models/types'
import { recordStreakActivity } from '../gamification/streak'
import { XP } from '@propella/shared'

export interface StartMarathonInput {
  plannedDurationMin: number
  pomodoroLength: number
  subjectSlugs: string[]
}

export interface EndMarathonResult {
  run: MarathonRun
  xpAwarded: number
}

export type TopicCoveredInput = TopicCovered

async function findRun(userId: string, runId: string): Promise<MarathonRun> {
  const run = await prisma.marathonRun.findFirst({ where: { id: runId, userId } })
  if (!run) throw new NotFoundError('Marathon run not found')
  return run
}

export async function startMarathon(
  userId: string,
  input: StartMarathonInput,
): Promise<MarathonRun> {
  return prisma.marathonRun.create({
    data: {
      userId,
      plannedDurationMin: input.plannedDurationMin,
      pomodoroLength: input.pomodoroLength,
      startedAt: new Date(),
      status: 'running',
    },
  })
}

export async function pauseMarathon(userId: string, runId: string): Promise<MarathonRun> {
  const run = await findRun(userId, runId)
  if (run.status !== 'running') throw new AppError(400, 'Marathon is not running')

  const pauses = jsonArray<MarathonPause>(run.pauses)
  pauses.push({ at: new Date().toISOString(), durationSec: 0 })

  return prisma.marathonRun.update({
    where: { id: run.id },
    data: { pauses, status: 'paused' },
  })
}

export async function resumeMarathon(userId: string, runId: string): Promise<MarathonRun> {
  const run = await findRun(userId, runId)
  if (run.status !== 'paused') throw new AppError(400, 'Marathon is not paused')

  // Close out the open pause with how long it actually lasted.
  const pauses = jsonArray<MarathonPause>(run.pauses)
  const lastPause = pauses[pauses.length - 1]
  if (lastPause) {
    lastPause.durationSec = Math.floor(
      (Date.now() - new Date(lastPause.at).getTime()) / 1000,
    )
  }

  return prisma.marathonRun.update({
    where: { id: run.id },
    data: { pauses, status: 'running' },
  })
}

export async function endMarathon(
  userId: string,
  runId: string,
  actualDurationSec: number,
  pomodorosCompleted: number,
  topicsCovered: TopicCoveredInput[],
): Promise<EndMarathonResult> {
  const existing = await findRun(userId, runId)
  if (existing.status === 'completed') throw new AppError(400, 'Marathon already completed')

  // Calculate XP
  let xpAwarded = pomodorosCompleted * XP.MARATHON_PER_POMODORO
  if (pomodorosCompleted >= 4) {
    xpAwarded += XP.MARATHON_4_PLUS_BONUS
  }

  // Create XP event
  if (xpAwarded > 0) {
    await prisma.xPEvent.create({
      data: {
        userId,
        source: 'marathon',
        sourceId: existing.id,
        amount: xpAwarded,
        reason: `Marathon: ${pomodorosCompleted} pomodoro${pomodorosCompleted !== 1 ? 's' : ''} completed`,
      },
    })
  }

  await recordStreakActivity(userId)

  const run = await prisma.marathonRun.update({
    where: { id: existing.id },
    data: {
      status: 'completed',
      endedAt: new Date(),
      actualDurationSec,
      pomodorosCompleted,
      topicsCovered,
      xpAwarded,
    },
  })

  // In-app notification
  const { notify } = await import('../notifications/notification.service')
  await notify(userId, 'streak_milestone', {
    title: 'Marathon Crushed! 🏃💨',
    body: `You completed a ${pomodorosCompleted}-pomodoro marathon (${Math.round(actualDurationSec / 60)} mins) and earned ${xpAwarded} XP!`,
    deeplink: '/marathon',
    metadata: { marathonId: run.id, pomodorosCompleted, xpAwarded },
  })

  // Email notification
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true, notifyEmail: true },
  })
  if (user?.notifyEmail) {
    const { sendMarathonCompletedEmail } = await import('../../lib/email')
    await sendMarathonCompletedEmail(user.email, {
      name: user.name,
      pomodorosCompleted,
      durationMinutes: Math.round(actualDurationSec / 60),
      xpAwarded,
      topicsCovered: topicsCovered.map((t) => t.topicSlug.replace(/-/g, ' ')),
    })
  }

  // Check achievements and leaderboard standings
  const { checkAndAwardBadges } = await import('../badges/badges.service')
  const { checkLeaderboardTop5 } = await import('../leaderboard/leaderboard.service')
  await checkAndAwardBadges(userId)
  await checkLeaderboardTop5(userId)

  return { run, xpAwarded }
}

/**
 * Ends a run the student stopped before finishing.
 *
 * No XP, no streak credit and no badge — a marathon only pays out when it is
 * seen through. The run is still saved so the history stays honest.
 */
export async function abandonMarathon(
  userId: string,
  runId: string,
  actualDurationSec: number,
  pomodorosCompleted: number,
  topicsCovered: TopicCoveredInput[],
): Promise<MarathonRun> {
  const existing = await findRun(userId, runId)
  if (existing.status === 'completed') {
    throw new AppError(400, 'Marathon already completed')
  }

  return prisma.marathonRun.update({
    where: { id: existing.id },
    data: {
      status: 'abandoned',
      endedAt: new Date(),
      actualDurationSec,
      pomodorosCompleted,
      topicsCovered,
      xpAwarded: 0,
    },
  })
}

export async function getMarathonHistory(userId: string): Promise<MarathonRun[]> {
  return prisma.marathonRun.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })
}
