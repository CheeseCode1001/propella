/**
 * Propella service worker.
 *
 * Hand-written rather than generated: next-pwa does not support Next 16 with
 * Turbopack, and the caching rules here need to be deliberate — this app serves
 * per-user data, so nothing from the API is ever cached.
 *
 * Strategy
 *   navigations   network-first, falling back to cache, then /offline.html
 *   build assets  cache-first (immutable, content-hashed by Next)
 *   other GETs    stale-while-revalidate
 *   API + auth    never cached, never intercepted
 */

const VERSION = 'v1'
const SHELL_CACHE = `propella-shell-${VERSION}`
const ASSET_CACHE = `propella-assets-${VERSION}`
const OFFLINE_URL = '/offline.html'

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll([OFFLINE_URL]))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== SHELL_CACHE && key !== ASSET_CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  )
})

// Lets a freshly deployed worker take over without waiting for every tab to close.
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting()
})

/** Anything user-specific or authenticated must bypass the cache entirely. */
function isPrivate(url) {
  return (
    url.pathname.startsWith('/api/') ||
    url.pathname.includes('/auth/') ||
    url.pathname.startsWith('/_next/image')
  )
}

function isBuildAsset(url) {
  return url.pathname.startsWith('/_next/static/')
}

self.addEventListener('fetch', (event) => {
  const { request } = event

  // Only plain GETs are cacheable; leave everything else to the network.
  if (request.method !== 'GET') return

  const url = new URL(request.url)

  // Cross-origin (including the API on :5000) is never touched.
  if (url.origin !== self.location.origin) return
  if (isPrivate(url)) return

  // Content-hashed build output never changes — serve from cache when present.
  if (isBuildAsset(url)) {
    event.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ||
          fetch(request).then((res) => {
            if (res.ok) {
              const copy = res.clone()
              void caches.open(ASSET_CACHE).then((c) => c.put(request, copy))
            }
            return res
          }),
      ),
    )
    return
  }

  // Page loads: prefer the network so content is fresh, fall back when offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone()
          void caches.open(SHELL_CACHE).then((c) => c.put(request, copy))
          return res
        })
        .catch(async () => {
          const cached = await caches.match(request)
          return cached || caches.match(OFFLINE_URL)
        }),
    )
    return
  }

  // Everything else: serve what we have, refresh in the background.
  event.respondWith(
    caches.match(request).then((hit) => {
      const network = fetch(request)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone()
            void caches.open(ASSET_CACHE).then((c) => c.put(request, copy))
          }
          return res
        })
        .catch(() => hit)
      return hit || network
    }),
  )
})

/* -------------------------------------------------------------------------- */
/* Push notifications                                                          */
/* -------------------------------------------------------------------------- */

self.addEventListener('push', (event) => {
  if (!event.data) return

  let payload
  try {
    payload = event.data.json()
  } catch {
    // A push service can deliver a bare string; still worth showing.
    payload = { title: 'Propella', body: event.data.text() }
  }

  const title = payload.title || 'Propella'
  const options = {
    body: payload.body || '',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    // Same tag replaces the previous notification instead of stacking.
    tag: payload.tag || 'propella',
    renotify: true,
    data: { url: payload.url || '/dashboard' },
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const target = event.notification.data && event.notification.data.url
  const url = target || '/dashboard'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      // Focus an open tab rather than piling up new ones.
      for (const client of clients) {
        if ('focus' in client) {
          client.navigate(url).catch(() => {})
          return client.focus()
        }
      }
      return self.clients.openWindow(url)
    }),
  )
})
