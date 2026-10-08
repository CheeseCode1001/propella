import crypto from 'crypto'
import { env } from '../../config/env'
import { AppError } from '../../middleware/error-handler'
import { logger } from '../../config/logger'

const PAYSTACK_BASE_URL = 'https://api.paystack.co'

export interface PaystackInitializeInput {
  email: string
  amount: number // in kobo (NGN * 100)
  reference: string
  callbackUrl: string
  planCode?: string | undefined
  metadata?: Record<string, unknown> | undefined
}

export interface PaystackInitializeResponse {
  authorization_url: string
  access_code: string
  reference: string
}

export interface PaystackVerifyResponse {
  id: number
  status: string // 'success' | 'failed' | 'abandoned'
  reference: string
  amount: number // in kobo
  currency: string
  channel?: string
  paid_at?: string
  customer?: {
    id: number
    email: string
    customer_code: string
  }
  authorization?: {
    authorization_code: string
    card_type: string
    last4: string
    bank?: string
    reusable?: boolean
  }
  plan?: string
  metadata?: Record<string, unknown>
}

function getSecretKey(): string {
  const key = env.PAYSTACK_SECRET_KEY?.trim()
  if (!key) {
    throw new AppError(
      503,
      'Paystack payment gateway is not configured. Please set PAYSTACK_SECRET_KEY in environment.',
    )
  }
  return key
}

/**
 * Initializes a transaction on Paystack
 */
export async function initializePaystackTransaction(
  input: PaystackInitializeInput,
): Promise<PaystackInitializeResponse> {
  const secretKey = getSecretKey()

  const payload: Record<string, unknown> = {
    email: input.email,
    amount: input.amount,
    reference: input.reference,
    callback_url: input.callbackUrl,
    metadata: input.metadata ?? {},
  }

  if (input.planCode) {
    payload['plan'] = input.planCode
  }

  logger.info({ reference: input.reference, email: input.email }, 'Initializing Paystack transaction')

  const res = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const json = (await res.json()) as {
    status: boolean
    message: string
    data?: PaystackInitializeResponse
  }

  if (!res.ok || !json.status || !json.data) {
    logger.error({ resStatus: res.status, errorJson: json }, 'Paystack initialization failed')
    throw new AppError(400, json.message || 'Failed to initialize payment with Paystack')
  }

  return json.data
}

/**
 * Verifies a transaction on Paystack by reference
 */
export async function verifyPaystackTransaction(
  reference: string,
): Promise<PaystackVerifyResponse> {
  const secretKey = getSecretKey()

  logger.info({ reference }, 'Verifying Paystack transaction')

  const res = await fetch(`${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
    },
  })

  const json = (await res.json()) as {
    status: boolean
    message: string
    data?: PaystackVerifyResponse
  }

  if (!res.ok || !json.status || !json.data) {
    logger.error({ reference, resStatus: res.status, errorJson: json }, 'Paystack verification failed')
    throw new AppError(400, json.message || 'Payment verification failed')
  }

  return json.data
}

/**
 * Verifies the Paystack webhook signature using HMAC-SHA512
 */
export function verifyPaystackWebhookSignature(
  rawBody: Buffer | string,
  signature: string | undefined,
): boolean {
  const secretKey = env.PAYSTACK_SECRET_KEY?.trim()
  if (!secretKey || !signature) return false

  try {
    const hash = crypto
      .createHmac('sha512', secretKey)
      .update(typeof rawBody === 'string' ? Buffer.from(rawBody, 'utf8') : rawBody)
      .digest('hex')

    return crypto.timingSafeEqual(Buffer.from(hash, 'utf8'), Buffer.from(signature, 'utf8'))
  } catch (err) {
    logger.warn({ err }, 'Error verifying Paystack webhook signature')
    return false
  }
}
