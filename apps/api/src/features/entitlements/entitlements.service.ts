import { prisma, Prisma } from '../../config/db'
import { PaywallRequiredError, NotFoundError } from '../../middleware/error-handler'
import {
  WELCOME_DISCOUNT_WINDOW_MS,
  WELCOME_DISCOUNT_PERCENT,
  type EntitlementStatusDto,
  type TrialUsageDto,
  type TrialTopicItem,
} from '@propella/shared'

const DEFAULT_TOPICS_LIMIT = 1
const DEFAULT_AI_QUESTIONS_LIMIT = 3
const DEFAULT_QUIZZES_LIMIT = 1

interface StoredTopicItem {
  subjectSlug: string
  topicSlug: string
  firstViewedAt: string
}

function parseTopicsViewed(json: unknown): StoredTopicItem[] {
  if (!Array.isArray(json)) return []
  return json.filter((item): item is StoredTopicItem =>
    Boolean(item && typeof item === 'object' && 'subjectSlug' in item && 'topicSlug' in item),
  )
}

/**
 * Checks if the user currently holds an active Scholar subscription.
 */
export async function isScholarActive(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true, planExpiresAt: true },
  })
  if (!user) return false

  const now = new Date()
  return (
    user.plan === 'scholar' &&
    Boolean(user.planExpiresAt && user.planExpiresAt.getTime() > now.getTime())
  )
}

/**
 * Retrieves or initializes the trial usage record for a free account.
 */
export async function getOrCreateTrialUsage(userId: string) {
  let usage = await prisma.trialUsage.findUnique({
    where: { userId },
  })

  if (!usage) {
    usage = await prisma.trialUsage.create({
      data: {
        userId,
        topicsLimit: DEFAULT_TOPICS_LIMIT,
        aiQuestionsLimit: DEFAULT_AI_QUESTIONS_LIMIT,
        quizzesLimit: DEFAULT_QUIZZES_LIMIT,
        mocksLimit: 0,
      },
    })
  }

  return usage
}

/**
 * Returns the comprehensive entitlement status for the client, including
 * 3-day (72-hour) 50% welcome discount eligibility (#999 Basic, #1,499 Shared, #4,999 Full).
 */
export async function getEntitlementStatus(userId: string): Promise<EntitlementStatusDto> {
  const [user, priorSubCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true, planExpiresAt: true, createdAt: true },
    }),
    prisma.subscription.count({ where: { userId } }),
  ])
  if (!user) throw new NotFoundError('User not found')

  const now = new Date()
  const isScholar =
    user.plan === 'scholar' &&
    Boolean(user.planExpiresAt && user.planExpiresAt.getTime() > now.getTime())

  const discountWindowEndsAt = new Date(user.createdAt.getTime() + WELCOME_DISCOUNT_WINDOW_MS)
  const discountEligible =
    !isScholar && priorSubCount === 0 && now.getTime() < discountWindowEndsAt.getTime()

  if (isScholar) {
    return {
      plan: 'scholar',
      isScholar: true,
      isTrial: false,
      isPaywallLocked: false,
      trialUsage: null,
      remaining: {
        topics: 999999,
        aiQuestions: 999999,
        quizzes: 999999,
      },
      discountEligible: false,
      discountExpiresAt: null,
      discountPercent: WELCOME_DISCOUNT_PERCENT,
    }
  }

  const usage = await getOrCreateTrialUsage(userId)
  const topicsViewed = parseTopicsViewed(usage.topicsViewed)

  const remainingTopics = Math.max(0, usage.topicsLimit - topicsViewed.length)
  const remainingAi = Math.max(0, usage.aiQuestionsLimit - usage.aiQuestionsCount)
  const remainingQuizzes = Math.max(0, usage.quizzesLimit - usage.quizzesTakenCount)

  const isExhausted = remainingTopics === 0 && remainingAi === 0 && remainingQuizzes === 0
  const isPaywallLocked = usage.isPaywallLocked || isExhausted

  const trialDto: TrialUsageDto = {
    topicsViewed: topicsViewed as TrialTopicItem[],
    topicsLimit: usage.topicsLimit,
    aiQuestionsCount: usage.aiQuestionsCount,
    aiQuestionsLimit: usage.aiQuestionsLimit,
    quizzesTakenCount: usage.quizzesTakenCount,
    quizzesLimit: usage.quizzesLimit,
    mocksLimit: usage.mocksLimit,
    isPaywallLocked,
    firstActivityAt: usage.firstActivityAt?.toISOString() || null,
    lockedAt: usage.lockedAt?.toISOString() || null,
  }

  return {
    plan: 'free',
    isScholar: false,
    isTrial: true,
    isPaywallLocked,
    trialUsage: trialDto,
    remaining: {
      topics: remainingTopics,
      aiQuestions: remainingAi,
      quizzes: remainingQuizzes,
    },
    discountEligible,
    discountExpiresAt: discountEligible ? discountWindowEndsAt.toISOString() : null,
    discountPercent: WELCOME_DISCOUNT_PERCENT,
  }
}

