import type { ExamType, Prisma } from '../../config/db'
import { prisma } from '../../config/db'
import { AppError, NotFoundError } from '../../middleware/error-handler'
import { parsePastQuestions, type RowError } from '../../lib/past-question-import'
import { logger } from '../../config/logger'
import { sendPushToUsers } from '../../lib/push'

// ─── Platform metrics ────────────────────────────────────────────────

export interface AdminMetrics {
  users: { total: number; verified: number; onboarded: number; newLast7Days: number }
  content: { subjects: number; pastQuestions: number; quizzesGenerated: number }
  activity: { studySessions: number; quizAttempts: number; marathonRuns: number; xpAwarded: number }
  pastQuestionsByExam: Array<{ exam: ExamType; count: number }>
}

export async function getMetrics(): Promise<AdminMetrics> {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const [
    users,
    verified,
    onboarded,
    newUsers,
    subjects,
    pastQuestions,
    quizzes,
    sessions,
    attempts,
    marathons,
    xp,
    byExam,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { emailVerifiedAt: { not: null } } }),
    prisma.user.count({ where: { onboardingCompleted: true } }),
    prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.subject.count(),
    prisma.pastQuestion.count(),
    prisma.quiz.count(),
    prisma.studySession.count(),
    prisma.quizAttempt.count(),
    prisma.marathonRun.count(),
    prisma.xPEvent.aggregate({ _sum: { amount: true } }),
    prisma.pastQuestion.groupBy({ by: ['exam'], _count: { _all: true } }),
  ])

  return {
    users: { total: users, verified, onboarded, newLast7Days: newUsers },
    content: { subjects, pastQuestions, quizzesGenerated: quizzes },
    activity: {
      studySessions: sessions,
      quizAttempts: attempts,
      marathonRuns: marathons,
      xpAwarded: xp._sum.amount ?? 0,
    },
    pastQuestionsByExam: byExam.map((r) => ({ exam: r.exam, count: r._count._all })),
  }
}

// ─── Users ───────────────────────────────────────────────────────────

export async function listUsers(params: { search?: string; page: number; limit: number }) {
  const where: Prisma.UserWhereInput = params.search
    ? {
        OR: [
          { email: { contains: params.search, mode: 'insensitive' } },
          { name: { contains: params.search, mode: 'insensitive' } },
        ],
      }
    : {}

  const [rows, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (params.page - 1) * params.limit,
      take: params.limit,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        plan: true,
        emailVerifiedAt: true,
        onboardingCompleted: true,
        createdAt: true,
        _count: { select: { quizAttempts: true, studySessions: true } },
      },
    }),
    prisma.user.count({ where }),
  ])

  return {
    users: rows.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      plan: u.plan,
      emailVerified: u.emailVerifiedAt !== null,
      onboardingCompleted: u.onboardingCompleted,
      createdAt: u.createdAt.toISOString(),
      quizAttempts: u._count.quizAttempts,
      studySessions: u._count.studySessions,
    })),
    total,
    page: params.page,
    limit: params.limit,
  }
}

export interface AdminAccount {
  id: string
  name: string
  email: string
  emailVerified: boolean
  createdAt: string
}

/** Everyone who currently holds admin access, oldest first. */
export async function listAdmins(): Promise<AdminAccount[]> {
  const rows = await prisma.user.findMany({
    where: { role: 'admin' },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerifiedAt: true,
      createdAt: true,
    },
  })

  return rows.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    emailVerified: u.emailVerifiedAt !== null,
    createdAt: u.createdAt.toISOString(),
  }))
}

export async function setUserRole(
  actingAdminId: string,
  userId: string,
  role: 'student' | 'admin',
): Promise<void> {
  if (actingAdminId === userId && role === 'student') {
    // Prevents an admin locking themselves (and possibly everyone) out.
    throw new AppError(400, 'You cannot remove your own admin access')
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  })
  if (!user) throw new NotFoundError('User not found')

  // Removing the only remaining admin would leave the console unreachable.
  if (role === 'student' && user.role === 'admin') {
    const admins = await prisma.user.count({ where: { role: 'admin' } })
    if (admins <= 1) {
      throw new AppError(400, 'There must be at least one administrator')
    }
  }

  await prisma.user.update({ where: { id: userId }, data: { role } })
}

