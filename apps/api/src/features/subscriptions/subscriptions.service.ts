import { nanoid } from 'nanoid'
import { prisma } from '../../config/db'
import { env } from '../../config/env'
import { AppError, NotFoundError } from '../../middleware/error-handler'
import { logger } from '../../config/logger'
import { notify } from '../notifications/notification.service'
import {
  sendSubscriptionReceiptEmail,
  sendGiftSubscriptionEmail,
  sendSharedPlanInviteEmail,
} from '../../lib/email'
import {
  initializePaystackTransaction,
  verifyPaystackTransaction,
  type PaystackVerifyResponse,
} from './paystack.service'
import {
  SUBSCRIPTION_PLANS,
  type SubscriptionPlanId,
} from '@propella/shared'

export interface InitializeSubscriptionInput {
  plan: SubscriptionPlanId
  isGift?: boolean | undefined
  giftRecipientEmail?: string | undefined
  giftRecipientName?: string | undefined
  giftMessage?: string | undefined
  isShared?: boolean | undefined
  sharedWithEmail?: string | undefined
}

export interface CurrentSubscriptionResponse {
  plan: 'free' | 'scholar'
  planExpiresAt: string | null
  isActive: boolean
  daysRemaining: number
  activeSubscription: {
    id: string
    plan: SubscriptionPlanId
    planName: string
    amount: number
    status: string
    startDate: string
    expiresAt: string
    reference: string
    isGift: boolean
    isShared?: boolean
    sharedWithEmail?: string | null
  } | null
  history: Array<{
    id: string
    reference: string
    amount: number
    currency: string
    status: string
    channel: string | null
    paidAt: string | null
    createdAt: string
  }>
}

/**
 * Initializes a new checkout session with Paystack
 */
export async function initializeSubscription(
  userId: string,
  input: InitializeSubscriptionInput,
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, plan: true, planExpiresAt: true },
  })
  if (!user) throw new NotFoundError('User not found')

  const planConfig = SUBSCRIPTION_PLANS[input.plan]
  if (!planConfig) {
    throw new AppError(400, `Invalid subscription plan: ${input.plan}`)
  }

  const isGift = Boolean(input.isGift)
  const isShared = input.plan === 'scholar_shared' || Boolean(input.isShared)
  const sharedWithEmail = input.sharedWithEmail?.trim()?.toLowerCase() || null

  if (isGift && !input.giftRecipientEmail?.trim()) {
    throw new AppError(400, 'Recipient email is required for a gift subscription')
  }

  // Create unique reference for tracking
  const prefix = isGift ? 'prp_gift' : isShared ? 'prp_share' : 'prp_sub'
  const reference = `${prefix}_${nanoid(16)}`

  // Base frontend URL for callback
  const frontendUrl = env.FRONTEND_URL ? env.FRONTEND_URL.replace(/\/$/, '') : 'http://localhost:3000'
  const callbackUrl = isGift
    ? `${frontendUrl}/pricing?payment=callback&ref=${reference}`
    : `${frontendUrl}/settings?tab=plan&payment=callback&ref=${reference}`

  // Record pending transaction in database
  await prisma.paymentTransaction.create({
    data: {
      userId,
      reference,
      amount: planConfig.price,
      currency: 'NGN',
      status: 'pending',
      metadata: {
        userId,
        plan: input.plan,
        isGift,
        giftRecipientEmail: input.giftRecipientEmail?.trim()?.toLowerCase() || null,
        giftRecipientName: input.giftRecipientName?.trim() || null,
        giftMessage: input.giftMessage?.trim() || null,
        isShared,
        sharedWithEmail,
      },
    },
  })

  // Optional recurring plan code from environment if monthly
  const planCode =
    input.plan === 'scholar_monthly' && env.PAYSTACK_PLAN_MONTHLY_CODE
      ? env.PAYSTACK_PLAN_MONTHLY_CODE
      : undefined

  const paystackData = await initializePaystackTransaction({
    email: user.email,
    amount: planConfig.priceKobo,
    reference,
    callbackUrl,
    planCode: isGift ? undefined : planCode, // Don't subscribe the gift sender to a recurring auto-debit
    metadata: {
      userId,
      purchaserName: user.name,
      plan: input.plan,
      isGift,
      giftRecipientEmail: input.giftRecipientEmail?.trim()?.toLowerCase() || null,
      giftRecipientName: input.giftRecipientName?.trim() || null,
      giftMessage: input.giftMessage?.trim() || null,
      custom_fields: [
        {
          display_name: 'Platform',
          variable_name: 'platform',
          value: 'Propella Study',
        },
        {
          display_name: 'Plan',
          variable_name: 'plan',
          value: planConfig.name,
        },
        ...(isGift
          ? [
              {
                display_name: 'Gift Recipient',
                variable_name: 'gift_recipient',
                value: input.giftRecipientEmail || '',
              },
            ]
          : []),
      ],
    },
  })

  return {
    authorizationUrl: paystackData.authorization_url,
    accessCode: paystackData.access_code,
    reference,
    amount: planConfig.price,
    plan: input.plan,
  }
}

