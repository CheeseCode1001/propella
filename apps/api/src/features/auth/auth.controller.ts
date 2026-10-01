import type { Request, Response, NextFunction } from 'express'
import type {
  SignupInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  VerifySignupInput,
  ResendSignupCodeInput,
} from '@propella/shared'
import * as authService from './auth.service'
import { env } from '../../config/env'
import { AppError } from '../../middleware/error-handler'
import { logger } from '../../config/logger'

const REFRESH_COOKIE_NAME = 'refresh_token'
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000

const isProduction = env.NODE_ENV === 'production'

/**
 * Cookie flags for the refresh token.
 */
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? ('none' as const) : ('lax' as const),
  path: '/',
  ...(env.COOKIE_DOMAIN ? { domain: env.COOKIE_DOMAIN } : {}),
}

function setRefreshCookie(res: Response, token: string): void {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    ...REFRESH_COOKIE_OPTIONS,
    maxAge: THIRTY_DAYS_MS,
  })
}

function clearRefreshCookie(res: Response): void {
  res.clearCookie(REFRESH_COOKIE_NAME, REFRESH_COOKIE_OPTIONS)
}

/**
 * Step 1 of registration: validates signup input, hashes password, saves pending
 * registration and sends 6-digit verification email. The account is NOT created
 * in the database yet.
 */
export async function signup(
  req: Request<object, object, SignupInput>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await authService.signup(req.body)
    res.status(200).json({
      data: {
        pendingVerification: true,
        email: result.email,
      },
    })
  } catch (err) {
    next(err)
  }
}

/**
 * Step 2 of registration: confirms 6-digit code, creates the User record in database,
 * issues JWT tokens, sets refresh cookie, and qualifies referrals.
 */
export async function verifySignup(
  req: Request<object, object, VerifySignupInput>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = await authService.verifyPendingSignup(req.body.email, req.body.code)
    const tokens = authService.generateTokens(
      user.id,
      user.email,
      user.plan,
    )

    setRefreshCookie(res, tokens.refreshToken)

    res.status(201).json({
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          plan: user.plan,
          onboardingCompleted: Boolean(user.onboardingCompleted),
          onboardingStep: user.onboardingStep ?? 0,
          theme: user.theme,
          timezone: user.timezone,
          avatarUrl: user.avatarUrl,
          emailVerified: user.emailVerifiedAt !== null,
        },
        accessToken: tokens.accessToken,
      },
    })
  } catch (err: any) {
    logger.error({ err, email: req.body.email, msg: err?.message }, 'verifySignup failed')
    next(err)
  }
}

export async function resendSignupCode(
  req: Request<object, object, ResendSignupCodeInput>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await authService.resendPendingCode(req.body.email)
    res.status(200).json({ data: { sent: true } })
  } catch (err: any) {
    logger.error({ err, email: req.body.email, msg: err?.message }, 'resendSignupCode failed')
    next(err)
  }
}

export async function login(
  req: Request<object, object, LoginInput>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = await authService.login(req.body.email, req.body.password)
    const tokens = authService.generateTokens(
      user.id,
      user.email,
      user.plan,
    )

    setRefreshCookie(res, tokens.refreshToken)

    res.status(200).json({
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          plan: user.plan,
          onboardingCompleted: Boolean(user.onboardingCompleted),
          onboardingStep: user.onboardingStep ?? 0,
          theme: user.theme,
          timezone: user.timezone,
          avatarUrl: user.avatarUrl,
          emailVerified: user.emailVerifiedAt !== null,
        },
        accessToken: tokens.accessToken,
      },
    })
  } catch (err: any) {
    logger.error({ err, email: req.body.email, msg: err?.message }, 'login failed')
    next(err)
  }
}

export async function logout(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    clearRefreshCookie(res)
    res.status(204).end()
  } catch (err) {
    next(err)
  }
}

export async function refresh(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const token = req.cookies[REFRESH_COOKIE_NAME] as string | undefined

    if (!token) {
      throw new AppError(401, 'No refresh token provided')
    }

    const payload = authService.verifyRefreshToken(token)
    const tokens = authService.generateTokens(payload.id, payload.email, payload.plan)
    const user = await authService.getUserForRefresh(payload.id)

    setRefreshCookie(res, tokens.refreshToken)

    res.status(200).json({
      data: {
        accessToken: tokens.accessToken,
        user: user
          ? {
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
            }
          : null,
      },
    })
  } catch (err) {
    next(err)
  }
}

/**
 * Development-only: returns the pending verification code so the sign-up flow is
 * usable without a mail provider. Responds 404 in production or whenever
 * RESEND_API_KEY is configured. Accepts ?email=... or requires authenticated user.
 */
export async function devVerificationCode(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!authService.canRevealCodeInDev()) {
      res.status(404).json({ error: 'Not available' })
      return
    }
    const identifier = (req.query.email as string) || req.user?.id
    if (!identifier) throw new AppError(400, 'Email or authentication required')
    const code = await authService.peekVerificationCode(identifier)
    res.status(200).json({ data: { code } })
  } catch (err) {
    next(err)
  }
}

/** Confirms email for an already-authenticated user account */
export async function verifyEmail(
  req: Request<object, object, { code: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user?.id) throw new AppError(401, 'Not authenticated')
    await authService.verifyEmailCode(req.user.id, req.body.code)
    res.status(200).json({ data: { emailVerified: true } })
  } catch (err) {
    next(err)
  }
}

export async function resendVerification(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user?.id) throw new AppError(401, 'Not authenticated')
    await authService.resendVerificationCode(req.user.id)
    res.status(200).json({ data: { sent: true } })
  } catch (err) {
    next(err)
  }
}

export async function forgotPassword(
  req: Request<object, object, ForgotPasswordInput>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await authService.forgotPassword(req.body.email)
    res.status(200).json({
      data: { message: 'If that email is registered, a reset link has been sent' },
    })
  } catch (err) {
    next(err)
  }
}

export async function resetPassword(
  req: Request<object, object, ResetPasswordInput>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await authService.resetPassword(req.body.token, req.body.password)
    res.status(200).json({ data: { message: 'Password reset successfully' } })
  } catch (err) {
    next(err)
  }
}
