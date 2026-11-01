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
  chargePaystackAuthorization,
} from './paystack.service'
import {
  SUBSCRIPTION_PLANS,
  WELCOME_DISCOUNT_WINDOW_MS,
  WELCOME_DISCOUNT_PERCENT,
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
  discountEligible: boolean
  discountExpiresAt: string | null
  discountPercent: number
  activeSubscription: {
    id: string
    plan: SubscriptionPlanId
    planName: string
    amount: number
    renewalAmount: number
    isDiscounted: boolean
    autoRenew: boolean
    cardLast4?: string | null
    cardBrand?: string | null
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

interface StoredPaymentMetadata {
  userId?: string
  plan?: SubscriptionPlanId
  isGift?: boolean
  giftRecipientEmail?: string | null
  giftRecipientName?: string | null
  giftMessage?: string | null
  isShared?: boolean
  sharedWithEmail?: string | null
  isDiscounted?: boolean
  standardPrice?: number
  renewalAmount?: number
  autoRenew?: boolean
  authorizationCode?: string | null
  cardSignature?: string | null
  cardLast4?: string | null
  cardBrand?: string | null
  reusable?: boolean
}

/**
 * Checks whether a user is within the 3-day (72-hour) welcome discount window
 * from registration and has not previously activated a subscription.
 */
export async function checkWelcomeDiscountEligibility(userId: string): Promise<{
  eligible: boolean
  expiresAt: Date
}> {
  const [user, priorSubs] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { createdAt: true, plan: true, planExpiresAt: true },
    }),
    prisma.subscription.count({ where: { userId } }),
  ])

  if (!user) throw new NotFoundError('User not found')

  const expiresAt = new Date(user.createdAt.getTime() + WELCOME_DISCOUNT_WINDOW_MS)
  const now = new Date()
  const isCurrentlyScholar =
    user.plan === 'scholar' &&
    Boolean(user.planExpiresAt && user.planExpiresAt.getTime() > now.getTime())

  const eligible =
    !isCurrentlyScholar && priorSubs === 0 && now.getTime() < expiresAt.getTime()

  return { eligible, expiresAt }
}

/**
 * Initializes a new checkout session with Paystack.
 * - Within 3 days of registration, applies the 50% welcome discount (₦999 Basic, ₦1,499 Shared, ₦4,999 Full).
 * - Strategically forces `channels: ['card']` on non-gift plans so a reusable card authorization
 *   is captured to auto-renew next month at the standard price and prevent multi-account discount abuse.
 */
