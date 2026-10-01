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
import { sendPasswordResetEmail, sendVerificationCodeEmail, sendWelcomeEmail } from '../../lib/email'

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
 * Issues a fresh code and emails it for an existing user.
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
 * Development helper: retrieves pending 6-digit code for testing.
 * Supports passing either userId or email address.
 */
export async function peekVerificationCode(identifier: string): Promise<string | null> {
  if (!canRevealCodeInDev()) return null

  if (identifier.includes('@')) {
    const pending = await prisma.pendingRegistration.findUnique({
      where: { email: identifier.toLowerCase().trim() },
      select: { codeHash: true, expiresAt: true },
    })
    if (!pending || pending.expiresAt < new Date()) return null
    for (let i = 0; i < 1_000_000; i++) {
      const candidate = String(i).padStart(6, '0')
      if (hashCode(candidate) === pending.codeHash) return candidate
    }
    return null
  }

  const record = await prisma.emailVerification.findFirst({
    where: { userId: identifier, consumedAt: null, expiresAt: { gt: new Date() } },
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

/** Confirms a code and marks an existing user account verified. */
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

/**
 * Registers an intent to sign up. The user account is NOT created in the database
 * until the email verification code is successfully confirmed.
 */
export async function signup(data: SignupInput): Promise<{ pendingVerification: boolean; email: string }> {
  const email = data.email.toLowerCase().trim()

  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true, emailVerifiedAt: true },
  })
  if (existing) {
    throw new AppError(409, 'An account with this email already exists')
  }

  const existingPending = await prisma.pendingRegistration.findUnique({
    where: { email },
    select: { createdAt: true },
  })
  const now = new Date()
  if (existingPending && now.getTime() - existingPending.createdAt.getTime() < VERIFY_RESEND_COOLDOWN_MS) {
    throw new AppError(429, 'A verification code was recently sent. Please wait a moment before trying again.')
  }

  const passwordHash = await bcrypt.hash(data.password, BCRYPT_ROUNDS)
  const code = generateCode()

  await prisma.pendingRegistration.upsert({
    where: { email },
    create: {
      email,
      name: data.name.trim(),
      passwordHash,
      referralCode: data.referralCode?.trim() || null,
      codeHash: hashCode(code),
      expiresAt: new Date(now.getTime() + VERIFY_CODE_TTL_MS),
      attempts: 0,
      createdAt: now,
    },
    update: {
      name: data.name.trim(),
      passwordHash,
      referralCode: data.referralCode?.trim() || null,
      codeHash: hashCode(code),
      expiresAt: new Date(now.getTime() + VERIFY_CODE_TTL_MS),
      attempts: 0,
      createdAt: now,
    },
  })

  if (env.NODE_ENV !== 'production') {
    logger.info({ code, email }, 'Pending registration verification code (dev only)')
  }

  await sendVerificationCodeEmail(email, code)

  return { pendingVerification: true, email }
}

/**
 * Confirms the pending registration code and creates the actual user account.
 */
export async function verifyPendingSignup(email: string, code: string): Promise<User> {
  const cleanEmail = email.toLowerCase().trim()

  // Handle existing account that might not have verified yet
  const existingUser = await prisma.user.findUnique({
    where: { email: cleanEmail },
  })
  if (existingUser) {
    if (existingUser.emailVerifiedAt) {
      throw new AppError(400, 'This account is already verified. Please log in.')
    }
    await verifyEmailCode(existingUser.id, code)
    return existingUser
  }

  const pending = await prisma.pendingRegistration.findUnique({
    where: { email: cleanEmail },
  })

  if (!pending) {
    throw new AppError(400, 'No pending registration found for this email. Please sign up again.')
  }
  if (pending.expiresAt < new Date()) {
    throw new AppError(400, 'That verification code has expired. Please request a new code.')
  }
  if (pending.attempts >= VERIFY_MAX_ATTEMPTS) {
    throw new AppError(429, 'Too many incorrect attempts. Please request a new code.')
  }

  if (pending.codeHash !== hashCode(code)) {
    await prisma.pendingRegistration.update({
      where: { id: pending.id },
      data: { attempts: { increment: 1 } },
    })
    throw new AppError(400, 'That code is not correct')
  }

  // Account creation happens ONLY after email verification is confirmed
  const user = await prisma.user.create({
    data: {
      email: pending.email,
      name: pending.name,
      passwordHash: pending.passwordHash,
      emailVerifiedAt: new Date(),
      streak: { create: { lastActiveDate: new Date() } },
    },
  })

  // Remove pending registration record
  await prisma.pendingRegistration.delete({ where: { id: pending.id } }).catch(() => null)

  try {
    await ensureReferralCode(user.id)
  } catch (err) {
    logger.warn({ err, userId: user.id }, 'Could not assign a referral code at signup')
  }

  if (pending.referralCode) {
    await attachReferral(user.id, pending.referralCode)
  }

  await qualifyReferral(user.id)

  try {
    await sendWelcomeEmail(user.email, user.name)
  } catch (err) {
    logger.warn({ err, userId: user.id }, 'Could not send welcome email')
  }

  return user
}

/**
 * Resends the verification code for a pending registration or unverified user.
 */
export async function resendPendingCode(email: string): Promise<void> {
  const cleanEmail = email.toLowerCase().trim()

  const pending = await prisma.pendingRegistration.findUnique({
    where: { email: cleanEmail },
  })

  if (!pending) {
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
      select: { id: true, email: true, emailVerifiedAt: true },
    })
    if (existing) {
      if (existing.emailVerifiedAt) {
        throw new AppError(400, 'Your email is already verified. Please log in.')
      }
      await issueVerificationCode(existing.id, existing.email)
      return
    }
    throw new AppError(404, 'No pending registration found for this email. Please sign up.')
  }

  const now = new Date()
  if (now.getTime() - pending.createdAt.getTime() < VERIFY_RESEND_COOLDOWN_MS) {
    throw new AppError(429, 'Please wait a moment before requesting another code')
  }

  const code = generateCode()
  await prisma.pendingRegistration.update({
    where: { id: pending.id },
    data: {
      codeHash: hashCode(code),
      expiresAt: new Date(now.getTime() + VERIFY_CODE_TTL_MS),
      attempts: 0,
      createdAt: now,
    },
  })

  if (env.NODE_ENV !== 'production') {
    logger.info({ code, email: cleanEmail }, 'Pending verification code (dev only)')
  }

  await sendVerificationCodeEmail(cleanEmail, code)
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
