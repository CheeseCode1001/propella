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

    // Grant digital cash balance (₦1,000 per converted referral)
    await prisma.user.update({
      where: { id: referral.referrerId },
      data: { referralBalance: { increment: REFERRAL_CASH_REWARD } },
    })

    await grantCredits(
      inviteeId,
      CREDITS_FOR_JOINING,
      'referred_signup',
      'Welcome bonus for joining through an invite',
      referral.id,
    )

    await notify(referral.referrerId, 'system', {
      title: `You earned ₦${REFERRAL_CASH_REWARD} & ${CREDITS_PER_REFERRAL} AI credits!`,
      body: 'Someone you invited joined Propella. Digital cash has been credited to your referral wallet.',
      deeplink: '/settings?tab=referrals',
      metadata: { referralId: referral.id },
    })
  } catch (err) {
    logger.warn({ err, inviteeId }, 'Could not qualify referral')
  }
}

export const REFERRAL_CASH_REWARD = 1000
export const MIN_WITHDRAWAL_REFERRALS = 5

export interface WithdrawalRequestInput {
  bankName: string
  accountName: string
  accountNumber: string
  amount: number
}

export async function requestWithdrawal(userId: string, input: WithdrawalRequestInput) {
  const amount = Number(input.amount)
  const bankName = input.bankName?.trim()
  const accountName = input.accountName?.trim()
  const accountNumber = input.accountNumber?.trim()

  if (!bankName) throw new AppError(400, 'Bank name is required')
  if (!accountName) throw new AppError(400, 'Account name is required')
  if (!accountNumber || accountNumber.length < 9) {
    throw new AppError(400, 'A valid bank account number is required')
  }
  if (isNaN(amount) || amount <= 0) {
    throw new AppError(400, 'A valid withdrawal amount is required')
  }

  // 1. Check user has at least 5 qualified referrals
  const qualifiedCount = await prisma.referral.count({
    where: { referrerId: userId, qualifiedAt: { not: null } },
  })

  if (qualifiedCount < MIN_WITHDRAWAL_REFERRALS) {
    throw new AppError(
      400,
      `You need at least ${MIN_WITHDRAWAL_REFERRALS} successful referrals before requesting a withdrawal. You currently have ${qualifiedCount}.`,
    )
  }

  // 2. Check balance
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { referralBalance: true },
  })

  if (!user || user.referralBalance < amount) {
    throw new AppError(400, `Insufficient referral balance. Available: ₦${user?.referralBalance ?? 0}`)
  }

  // 3. Atomically create withdrawal and decrement balance
  const [withdrawal] = await prisma.$transaction([
    prisma.withdrawalRequest.create({
      data: {
        userId,
        amount,
        bankName,
        accountName,
        accountNumber,
        status: 'pending',
      },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { referralBalance: { decrement: amount } },
    }),
  ])

  return withdrawal
}

export async function getUserWithdrawals(userId: string) {
  return prisma.withdrawalRequest.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })
}

/* -------------------------------------------------------------------------- */
/* Read model                                                                  */
/* -------------------------------------------------------------------------- */

export interface ReferralSummary {
  code: string
  /** Ready-to-share link. */
  shareUrl: string
  creditBalance: number
  referralBalance: number
  creditsPerReferral: number
  creditsForJoining: number
  cashRewardPerReferral: number
  minReferralsForWithdrawal: number
  canWithdraw: boolean
  totalInvited: number
  totalQualified: number
  pending: number
  creditsEarned: number
  invitees: {
    name: string
    joinedAt: string
    qualified: boolean
  }[]
  withdrawals: {
    id: string
    amount: number
    bankName: string
    accountName: string
    accountNumber: string
    status: 'pending' | 'approved' | 'rejected'
    rejectionReason: string | null
    approvedAt: string | null
    createdAt: string
  }[]
}

export async function getReferralSummary(
  userId: string,
  frontendUrl: string,
): Promise<ReferralSummary> {
  const code = await ensureReferralCode(userId)

  const [referrals, balance, earned, user, userWithdrawals] = await Promise.all([
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
    prisma.user.findUnique({
      where: { id: userId },
      select: { referralBalance: true },
    }),
    prisma.withdrawalRequest.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  const qualified = referrals.filter((r) => r.qualifiedAt !== null).length
  const refBalance = user?.referralBalance ?? 0

  return {
    code,
    // Trailing slash would produce a double slash in the shared link.
    shareUrl: `${frontendUrl.replace(/\/$/, '')}/signup?ref=${code}`,
    creditBalance: balance,
    referralBalance: refBalance,
    creditsPerReferral: CREDITS_PER_REFERRAL,
    creditsForJoining: CREDITS_FOR_JOINING,
    cashRewardPerReferral: REFERRAL_CASH_REWARD,
    minReferralsForWithdrawal: MIN_WITHDRAWAL_REFERRALS,
    canWithdraw: qualified >= MIN_WITHDRAWAL_REFERRALS && refBalance > 0,
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
    withdrawals: userWithdrawals.map((w) => ({
      id: w.id,
      amount: w.amount,
      bankName: w.bankName,
      accountName: w.accountName,
      accountNumber: w.accountNumber,
      status: w.status,
      rejectionReason: w.rejectionReason,
      approvedAt: w.approvedAt ? w.approvedAt.toISOString() : null,
      createdAt: w.createdAt.toISOString(),
    })),
  }
}
