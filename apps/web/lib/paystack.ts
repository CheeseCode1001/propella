import { api } from './api-client'
import type { SubscriptionPlanId } from '@propella/shared'

export interface CheckoutOptions {
  plan: SubscriptionPlanId
  isGift?: boolean
  giftRecipientEmail?: string
  giftRecipientName?: string
  giftMessage?: string
  onSuccess?: (reference: string) => void
  onCancel?: () => void
}

declare global {
  interface Window {
    PaystackPop?: {
      setup: (options: any) => { openIframe: () => void }
    }
  }
}

export function loadPaystackScript(): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false)
  if (window.PaystackPop) return Promise.resolve(true)

  return new Promise((resolve) => {
    const existing = document.getElementById('paystack-inline-js')
    if (existing) {
      resolve(true)
      return
    }
    const script = document.createElement('script')
    script.id = 'paystack-inline-js'
    script.src = 'https://js.paystack.co/v1/inline.js'
    script.async = true
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export async function startPaystackCheckout(options: CheckoutOptions) {
  const res = await api.post<{
    data: {
      authorizationUrl: string
      accessCode: string
      reference: string
      amount: number
      plan: string
    }
  }>('/subscriptions/initialize', {
    plan: options.plan,
    isGift: options.isGift,
    giftRecipientEmail: options.giftRecipientEmail,
    giftRecipientName: options.giftRecipientName,
    giftMessage: options.giftMessage,
  })

  const { authorizationUrl, accessCode, reference } = res.data
  const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY?.trim()

  // If public key is available, attempt seamless Paystack popup iframe
  if (publicKey && typeof window !== 'undefined') {
    const loaded = await loadPaystackScript()
    if (loaded && window.PaystackPop) {
      const handler = window.PaystackPop.setup({
        key: publicKey,
        access_code: accessCode,
        callback: (response: { reference: string }) => {
          if (options.onSuccess) {
            options.onSuccess(response.reference || reference)
          } else {
            window.location.href = `/settings?tab=plan&payment=callback&ref=${response.reference || reference}`
          }
        },
        onClose: () => {
          options.onCancel?.()
        },
      })
      handler.openIframe()
      return { type: 'popup' as const, reference }
    }
  }

  // Reliable checkout redirect (works across all browsers, mobile Safari, etc.)
  if (typeof window !== 'undefined' && authorizationUrl) {
    window.location.href = authorizationUrl
    return { type: 'redirect' as const, reference, url: authorizationUrl }
  }

  return { type: 'unknown' as const, reference }
}