/**
 * Grants admin access by email address.
 *
 * Email is the handle admins actually know, and it avoids exposing a user
 * lookup endpoint purely so the console can resolve an id.
 */
export async function grantAdminByEmail(email: string): Promise<AdminAccount> {
  const normalized = email.trim().toLowerCase()
  if (!normalized) throw new AppError(400, 'An email address is required')

  const user = await prisma.user.findUnique({
    where: { email: normalized },
    select: { id: true, name: true, email: true, emailVerifiedAt: true, createdAt: true, role: true },
  })

  if (!user) {
    throw new NotFoundError('No account with that email address. They need to sign up first.')
  }
  if (user.role === 'admin') {
    throw new AppError(400, 'That account already has admin access')
  }

  await prisma.user.update({ where: { id: user.id }, data: { role: 'admin' } })

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    emailVerified: user.emailVerifiedAt !== null,
    createdAt: user.createdAt.toISOString(),
  }
}

// ─── Broadcasts ──────────────────────────────────────────────────────

export type BroadcastAudience = 'all' | 'active' | 'unverified'

export interface BroadcastResult {
  recipients: number
  pushesDelivered: number
}

/**
 * Sends one message to many students at once.
 *
 * Notification rows are written in bulk (a single createMany), then pushes go
 * out separately — a device that cannot be reached must not stop the in-app
 * notification from being recorded for everyone else.
 */
export async function broadcast(params: {
  title: string
  body: string
  audience: BroadcastAudience
  deeplink?: string | null
}): Promise<BroadcastResult> {
  const title = params.title.trim().slice(0, 80)
  const body = params.body.trim().slice(0, 200)

  if (!title) throw new AppError(400, 'A title is required')
  if (!body) throw new AppError(400, 'A message is required')

  // Broadcasts go to students. Admins get them through their own account only
  // if they are also studying, which is not what this is for.
  const where: Prisma.UserWhereInput = { role: 'student' }

  if (params.audience === 'active') {
    // Anyone who has studied in the last 30 days.
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    where.studySessions = { some: { startedAt: { gte: since } } }
  } else if (params.audience === 'unverified') {
    where.emailVerifiedAt = null
  }

  const recipients = await prisma.user.findMany({ where, select: { id: true } })
  if (recipients.length === 0) {
    return { recipients: 0, pushesDelivered: 0 }
  }

  await prisma.notification.createMany({
    data: recipients.map((u) => ({
      userId: u.id,
      type: 'system' as const,
      title,
      body,
      deeplink: params.deeplink?.trim() || null,
    })),
  })

  // Only push to those who have not switched pushes off.
  const pushable = await prisma.user.findMany({
    where: { id: { in: recipients.map((u) => u.id) }, notifyPush: true },
    select: { id: true },
  })

  const pushesDelivered = await sendPushToUsers(
    pushable.map((u) => u.id),
    {
      title,
      body,
      url: params.deeplink?.trim() || '/dashboard',
      tag: 'announcement',
    },
  ).catch((err: unknown) => {
    logger.warn({ err }, 'Broadcast push fan-out failed')
    return 0
  })

  logger.info(
    { recipients: recipients.length, pushesDelivered, audience: params.audience },
    'Broadcast sent',
  )

  return { recipients: recipients.length, pushesDelivered }
}

// ─── Past questions ──────────────────────────────────────────────────

export interface ImportSummary {
  batchId: string
  total: number
  imported: number
  skipped: number
  failed: number
  errors: RowError[]
}

