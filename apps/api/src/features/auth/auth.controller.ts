import type { Request, Response, NextFunction } from 'express'
import type { SignupInput, LoginInput, ForgotPasswordInput, ResetPasswordInput } from '@propella/shared'
import * as authService from './auth.service'
import { env } from '../../config/env'
import { AppError } from '../../middleware/error-handler'

const REFRESH_COOKIE_NAME = 'refresh_token'
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000

const isProduction = env.NODE_ENV === 'production'

/**
 * Cookie flags for the refresh token.
 *
 * In production the web app (Vercel) and the API (Render) are on different
 * registrable domains, which makes every API call cross-site. A SameSite=Lax
 * cookie is not sent on those, so the silent refresh would fail and students
 * would be asked to sign in on every page load. SameSite=None fixes that, and
 * browsers only accept it together with Secure.
 *
 * Locally both run on localhost, which is same-site, so Lax is kept — Secure
 * would otherwise stop the cookie being set over plain http.
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
  // Must match the flags the cookie was set with, or the browser keeps it.
  res.clearCookie(REFRESH_COOKIE_NAME, REFRESH_COOKIE_OPTIONS)
}

export async function signup(
  req: Request<object, object, SignupInput>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = await authService.signup(req.body)
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
          onboardingCompleted: user.onboardingCompleted,
          onboardingStep: user.onboardingStep,
          theme: user.theme,
          timezone: user.timezone,
          avatarUrl: user.avatarUrl,
          emailVerified: user.emailVerifiedAt !== null,
        },
        accessToken: tokens.accessToken,
      },
    })
  } catch (err) {
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
          onboardingCompleted: user.onboardingCompleted,
          onboardingStep: user.onboardingStep,
          theme: user.theme,
          timezone: user.timezone,
          avatarUrl: user.avatarUrl,
          emailVerified: user.emailVerifiedAt !== null,
        },
        accessToken: tokens.accessToken,
      },
    })
  } catch (err) {
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
 * RESEND_API_KEY is configured.
 */
export async function devVerificationCode(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user?.id) throw new AppError(401, 'Not authenticated')
    if (!authService.canRevealCodeInDev()) {
      res.status(404).json({ error: 'Not available' })
      return
    }
    const code = await authService.peekVerificationCode(req.user.id)
    res.status(200).json({ data: { code } })
  } catch (err) {
    next(err)
  }
}

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
    // Always return 200 — do not reveal whether the email exists
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
