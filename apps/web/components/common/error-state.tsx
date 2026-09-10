'use client'

import { CloudCross, Danger, Refresh2, WifiSquare } from 'iconsax-reactjs'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'

export type ErrorKind = 'offline' | 'server' | 'notFound' | 'generic'

interface ErrorStateProps {
  kind?: ErrorKind
  title?: string
  message?: string
  /** Omit to hide the retry button (e.g. for a 404). */
  onRetry?: () => void
  /** Shown when there is cached content behind the error. */
  onDismiss?: () => void
  className?: string
  compact?: boolean
}

const PRESETS: Record<ErrorKind, { icon: typeof Danger; title: string; message: string }> = {
  offline: {
    icon: WifiSquare,
    title: 'You are offline',
    message:
      'We could not reach Propella. Anything you have already opened stays available, and this will refresh once you are back online.',
  },
  server: {
    icon: CloudCross,
    title: 'We cannot load this right now',
    message:
      'Propella is not responding. This is on our side, not yours — please try again in a moment.',
  },
  notFound: {
    icon: Danger,
    title: 'We could not find that',
    message: 'The page or item you were looking for is not here any more.',
  },
  generic: {
    icon: Danger,
    title: 'Something went wrong',
    message: 'That did not load as expected. Try again, and let us know if it keeps happening.',
  },
}

/**
 * Shown when data cannot be loaded and there is nothing cached to fall back on.
 *
 * Wording follows the brand voice: it says plainly what happened, puts the
 * blame on the system rather than the student, and always offers a way forward.
 */
export function ErrorState({
  kind = 'generic',
  title,
  message,
  onRetry,
  onDismiss,
  className,
  compact = false,
}: ErrorStateProps) {
  const preset = PRESETS[kind]
  const Icon = preset.icon

  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center gap-3 text-center',
        'rounded-[var(--radius-md)] border border-dashed border-[var(--color-rule-2)]',
        compact ? 'px-4 py-6' : 'px-6 py-12',
        className,
      )}
    >
      <div
        className="flex items-center justify-center rounded-full"
        style={{
          width: compact ? 36 : 44,
          height: compact ? 36 : 44,
          backgroundColor: 'var(--color-warning-tint)',
          color: 'var(--color-warning)',
        }}
      >
        <Icon size={compact ? 18 : 22} color="currentColor" variant="Linear" />
      </div>

      <p
        className="text-[15px] font-semibold text-[var(--color-ink)]"
        style={{ fontFamily: 'var(--font-sans)' }}
      >
        {title ?? preset.title}
      </p>

      <p className="max-w-[340px] text-[13.5px] leading-[1.6] text-[var(--color-ink-2)]">
        {message ?? preset.message}
      </p>

      {(onRetry || onDismiss) && (
        <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
          {onRetry && (
            <Button variant="secondary" size="sm" onClick={onRetry}>
              <Refresh2 size={14} color="currentColor" variant="Linear" />
              Try again
            </Button>
          )}
          {onDismiss && (
            <Button variant="ghost" size="sm" onClick={onDismiss}>
              Show saved copy
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

/** Picks the right preset from whatever the query layer threw. */
export function errorKindFrom(error: unknown, online = true): ErrorKind {
  if (!online) return 'offline'
  if (error instanceof Error) {
    const text = error.message.toLowerCase()
    if (text.includes('not found')) return 'notFound'
    if (text.includes('failed to fetch') || text.includes('network')) return 'offline'
  }
  return 'server'
}
