'use client'

import { useState } from 'react'
import { useRouter } from '@/lib/i18n/navigation'
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
import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Plus,
  Bell,
  Calendar as CalendarIcon,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useQueryClient } from '@tanstack/react-query'
import { useRoadmap } from '@/lib/hooks/use-roadmap'
import { usePlannerTasks, useCreateTask, type PlannerTask } from '@/lib/hooks/use-planner-tasks'
import { useAuthStore } from '@/lib/stores/auth-store'
import { api } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Modal } from '@/components/ui/modal'
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
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)
  const isUndergrad = Boolean(user?.undergraduateMode)

  const [weekStart, setWeekStart] = useState<Date>(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 }),
  )
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week')
  const [selectedDayIndex, setSelectedDayIndex] = useState(0)
  const [selectedNode, setSelectedNode] = useState<RoadmapNode | null>(null)

  // Readjustment state
  const [isReadjusting, setIsReadjusting] = useState(false)
  const [readjustSuccess, setReadjustSuccess] = useState<string | null>(null)

  // Undergraduate custom planner task modal
  const [isCustomTaskOpen, setIsCustomTaskOpen] = useState(false)
  const [customTitle, setCustomTitle] = useState('')
  const [customDueDate, setCustomDueDate] = useState('')
  const [customDuration, setCustomDuration] = useState('45')
  const [customReminder, setCustomReminder] = useState(true)

  const { data: roadmap, isLoading } = useRoadmap()
  const { data: plannerTasks = [] } = usePlannerTasks()
  const createTaskMutation = useCreateTask()

  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd })

  // Group nodes by planned start date within this week
  function getNodesForDay(day: Date): RoadmapNode[] {
    if (!roadmap?.nodes) return []
    return roadmap.nodes.filter((node) => {
      try {
        const planned = parseISO(node.plannedStartDate)
        return isSameDay(planned, day)
      } catch {
        return false
      }
    })
  }

  // Get user-created custom tasks for this day (for undergrads / custom planner)
  function getTasksForDay(day: Date): PlannerTask[] {
    return plannerTasks.filter((task) => {
      if (!task.dueDate) return false
      try {
        const d = parseISO(task.dueDate)
        return isSameDay(d, day)
      } catch {
        return false
      }
    })
  }

  function handlePrevWeek() {
    setWeekStart((w) => subWeeks(w, 1))
  }

  function handleNextWeek() {
    setWeekStart((w) => addWeeks(w, 1))
  }

  async function handleReadjustSchedule() {
    setIsReadjusting(true)
    setReadjustSuccess(null)
    try {
      const res = await api.post<{
        data: { adjustedTasks: number; adjustedNodes: number; message: string }
      }>('/planner/readjust')
      queryClient.invalidateQueries({ queryKey: ['roadmap'] })
      queryClient.invalidateQueries({ queryKey: ['planner-tasks'] })
      setReadjustSuccess(
        res.data?.message ||
          'Your schedule has been readjusted! Missed and overdue topics have been redistributed smoothly forward from today.',
      )
      setTimeout(() => setReadjustSuccess(null), 5000)
    } catch (err) {
      console.error('Failed to readjust planner', err)
      setReadjustSuccess('Failed to readjust planner. Please try again.')
    } finally {
      setIsReadjusting(false)
    }
  }

  function handleCreateCustomTask(e: React.FormEvent) {
    e.preventDefault()
    if (!customTitle.trim()) return

    createTaskMutation.mutate(
      {
        title: customTitle.trim(),
        dueDate: customDueDate ? new Date(customDueDate).toISOString() : null,
      },
      {
        onSuccess: () => {
          setIsCustomTaskOpen(false)
          setCustomTitle('')
          setCustomDueDate('')
        },
      },
    )
  }

  const displayDays = viewMode === 'day' ? [days[selectedDayIndex]!] : days

  return (
    <div>
      {/* Header */}
      <div
        style={{
          marginBottom: 24,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
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
            {isUndergrad ? 'University Study Planner' : t('title')}
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

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {/* Readjust Schedule Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleReadjustSchedule}
            disabled={isReadjusting}
            className="flex items-center gap-1.5 text-xs text-[var(--color-ink)]"
            title="Automatically reschedule missed topics forward without losing streak"
          >
            <RefreshCw size={13} className={isReadjusting ? 'animate-spin' : ''} />
            <span>{isReadjusting ? 'Readjusting...' : 'Readjust Missed Tasks'}</span>
          </Button>

          {/* Undergraduate Custom Study Block */}
          {isUndergrad && (
            <Button
              variant="accent"
              size="sm"
              onClick={() => setIsCustomTaskOpen(true)}
              className="flex items-center gap-1.5 text-xs"
            >
              <Plus size={14} />
              <span>Add Study Session</span>
            </Button>
          )}

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

      {/* Readjustment notification banner */}
      {readjustSuccess && (
        <div className="mb-4 p-3 rounded-lg bg-[var(--color-accent-tint)] border border-[var(--color-accent)]/20 text-xs text-[var(--color-ink)] flex items-center gap-2">
          <CheckCircle2 size={16} className="text-[var(--color-accent)] shrink-0" />
          <span>{readjustSuccess}</span>
        </div>
      )}

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
              const customTasks = getTasksForDay(day)
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
                    {nodes.length === 0 && customTasks.length === 0 ? (
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
                      <>
                        {/* Secondary Syllabus Roadmap nodes */}
                        {!isUndergrad &&
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
                          ))}

                        {/* Custom Tasks / University Study Blocks */}
                        {customTasks.map((task) => (
                          <div
                            key={task.id}
                            style={{
                              backgroundColor: 'var(--color-card)',
                              border: '1px solid var(--color-rule)',
                              borderLeft: '4px solid var(--color-accent)',
                              borderRadius: 'var(--radius-sm)',
                              padding: '6px 8px',
                            }}
                          >
                            <p
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
                              {task.title}
                            </p>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4,
                                marginTop: 2,
                                fontSize: 10,
                                color: 'var(--color-ink-3)',
                              }}
                            >
                              <Bell size={10} className="text-[var(--color-accent)]" />
                              <span>Reminder active</span>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* To-do board */}
      <section className="mt-8">
        <div className="mb-3">
          <h2
            className="text-[18px] font-medium text-[var(--color-ink)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {isUndergrad ? 'University Study Tasks & Deadlines' : 'Your tasks'}
          </h2>
          <p className="text-[13px] text-[var(--color-ink-3)]">
            Drag a card between columns as you work through it.
          </p>
        </div>
        <KanbanBoard />
      </section>

      {/* Modal: Undergraduate Custom Study Block */}
      <Modal
        open={isCustomTaskOpen}
        onClose={() => setIsCustomTaskOpen(false)}
        title="Schedule University Study Session"
        subtitle="Set your study goals, course review dates, and automated reminders"
        size="md"
        footer={
          <div className="flex items-center justify-end gap-3">
            <Button variant="outline" onClick={() => setIsCustomTaskOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="accent"
              disabled={createTaskMutation.isPending || !customTitle.trim()}
              onClick={handleCreateCustomTask}
            >
              {createTaskMutation.isPending ? 'Scheduling...' : 'Save & Set Reminder'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleCreateCustomTask} className="space-y-4 py-1">
          <div>
            <Label htmlFor="customTitle">Course / Study Topic</Label>
            <Input
              id="customTitle"
              placeholder="e.g. MTH 201 - Linear Algebra Assignment & Review"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="customDate">Scheduled Date & Time</Label>
            <Input
              id="customDate"
              type="datetime-local"
              value={customDueDate}
              onChange={(e) => setCustomDueDate(e.target.value)}
            />
            <p className="text-[11px] text-[var(--color-ink-3)] mt-1">
              Propella will automatically send you an in-app and email reminder before your session starts.
            </p>
          </div>

          <div>
            <Label htmlFor="duration">Target Duration (Minutes)</Label>
            <Input
              id="duration"
              type="number"
              min={15}
              max={300}
              value={customDuration}
              onChange={(e) => setCustomDuration(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              id="reminderCheck"
              type="checkbox"
              checked={customReminder}
              onChange={(e) => setCustomReminder(e.target.checked)}
              className="rounded border-[var(--color-rule)] text-[var(--color-accent)]"
            />
            <label htmlFor="reminderCheck" className="text-xs text-[var(--color-ink)] cursor-pointer">
              Send daily reminder & alert notification if missed
            </label>
          </div>
        </form>
      </Modal>

      {/* Session detail panel (Secondary syllabus) */}
      {selectedNode && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setSelectedNode(null)}
          />
          <div className="relative w-full max-w-[480px] rounded-t-3xl sm:rounded-2xl bg-[var(--color-paper)] p-6 shadow-2xl border border-[var(--color-rule)] transition-all">
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
              <Button variant="secondary" onClick={() => setSelectedNode(null)}>
                Skip
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