/**
 * Calculates new expiry date, extending if already active
 */
function calculateExpirationDate(
  currentExpiresAt: Date | null | undefined,
  durationDays: number,
): Date {
  const now = new Date()
  const base =
    currentExpiresAt && currentExpiresAt.getTime() > now.getTime()
      ? new Date(currentExpiresAt.getTime())
      : now

  const next = new Date(base.getTime())
  next.setDate(next.getDate() + durationDays)
  return next
}

/**
 * Verifies transaction with Paystack and activates the subscription
 */
export async function verifyAndActivateSubscription(
  reference: string,
  actingUserId?: string,
) {
  // 1. Verify with Paystack
  const verified = await verifyPaystackTransaction(reference)

  if (verified.status !== 'success') {
    // Update transaction record if found
    await prisma.paymentTransaction
      .updateMany({
        where: { reference },
        data: { status: 'failed' },
      })
      .catch(() => {})

    throw new AppError(400, `Payment was not successful (status: ${verified.status})`)
  }

  // 2. Fetch or create transaction record
  let tx = await prisma.paymentTransaction.findUnique({
    where: { reference },
    include: { subscription: true },
  })

  // If already activated, return idempotent result
  if (tx && tx.status === 'success' && tx.subscription) {
    return {
      success: true,
      alreadyProcessed: true,
      subscription: tx.subscription,
      message: 'Subscription has already been activated.',
    }
  }

  const meta = (verified.metadata || tx?.metadata || {}) as {
    userId?: string
    plan?: SubscriptionPlanId
    isGift?: boolean
    giftRecipientEmail?: string | null
    giftRecipientName?: string | null
    giftMessage?: string | null
    isShared?: boolean
    sharedWithEmail?: string | null
  }

  const userId = meta.userId || actingUserId || tx?.userId
  if (!userId) {
    throw new AppError(400, 'Could not determine student account for this transaction')
  }

  const planId: SubscriptionPlanId = meta.plan || 'scholar_basic'
  const planConfig = SUBSCRIPTION_PLANS[planId] || SUBSCRIPTION_PLANS.scholar_basic
  const isGift = Boolean(meta.isGift)
  const isShared = planId === 'scholar_shared' || Boolean(meta.isShared)
  const sharedWithEmail = meta.sharedWithEmail?.trim()?.toLowerCase() || null
  const recipientEmail = meta.giftRecipientEmail?.trim()?.toLowerCase()
  const recipientName = meta.giftRecipientName?.trim()
  const giftMessage = meta.giftMessage?.trim()

  const purchaser = await prisma.user.findUnique({ where: { id: userId } })
  if (!purchaser) throw new NotFoundError('Purchaser account not found')

  let beneficiaryUser = purchaser
  if (isGift && recipientEmail) {
    const existingRecipient = await prisma.user.findUnique({
      where: { email: recipientEmail },
    })
    if (existingRecipient) {
      beneficiaryUser = existingRecipient
    }
  }

  const newExpiresAt = calculateExpirationDate(
    beneficiaryUser.planExpiresAt,
    planConfig.durationDays,
  )

  // 3. Atomically activate in transaction
  const result = await prisma.$transaction(async (db) => {
    // If beneficiary is an existing user, upgrade them
    if (beneficiaryUser) {
      await db.user.update({
        where: { id: beneficiaryUser.id },
        data: {
          plan: 'scholar',
          planExpiresAt: newExpiresAt,
          ...(verified.customer?.customer_code
            ? { paystackCustomerCode: verified.customer.customer_code }
            : {}),
        },
      })
    }

    let sharedWithUserId: string | null = null
    if (isShared && sharedWithEmail) {
      const partner = await db.user.findUnique({ where: { email: sharedWithEmail } })
      if (partner) {
        sharedWithUserId = partner.id
        await db.user.update({
          where: { id: partner.id },
          data: {
            plan: 'scholar',
            planExpiresAt: newExpiresAt,
          },
        })
      }
    }

    // Upsert subscription row
    const subscription = await db.subscription.upsert({
      where: { reference },
      create: {
        userId: beneficiaryUser ? beneficiaryUser.id : purchaser.id,
        plan: planId,
        status: 'active',
        amount: Math.round(verified.amount / 100),
        reference,
        paystackSubscriptionCode: (verified as any).subscription?.subscription_code || null,
        paystackCustomerCode: verified.customer?.customer_code || null,
        paystackPlanCode: verified.plan || null,
        startDate: new Date(),
        expiresAt: newExpiresAt,
        isGift,
        giftRecipientEmail: recipientEmail || null,
        giftRecipientName: recipientName || null,
        giftMessage: giftMessage || null,
        isShared,
        sharedWithEmail,
        sharedWithUserId,
      },
      update: {
        status: 'active',
        expiresAt: newExpiresAt,
        ...(isShared ? { isShared: true, sharedWithEmail, sharedWithUserId } : {}),
      },
    })

    // Upsert payment transaction
    await db.paymentTransaction.upsert({
      where: { reference },
      create: {
        userId: purchaser.id,
        subscriptionId: subscription.id,
        reference,
        amount: Math.round(verified.amount / 100),
        currency: verified.currency || 'NGN',
        status: 'success',
        channel: verified.channel || 'card',
        paidAt: verified.paid_at ? new Date(verified.paid_at) : new Date(),
        metadata: (verified.metadata as any) ?? {},
      },
      update: {
        status: 'success',
        channel: verified.channel || 'card',
        paidAt: verified.paid_at ? new Date(verified.paid_at) : new Date(),
        subscriptionId: subscription.id,
      },
    })

    return subscription
  })

  // 4. Send Notifications & Emails
  try {
    if (isGift && recipientEmail) {
      // In-app notification for recipient if they exist
      if (beneficiaryUser && beneficiaryUser.id !== purchaser.id) {
        await notify(beneficiaryUser.id, 'plan_change', {
          title: 'You received a Scholar Gift Subscription! 🎁',
          body: `${purchaser.name} has gifted you a ${planConfig.name}. Enjoy unlimited access to past questions and AI tutors!`,
          deeplink: '/dashboard',
          metadata: { subscriptionId: result.id, senderName: purchaser.name },
        })
      }

      // Email to recipient celebrating gift
      await sendGiftSubscriptionEmail({
        to: recipientEmail,
        recipientName: recipientName || undefined,
        senderName: purchaser.name,
        planName: planConfig.name,
        message: giftMessage || undefined,
        expiresAt: newExpiresAt,
      })

      // Notification to purchaser
      await notify(purchaser.id, 'system', {
        title: 'Gift Subscription Activated! 🎁',
        body: `Your gift of ${planConfig.name} to ${recipientEmail} has been activated successfully.`,
        deeplink: '/settings?tab=plan',
        metadata: { subscriptionId: result.id },
      })
    } else {
      // Personal subscription
      await notify(purchaser.id, 'plan_change', {
        title: 'Welcome to Scholar Plan! 🎉',
        body: `Your ${planConfig.name} is now active until ${newExpiresAt.toLocaleDateString()}. Enjoy unlimited AI, full mock tests, and courses!`,
        deeplink: '/dashboard',
        metadata: { subscriptionId: result.id },
      })

      // Send receipt email
      await sendSubscriptionReceiptEmail({
        to: purchaser.email,
        name: purchaser.name,
        planName: planConfig.name,
        amount: planConfig.price,
        reference,
        expiresAt: newExpiresAt,
      })

      // If shared plan, send invite email to partner
      if (isShared && sharedWithEmail) {
        await sendSharedPlanInviteEmail({
          to: sharedWithEmail,
          senderName: purchaser.name,
          expiresAt: newExpiresAt,
        })
      }
    }
  } catch (err: unknown) {
    logger.warn({ err }, 'Could not dispatch notifications or email after subscription activation')
  }

  return {
    success: true,
    subscription: result,
    planExpiresAt: newExpiresAt.toISOString(),
    message: 'Subscription successfully activated!',
  }
}