export async function initializeSubscription(
  userId: string,
  input: InitializeSubscriptionInput,
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, plan: true, planExpiresAt: true, createdAt: true },
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

  // Check 3-day welcome discount eligibility (applies to personal/shared subscriptions, not gifts)
  const discountCheck = isGift
    ? { eligible: false, expiresAt: new Date(0) }
    : await checkWelcomeDiscountEligibility(userId)

  const isDiscounted = discountCheck.eligible
  const chargeAmount = isDiscounted ? planConfig.discountPrice : planConfig.price
  const chargeAmountKobo = isDiscounted ? planConfig.discountPriceKobo : planConfig.priceKobo
  const renewalAmount = planConfig.price

  // Create unique reference for tracking
  const prefix = isGift ? 'prp_gift' : isShared ? 'prp_share' : isDiscounted ? 'prp_disc' : 'prp_sub'
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
      amount: chargeAmount,
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
        isDiscounted,
        standardPrice: planConfig.price,
        renewalAmount,
        autoRenew: !isGift,
      },
    },
  })

  // Only pass Paystack planCode on non-discounted monthly transactions; on discounted
  // transactions we charge the 50% intro price via card and auto-renew at standard price.
  const planCode =
    !isDiscounted && input.plan === 'scholar_monthly' && env.PAYSTACK_PLAN_MONTHLY_CODE
      ? env.PAYSTACK_PLAN_MONTHLY_CODE
      : undefined

  const email = user.email?.trim()?.toLowerCase()
  if (!email || !email.includes('@')) {
    throw new AppError(400, 'Your account does not have a valid email address configured for payment.')
  }

  // Force reusable card channel on personal/discounted plans so auto-renewal at standard price is guaranteed
  const channels = isGift ? undefined : ['card']

  const paystackData = await initializePaystackTransaction({
    email,
    amount: chargeAmountKobo,
    reference,
    callbackUrl,
    planCode: isGift ? undefined : planCode,
    channels,
    metadata: {
      userId,
      purchaserName: user.name,
      plan: input.plan,
      isGift,
      isDiscounted,
      standardPrice: planConfig.price,
      renewalAmount,
      autoRenew: !isGift,
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
          value: isDiscounted
            ? `${planConfig.name} (50% Welcome Offer — Renews at ₦${planConfig.price.toLocaleString()})`
            : planConfig.name,
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
    amount: chargeAmount,
    standardPrice: planConfig.price,
    renewalAmount,
    isDiscounted,
    autoRenew: !isGift,
    plan: input.plan,
    email,
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
 * Verifies transaction with Paystack and activates the subscription.
 * Also enforces anti-abuse checks using Paystack's card signature so users cannot
 * open multiple accounts with the same card to repeatedly claim the 3-day 50% discount.
 */
export async function verifyAndActivateSubscription(
  reference: string,
  actingUserId?: string,
) {
  // 1. Verify with Paystack
  const verified = await verifyPaystackTransaction(reference)

  if (verified.status !== 'success') {
    await prisma.paymentTransaction
      .updateMany({
        where: { reference },
        data: { status: 'failed' },
      })
      .catch(() => {})

    throw new AppError(400, `Payment was not successful (status: ${verified.status})`)
  }

  // 2. Fetch or create transaction record
  const tx = await prisma.paymentTransaction.findUnique({
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

  const txMeta = (tx?.metadata ?? {}) as StoredPaymentMetadata
  const verifiedMeta = (verified.metadata ?? {}) as StoredPaymentMetadata
  const meta: StoredPaymentMetadata = { ...txMeta, ...verifiedMeta }

  const userId = meta.userId || actingUserId || tx?.userId
  if (!userId) {
    throw new AppError(400, 'Could not determine student account for this transaction')
  }

  const planId: SubscriptionPlanId = meta.plan || 'scholar_basic'
  const planConfig = SUBSCRIPTION_PLANS[planId] || SUBSCRIPTION_PLANS.scholar_basic
  const isGift = Boolean(meta.isGift)
  const isDiscounted = Boolean(meta.isDiscounted)
  const isShared = planId === 'scholar_shared' || Boolean(meta.isShared)
  const sharedWithEmail = meta.sharedWithEmail?.trim()?.toLowerCase() || null
  const recipientEmail = meta.giftRecipientEmail?.trim()?.toLowerCase()
  const recipientName = meta.giftRecipientName?.trim()
  const giftMessage = meta.giftMessage?.trim()

  const authorizationCode = verified.authorization?.authorization_code || null
  const cardSignature = verified.authorization?.signature || null
  const cardLast4 = verified.authorization?.last4 || null
  const cardBrand = verified.authorization?.card_type || null
  const reusable = Boolean(verified.authorization?.reusable)

  // Anti-abuse check: if this is a discounted purchase and Paystack returned a card signature,
  // verify this card signature hasn't already been used on a DIFFERENT account for a discounted plan.
  if (isDiscounted && cardSignature) {
    const priorDiscountTxs = await prisma.paymentTransaction.findMany({
      where: {
        status: 'success',
        userId: { not: userId },
      },
      select: { id: true, userId: true, metadata: true },
      take: 500,
    })

    const abusedOnOtherAccount = priorDiscountTxs.some((otherTx) => {
      const m = (otherTx.metadata ?? {}) as StoredPaymentMetadata
      return m.isDiscounted === true && m.cardSignature === cardSignature
    })

    if (abusedOnOtherAccount) {
      logger.warn(
        { userId, reference, cardSignature },
        'Blocked multi-account 50% welcome discount abuse using the same card signature',
      )
      throw new AppError(
        403,
        'This payment card has already been used to claim the 3-day 50% welcome discount on another Propella account. Please use your original account or subscribe at the standard rate.',
      )
    }
  }

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

  const paidAmountNaira = Math.round(verified.amount / 100)
  const enrichedMetadata: StoredPaymentMetadata = {
    ...meta,
    userId,
    plan: planId,
    isGift,
    isShared,
    sharedWithEmail,
    isDiscounted,
    standardPrice: planConfig.price,
    renewalAmount: planConfig.price,
    autoRenew: !isGift,
    authorizationCode,
    cardSignature,
    cardLast4,
    cardBrand,
    reusable,
  }

  // 3. Atomically activate in transaction
  const result = await prisma.$transaction(async (db) => {
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

    const subscription = await db.subscription.upsert({
      where: { reference },
      create: {
        userId: beneficiaryUser ? beneficiaryUser.id : purchaser.id,
        plan: planId,
        status: 'active',
        amount: paidAmountNaira,
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

    await db.paymentTransaction.upsert({
      where: { reference },
      create: {
        userId: purchaser.id,
        subscriptionId: subscription.id,
        reference,
        amount: paidAmountNaira,
        currency: verified.currency || 'NGN',
        status: 'success',
        channel: verified.channel || 'card',
        paidAt: verified.paid_at ? new Date(verified.paid_at) : new Date(),
        metadata: enrichedMetadata as any,
      },
      update: {
        status: 'success',
        amount: paidAmountNaira,
        channel: verified.channel || 'card',
        paidAt: verified.paid_at ? new Date(verified.paid_at) : new Date(),
        subscriptionId: subscription.id,
        metadata: enrichedMetadata as any,
      },
    })

    return subscription
  })

  // 4. Send Notifications & Emails
  try {
    if (isGift && recipientEmail) {
      if (beneficiaryUser && beneficiaryUser.id !== purchaser.id) {
        await notify(beneficiaryUser.id, 'plan_change', {
          title: 'You received a Scholar Gift Subscription! 🎁',
          body: `${purchaser.name} has gifted you a ${planConfig.name}. Enjoy unlimited access to past questions and AI tutors!`,
          deeplink: '/dashboard',
          metadata: { subscriptionId: result.id, senderName: purchaser.name },
        })
      }

      await sendGiftSubscriptionEmail({
        to: recipientEmail,
        recipientName: recipientName || undefined,
        senderName: purchaser.name,
        planName: planConfig.name,
        message: giftMessage || undefined,
        expiresAt: newExpiresAt,
      })

      await notify(purchaser.id, 'system', {
        title: 'Gift Subscription Activated! 🎁',
        body: `Your gift of ${planConfig.name} to ${recipientEmail} has been activated successfully.`,
        deeplink: '/settings?tab=plan',
        metadata: { subscriptionId: result.id },
      })
    } else {
      await notify(purchaser.id, 'plan_change', {
        title: 'Welcome to Scholar Plan! 🎉',
        body: isDiscounted
          ? `Your ${planConfig.name} (50% Welcome Offer — ₦${paidAmountNaira.toLocaleString()}) is active until ${newExpiresAt.toLocaleDateString()}. Auto-renews next month at standard rate (₦${planConfig.price.toLocaleString()}).`
          : `Your ${planConfig.name} is now active until ${newExpiresAt.toLocaleDateString()}. Enjoy unlimited AI, full mock tests, and courses!`,
        deeplink: '/dashboard',
        metadata: { subscriptionId: result.id, isDiscounted, renewalAmount: planConfig.price },
      })

      await sendSubscriptionReceiptEmail({
        to: purchaser.email,
        name: purchaser.name,
        planName: planConfig.name,
        amount: paidAmountNaira,
        reference,
        expiresAt: newExpiresAt,
      })

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
    message: isDiscounted
      ? `50% Welcome Offer activated! Your plan will auto-renew on ${newExpiresAt.toLocaleDateString()} at the standard rate of ₦${planConfig.price.toLocaleString()}.`
      : 'Subscription successfully activated!',
  }
}

/**
 * Processes due subscription auto-renewals at the STANDARD plan price using the saved Paystack
 * reusable card authorization code. Called by the background scheduler and lazily when checking status.
 */
export async function processDueSubscriptionRenewals(): Promise<number> {
  const now = new Date()
  const dueSubs = await prisma.subscription.findMany({
    where: {
      status: 'active',
      isGift: false,
      expiresAt: { lte: now },
    },
    include: {
      user: { select: { id: true, email: true, name: true, planExpiresAt: true } },
      payments: {
        where: { status: 'success' },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
    take: 50,
  })

  let renewedCount = 0

  for (const sub of dueSubs) {
    const latestPayment = sub.payments[0]
    const meta = (latestPayment?.metadata ?? {}) as StoredPaymentMetadata
    const planId = (sub.plan as SubscriptionPlanId) || 'scholar_basic'
    const planConfig = SUBSCRIPTION_PLANS[planId] || SUBSCRIPTION_PLANS.scholar_basic

    // If autoRenew was explicitly disabled or no authorization code was saved, expire the subscription
    if (meta.autoRenew === false || !meta.authorizationCode) {
      await prisma.$transaction([
        prisma.subscription.update({
          where: { id: sub.id },
          data: { status: 'expired' },
        }),
        prisma.user.update({
          where: { id: sub.userId },
          data: { plan: 'free' },
        }),
      ])
      continue
    }

    const renewalRef = `prp_renew_${nanoid(16)}`
    const standardPriceNaira = planConfig.price
    const standardPriceKobo = planConfig.priceKobo

    try {
      const chargeResult = await chargePaystackAuthorization({
        email: sub.user.email,
        amount: standardPriceKobo,
        authorizationCode: meta.authorizationCode,
        reference: renewalRef,
        metadata: {
          userId: sub.userId,
          plan: planId,
          isRenewal: true,
          previousSubscriptionId: sub.id,
        },
      })

      if (chargeResult.status === 'success') {
        const nextExpiresAt = calculateExpirationDate(now, planConfig.durationDays)
        const nextAuthCode =
          chargeResult.authorization?.authorization_code || meta.authorizationCode

        await prisma.$transaction([
          prisma.user.update({
            where: { id: sub.userId },
            data: { plan: 'scholar', planExpiresAt: nextExpiresAt },
          }),
          ...(sub.sharedWithUserId
            ? [
                prisma.user.update({
                  where: { id: sub.sharedWithUserId },
                  data: { plan: 'scholar', planExpiresAt: nextExpiresAt },
                }),
              ]
            : []),
          prisma.subscription.update({
            where: { id: sub.id },
            data: {
              amount: standardPriceNaira,
              expiresAt: nextExpiresAt,
              status: 'active',
            },
          }),
          prisma.paymentTransaction.create({
            data: {
              userId: sub.userId,
              subscriptionId: sub.id,
              reference: renewalRef,
              amount: standardPriceNaira,
              currency: 'NGN',
              status: 'success',
              channel: 'card',
              paidAt: new Date(),
              metadata: {
                ...meta,
                isDiscounted: false,
                standardPrice: standardPriceNaira,
                renewalAmount: standardPriceNaira,
                autoRenew: true,
                authorizationCode: nextAuthCode,
              } as any,
            },
          }),
        ])

        await notify(sub.userId, 'plan_change', {
          title: 'Scholar Subscription Auto-Renewed 🔄',
          body: `Your ${planConfig.name} has been renewed at the standard rate of ₦${standardPriceNaira.toLocaleString()} until ${nextExpiresAt.toLocaleDateString()}.`,
          deeplink: '/settings?tab=plan',
        })

        renewedCount += 1
      } else {
        throw new Error(`Renewal charge returned status: ${chargeResult.status}`)
      }
    } catch (err) {
      logger.warn({ err, subscriptionId: sub.id, userId: sub.userId }, 'Auto-renewal charge failed; marking expired')
      await prisma.$transaction([
        prisma.subscription.update({
          where: { id: sub.id },
          data: { status: 'expired' },
        }),
        prisma.user.update({
          where: { id: sub.userId },
          data: { plan: 'free' },
        }),
      ])
    }
  }

  return renewedCount
}

/**
 * Gets the current active subscription and payment history for a user
 */
export async function getCurrentSubscription(
  userId: string,
): Promise<CurrentSubscriptionResponse> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true, planExpiresAt: true, createdAt: true },
  })
  if (!user) throw new NotFoundError('User not found')

  const now = new Date()

  // If expired, attempt auto-renewal first before downgrading
  if (user.plan === 'scholar' && user.planExpiresAt && user.planExpiresAt.getTime() <= now.getTime()) {
    await processDueSubscriptionRenewals().catch(() => {})
    const refreshed = await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true, planExpiresAt: true },
    })
    if (refreshed) {
      user.plan = refreshed.plan
      user.planExpiresAt = refreshed.planExpiresAt
    }
  }

  const isActive =
    user.plan === 'scholar' &&
    Boolean(user.planExpiresAt && user.planExpiresAt.getTime() > now.getTime())

  let daysRemaining = 0
  if (isActive && user.planExpiresAt) {
    const diffMs = user.planExpiresAt.getTime() - now.getTime()
    daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)))
  }

  const [activeSub, history, discountCheck] = await Promise.all([
    prisma.subscription.findFirst({
      where: {
        userId,
        status: 'active',
        expiresAt: { gt: now },
      },
      orderBy: { expiresAt: 'desc' },
      include: {
        payments: {
          where: { status: 'success' },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    }),
    prisma.paymentTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
    checkWelcomeDiscountEligibility(userId),
  ])

  const activePlanId = (activeSub?.plan as SubscriptionPlanId) || 'scholar_basic'
  const activePlanConfig = SUBSCRIPTION_PLANS[activePlanId] || SUBSCRIPTION_PLANS.scholar_basic
  const latestMeta = (activeSub?.payments?.[0]?.metadata ?? {}) as StoredPaymentMetadata

  return {
    plan: user.plan,
    planExpiresAt: user.planExpiresAt ? user.planExpiresAt.toISOString() : null,
    isActive,
    daysRemaining,
    discountEligible: discountCheck.eligible,
    discountExpiresAt: discountCheck.eligible ? discountCheck.expiresAt.toISOString() : null,
    discountPercent: WELCOME_DISCOUNT_PERCENT,
    activeSubscription: activeSub
      ? {
          id: activeSub.id,
          plan: activePlanId,
          planName: activePlanConfig.name || activeSub.plan,
          amount: activeSub.amount,
          renewalAmount: latestMeta.renewalAmount ?? activePlanConfig.price,
          isDiscounted: Boolean(latestMeta.isDiscounted),
          autoRenew: latestMeta.autoRenew ?? !activeSub.isGift,
          cardLast4: latestMeta.cardLast4 ?? null,
          cardBrand: latestMeta.cardBrand ?? null,
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
    include: {
      payments: {
        where: { status: 'success' },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
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

  if (activeSub.payments[0]) {
    const prevMeta = (activeSub.payments[0].metadata ?? {}) as StoredPaymentMetadata
    await prisma.paymentTransaction.update({
      where: { id: activeSub.payments[0].id },
      data: {
        metadata: { ...prevMeta, autoRenew: false } as any,
      },
    })
  }

  await notify(userId, 'plan_change', {
    title: 'Subscription Cancelled',
    body: `Your Scholar subscription auto-renewal has been cancelled. You will retain Scholar access until ${activeSub.expiresAt.toLocaleDateString()}.`,
    deeplink: '/settings?tab=plan',
  })

  return {
    success: true,
    message: 'Subscription auto-renewal has been cancelled. Your access will continue until the end of your billing cycle.',
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
