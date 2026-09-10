import type { ExamProfile, User } from '../../config/db'
import type {
  OnboardingStep1Input,
  OnboardingStep2JambInput,
  OnboardingStep2WaecInput,
  OnboardingStep3Input,
  OnboardingStep4Input,
  OnboardingStep5Input,
  OnboardingStep6Input,
} from '@propella/shared'
import { prisma } from '../../config/db'
import { AppError, NotFoundError } from '../../middleware/error-handler'
import { generateInitialRoadmap } from '../../lib/adaptive-engine'
import { jsonArray, type ExamProfileSubject } from '../../models/types'

// Window label → start/end time mapping
const WINDOW_TIMES: Record<string, { start: string; end: string }> = {
  'early-morning': { start: '05:00', end: '08:00' },
  morning: { start: '08:00', end: '12:00' },
  afternoon: { start: '12:00', end: '17:00' },
  evening: { start: '17:00', end: '22:00' },
}

function getPreferredWindow(windows: string[]): { start: string; end: string } {
  if (windows.length === 0) return { start: '08:00', end: '22:00' }
  const first = windows[0]!
  const last = windows[windows.length - 1]!
  return {
    start: WINDOW_TIMES[first]?.start ?? '08:00',
    end: WINDOW_TIMES[last]?.end ?? '22:00',
  }
}

async function getUser(userId: string): Promise<User> {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw new NotFoundError('User not found')
  return user
}

async function ensureExamProfile(userId: string): Promise<ExamProfile> {
  const profile = await prisma.examProfile.findUnique({ where: { userId } })
  if (!profile) {
    throw new AppError(400, 'Exam profile not initialised — complete step 1 first')
  }
  return profile
}

async function setStep(userId: string, step: number): Promise<void> {
  await prisma.user.update({ where: { id: userId }, data: { onboardingStep: step } })
}

export async function getStatus(userId: string) {
  const user = await getUser(userId)
  return {
    step: user.onboardingStep,
    completed: user.onboardingCompleted,
  }
}

export async function saveStep1(userId: string, data: OnboardingStep1Input): Promise<void> {
  await getUser(userId)

  // Keep examType as the primary exam for older callers while persisting
  // all selected exams for multi-exam flows.
  const primaryExamType = data.examTypes[0]
  if (!primaryExamType) {
    throw new AppError(400, 'Select at least one exam type')
  }

  // Placeholder exam date that step 5 overwrites.
  const placeholderExamDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)

  await prisma.examProfile.upsert({
    where: { userId },
    create: {
      userId,
      examType: primaryExamType,
      examTypes: data.examTypes,
      examDate: placeholderExamDate,
    },
    update: {
      examType: primaryExamType,
      examTypes: data.examTypes,
    },
  })

  await setStep(userId, 1)
}

export async function saveStep2Jamb(
  userId: string,
  data: OnboardingStep2JambInput,
): Promise<void> {
  await ensureExamProfile(userId)

  await prisma.examProfile.update({
    where: { userId },
    data: {
      ...(data.intendedCourse !== undefined ? { intendedCourse: data.intendedCourse } : {}),
      ...(data.institutionType !== undefined ? { institutionType: data.institutionType } : {}),
    },
  })

  await setStep(userId, 2)
}

export async function saveStep2Waec(
  userId: string,
  data: OnboardingStep2WaecInput,
): Promise<void> {
  await ensureExamProfile(userId)

  await prisma.examProfile.update({
    where: { userId },
    data: { learningStyle: data.learningStyle },
  })

  await setStep(userId, 2)
}

export async function saveStep3(userId: string, data: OnboardingStep3Input): Promise<void> {
  await ensureExamProfile(userId)

  // Validate that the slugs exist in the subjects table
  const foundSubjects = await prisma.subject.findMany({
    where: { slug: { in: data.subjectSlugs } },
    select: { id: true, slug: true, name: true },
  })

  const foundSlugsSet = new Set(foundSubjects.map((s) => s.slug))
  const invalidSlugs = data.subjectSlugs.filter((s) => !foundSlugsSet.has(s))
  if (invalidSlugs.length > 0) {
    throw new AppError(400, `Invalid subject slugs: ${invalidSlugs.join(', ')}`)
  }

  const subjects: ExamProfileSubject[] = foundSubjects.map((s) => ({
    subjectId: s.id,
    slug: s.slug,
    name: s.name,
    isWeak: false,
    isStrong: false,
    currentMastery: 50,
  }))

  await prisma.examProfile.update({ where: { userId }, data: { subjects } })

  await setStep(userId, 3)
}

export async function saveStep4(userId: string, data: OnboardingStep4Input): Promise<void> {
  const profile = await ensureExamProfile(userId)

  const subjects = jsonArray<ExamProfileSubject>(profile.subjects)

  for (const strength of data.strengths) {
    const subject = subjects.find((s) => s.slug === strength.subjectSlug)
    if (subject) {
      subject.isWeak = strength.level === 'weak'
      subject.isStrong = strength.level === 'strong'
    }
  }

  await prisma.examProfile.update({ where: { userId }, data: { subjects } })

  await setStep(userId, 4)
}

export async function saveStep5(userId: string, data: OnboardingStep5Input): Promise<void> {
  await ensureExamProfile(userId)

  await prisma.examProfile.update({
    where: { userId },
    data: { examDate: new Date(data.examDate) },
  })

  await setStep(userId, 5)
}

export async function saveStep6(userId: string, data: OnboardingStep6Input): Promise<void> {
  await ensureExamProfile(userId)

  const window = getPreferredWindow(data.preferredStudyWindows)

  await prisma.examProfile.update({
    where: { userId },
    data: {
      dailyStudyMinutes: data.dailyStudyMinutes,
      studyWindowStart: window.start,
      studyWindowEnd: window.end,
    },
  })

  await setStep(userId, 6)
}

interface CompletedUser {
  id: string
  name: string
  email: string
  plan: string
  onboardingCompleted: boolean
  onboardingStep: number
  theme: string
  timezone: string
  avatarUrl: string | null
  emailVerified: boolean
}

export async function completeOnboarding(userId: string): Promise<{
  user: CompletedUser
  roadmap: { id: string } | null
}> {
  await getUser(userId)
  const profile = await ensureExamProfile(userId)

  // Generate the roadmap before flipping the flag so a failure here does not
  // leave the account marked complete with no plan.
  await generateInitialRoadmap(userId, profile)

  const user = await prisma.user.update({
    where: { id: userId },
    data: { onboardingCompleted: true, onboardingStep: 6 },
  })

  const roadmap = await prisma.roadmap.findUnique({
    where: { userId },
    select: { id: true },
  })

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      plan: user.plan,
      onboardingCompleted: user.onboardingCompleted,
      onboardingStep: user.onboardingStep,
      theme: user.theme,
      timezone: user.timezone,
      avatarUrl: user.avatarUrl,
      emailVerified: user.emailVerifiedAt !== null,
    },
    roadmap: roadmap ? { id: roadmap.id } : null,
  }
}
