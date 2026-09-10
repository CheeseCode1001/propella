import type { ExamProfile, User } from '../../config/db'
import { prisma } from '../../config/db'
import { AppError, NotFoundError } from '../../middleware/error-handler'
import { getRank, getNextRank } from '@propella/shared'
import type { AuthUser } from '@propella/shared'
import { jsonArray, type ExamProfileSubject } from '../../models/types'

interface ExamProfileSummary {
  examType: string
  examTypes?: string[]
  examDate: string
  subjects: {
    slug: string
    name: string
    isWeak: boolean
    isStrong: boolean
    currentMastery: number
  }[]
  dailyStudyMinutes: number
  preferredStudyWindow: { start: string; end: string }
  learningStyle?: string
  intendedCourse?: string
  institutionType?: string
}

interface MeResponse {
  user: AuthUser
  examProfile: ExamProfileSummary | null
  streak: {
    currentStreak: number
    longestStreak: number
    lastActiveDate: string
    freezesAvailable: number
  }
  xp: {
    totalXP: number
    rankName: string
    nextRankName: string | null
    nextRankThreshold: number | null
    xpToNextRank: number | null
  }
}

export function buildAuthUser(user: User): AuthUser {
  const result: AuthUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    plan: user.plan,
    onboardingCompleted: user.onboardingCompleted,
    onboardingStep: user.onboardingStep,
    theme: user.theme,
    timezone: user.timezone,
    locale: user.locale,
    emailVerified: user.emailVerifiedAt !== null,
  }
  if (user.avatarUrl !== null) result.avatarUrl = user.avatarUrl
  return result
}

export function buildExamProfileSummary(profile: ExamProfile): ExamProfileSummary {
  const summary: ExamProfileSummary = {
    examType: profile.examType,
    examTypes: profile.examTypes.length ? profile.examTypes : [profile.examType],
    examDate: profile.examDate.toISOString(),
    subjects: jsonArray<ExamProfileSubject>(profile.subjects).map((s) => ({
      slug: s.slug,
      name: s.name,
      isWeak: s.isWeak,
      isStrong: s.isStrong,
      currentMastery: s.currentMastery,
    })),
    dailyStudyMinutes: profile.dailyStudyMinutes,
    preferredStudyWindow: {
      start: profile.studyWindowStart,
      end: profile.studyWindowEnd,
    },
  }
  if (profile.learningStyle !== null) summary.learningStyle = profile.learningStyle
  if (profile.intendedCourse !== null) summary.intendedCourse = profile.intendedCourse
  if (profile.institutionType !== null) summary.institutionType = profile.institutionType
  return summary
}

export async function getMe(userId: string): Promise<MeResponse> {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) {
    throw new NotFoundError('User not found')
  }

  const [examProfile, streakRow, xpAgg] = await Promise.all([
    prisma.examProfile.findUnique({ where: { userId } }),
    prisma.streak.findUnique({ where: { userId } }),
    prisma.xPEvent.aggregate({ where: { userId }, _sum: { amount: true } }),
  ])

  const totalXP = xpAgg._sum.amount ?? 0
  const rank = getRank(totalXP)
  const nextRank = getNextRank(totalXP)

  return {
    user: buildAuthUser(user),
    examProfile: examProfile ? buildExamProfileSummary(examProfile) : null,
    streak: streakRow
      ? {
          currentStreak: streakRow.currentStreak,
          longestStreak: streakRow.longestStreak,
          lastActiveDate: streakRow.lastActiveDate.toISOString(),
          freezesAvailable: streakRow.freezesAvailable,
        }
      : {
          currentStreak: 0,
          longestStreak: 0,
          lastActiveDate: new Date().toISOString(),
          freezesAvailable: 1,
        },
    xp: {
      totalXP,
      rankName: rank.name,
      nextRankName: nextRank?.name ?? null,
      nextRankThreshold: nextRank?.threshold ?? null,
      xpToNextRank: nextRank ? nextRank.threshold - totalXP : null,
    },
  }
}

interface UpdateProfileData {
  name?: string
  theme?: 'system' | 'light' | 'dark'
  timezone?: string
  locale?: 'en' | 'yo' | 'ha' | 'ig'
  /** A resized data URL, or null to go back to initials. */
  avatarUrl?: string | null
  notifications?: {
    email?: boolean
    push?: boolean
    studyReminders?: boolean
    streakReminders?: boolean
    weeklyDigest?: boolean
  }
}

/**
 * Avatars are stored inline as data URLs rather than in object storage, which
 * this deployment does not have. The browser resizes to a small square before
 * uploading; this is the backstop that keeps an oversized or non-image payload
 * out of the column.
 */
const AVATAR_MAX_BYTES = 400 * 1024
const AVATAR_ALLOWED_TYPES = ['image/webp', 'image/jpeg', 'image/png']

function validateAvatar(value: string): string {
  const match = /^data:([a-z/+-]+);base64,([A-Za-z0-9+/=]+)$/i.exec(value.trim())
  if (!match) {
    throw new AppError(400, 'That image could not be read. Try another one.')
  }

  const [, mimeType = '', base64 = ''] = match

  if (!AVATAR_ALLOWED_TYPES.includes(mimeType.toLowerCase())) {
    throw new AppError(400, 'Profile pictures must be a JPEG, PNG or WebP image.')
  }

  // base64 encodes 3 bytes as 4 characters.
  const bytes = Math.floor((base64.length * 3) / 4)
  if (bytes > AVATAR_MAX_BYTES) {
    throw new AppError(400, 'That image is too large. Please choose a smaller one.')
  }

  return value.trim()
}

export async function updateProfile(
  userId: string,
  data: UpdateProfileData,
): Promise<AuthUser> {
  const exists = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  })
  if (!exists) {
    throw new NotFoundError('User not found')
  }

  const n = data.notifications

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.theme !== undefined ? { theme: data.theme } : {}),
      ...(data.timezone !== undefined ? { timezone: data.timezone } : {}),
      ...(data.locale !== undefined ? { locale: data.locale } : {}),
      ...(data.avatarUrl !== undefined
        ? { avatarUrl: data.avatarUrl === null ? null : validateAvatar(data.avatarUrl) }
        : {}),
      ...(n?.email !== undefined ? { notifyEmail: n.email } : {}),
      ...(n?.push !== undefined ? { notifyPush: n.push } : {}),
      ...(n?.studyReminders !== undefined ? { notifyStudyReminders: n.studyReminders } : {}),
      ...(n?.streakReminders !== undefined ? { notifyStreakReminders: n.streakReminders } : {}),
      ...(n?.weeklyDigest !== undefined ? { notifyWeeklyDigest: n.weeklyDigest } : {}),
    },
  })

  return buildAuthUser(user)
}
