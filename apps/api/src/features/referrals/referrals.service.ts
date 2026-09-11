import { prisma } from '../../config/db'
import { AppError, NotFoundError } from '../../middleware/error-handler'
import { logger } from '../../config/logger'
import { notify } from '../notifications/notification.service'

/* -------------------------------------------------------------------------- */
/* Reward rules                                                                */
/* -------------------------------------------------------------------------- */

/** Credits the referrer earns per qualified referral. */
export const CREDITS_PER_REFERRAL = 50

/** Credits the invited student starts with, as a reason to use the code. */
export const CREDITS_FOR_JOINING = 25

/**
 * A referral only pays out once the invited student verifies their email.
 *
 * Rewarding at sign-up would pay for throwaway addresses; verification is the
 * cheapest proof that a real person is behind the account.
 */
export const QUALIFYING_ACTION = 'email verification'

/* -------------------------------------------------------------------------- */
/* Codes                                                                       */
/* -------------------------------------------------------------------------- */

// No 0/O/1/I/L — these get read aloud and typed in by hand.
const CODE_ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ'
const CODE_LENGTH = 7

function randomCode(): string {
  let out = ''
  for (let i = 0; i < CODE_LENGTH; i++) {
    out += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)]
  }
  return out
}

export function normalizeCode(input: string): string {
  return input.trim().toUpperCase().replace(/\s+/g, '')
}

/**
 * Returns the student's code, creating one on first use.
 *
 * Codes are assigned lazily rather than at sign-up so accounts that existed
 * before referrals shipped get one the first time they open the panel.
 */
export async function ensureReferralCode(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { referralCode: true },
  })
  if (!user) throw new NotFoundError('User not found')
  if (user.referralCode) return user.referralCode

  // Collisions are unlikely but not impossible; retry a few times before giving
  // up rather than handing back a code that failed to save.
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = randomCode()
    try {
      await prisma.user.update({ where: { id: userId }, data: { referralCode: code } })
      return code
    } catch {
      // Unique violation — try another.
    }
  }

  throw new AppError(500, 'Could not create a referral code. Please try again.')
}

/* -------------------------------------------------------------------------- */
/* Credits                                                                     */
/* -------------------------------------------------------------------------- */

export type CreditSource =
  | 'referral_bonus'
  | 'signup_bonus'
  | 'referred_signup'
  | 'admin_adjustment'
  | 'assistant_message'
  | 'quiz_generation'

/** The balance is the sum of the ledger, never a stored counter that can drift. */
export async function getCreditBalance(userId: string): Promise<number> {
  const agg = await prisma.creditEvent.aggregate({
    where: { userId },
    _sum: { amount: true },
  })
  return agg._sum.amount ?? 0
}

export async function grantCredits(
  userId: string,
  amount: number,
  source: CreditSource,
  reason: string,
  sourceId?: string,
): Promise<void> {
  if (amount === 0) return
  await prisma.creditEvent.create({
    data: { userId, amount, source, reason, sourceId: sourceId ?? null },
  })
}

/* -------------------------------------------------------------------------- */
/* Referrals                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Records that `inviteeId` signed up using `code`.
 *
 * Called during sign-up. Never throws for a bad code — a mistyped or missing
 * code must not stop somebody creating an account.
 */
export async function attachReferral(inviteeId: string, rawCode: string): Promise<void> {
  const code = normalizeCode(rawCode)
  if (!code) return

  try {
    const referrer = await prisma.user.findUnique({
      where: { referralCode: code },
      select: { id: true },
    })

    if (!referrer) {
      logger.info({ code }, 'Referral code not recognised')
      return
    }
    if (referrer.id === inviteeId) {
      logger.info({ inviteeId }, 'Ignored self-referral')
      return
    }

    await prisma.referral.create({
      data: { referrerId: referrer.id, inviteeId, code },
    })
  } catch (err) {
    // Most likely the invitee already has a referral row. Either way, a
    // referral is a bonus and must never break sign-up.
    logger.warn({ err, inviteeId }, 'Could not attach referral')
  }
}

/**
 * Pays out a referral once the invited student qualifies.
 *
 * Idempotent: the `qualifiedAt: null` filter means a second call updates
 * nothing and grants nothing.
 */
export async function qualifyReferral(inviteeId: string): Promise<void> {
  try {
    const referral = await prisma.referral.findUnique({
      where: { inviteeId },
      select: { id: true, referrerId: true, qualifiedAt: true },
    })
    if (!referral || referral.qualifiedAt) return

    const updated = await prisma.referral.updateMany({
      where: { id: referral.id, qualifiedAt: null },
      data: { qualifiedAt: new Date(), creditsAwarded: CREDITS_PER_REFERRAL },
    })
    // Another request got there first.
    if (updated.count === 0) return

    await grantCredits(
      referral.referrerId,
      CREDITS_PER_REFERRAL,
      'referral_bonus',
      'A friend you invited joined Propella',
      referral.id,
    )

    await grantCredits(
      inviteeId,
      CREDITS_FOR_JOINING,
      'referred_signup',
      'Welcome bonus for joining through an invite',
      referral.id,
    )

    await notify(referral.referrerId, 'system', {
      title: `You earned ${CREDITS_PER_REFERRAL} AI credits`,
      body: 'Someone you invited just joined Propella. Thank you for sharing.',
      deeplink: '/settings?tab=referrals',
      metadata: { referralId: referral.id },
    })
  } catch (err) {
    logger.warn({ err, inviteeId }, 'Could not qualify referral')
  }
}

/* -------------------------------------------------------------------------- */
/* Read model                                                                  */
/* -------------------------------------------------------------------------- */

export interface ReferralSummary {
  code: string
  /** Ready-to-share link. */
  shareUrl: string
  creditBalance: number
  creditsPerReferral: number
  creditsForJoining: number
  totalInvited: number
  totalQualified: number
  pending: number
  creditsEarned: number
  invitees: {
    name: string
    joinedAt: string
    qualified: boolean
  }[]
}

export async function getReferralSummary(
  userId: string,
  frontendUrl: string,
): Promise<ReferralSummary> {
  const code = await ensureReferralCode(userId)

  const [referrals, balance, earned] = await Promise.all([
    prisma.referral.findMany({
      where: { referrerId: userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        qualifiedAt: true,
        createdAt: true,
        invitee: { select: { name: true } },
      },
    }),
    getCreditBalance(userId),
    prisma.creditEvent.aggregate({
      where: { userId, source: 'referral_bonus' },
      _sum: { amount: true },
    }),
  ])

  const qualified = referrals.filter((r) => r.qualifiedAt !== null).length

  return {
    code,
    // Trailing slash would produce a double slash in the shared link.
    shareUrl: `${frontendUrl.replace(/\/$/, '')}/signup?ref=${code}`,
    creditBalance: balance,
    creditsPerReferral: CREDITS_PER_REFERRAL,
    creditsForJoining: CREDITS_FOR_JOINING,
    totalInvited: referrals.length,
    totalQualified: qualified,
    pending: referrals.length - qualified,
    creditsEarned: earned._sum.amount ?? 0,
    invitees: referrals.map((r) => ({
      // First name only — the referrer does not need a full contact list.
      name: r.invitee.name.split(' ')[0] ?? 'Student',
      joinedAt: r.createdAt.toISOString(),
      qualified: r.qualifiedAt !== null,
    })),
  }
}
