'use client'

import { useEffect } from 'react'
import { useRouter } from '@/lib/i18n/navigation'

/**
 * Marathon runs no longer take over the screen — they live in the floating
 * widget mounted in the app shell (components/marathon/marathon-widget.tsx).
 *
 * This route is kept only so existing links and browser history land somewhere
 * sensible instead of 404-ing.
 */
export default function LegacyMarathonRunPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/dashboard')
  }, [router])

  return null
}
