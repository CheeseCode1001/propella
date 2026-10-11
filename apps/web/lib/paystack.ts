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
    PaystackPop?: any
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
    script.src = 'https://js.paystack.co/v2/inline.js'
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
      email?: string
    }
  }>('/subscriptions/initialize', {
    plan: options.plan,
    isGift: options.isGift,
    giftRecipientEmail: options.giftRecipientEmail,
    giftRecipientName: options.giftRecipientName,
    giftMessage: options.giftMessage,
  })

  const { authorizationUrl, accessCode, reference, email } = res.data
  const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY?.trim()

  // Attempt seamless Paystack v2 popup if available on window
  if (typeof window !== 'undefined') {
    const loaded = await loadPaystackScript()
    if (loaded && window.PaystackPop) {
      try {
        const popup = new window.PaystackPop()
        if (typeof popup.checkout === 'function') {
          popup.checkout({
            key: publicKey,
            email: email,
            accessCode: accessCode,
            onSuccess: (response: { reference?: string }) => {
              const ref = response?.reference || reference
              if (options.onSuccess) {
                options.onSuccess(ref)
              } else {
                window.location.href = `/settings?tab=plan&payment=callback&ref=${encodeURIComponent(ref)}`
              }
            },
            onCancel: () => {
              options.onCancel?.()
            },
          })
          return { type: 'popup' as const, reference }
        }
      } catch (err) {
        console.warn('Paystack popup initiation failed, falling back to direct redirect:', err)
      }
    }

    // Direct redirect to Paystack authorizationUrl (robust across all mobile and desktop browsers)
    if (authorizationUrl) {
      window.location.href = authorizationUrl
      return { type: 'redirect' as const, reference, url: authorizationUrl }
    }
  }

  return { type: 'unknown' as const, reference }
}
