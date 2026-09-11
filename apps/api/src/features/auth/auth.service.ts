import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import type { User } from '../../config/db'
import type { SignupInput } from '@propella/shared'
import { prisma } from '../../config/db'
import { env } from '../../config/env'
import {
  attachReferral,
  qualifyReferral,
  ensureReferralCode,
} from '../referrals/referrals.service'
import { logger } from '../../config/logger'
import { AppError } from '../../middleware/error-handler'
import { sendPasswordResetEmail, sendVerificationCodeEmail } from '../../lib/email'

const BCRYPT_ROUNDS = 12
// A signed-in session lasts a day before the access token is renewed. The
// refresh cookie outlives it by a month, so returning students are signed back
// in silently rather than being asked for their password again.
// Cast: jsonwebtoken types the span as a template literal union, which a
// validated env string cannot narrow to on its own.
const ACCESS_TOKEN_TTL = env.ACCESS_TOKEN_TTL as NonNullable<jwt.SignOptions['expiresIn']>
const REFRESH_TOKEN_TTL = env.REFRESH_TOKEN_TTL as NonNullable<jwt.SignOptions['expiresIn']>
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000 // 1 hour
const VERIFY_CODE_TTL_MS = 15 * 60 * 1000 // 15 minutes
const VERIFY_MAX_ATTEMPTS = 5
const VERIFY_RESEND_COOLDOWN_MS = 60 * 1000 // 1 minute

function hashCode(code: string): string {
  return crypto.createHash('sha256').update(code).digest('hex')
}

/**
 * Six digits, uniformly distributed. `randomInt` avoids the modulo bias you get
 * from `randomBytes % 1000000`.
 */
function generateCode(): string {
  return String(crypto.randomInt(0, 1_000_000)).padStart(6, '0')
}

/**
 * True when nothing can actually deliver the code, so the UI may show it.
 * Never true in production.
 */
export function canRevealCodeInDev(): boolean {
  return env.NODE_ENV !== 'production' && !env.RESEND_API_KEY
}

/**
 * Issues a fresh code and emails it. Any earlier unused codes are invalidated so
 * only the newest one works. Returns the code so development flows can surface
 * it without digging through server logs.
 */
export async function issueVerificationCode(userId: string, email: string): Promise<string> {
  const now = new Date()

  const recent = await prisma.emailVerification.findFirst({
    where: { userId, consumedAt: null },
    orderBy: { createdAt: 'desc' },
    select: { createdAt: true },
  })
  if (recent && now.getTime() - recent.createdAt.getTime() < VERIFY_RESEND_COOLDOWN_MS) {
    throw new AppError(429, 'Please wait a moment before requesting another code')
  }

  const code = generateCode()

  await prisma.$transaction([
    prisma.emailVerification.updateMany({
      where: { userId, consumedAt: null },
      data: { consumedAt: now },
    }),
    prisma.emailVerification.create({
      data: {
        userId,
        codeHash: hashCode(code),
        expiresAt: new Date(now.getTime() + VERIFY_CODE_TTL_MS),
      },
    }),
  ])

  if (env.NODE_ENV !== 'production') {
    logger.info({ code, email }, 'Email verification code (dev only)')
  }

  await sendVerificationCodeEmail(email, code)

  return code
}

/**
 * Development helper: brute-forces the six digits back out of the stored hash.
 * Only reachable when there is no mail provider configured and we are not in
 * production, so a real deployment can never expose a pending code.
 */
