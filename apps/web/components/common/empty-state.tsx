'use client'

import type { Icon as IconsaxIcon } from 'iconsax-reactjs'
import { cn } from '@/lib/utils/cn'

interface EmptyStateProps {
  /** Iconsax glyph shown above the message. */
  icon?: IconsaxIcon
  title?: string
  /** Short sentence explaining what will appear here, and how to make it appear. */
  message: string
  action?: React.ReactNode
  className?: string
}

/**
 * The one empty state used across the app: dashed border, icon, a title and a
 * sentence that tells the student what to do next.
 *
 * Copy should follow the brand voice — encouraging, never making anyone feel
 * behind. "Nothing here yet" rather than "You have not done this".
 */
export function EmptyState({
  icon: Icon,
  title,
  message,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center gap-3',
        'rounded-[var(--radius-md)] border border-dashed border-[var(--color-rule-2)]',
        'px-6 py-12',
        className,
      )}
    >
      {Icon && (
        <div
          className="flex items-center justify-center rounded-full"
          style={{
            width: 44,
            height: 44,
            backgroundColor: 'var(--color-paper-3)',
            color: 'var(--color-ink-3)',
          }}
        >
          <Icon size={22} color="currentColor" variant="Linear" />
        </div>
      )}

      {title && (
        <p
          className="text-[15px] font-semibold text-[var(--color-ink)]"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          {title}
        </p>
      )}

      <p className="text-[13.5px] leading-[1.6] text-[var(--color-ink-2)] max-w-[320px]">
        {message}
      </p>

      {action && <div className="mt-1">{action}</div>}
    </div>
  )
}
