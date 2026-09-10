'use client'

import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'
import { api } from '@/lib/api-client'

/**
 * Web push subscription for the current browser.
 *
 * The whole flow is optional: without a VAPID key, without a service worker, or
 * on a browser that has no Push API (notably iOS Safari outside an installed
 * PWA), `supported` is false and the UI simply does not offer notifications.
 */

export type PushPermission = 'default' | 'granted' | 'denied'

export interface UsePushResult {
  supported: boolean
  permission: PushPermission
  subscribed: boolean
  busy: boolean
  error: string | null
  subscribe: () => Promise<void>
  unsubscribe: () => Promise<void>
  sendTest: () => Promise<void>
}

/** VAPID keys travel as base64url; the Push API wants raw bytes. */
function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const normalized = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = window.atob(normalized)
  const output = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i)
  return output
}

/** Capabilities and permission are read on demand, so nothing to subscribe to. */
const noopSubscribe = () => () => {}

function isPushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    typeof Notification !== 'undefined'
  )
}

export function usePushNotifications(): UsePushResult {
  // Read through useSyncExternalStore rather than an effect: the server renders
  // "unsupported" and the client has the real answer on its first render.
  const supported = useSyncExternalStore(noopSubscribe, isPushSupported, () => false)

  // getSnapshot runs on every render, so a permission the student changed in
  // browser settings is picked up on the next render without an event.
  const permission = useSyncExternalStore<PushPermission>(
    noopSubscribe,
    () => (typeof Notification === 'undefined' ? 'default' : (Notification.permission as PushPermission)),
    () => 'default',
  )

  const [subscribed, setSubscribed] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Whether this device already holds a subscription can only be answered
  // asynchronously, via the service worker registration.
  useEffect(() => {
    if (!isPushSupported()) return
    let cancelled = false

    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => {
        if (!cancelled) setSubscribed(sub !== null)
      })
      .catch(() => {
        /* no registration yet — the student has simply not subscribed */
      })

    return () => {
      cancelled = true
    }
  }, [])

  const subscribe = useCallback(async () => {
    setError(null)
    setBusy(true)

    try {
      const permissionResult = await Notification.requestPermission()

      if (permissionResult !== 'granted') {
        setError(
          permissionResult === 'denied'
            ? 'Notifications are blocked for this site. You can turn them back on in your browser settings.'
            : 'Notifications were not enabled.',
        )
        return
      }

      const publicKey = process.env['NEXT_PUBLIC_VAPID_PUBLIC_KEY']
      if (!publicKey) {
        setError('Notifications are not configured yet.')
        return
      }

      const registration = await navigator.serviceWorker.ready

      // Reuse an existing subscription rather than creating a second one for
      // the same device; the browser errors if the key differs.
      const existing = await registration.pushManager.getSubscription()
      const subscription =
        existing ??
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
        }))

      await api.post('/notifications/push/subscribe', subscription.toJSON())
      setSubscribed(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not turn on notifications.')
    } finally {
      setBusy(false)
    }
  }, [])

  const unsubscribe = useCallback(async () => {
    setError(null)
    setBusy(true)

    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        // Tell the server first: if the local unsubscribe succeeds but the row
        // survives, the student keeps getting pushes they cannot switch off.
        await api
          .post('/notifications/push/unsubscribe', { endpoint: subscription.endpoint })
          .catch(() => undefined)
        await subscription.unsubscribe()
      }

      setSubscribed(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not turn off notifications.')
    } finally {
      setBusy(false)
    }
  }, [])

  const sendTest = useCallback(async () => {
    setError(null)
    try {
      await api.post('/notifications/push/test')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send a test notification.')
    }
  }, [])

  return { supported, permission, subscribed, busy, error, subscribe, unsubscribe, sendTest }
}