/**
 * Gets the current active subscription and payment history for a user
 */
export async function getCurrentSubscription(
  userId: string,
): Promise<CurrentSubscriptionResponse> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true, planExpiresAt: true },
  })
  if (!user) throw new NotFoundError('User not found')

  const now = new Date()
  const isActive =
    user.plan === 'scholar' &&
    Boolean(user.planExpiresAt && user.planExpiresAt.getTime() > now.getTime())

  let daysRemaining = 0
  if (isActive && user.planExpiresAt) {
    const diffMs = user.planExpiresAt.getTime() - now.getTime()
    daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)))
  }

  // If expired, lazily downgrade user plan in DB
  if (user.plan === 'scholar' && user.planExpiresAt && user.planExpiresAt.getTime() <= now.getTime()) {
    await prisma.user.update({
      where: { id: userId },
      data: { plan: 'free' },
    })
    user.plan = 'free'
  }

  const [activeSub, history] = await Promise.all([
    prisma.subscription.findFirst({
      where: {
        userId,
        status: 'active',
        expiresAt: { gt: now },
      },
      orderBy: { expiresAt: 'desc' },
    }),
    prisma.paymentTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
  ])

  return {
    plan: user.plan,
    planExpiresAt: user.planExpiresAt ? user.planExpiresAt.toISOString() : null,
    isActive,
    daysRemaining,
    activeSubscription: activeSub
      ? {
          id: activeSub.id,
          plan: activeSub.plan as SubscriptionPlanId,
          planName:
            SUBSCRIPTION_PLANS[activeSub.plan as SubscriptionPlanId]?.name ||
            activeSub.plan,
          amount: activeSub.amount,
          status: activeSub.status,
          startDate: activeSub.startDate.toISOString(),
          expiresAt: activeSub.expiresAt.toISOString(),
          reference: activeSub.reference,
          isGift: activeSub.isGift,
          isShared: activeSub.isShared,
          sharedWithEmail: activeSub.sharedWithEmail,
        }
      : null,
    history: history.map((t) => ({
      id: t.id,
      reference: t.reference,
      amount: t.amount,
      currency: t.currency,
      status: t.status,
      channel: t.channel,
      paidAt: t.paidAt ? t.paidAt.toISOString() : null,
      createdAt: t.createdAt.toISOString(),
    })),
  }
}