export async function importPastQuestions(params: {
  adminId: string
  filename: string
  format: 'csv' | 'json'
  content: string
}): Promise<ImportSummary> {
  const { questions, errors, total } = parsePastQuestions(params.content, params.format)

  if (total === 0 && errors.length > 0) {
    throw new AppError(400, errors[0]?.reason ?? 'The file could not be read')
  }

  let imported = 0
  let skipped = 0

  // createMany + skipDuplicates leans on the unique fingerprint index, so
  // re-uploading a file is safe and only new rows land.
  if (questions.length > 0) {
    const CHUNK = 500
    for (let i = 0; i < questions.length; i += CHUNK) {
      const chunk = questions.slice(i, i + CHUNK)
      try {
        const result = await prisma.pastQuestion.createMany({
          data: chunk.map((q) => ({
            exam: q.exam,
            year: q.year,
            subjectSlug: q.subjectSlug,
            topicSlug: q.topicSlug,
            stem: q.stem,
            options: q.options,
            correctOptionId: q.correctOptionId,
            explanation: q.explanation,
            source: q.source,
            fingerprint: q.fingerprint,
          })),
          skipDuplicates: true,
        })
        imported += result.count
        skipped += chunk.length - result.count
      } catch (err) {
        logger.error({ err, chunkStart: i }, 'Past question import chunk failed')
        errors.push({ row: i + 1, reason: 'Database rejected this batch of rows' })
      }
    }
  }

  const batch = await prisma.importBatch.create({
    data: {
      uploadedById: params.adminId,
      filename: params.filename,
      exam: questions[0]?.exam ?? null,
      rowsTotal: total,
      rowsImported: imported,
      rowsSkipped: skipped,
      rowsFailed: errors.length,
      errors: errors.slice(0, 200) as unknown as Prisma.InputJsonValue,
    },
  })

  return { batchId: batch.id, total, imported, skipped, failed: errors.length, errors }
}

export async function listPastQuestions(params: {
  exam?: ExamType
  subjectSlug?: string
  year?: number
  search?: string
  page: number
  limit: number
}) {
  const where: Prisma.PastQuestionWhereInput = {
    ...(params.exam ? { exam: params.exam } : {}),
    ...(params.subjectSlug ? { subjectSlug: params.subjectSlug } : {}),
    ...(params.year ? { year: params.year } : {}),
    ...(params.search ? { stem: { contains: params.search, mode: 'insensitive' } } : {}),
  }

  const [rows, total] = await Promise.all([
    prisma.pastQuestion.findMany({
      where,
      orderBy: [{ year: 'desc' }, { createdAt: 'desc' }],
      skip: (params.page - 1) * params.limit,
      take: params.limit,
    }),
    prisma.pastQuestion.count({ where }),
  ])

  return {
    questions: rows.map((q) => ({
      id: q.id,
      exam: q.exam,
      year: q.year,
      subjectSlug: q.subjectSlug,
      topicSlug: q.topicSlug,
      stem: q.stem,
      options: q.options,
      correctOptionId: q.correctOptionId,
      explanation: q.explanation,
      source: q.source,
      createdAt: q.createdAt.toISOString(),
    })),
    total,
    page: params.page,
    limit: params.limit,
  }
}

export async function deletePastQuestion(id: string): Promise<void> {
  const result = await prisma.pastQuestion.deleteMany({ where: { id } })
  if (result.count === 0) throw new NotFoundError('Question not found')
}

export async function listImportBatches(limit: number) {
  const rows = await prisma.importBatch.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
  return rows.map((b) => ({
    id: b.id,
    filename: b.filename,
    exam: b.exam,
    rowsTotal: b.rowsTotal,
    rowsImported: b.rowsImported,
    rowsSkipped: b.rowsSkipped,
    rowsFailed: b.rowsFailed,
    errors: b.errors,
    createdAt: b.createdAt.toISOString(),
  }))
}

/** Distinct subjects/years present in the bank, for the filter dropdowns. */
export async function getPastQuestionFacets() {
  const [subjects, years] = await Promise.all([
    prisma.pastQuestion.groupBy({ by: ['subjectSlug'], _count: { _all: true } }),
    prisma.pastQuestion.groupBy({ by: ['year'], _count: { _all: true } }),
  ])
  return {
    subjects: subjects
      .map((s) => ({ subjectSlug: s.subjectSlug, count: s._count._all }))
      .sort((a, b) => a.subjectSlug.localeCompare(b.subjectSlug)),
    years: years.map((y) => ({ year: y.year, count: y._count._all })).sort((a, b) => b.year - a.year),
  }
}
