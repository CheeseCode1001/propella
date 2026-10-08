import type { Request, Response } from 'express'
import { z } from 'zod'
import { AppError } from '../../middleware/error-handler'
import { logger } from '../../config/logger'
import { verifyPaystackWebhookSignature } from './paystack.service'
import * as subService from './subscriptions.service'

const InitializeSchema = z.object({
  plan: z.enum(['scholar_basic', 'scholar_shared', 'scholar_full', 'scholar_monthly']),
  isGift: z.boolean().optional(),
  giftRecipientEmail: z.string().email().optional(),
  giftRecipientName: z.string().optional(),
  giftMessage: z.string().optional(),
  isShared: z.boolean().optional(),
  sharedWithEmail: z.string().email().optional(),
})

const LinkSharedSchema = z.object({
  partnerEmail: z.string().email('Valid partner email is required'),
})

function getUserId(req: Request): string {
  const user = req.user
  if (!user?.id) {
    throw new AppError(401, 'Authentication required')
  }
  return user.id
}

export async function initialize(req: Request, res: Response) {
  const userId = getUserId(req)
  const parsed = InitializeSchema.safeParse(req.body)

  if (!parsed.success) {
    throw new AppError(400, 'Invalid subscription data: ' + parsed.error.issues[0]?.message)
  }

  const result = await subService.initializeSubscription(userId, {
    plan: parsed.data.plan,
    isGift: parsed.data.isGift,
    giftRecipientEmail: parsed.data.giftRecipientEmail,
    giftRecipientName: parsed.data.giftRecipientName,
    giftMessage: parsed.data.giftMessage,
    isShared: parsed.data.isShared,
    sharedWithEmail: parsed.data.sharedWithEmail,
  })
  res.status(200).json({ data: result })
}

export async function linkShared(req: Request, res: Response) {
  const userId = getUserId(req)
  const parsed = LinkSharedSchema.safeParse(req.body)

  if (!parsed.success) {
    throw new AppError(400, 'Invalid input: ' + parsed.error.issues[0]?.message)
  }

  const result = await subService.linkSharedAccount(userId, parsed.data.partnerEmail)
  res.status(200).json({ data: result })
}

export async function verify(req: Request, res: Response) {
  const reference = req.params['reference']
  if (!reference) {
    throw new AppError(400, 'Transaction reference is required')
  }

  // Get user ID if authenticated
  const userId = req.user?.id

  const result = await subService.verifyAndActivateSubscription(reference, userId)
  res.status(200).json({ data: result })
}

export async function getCurrent(req: Request, res: Response) {
  const userId = getUserId(req)
  const result = await subService.getCurrentSubscription(userId)
  res.status(200).json({ data: result })
}

export async function cancel(req: Request, res: Response) {
  const userId = getUserId(req)
  const result = await subService.cancelSubscription(userId)
  res.status(200).json({ data: result })
}

export async function webhook(req: Request, res: Response) {
  const signature = req.headers['x-paystack-signature'] as string | undefined
  const rawBody = (req as any).rawBody || Buffer.from(JSON.stringify(req.body))

  const isValid = verifyPaystackWebhookSignature(rawBody, signature)
  if (!isValid) {
    logger.warn('Rejected invalid Paystack webhook signature')
    return res.status(401).json({ error: 'Invalid signature' })
  }

  const event = req.body?.event
  const data = req.body?.data

  await subService.handlePaystackWebhook(event, data)
  return res.status(200).json({ status: 'ok' })
}