/**
 * Cancels auto-renewal or active subscription
 */
export async function cancelSubscription(userId: string) {
  const activeSub = await prisma.subscription.findFirst({
    where: { userId, status: 'active' },
    orderBy: { expiresAt: 'desc' },
  })

  if (!activeSub) {
    throw new AppError(404, 'No active subscription found to cancel')
  }

  await prisma.subscription.update({
    where: { id: activeSub.id },
    data: {
      status: 'cancelled',
      cancelledAt: new Date(),
    },
  })

  await notify(userId, 'plan_change', {
    title: 'Subscription Cancelled',
    body: `Your Scholar subscription has been cancelled. You will retain Scholar access until ${activeSub.expiresAt.toLocaleDateString()}.`,
    deeplink: '/settings?tab=plan',
  })

  return {
    success: true,
    message: 'Subscription has been cancelled. Your access will continue until the end of your billing cycle.',
    expiresAt: activeSub.expiresAt.toISOString(),
  }
}

/**
 * Links a partner's email address to an active Shared Plan
 */
export async function linkSharedAccount(userId: string, partnerEmail: string) {
  const normalizedEmail = partnerEmail.trim().toLowerCase()
  const purchaser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true },
  })
  if (!purchaser) throw new NotFoundError('User not found')

  if (purchaser.email.toLowerCase() === normalizedEmail) {
    throw new AppError(400, 'You cannot share your plan with your own account email')
  }

  const activeSharedSub = await prisma.subscription.findFirst({
    where: {
      userId,
      status: 'active',
      expiresAt: { gt: new Date() },
      OR: [{ plan: 'scholar_shared' }, { isShared: true }],
    },
    orderBy: { expiresAt: 'desc' },
  })

  if (!activeSharedSub) {
    throw new AppError(
      400,
      'No active Shared Plan found on your account. Upgrade to the Shared Plan to share access with a partner.',
    )
  }

  const partnerUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  })

  await prisma.$transaction(async (db) => {
    if (partnerUser) {
      await db.user.update({
        where: { id: partnerUser.id },
        data: {
          plan: 'scholar',
          planExpiresAt: activeSharedSub.expiresAt,
        },
      })
    }

    await db.subscription.update({
      where: { id: activeSharedSub.id },
      data: {
        sharedWithEmail: normalizedEmail,
        sharedWithUserId: partnerUser ? partnerUser.id : null,
      },
    })
  })

  // Send email and in-app notification
  try {
    await sendSharedPlanInviteEmail({
      to: normalizedEmail,
      partnerName: partnerUser ? partnerUser.name : undefined,
      senderName: purchaser.name,
      expiresAt: activeSharedSub.expiresAt,
    })

    if (partnerUser) {
      await notify(partnerUser.id, 'plan_change', {
        title: 'Shared Scholar Plan Activated! 👥',
        body: `${purchaser.name} has linked you to their Propella Shared Scholar Plan. Enjoy full Scholar access!`,
        deeplink: '/dashboard',
        metadata: { subscriptionId: activeSharedSub.id },
      })
    }
  } catch (err: unknown) {
    logger.warn({ err }, 'Failed to dispatch shared plan email')
  }

  return {
    success: true,
    message: partnerUser
      ? `Successfully linked ${partnerUser.name} (${normalizedEmail}) to your Shared Scholar Plan!`
      : `Invitation sent to ${normalizedEmail}! When they sign up or log in, their Scholar perks will be active.`,
    partnerEmail: normalizedEmail,
  }
}

/**
 * Handles incoming Paystack webhook events
 */
export async function handlePaystackWebhook(event: string, data: any) {
  logger.info({ event, reference: data?.reference }, 'Processing Paystack webhook')

  switch (event) {
    case 'charge.success': {
      if (data?.reference) {
        await verifyAndActivateSubscription(data.reference)
      }
      break
    }

    case 'subscription.disable':
    case 'subscription.not_renew': {
      const subCode = data?.subscription_code
      if (subCode) {
        await prisma.subscription.updateMany({
          where: { paystackSubscriptionCode: subCode },
          data: { status: 'cancelled', cancelledAt: new Date() },
        })
      }
      break
    }

    default:
      logger.info({ event }, 'Unhandled Paystack webhook event')
      break
  }

  return { received: true }
}
