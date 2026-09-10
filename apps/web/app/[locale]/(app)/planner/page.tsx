'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  eachDayOfInterval,
  format,
  isSameDay,
  parseISO,
} from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useRoadmap } from '@/lib/hooks/use-roadmap'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { KanbanBoard } from '@/components/planner/kanban-board'
import type { RoadmapNode } from '@propella/shared'

function getSubjectColor(slug: string): string {
  const map: Record<string, string> = {
    english: 'var(--color-subj-english)',
    mathematics: 'var(--color-subj-math)',
    physics: 'var(--color-subj-physics)',
    chemistry: 'var(--color-subj-chemistry)',
    biology: 'var(--color-subj-biology)',
    economics: 'var(--color-subj-economics)',
    government: 'var(--color-subj-government)',
    literature: 'var(--color-subj-literature)',
  }
  return map[slug] ?? 'var(--color-subj-default, var(--color-accent))'
}

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function PlannerPage() {
  const router = useRouter()
  const t = useTranslations('planner')
  const [weekStart, setWeekStart] = useState<Date>(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 }),
  )
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week')
  const [selectedDayIndex, setSelectedDayIndex] = useState(0)
  const [selectedNode, setSelectedNode] = useState<RoadmapNode | null>(null)

  const { data: roadmap, isLoading } = useRoadmap()

  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd })

  // Group nodes by planned start date within this week
  function getNodesForDay(day: Date): RoadmapNode[] {
    if (!roadmap?.nodes) return []
    return roadmap.nodes.filter((node) => {
      const planned = parseISO(node.plannedStartDate)
      return isSameDay(planned, day)
    })
  }

  function handlePrevWeek() {
    setWeekStart((w) => subWeeks(w, 1))
  }

  function handleNextWeek() {
    setWeekStart((w) => addWeeks(w, 1))
  }

  const displayDays = viewMode === 'day' ? [days[selectedDayIndex]!] : days

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 28,
              fontWeight: 500,
              color: 'var(--color-ink)',
              marginBottom: 4,
            }}
          >
            {t('title')}
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 13,
              color: 'var(--color-ink-3)',
            }}
          >
            {format(weekStart, 'MMMM d')} – {format(weekEnd, 'MMMM d, yyyy')}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* View toggle */}
          <div
            style={{
              display: 'inline-flex',
              backgroundColor: 'var(--color-paper-2)',
              borderRadius: 'var(--radius-sm)',
              padding: 2,
              border: '1px solid var(--color-rule)',
            }}
          >
            {(['week', 'day'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                style={{
                  padding: '4px 12px',
                  fontSize: 12,
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 500,
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor:
                    viewMode === mode ? 'var(--color-ink)' : 'transparent',
                  color:
                    viewMode === mode ? 'var(--color-paper)' : 'var(--color-ink-2)',
                  transition: 'all 0.15s',
                }}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>

          {/* Week navigation */}
          <Button variant="secondary" size="sm" onClick={handlePrevWeek}>
            <ChevronLeft size={14} />
          </Button>
          <Button variant="secondary" size="sm" onClick={handleNextWeek}>
            <ChevronRight size={14} />
          </Button>
        </div>
      </div>

      {/* Day navigation for day view (mobile-style) */}
      {viewMode === 'day' && (
        <div
          style={{
            display: 'flex',
            gap: 6,
            marginBottom: 16,
            overflowX: 'auto',
            paddingBottom: 4,
          }}
        >
          {days.map((day, idx) => (
            <button
              key={day.toISOString()}
              onClick={() => setSelectedDayIndex(idx)}
              style={{
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '6px 10px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-rule)',
                cursor: 'pointer',
                backgroundColor:
                  idx === selectedDayIndex
                    ? 'var(--color-ink)'
                    : 'var(--color-paper-2)',
                color:
                  idx === selectedDayIndex
                    ? 'var(--color-paper)'
                    : 'var(--color-ink-2)',
                fontFamily: 'var(--font-sans)',
              }}
            >
              <span style={{ fontSize: 10, opacity: 0.7 }}>{DAY_NAMES[idx]}</span>
              <span style={{ fontSize: 15, fontWeight: 600 }}>{format(day, 'd')}</span>
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${viewMode === 'week' ? 7 : 1}, 1fr)`,
            gap: 8,
          }}
        >
          {(viewMode === 'week' ? days : [days[0]!]).map((d) => (
            <div key={d.toISOString()}>
              <Skeleton className="h-6 w-full mb-2" />
              <Skeleton className="h-16 w-full" />
            </div>
          ))}
        </div>
      ) : (
        // On a phone seven columns will not fit, so the week scrolls sideways
        // with each day holding a readable minimum width. The scrollbar is
        // hidden — the clipped day at the edge is the cue that there is more.
        <div className="scrollbar-hide -mx-1 overflow-x-auto px-1">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                viewMode === 'week'
                  ? 'repeat(7, minmax(150px, 1fr))'
                  : 'minmax(0, 1fr)',
              gap: 8,
              alignItems: 'start',
              minWidth: viewMode === 'week' ? 'max-content' : undefined,
            }}
            className={viewMode === 'week' ? 'lg:!min-w-0' : undefined}
          >
          {displayDays.map((day, idx) => {
            const nodes = getNodesForDay(day)
            const dayLabel = DAY_NAMES[viewMode === 'day' ? selectedDayIndex : idx] ?? ''
            const isToday = isSameDay(day, new Date())

            return (
              <div key={day.toISOString()}>
                {/* Day heading */}
                <div
                  style={{
                    padding: '8px 4px',
                    borderBottom: '1px solid var(--color-rule)',
                    marginBottom: 6,
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: 11,
                      fontWeight: 500,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: isToday ? 'var(--color-accent)' : 'var(--color-ink-3)',
                    }}
                  >
                    {dayLabel}
                  </span>
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 16,
                      fontWeight: 600,
                      color: isToday ? 'var(--color-accent)' : 'var(--color-ink)',
                    }}
                  >
                    {format(day, 'd')}
                  </div>
                </div>

                {/* Session blocks */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {nodes.length === 0 ? (
                    <p
                      style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: 11,
                        color: 'var(--color-ink-3)',
                        padding: '8px 4px',
                        fontStyle: 'italic',
                      }}
                    >
                      Rest day
                    </p>
                  ) : (
                    nodes.map((node) => (
                      <button
                        key={`${node.subjectSlug}-${node.topicSlug}`}
                        onClick={() => setSelectedNode(node)}
                        style={{
                          display: 'block',
                          width: '100%',
                          textAlign: 'left',
                          backgroundColor: 'var(--color-card)',
                          border: '1px solid var(--color-rule)',
                          borderLeft: `4px solid ${getSubjectColor(node.subjectSlug)}`,
                          borderRadius: 'var(--radius-sm)',
                          padding: '6px 8px',
                          cursor: 'pointer',
                          transition: 'background-color 0.1s',
                        }}
                        onMouseEnter={(e) => {
                          ;(e.currentTarget as HTMLButtonElement).style.backgroundColor =
                            'var(--color-paper-3)'
                        }}
                        onMouseLeave={(e) => {
                          ;(e.currentTarget as HTMLButtonElement).style.backgroundColor =
                            'var(--color-card)'
                        }}
                      >
                        <div
                          style={{
                            fontFamily: 'var(--font-sans)',
                            fontSize: 12,
                            fontWeight: 500,
                            color: 'var(--color-ink)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {node.topicName ?? node.topicSlug}
                        </div>
                        <div
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: 10,
                            color: 'var(--color-ink-3)',
                            marginTop: 2,
                          }}
                        >
                          {t('duration', { minutes: node.estimatedMinutes ?? 30 })}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )
          })}
          </div>
        </div>
      )}

      {/* To-do board — the calendar covers scheduled topics, this covers
          everything else a student wants to keep track of. */}
      <section className="mt-8">
        <div className="mb-3">
          <h2
            className="text-[18px] font-medium text-[var(--color-ink)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Your tasks
          </h2>
          <p className="text-[13px] text-[var(--color-ink-3)]">
            Drag a card between columns as you work through it.
          </p>
        </div>
        <KanbanBoard />
      </section>

      {/* Session detail panel */}
      {selectedNode && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.3)',
            }}
            onClick={() => setSelectedNode(null)}
          />
          <div
            style={{
              position: 'relative',
              backgroundColor: 'var(--color-paper)',
              borderTopLeftRadius: 'var(--radius-lg)',
              borderTopRightRadius: 'var(--radius-lg)',
              padding: 24,
              width: '100%',
              maxWidth: 480,
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <div
              style={{
                borderLeft: `4px solid ${getSubjectColor(selectedNode.subjectSlug)}`,
                paddingLeft: 12,
                marginBottom: 16,
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 11,
                  color: 'var(--color-ink-3)',
                  marginBottom: 4,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {selectedNode.subjectName ?? selectedNode.subjectSlug}
              </p>
              <h3
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 20,
                  fontWeight: 500,
                  color: 'var(--color-ink)',
                  margin: 0,
                }}
              >
                {selectedNode.topicName ?? selectedNode.topicSlug}
              </h3>
            </div>

            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 13,
                color: 'var(--color-ink-3)',
                marginBottom: 20,
              }}
            >
              {t('duration', { minutes: selectedNode.estimatedMinutes ?? 30 })}
              {' · '}
              Mastery {selectedNode.mastery}%
            </p>

            <div style={{ display: 'flex', gap: 8 }}>
              <Button
                variant="accent"
                onClick={() => {
                  router.push(
                    `/study/new?subject=${selectedNode.subjectSlug}&topic=${selectedNode.topicSlug}`,
                  )
                }}
              >
                Start session
              </Button>
              <Button
                variant="secondary"
                onClick={() => setSelectedNode(null)}
              >
                Skip
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
