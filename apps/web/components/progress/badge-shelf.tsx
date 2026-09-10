'use client'

import { useQuery } from '@tanstack/react-query'
import {
  Flash,
  Book1,
  Clock,
  TaskSquare,
  Medal,
  BookSquare,
  Star1,
  Lock1,
  type Icon as IconsaxIcon,
} from 'iconsax-reactjs'
import { format } from 'date-fns'
import { api } from '@/lib/api-client'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface BadgeItem {
  badgeId: string
  name: string
  description: string
  category: string
  icon: string
  threshold: number
  earnedAt: string | null
  earnedValue: number | null
  progress: number
}

interface BadgesResponse {
  badges: BadgeItem[]
  earnedCount: number
  total: number
}

/** The catalogue names an Iconsax glyph; this resolves it to a component. */
const ICONS: Record<string, IconsaxIcon> = {
  Flash,
  Book1,
  Clock,
  TaskSquare,
  Medal,
  BookSquare,
  Star1,
}

function BadgeTile({ badge }: { badge: BadgeItem }) {
  const Icon = ICONS[badge.icon] ?? Medal
  const earned = badge.earnedAt !== null

  return (
    <div
      className="flex flex-col items-center gap-2 rounded-[var(--radius-md)] border p-3 text-center"
      style={{
        borderColor: earned ? 'var(--color-accent)' : 'var(--color-rule)',
        backgroundColor: earned ? 'var(--color-accent-tint)' : 'var(--color-paper-2)',
        // Unearned badges are visible but recede, so the shelf reads as
        // something to fill in rather than a list of things not done.
        opacity: earned ? 1 : 0.72,
      }}
      title={
        earned && badge.earnedAt
          ? `Earned ${format(new Date(badge.earnedAt), 'd MMM yyyy')}`
          : `${badge.progress}% of the way there`
      }
    >
      <div
        className="flex items-center justify-center rounded-full"
        style={{
          width: 42,
          height: 42,
          backgroundColor: earned ? 'var(--color-accent)' : 'var(--color-paper-3)',
          color: earned ? '#fff' : 'var(--color-ink-3)',
        }}
      >
        {earned ? (
          <Icon size={21} color="currentColor" variant="Bold" />
        ) : (
          <Lock1 size={18} color="currentColor" variant="Linear" />
        )}
      </div>

      <p
        className="text-[12.5px] font-semibold leading-[1.3] text-[var(--color-ink)]"
        style={{ fontFamily: 'var(--font-sans)' }}
      >
        {badge.name}
      </p>

      <p className="text-[11px] leading-[1.45] text-[var(--color-ink-3)]">{badge.description}</p>

      {earned ? (
        badge.earnedAt && (
          <p
            className="text-[10px] text-[var(--color-accent)]"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            {format(new Date(badge.earnedAt), 'd MMM yyyy')}
          </p>
        )
      ) : (
        <div className="mt-auto w-full">
          <div
            className="h-1 w-full overflow-hidden rounded-full"
            style={{ backgroundColor: 'var(--color-paper-3)' }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${badge.progress}%`,
                backgroundColor: 'var(--color-accent)',
              }}
            />
          </div>
          <p
            className="mt-1 text-[10px] text-[var(--color-ink-3)]"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            {badge.progress}%
          </p>
        </div>
      )}
    </div>
  )
}

/**
 * Achievements, earned and still to come.
 *
 * Shows the whole catalogue rather than only what has been earned — seeing the
 * next badge and how close it is gives a student something to aim at.
 */
export function BadgeShelf() {
  const { data, isLoading } = useQuery({
    queryKey: ['badges'],
    queryFn: () => api.get<{ data: BadgesResponse }>('/badges').then((r) => r.data),
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle style={{ fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
          Achievements
          {data && (
            <span
              className="ml-2 text-[12px] font-normal text-[var(--color-ink-3)]"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              {data.earnedCount}/{data.total}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-[150px] w-full rounded-[var(--radius-md)]" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {(data?.badges ?? []).map((badge) => (
              <BadgeTile key={badge.badgeId} badge={badge} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
