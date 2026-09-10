'use client'

import { useEffect, useRef, useState } from 'react'
import { WifiSquare } from 'iconsax-reactjs'
import { useOnlineStatus } from '@/lib/hooks/use-online-status'

/**
 * A quiet strip telling the student the app is running on saved data.
 *
 * It stays out of the way — no modal, nothing blocked — because everything they
 * have already opened still works offline.
 */
export function OfflineBanner() {
  const online = useOnlineStatus()
  const [showRestored, setShowRestored] = useState(false)

  // Remembering the previous value in a ref rather than state keeps the
  // reconnection check out of the render cycle.
  const wasOffline = useRef(false)

  useEffect(() => {
    if (!online) {
      wasOffline.current = true
      return
    }

    if (!wasOffline.current) return
    wasOffline.current = false

    // Confirm the reconnection briefly, then get out of the way.
    setShowRestored(true)
    const timer = setTimeout(() => setShowRestored(false), 3000)
    return () => clearTimeout(timer)
  }, [online])

  if (online && !showRestored) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center justify-center gap-2 px-4 py-1.5 text-[12.5px] font-medium"
      style={{
        backgroundColor: online ? 'var(--color-success-tint)' : 'var(--color-warning-tint)',
        color: online ? 'var(--color-success)' : 'var(--color-warning)',
        fontFamily: 'var(--font-sans)',
      }}
    >
      <WifiSquare size={14} color="currentColor" variant="Linear" />
      {online ? 'Back online — everything is syncing.' : 'Offline. Showing your saved work.'}
    </div>
  )
}