export async function peekVerificationCode(userId: string): Promise<string | null> {
  if (!canRevealCodeInDev()) return null

  const record = await prisma.emailVerification.findFirst({
    where: { userId, consumedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' },
    select: { codeHash: true },
  })
  if (!record) return null

  for (let i = 0; i < 1_000_000; i++) {
    const candidate = String(i).padStart(6, '0')
    if (hashCode(candidate) === record.codeHash) return candidate
  }
  return null
}

/** Confirms a code and marks the account verified. */
export async function verifyEmailCode(userId: string, code: string): Promise<void> {
  const record = await prisma.emailVerification.findFirst({
    where: { userId, consumedAt: null },
    orderBy: { createdAt: 'desc' },
  })

  if (!record) {
    throw new AppError(400, 'No verification code is pending. Request a new one.')
  }
  if (record.expiresAt < new Date()) {
    throw new AppError(400, 'That code has expired. Request a new one.')
  }
  if (record.attempts >= VERIFY_MAX_ATTEMPTS) {
    throw new AppError(429, 'Too many incorrect attempts. Request a new code.')
  }

  if (record.codeHash !== hashCode(code)) {
    await prisma.emailVerification.update({
      where: { id: record.id },
      data: { attempts: { increment: 1 } },
    })
    throw new AppError(400, 'That code is not correct')
  }

  await prisma.$transaction([
    prisma.emailVerification.update({
      where: { id: record.id },
      data: { consumedAt: new Date() },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { emailVerifiedAt: new Date() },
    }),
  ])

  // Verification is the qualifying action for a referral — it is the cheapest
  // proof a real person is behind the account. Idempotent and never throws.
  await qualifyReferral(userId)
}

export interface JwtTokenPayload {
  id: string
  email: string
  plan: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export async function signup(data: SignupInput): Promise<User> {
  const email = data.email.toLowerCase().trim()

  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  })
  if (existing) {
    throw new AppError(409, 'An account with this email already exists')
  }

  const passwordHash = await bcrypt.hash(data.password, BCRYPT_ROUNDS)

  // The streak row is created alongside the user so every account has one.
  const user = await prisma.user.create({
    data: {
      email,
      name: data.name,
      passwordHash,
      streak: { create: { lastActiveDate: new Date() } },
    },
  })

  // Give them their own code straight away, so it is ready the first time they
  // open the invite panel. Never blocks sign-up if it fails.
  try {
    await ensureReferralCode(user.id)
  } catch (err) {
    logger.warn({ err, userId: user.id }, 'Could not assign a referral code at signup')
  }

  // Record who invited them, if anyone. Nothing is paid out yet — that happens
  // when they verify their email. Swallows every failure by design: a bad code
  // must not cost somebody their account.
  if (data.referralCode) {
    await attachReferral(user.id, data.referralCode)
  }

  // Fire the verification code immediately; a failure here must not roll back a
  // successful signup, so it is reported and the user can resend.
  try {
    await issueVerificationCode(user.id, user.email)
  } catch (err) {
    logger.error({ err, userId: user.id }, 'Could not send initial verification code')
  }

  return user
}

export async function login(email: string, password: string): Promise<User> {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  })
  if (!user) {
    throw new AppError(401, 'Invalid email or password')
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash)
  if (!isMatch) {
    throw new AppError(401, 'Invalid email or password')
  }

  return user
}

export function generateTokens(userId: string, email: string, plan: string): AuthTokens {
  const payload: JwtTokenPayload = { id: userId, email, plan }

  const accessToken = jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: ACCESS_TOKEN_TTL,
  })

  const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_TTL,
  })

  return { accessToken, refreshToken }
}

export function verifyRefreshToken(token: string): JwtTokenPayload {
  try {
    const payload = jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtTokenPayload
    return { id: payload.id, email: payload.email, plan: payload.plan }
  } catch {
    throw new AppError(401, 'Invalid or expired refresh token')
  }
}

export async function getUserForRefresh(userId: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { id: userId } })
}

/** Re-issues a code for the signed-in user, unless already verified. */
export async function resendVerificationCode(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, emailVerifiedAt: true },
  })
  if (!user) throw new AppError(404, 'User not found')
  if (user.emailVerifiedAt) throw new AppError(400, 'Your email is already verified')

  await issueVerificationCode(userId, user.email)
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

  const user = await prisma.user.findFirst({
    where: {
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { gt: new Date() },
    },
    select: { id: true },
  })

  if (!user) {
    throw new AppError(400, 'This reset link is invalid or has expired')
  }

  const newHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS)

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: newHash,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    },
  })
}

export async function forgotPassword(email: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
    select: { id: true, email: true },
  })

  if (!user) {
    // Silently return — do not reveal whether the email exists
    return
  }

  const rawToken = crypto.randomBytes(32).toString('hex')
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex')

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetPasswordToken: hashedToken,
      resetPasswordExpires: new Date(Date.now() + RESET_TOKEN_TTL_MS),
    },
  })

  if (env.NODE_ENV !== 'production') {
    logger.info({ resetToken: rawToken, email }, 'Password reset token (dev only)')
  }

  const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${rawToken}`
  await sendPasswordResetEmail(user.email, resetUrl)
}
