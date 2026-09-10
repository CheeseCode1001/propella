'use client'

import { useEffect } from 'react'

/**
 * Registers the service worker in public/sw.js.
 *
 * Skipped in development: Next's dev server serves uncached, constantly
 * changing bundles, and a worker sitting in front of them causes stale-asset
 * errors that look like real bugs.
 */
export function PWARegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return

    const onLoad = () => {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((registration) => {
          // Activate a new worker as soon as one is waiting, so users are not
          // stuck on a stale build until every tab closes.
          registration.addEventListener('updatefound', () => {
            const installing = registration.installing
            if (!installing) return
            installing.addEventListener('statechange', () => {
              if (installing.state === 'installed' && navigator.serviceWorker.controller) {
                installing.postMessage('SKIP_WAITING')
              }
            })
          })
        })
        .catch(() => {
          // Registration failing only costs offline support; the app still works.
        })
    }

    if (document.readyState === 'complete') onLoad()
    else window.addEventListener('load', onLoad)

    return () => window.removeEventListener('load', onLoad)
  }, [])

  return null
}
