import type { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import { logger } from '../config/logger'
import { env } from '../config/env'

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class PaywallRequiredError extends AppError {
  constructor(
    message = 'Subscription required to continue',
    details?: { feature?: string; code?: string; upgradeUrl?: string; [key: string]: unknown },
  ) {
    super(403, message, { code: 'PAYWALL_REQUIRED', upgradeUrl: '/pricing', ...details })
    this.name = 'PaywallRequiredError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, message)
    this.name = 'ValidationError'
  }
}

export class AuthError extends AppError {
  constructor(message = 'Unauthorized') {
    super(401, message)
    this.name = 'AuthError'
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(403, message)
    this.name = 'ForbiddenError'
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Not found') {
    super(404, message)
    this.name = 'NotFoundError'
  }
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const isProduction = env.NODE_ENV === 'production'

  if (err instanceof ZodError) {
    const details = err.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }))
    logger.warn({ err, path: req.path }, 'Validation error')
    res.status(400).json({ error: 'Validation failed', details })
    return
  }

  if (err instanceof AppError) {
    logger.warn({ err, path: req.path, statusCode: err.statusCode }, err.message)
    res.status(err.statusCode).json({
      error: err.message,
      ...(err.details ? { details: err.details } : {}),
    })
    return
  }

  logger.error({ err, path: req.path, method: req.method }, 'Unhandled error')

  res.status(500).json({
    error: 'Internal server error',
    detail: err.message || String(err),
  })
}

