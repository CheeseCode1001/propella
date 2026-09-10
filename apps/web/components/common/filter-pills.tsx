'use client'

import { cn } from '@/lib/utils/cn'

export interface FilterPillOption<T extends string> {
  value: T
  label: string
}

interface FilterPillsProps<T extends string> {
  /** Small caps heading above the row, e.g. "Exam" or "Subject". */
  label?: string
  options: FilterPillOption<T>[]
  value: T
  onChange: (value: T) => void
  className?: string
}

/**
 * A single row of selectable pills.
 *
 * On narrow screens the row scrolls sideways instead of wrapping onto several
 * lines, so the filters never push the content they belong to off the screen.
 * The scrollbar is hidden — the partially visible pill at the edge is the
 * affordance.
 */
export function FilterPills<T extends string>({
  label,
  options,
  value,
  onChange,
  className,
}: FilterPillsProps<T>) {
  if (options.length === 0) return null

  return (
    <div className={className}>
      {label && (
        <p
          className="mb-2 text-[11px] font-semibold uppercase text-[var(--color-ink-3)]"
          style={{ fontFamily: 'var(--font-sans)', letterSpacing: '0.06em' }}
        >
          {label}
        </p>
      )}
      <div
        role="tablist"
        aria-label={label}
        className="scrollbar-hide -mx-1 flex gap-2 overflow-x-auto px-1 pb-0.5"
      >
        {options.map((option) => {
          const isActive = option.value === value
          return (
            <button
              key={option.value}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(option.value)}
              className={cn(
                'shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13px] font-medium',
                'cursor-pointer border-none transition-colors duration-150',
                isActive
                  ? 'bg-[var(--color-accent)] text-white'
                  : 'bg-[var(--color-paper-3)] text-[var(--color-ink-2)] hover:text-[var(--color-ink)]',
              )}
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