/**
 * Validates and records topic reader access under trial rules.
 * Allows returning to the same unlocked sample topic without consuming extra quota.
 */
export async function assertCanAccessTopic(
  userId: string,
  subjectSlug: string,
  topicSlug: string,
): Promise<void> {
  if (await isScholarActive(userId)) return

  const usage = await getOrCreateTrialUsage(userId)
  const topicsViewed = parseTopicsViewed(usage.topicsViewed)

  const isAlreadyViewed = topicsViewed.some(
    (t) => t.subjectSlug === subjectSlug && t.topicSlug === topicSlug,
  )

  if (isAlreadyViewed) {
    // Permitted: re-reading the already sampled topic is allowed
    return
  }

  // If attempting to open a NEW topic, check limit
  if (topicsViewed.length >= usage.topicsLimit) {
    if (!usage.isPaywallLocked) {
      await prisma.trialUsage.update({
        where: { id: usage.id },
        data: { isPaywallLocked: true, lockedAt: new Date() },
      })
    }

    throw new PaywallRequiredError(
      'You have reached your Free Trial limit of 1 sample topic. Upgrade to Scholar (50% off — ₦999 in your first 3 days) to unlock all topics across all subjects.',
      {
        feature: 'topic',
        limit: usage.topicsLimit,
        used: topicsViewed.length,
      },
    )
  }

  // Record this newly unlocked topic
  const nextTopics: StoredTopicItem[] = [
    ...topicsViewed,
    { subjectSlug, topicSlug, firstViewedAt: new Date().toISOString() },
  ]

  await prisma.trialUsage.update({
    where: { id: usage.id },
    data: {
      topicsViewed: nextTopics as unknown as Prisma.InputJsonValue,
      firstActivityAt: usage.firstActivityAt ?? new Date(),
    },
  })
}

/**
 * Checks if user is permitted to ask the AI Tutor.
 */
export async function assertCanAskAssistant(userId: string): Promise<void> {
  if (await isScholarActive(userId)) return

  const usage = await getOrCreateTrialUsage(userId)

  if (usage.aiQuestionsCount >= usage.aiQuestionsLimit) {
    if (!usage.isPaywallLocked) {
      await prisma.trialUsage.update({
        where: { id: usage.id },
        data: { isPaywallLocked: true, lockedAt: new Date() },
      })
    }

    throw new PaywallRequiredError(
      `You have reached your Free Trial limit of ${usage.aiQuestionsLimit} AI tutor questions. Upgrade to Scholar for unlimited 24/7 AI explanations.`,
      {
        feature: 'ai_assistant',
        limit: usage.aiQuestionsLimit,
        used: usage.aiQuestionsCount,
      },
    )
  }
}

/**
 * Records an AI question consumption for trial accounts.
 */
export async function recordAssistantQuery(userId: string): Promise<void> {
  if (await isScholarActive(userId)) return

  const usage = await getOrCreateTrialUsage(userId)
  const nextCount = usage.aiQuestionsCount + 1
  const isNowLocked = nextCount >= usage.aiQuestionsLimit

  await prisma.trialUsage.update({
    where: { id: usage.id },
    data: {
      aiQuestionsCount: nextCount,
      firstActivityAt: usage.firstActivityAt ?? new Date(),
      ...(isNowLocked && !usage.isPaywallLocked
        ? { isPaywallLocked: true, lockedAt: new Date() }
        : {}),
    },
  })
}

/**
 * Validates quiz generation access.
 */
export async function assertCanTakeQuiz(userId: string, isMock = false): Promise<void> {
  const isScholar = await isScholarActive(userId)
  if (isScholar) return

  if (isMock) {
    throw new PaywallRequiredError(
      'Full JAMB/WAEC Mock Exam simulation is an exclusive Scholar feature. Subscribe to simulate real timed exam conditions.',
      { feature: 'mock_exam' },
    )
  }

  const usage = await getOrCreateTrialUsage(userId)
  if (usage.quizzesTakenCount >= usage.quizzesLimit) {
    throw new PaywallRequiredError(
      'You have completed your 1 free sample practice quiz. Upgrade to Scholar to practice thousands of past questions.',
      {
        feature: 'quiz',
        limit: usage.quizzesLimit,
        used: usage.quizzesTakenCount,
      },
    )
  }
}

/**
 * Increments practice quiz consumption for trial users.
 */
export async function recordQuizAttempt(userId: string): Promise<void> {
  if (await isScholarActive(userId)) return

  const usage = await getOrCreateTrialUsage(userId)
  await prisma.trialUsage.update({
    where: { id: usage.id },
    data: {
      quizzesTakenCount: { increment: 1 },
      firstActivityAt: usage.firstActivityAt ?? new Date(),
    },
  })
}
