'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { api } from '@/lib/api-client'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Cup } from 'iconsax-reactjs'
import { EmptyState } from '@/components/common/empty-state'
import { useAuthStore } from '@/lib/stores/auth-store'

type Period = 'week' | 'month' | 'all'

interface LeaderboardEntry {
  rank: number
  userId: string
  name: string
  xp: number
  rankName: string
}

interface LeaderboardData {
  entries: LeaderboardEntry[]
  myEntry: LeaderboardEntry | null
}

const PERIOD_KEYS: Record<Period, 'weekly' | 'monthly' | 'allTime'> = {
  week: 'weekly',
  month: 'monthly',
  all: 'allTime',
}

function rankBadgeVariant(rank: number): 'default' | 'accent' | 'success' | 'warning' {
  if (rank === 1) return 'accent'
  if (rank <= 3) return 'success'
  if (rank <= 10) return 'warning'
  return 'default'
}

function RankNumber({ rank }: { rank: number }) {
  const isTop3 = rank <= 3
  return (
    <span
      style={{
        fontFamily: 'var(--font-display)',
        fontSize: isTop3 ? 20 : 15,
        fontWeight: 500,
        color: isTop3 ? 'var(--color-accent)' : 'var(--color-ink-3)',
        width: 32,
        textAlign: 'center',
        flexShrink: 0,
      }}
    >
      {rank}
    </span>
  )
}

function LeaderboardRow({
  entry,
  isMe,
}: {
  entry: LeaderboardEntry
  isMe: boolean
}) {
  const t = useTranslations('leaderboard')
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '12px 16px',
        borderRadius: 'var(--radius-sm)',
        backgroundColor: isMe ? 'var(--color-accent-tint)' : 'transparent',
        border: isMe ? '1px solid var(--color-accent)' : '1px solid transparent',
        marginBottom: 4,
      }}
    >
      <RankNumber rank={entry.rank} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 14,
            fontWeight: isMe ? 600 : 500,
            color: isMe ? 'var(--color-accent)' : 'var(--color-ink)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {entry.name}
          {isMe && (
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                color: 'var(--color-accent)',
                marginLeft: 8,
              }}
            >
              ({t('you')})
            </span>
          )}
        </p>
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--color-ink-3)',
            marginTop: 2,
          }}
        >
          {entry.rankName}
        </p>
      </div>
      <span
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 16,
          fontWeight: 500,
          color: isMe ? 'var(--color-accent)' : 'var(--color-ink)',
          flexShrink: 0,
        }}
      >
        {t('xp', { xp: entry.xp.toLocaleString() })}
      </span>
    </div>
  )
}

export default function LeaderboardPage() {
  const [period, setPeriod] = useState<Period>('week')
  const user = useAuthStore((s) => s.user)
  const t = useTranslations('leaderboard')

  const { data, isLoading } = useQuery({
    queryKey: ['leaderboard', period],
    queryFn: () =>
      api
        .get<{ data: LeaderboardData }>(`/leaderboard?period=${period}`)
        .then((r) => r.data),
  })

  const myEntry = data?.myEntry
  const entries = data?.entries ?? []
  const myInTop10 = myEntry ? myEntry.rank <= 10 : false

  return (
    <div style={{ margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 40,
            fontWeight: 500,
            color: 'var(--color-ink)',
            marginBottom: 8,
          }}
        >
          {t('title')}
        </h1>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 15, color: 'var(--color-ink-2)' }}>
          See how you stack up against other students.
        </p>
      </div>

      {/* Period tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {(Object.keys(PERIOD_KEYS) as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            style={{
              padding: '8px 18px',
              borderRadius: 999,
              border: period === p ? '2px solid var(--color-accent)' : '2px solid var(--color-rule-2)',
              backgroundColor: period === p ? 'var(--color-accent-tint)' : 'var(--color-paper)',
              color: period === p ? 'var(--color-accent)' : 'var(--color-ink-2)',
              fontFamily: 'var(--font-sans)',
              fontWeight: 500,
              fontSize: 13,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {t(PERIOD_KEYS[p])}
          </button>
        ))}
      </div>

      {/* My position (if outside top 10) */}
      {myEntry && !myInTop10 && !isLoading && (
        <Card style={{ marginBottom: 20, borderColor: 'var(--color-accent)' }}>
          <CardContent style={{ paddingTop: 16, paddingBottom: 16 }}>
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                color: 'var(--color-ink-3)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: 8,
              }}
            >
              Your position
            </p>
            <LeaderboardRow entry={myEntry} isMe />
          </CardContent>
        </Card>
      )}

      {/* Main table */}
      <Card>
        <CardContent style={{ paddingTop: 20 }}>
          {isLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : entries.length === 0 ? (
            <EmptyState
              icon={Cup}
              title="Nobody on the board yet"
              message="Study a topic or finish a quiz to earn your first XP and appear here."
            />
          ) : (
            entries.map((entry) => (
              <LeaderboardRow
                key={entry.userId}
                entry={entry}
                isMe={entry.userId === (user as { id?: string } | null)?.id}
              />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
