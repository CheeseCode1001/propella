'use client'

import { useEffect } from 'react'
import { ErrorState } from '@/components/common/error-state'

export default function AssistantError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Assistant error:', error)
  }, [error])

  return (
    <div className="flex h-full w-full flex-1 items-center justify-center p-6">
      <ErrorState
        kind="server"
        title="Could not load the assistant"
        message="Something went wrong while loading the AI assistant. Click try again to reload."
        onRetry={reset}
      />
    </div>
  )
}
