import webpush from 'web-push'
import { prisma } from '../config/db'
import { env } from '../config/env'
import { logger } from '../config/logger'

/**
 * Web push delivery.
 *
 * Configured lazily: without VAPID keys the app runs normally and simply does
 * not send pushes, the same way a missing Resend key disables email. That keeps
 * local development working with no extra setup.
 */

let configured: boolean | null = null

export function isPushConfigured(): boolean {
  if (configured === null) {
    if (!env.VAPID_PUBLIC_KEY || !env.VAPID_PRIVATE_KEY) {
      logger.info('Web push disabled — VAPID keys are not set')
      configured = false
      return configured
    }

    try {
      webpush.setVapidDetails(
        // Push services require a contact URI; mailto: is the conventional one.
        env.VAPID_SUBJECT,
        env.VAPID_PUBLIC_KEY,
        env.VAPID_PRIVATE_KEY,
      )
      configured = true
    } catch (err) {
      // A malformed subject or key would otherwise throw on every single
      // notification. Log it once and carry on with push switched off —
      // in-app notifications are unaffected.
      logger.error({ err }, 'Web push disabled — VAPID configuration is invalid')
      configured = false
    }
  }
  return configured
}

export function getPublicKey(): string | null {
  return isPushConfigured() ? env.VAPID_PUBLIC_KEY : null
}

export interface PushPayload {
  title: string
  body: string
  /** Where the notification should open. Relative to the web app. */
  url?: string
  /** Collapses same-tag notifications so a device is not flooded. */
  tag?: string
}

/**
 * Sends one payload to every device a student has registered.
 *
 * Failures are per-device and never propagate: a dead subscription must not
 * fail the action that triggered the notification. 404/410 mean the browser has
 * discarded the subscription, so the row is deleted rather than retried.
 */
export async function sendPushToUser(userId: string, payload: PushPayload): Promise<number> {
  if (!isPushConfigured()) return 0

  const subs = await prisma.pushSubscription.findMany({
    where: { userId, failedAt: null },
  })
  if (subs.length === 0) return 0

  const body = JSON.stringify({
    title: payload.title,
    body: payload.body,
    url: payload.url ?? '/dashboard',
    tag: payload.tag ?? 'propella',
  })

  const results = await Promise.allSettled(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          body,
          { TTL: 60 * 60 * 24 },
        )

        await prisma.pushSubscription.update({
          where: { id: sub.id },
          data: { lastUsedAt: new Date() },
        })
        return true
      } catch (err) {
        const statusCode = (err as { statusCode?: number }).statusCode

        if (statusCode === 404 || statusCode === 410) {
          // The browser has thrown this subscription away for good.
          await prisma.pushSubscription
            .delete({ where: { id: sub.id } })
            .catch(() => undefined)
        } else {
          await prisma.pushSubscription
            .update({ where: { id: sub.id }, data: { failedAt: new Date() } })
            .catch(() => undefined)
          logger.warn({ err, statusCode, userId }, 'Push delivery failed')
        }
        throw err
      }
    }),
  )

  return results.filter((r) => r.status === 'fulfilled').length
}

/** Fan-out for admin broadcasts. Chunked so one huge query does not stall. */
export async function sendPushToUsers(
  userIds: string[],
  payload: PushPayload,
): Promise<number> {
  if (!isPushConfigured() || userIds.length === 0) return 0

  const CHUNK = 50
  let delivered = 0

  for (let i = 0; i < userIds.length; i += CHUNK) {
    const chunk = userIds.slice(i, i + CHUNK)
    const counts = await Promise.all(chunk.map((id) => sendPushToUser(id, payload)))
    delivered += counts.reduce((sum, n) => sum + n, 0)
  }

  return delivered
}

export interface SubscriptionInput {
  endpoint: string
  keys: { p256dh: string; auth: string }
}

export async function saveSubscription(
  userId: string,
  sub: SubscriptionInput,
  userAgent?: string,
): Promise<void> {
  // The endpoint is unique per device+browser, so re-subscribing on the same
  // device updates the existing row instead of piling up duplicates.
  await prisma.pushSubscription.upsert({
    where: { endpoint: sub.endpoint },
    create: {
      userId,
      endpoint: sub.endpoint,
      p256dh: sub.keys.p256dh,
      auth: sub.keys.auth,
      userAgent: userAgent ?? null,
    },
    update: {
      userId,
      p256dh: sub.keys.p256dh,
      auth: sub.keys.auth,
      userAgent: userAgent ?? null,
      failedAt: null,
    },
  })
}

export async function removeSubscription(userId: string, endpoint: string): Promise<void> {
  await prisma.pushSubscription.deleteMany({ where: { userId, endpoint } })
}
