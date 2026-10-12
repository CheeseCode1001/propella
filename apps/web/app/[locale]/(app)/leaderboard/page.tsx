'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { api } from '@/lib/api-client'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Cup } from 'iconsax-reactjs'
import { Crown, Star, Sparkles, Trophy } from 'lucide-react'
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

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <div
        className="relative flex items-center justify-center shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500 text-amber-950 shadow-[0_2px_12px_rgba(245,158,11,0.55)] ring-2 ring-amber-400 animate-pulse"
        title="Rank 1 Golden Crown"
      >
        <Crown className="w-5 h-5 text-amber-950 fill-amber-900 drop-shadow-sm" />
      </div>
    )
  }
  if (rank === 2) {
    return (
      <div
        className="relative flex items-center justify-center shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 text-slate-800 dark:text-slate-100 shadow-sm ring-1 ring-slate-300 dark:ring-slate-600"
        title="Rank 2 Star"
      >
        <div className="flex items-center gap-0.5">
          <span className="font-mono text-xs font-bold">2</span>
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
        </div>
      </div>
    )
  }
  if (rank === 3) {
    return (
      <div
        className="relative flex items-center justify-center shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-amber-100 to-amber-200/80 dark:from-amber-950/60 dark:to-amber-900/60 text-amber-900 dark:text-amber-200 shadow-sm ring-1 ring-amber-300/60"
        title="Rank 3 Star"
      >
        <div className="flex items-center gap-0.5">
          <span className="font-mono text-xs font-bold">3</span>
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
        </div>
      </div>
    )
  }
  return (
    <div className="flex items-center justify-center gap-1 shrink-0 w-9 text-center">
      <span className="font-mono text-xs font-semibold text-[var(--color-ink-3)]">{rank}</span>
      <Star className="w-3 h-3 text-amber-400 fill-amber-400/90 shrink-0" />
    </div>
  )
}

function PodiumCard({
  entry,
  isMe,
  position,
}: {
  entry: LeaderboardEntry
  isMe: boolean
  position: 1 | 2 | 3
}) {
  const isFirst = position === 1
  return (
    <div
      className={`relative flex flex-col items-center justify-end p-4 rounded-2xl border transition-all ${
        isFirst
          ? 'bg-gradient-to-b from-amber-500/15 via-amber-400/5 to-transparent border-amber-400/60 shadow-[0_4px_24px_rgba(245,158,11,0.2)] order-2 pb-6 min-h-[220px]'
          : position === 2
            ? 'bg-gradient-to-b from-slate-200/20 to-transparent border-slate-300 dark:border-slate-700 order-1 min-h-[190px]'
            : 'bg-gradient-to-b from-amber-700/10 to-transparent border-amber-600/30 order-3 min-h-[180px]'
      }`}
    >
      {/* Crown on #1 or Stars on #2 & #3 */}
      {isFirst ? (
        <div className="relative mb-2 flex flex-col items-center">
          <Crown className="w-9 h-9 text-amber-500 fill-amber-400 drop-shadow-[0_2px_10px_rgba(245,158,11,0.7)] animate-bounce" />
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500 flex items-center justify-center text-amber-950 font-bold text-xl shadow-lg ring-4 ring-amber-300/50 mt-1">
            {entry.name.charAt(0).toUpperCase()}
          </div>
          <span className="absolute bottom-0 right-0 px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-600 text-white shadow">
            #1
          </span>
        </div>
      ) : (
        <div className="relative mb-2 flex flex-col items-center">
          <Star className="w-5 h-5 text-amber-400 fill-amber-400 mb-1" />
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-base shadow-sm ring-2 ${
              position === 2
                ? 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 ring-slate-300 dark:ring-slate-600'
                : 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 ring-amber-400/30'
            }`}
          >
            {entry.name.charAt(0).toUpperCase()}
          </div>
          <span
            className={`absolute bottom-0 right-0 px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold shadow ${
              position === 2 ? 'bg-slate-600 text-white' : 'bg-amber-800 text-amber-100'
            }`}
          >
            #{position}
          </span>
        </div>
      )}

      <p className="text-sm font-semibold text-[var(--color-ink)] truncate max-w-[120px] text-center mt-1">
        {entry.name}
      </p>
      <p className="text-[11px] font-mono text-[var(--color-ink-3)] mb-2">
        {entry.rankName}
      </p>
      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[var(--color-paper-2)] border border-[var(--color-rule)] text-xs font-mono font-bold text-[var(--color-accent)] shadow-sm">
        {isFirst ? (
          <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
        ) : (
          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
        )}
        {entry.xp.toLocaleString()} XP
      </div>
    </div>
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
  const isFirst = entry.rank === 1

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '12px 16px',
        borderRadius: 'var(--radius-sm)',
        backgroundColor: isMe
          ? 'var(--color-accent-tint)'
          : isFirst
            ? 'rgba(245, 158, 11, 0.08)'
            : 'transparent',
        border: isMe
          ? '1px solid var(--color-accent)'
          : isFirst
            ? '1px solid rgba(245, 158, 11, 0.45)'
            : '1px solid transparent',
        marginBottom: 4,
      }}
      className="transition-colors hover:bg-[var(--color-paper-2)]/60"
    >
      <RankBadge rank={entry.rank} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="flex items-center gap-2">
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 14,
              fontWeight: isMe || isFirst ? 600 : 500,
              color: isMe ? 'var(--color-accent)' : 'var(--color-ink)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {entry.name}
          </p>

          {/* Golden Crown badge for #1 */}
          {isFirst && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-400/40 shrink-0">
              <Crown className="w-3 h-3 text-amber-500 fill-amber-400" />
              Champion
            </span>
          )}

          {/* Star badge for others */}
          {!isFirst && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.2 text-[11px] font-mono text-amber-500 shrink-0" title={`Rank ${entry.rank}`}>
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            </span>
          )}

          {isMe && (
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                color: 'var(--color-accent)',
              }}
            >
              ({t('you')})
            </span>
          )}
        </div>
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
          color: isMe ? 'var(--color-accent)' : isFirst ? '#D97706' : 'var(--color-ink)',
          flexShrink: 0,
        }}
        className="flex items-center gap-1.5 font-mono"
      >
        {isFirst && <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />}
        {!isFirst && <Star className="w-3 h-3 text-amber-400 fill-amber-400" />}
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

      {/* Top 3 Podium */}
      {!isLoading && entries.length >= 3 && (
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6 items-end">
          {entries[1] && (
            <PodiumCard
              entry={entries[1]}
              isMe={entries[1].userId === (user as { id?: string } | null)?.id}
              position={2}
            />
          )}
          {entries[0] && (
            <PodiumCard
              entry={entries[0]}
              isMe={entries[0].userId === (user as { id?: string } | null)?.id}
              position={1}
            />
          )}
          {entries[2] && (
            <PodiumCard
              entry={entries[2]}
              isMe={entries[2].userId === (user as { id?: string } | null)?.id}
              position={3}
            />
          )}
        </div>
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
