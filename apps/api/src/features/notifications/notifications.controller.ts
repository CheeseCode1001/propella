import type { Request, Response, NextFunction } from 'express'
import { AppError } from '../../middleware/error-handler'
import * as notificationService from './notification.service'
import {
  getPublicKey,
  saveSubscription,
  removeSubscription,
  sendPushToUser,
} from '../../lib/push'

function requireUser(req: Request): string {
  if (!req.user?.id) throw new AppError(401, 'Not authenticated')
  return req.user.id
}

export async function listNotifications(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = requireUser(req)
    const limit = Math.min(parseInt(String(req.query.limit ?? '20'), 10) || 20, 50)
    const cursor = typeof req.query.cursor === 'string' ? req.query.cursor : undefined
    const result = await notificationService.listNotifications(userId, limit, cursor)
    res.status(200).json({ data: result })
  } catch (err) {
    next(err)
  }
}

export async function getUnreadCount(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = requireUser(req)
    const count = await notificationService.getUnreadCount(userId)
    res.status(200).json({ data: { count } })
  } catch (err) {
    next(err)
  }
}

export async function markRead(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = requireUser(req)
    const { id } = req.params
    if (!id) throw new AppError(400, 'Notification ID required')
    await notificationService.markRead(userId, id)
    res.status(204).send()
  } catch (err) {
    next(err)
  }
}

export async function markAllRead(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = requireUser(req)
    await notificationService.markAllRead(userId)
    res.status(204).send()
  } catch (err) {
    next(err)
  }
}

export async function deleteNotification(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = requireUser(req)
    const { id } = req.params
    if (!id) throw new AppError(400, 'Notification ID required')
    await notificationService.deleteNotification(userId, id)
    res.status(204).send()
  } catch (err) {
    next(err)
  }
}

// ─── Web push ────────────────────────────────────────────────────────

/**
 * The VAPID public key the browser needs to subscribe.
 *
 * Returns null (not an error) when push is not configured, so the client can
 * simply not offer notifications rather than showing a failure.
 */
export function getPushKey(_req: Request, res: Response): void {
  res.status(200).json({ data: { publicKey: getPublicKey() } })
}

export async function subscribePush(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = requireUser(req)
    const body = req.body as {
      endpoint?: unknown
      keys?: { p256dh?: unknown; auth?: unknown }
    }

    if (
      typeof body.endpoint !== 'string' ||
      typeof body.keys?.p256dh !== 'string' ||
      typeof body.keys?.auth !== 'string'
    ) {
      throw new AppError(400, 'A complete push subscription is required')
    }

    await saveSubscription(
      userId,
      { endpoint: body.endpoint, keys: { p256dh: body.keys.p256dh, auth: body.keys.auth } },
      req.get('user-agent') ?? undefined,
    )

    res.status(201).json({ data: { subscribed: true } })
  } catch (err) {
    next(err)
  }
}

export async function unsubscribePush(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = requireUser(req)
    const { endpoint } = req.body as { endpoint?: unknown }

    if (typeof endpoint !== 'string') {
      throw new AppError(400, 'An endpoint is required')
    }

    await removeSubscription(userId, endpoint)
    res.status(204).send()
  } catch (err) {
    next(err)
  }
}

/** Sends a push to the caller's own devices, so they can confirm it works. */
export async function sendTestPush(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = requireUser(req)
    const delivered = await sendPushToUser(userId, {
      title: 'Notifications are on',
      body: 'This is what a Propella reminder will look like.',
      url: '/dashboard',
      tag: 'test',
    })
    res.status(200).json({ data: { delivered } })
  } catch (err) {
    next(err)
  }
}
