'use client'

import { useMemo, useRef, useState } from 'react'
import { Add, Trash, TaskSquare, Calendar as CalendarIcon } from 'iconsax-reactjs'
import { format, isPast, isToday } from 'date-fns'
import {
  usePlannerTasks,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  useReorderColumn,
  type PlannerTask,
  type TaskStatus,
} from '@/lib/hooks/use-planner-tasks'
import { EmptyState } from '@/components/common/empty-state'
import { ErrorState, errorKindFrom } from '@/components/common/error-state'
import { useOnlineStatus } from '@/lib/hooks/use-online-status'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils/cn'

const COLUMNS: { status: TaskStatus; label: string; hint: string }[] = [
  { status: 'todo', label: 'To do', hint: 'Everything you plan to get to' },
  { status: 'doing', label: 'In progress', hint: 'What you are working on now' },
  { status: 'done', label: 'Done', hint: 'Finished — nice work' },
]

function dueLabel(dueDate: string): { text: string; tone: 'default' | 'today' | 'late' } {
  const date = new Date(dueDate)
  if (isToday(date)) return { text: 'Due today', tone: 'today' }
  if (isPast(date)) return { text: `Due ${format(date, 'd MMM')}`, tone: 'late' }
  return { text: `Due ${format(date, 'd MMM')}`, tone: 'default' }
}

function TaskCard({
  task,
  onDelete,
  onDragStart,
  dragging,
}: {
  task: PlannerTask
  onDelete: () => void
  onDragStart: (e: React.DragEvent) => void
  dragging: boolean
}) {
  const due = task.dueDate ? dueLabel(task.dueDate) : null

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className={cn(
        'group cursor-grab rounded-[var(--radius-sm)] border border-[var(--color-rule)]',
        'bg-[var(--color-card)] p-3 transition-shadow active:cursor-grabbing',
        dragging ? 'opacity-40' : 'hover:shadow-[var(--shadow-sm)]',
      )}
    >
      <div className="flex items-start gap-2">
        <p
          className={cn(
            'min-w-0 flex-1 break-words text-[13.5px] leading-[1.45]',
            task.status === 'done'
              ? 'text-[var(--color-ink-3)] line-through'
              : 'text-[var(--color-ink)]',
          )}
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          {task.title}
        </p>

        <button
          type="button"
          onClick={onDelete}
          aria-label={`Delete "${task.title}"`}
          className="shrink-0 cursor-pointer rounded border-none bg-transparent p-0.5 text-[var(--color-ink-3)] opacity-0 transition-opacity hover:text-[var(--color-danger)] focus:opacity-100 group-hover:opacity-100"
        >
          <Trash size={14} color="currentColor" variant="Linear" />
        </button>
      </div>

      {due && (
        <p
          className="mt-2 flex items-center gap-1 text-[11px]"
          style={{
            fontFamily: 'var(--font-mono)',
            color:
              due.tone === 'late'
                ? 'var(--color-danger)'
                : due.tone === 'today'
                  ? 'var(--color-warning)'
                  : 'var(--color-ink-3)',
          }}
        >
          <CalendarIcon size={12} color="currentColor" variant="Linear" />
          {due.text}
        </p>
      )}
    </div>
  )
}

function AddCard({ status, onAdd }: { status: TaskStatus; onAdd: (title: string) => void }) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const inputRef = useRef<HTMLTextAreaElement>(null)

  function submit() {
    const value = title.trim()
    if (!value) {
      setOpen(false)
      setTitle('')
      return
    }
    onAdd(value)
    setTitle('')
    // Stay open so several tasks can be added in a row.
    inputRef.current?.focus()
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => {
          setOpen(true)
          requestAnimationFrame(() => inputRef.current?.focus())
        }}
        className="flex w-full cursor-pointer items-center gap-1.5 rounded-[var(--radius-sm)] border-none bg-transparent px-2 py-2 text-left text-[13px] text-[var(--color-ink-3)] transition-colors hover:bg-[var(--color-paper-3)] hover:text-[var(--color-ink-2)]"
        style={{ fontFamily: 'var(--font-sans)' }}
      >
        <Add size={16} color="currentColor" variant="Linear" />
        Add a task
      </button>
    )
  }

  return (
    <div className="rounded-[var(--radius-sm)] border border-[var(--color-accent)] bg-[var(--color-card)] p-2">
      <textarea
        ref={inputRef}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            submit()
          } else if (e.key === 'Escape') {
            setOpen(false)
            setTitle('')
          }
        }}
        onBlur={submit}
        rows={2}
        maxLength={160}
        placeholder={`Add to ${COLUMNS.find((c) => c.status === status)?.label.toLowerCase()}…`}
        aria-label="New task"
        className="w-full resize-none border-none bg-transparent text-[13.5px] text-[var(--color-ink)] outline-none"
        style={{ fontFamily: 'var(--font-sans)' }}
      />
      <p className="text-[11px] text-[var(--color-ink-3)]">Enter to save · Esc to cancel</p>
    </div>
  )
}

/**
 * A three-column to-do board under the calendar.
 *
 * Drag and drop uses the native HTML5 API rather than a drag library — the
 * board is small, and this keeps the bundle down. Each drop rewrites the order
 * of the destination column so positions cannot drift.
 */
export function KanbanBoard() {
  const online = useOnlineStatus()
  const { data, isLoading, isError, error, refetch } = usePlannerTasks()
  const createTask = useCreateTask()
  const deleteTask = useDeleteTask()
  const reorder = useReorderColumn()
  const updateTask = useUpdateTask()

  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [overColumn, setOverColumn] = useState<TaskStatus | null>(null)

  const byColumn = useMemo(() => {
    const grouped: Record<TaskStatus, PlannerTask[]> = { todo: [], doing: [], done: [] }
    for (const task of data ?? []) grouped[task.status].push(task)
    for (const status of Object.keys(grouped) as TaskStatus[]) {
      grouped[status].sort((a, b) => a.position - b.position)
    }
    return grouped
  }, [data])

  function handleDrop(status: TaskStatus) {
    setOverColumn(null)
    const id = draggingId
    setDraggingId(null)
    if (!id) return

    const task = (data ?? []).find((t) => t.id === id)
    if (!task) return

    // Dropped back where it started — nothing to write.
    const target = byColumn[status]
    if (task.status === status && target[target.length - 1]?.id === id) return

    const remaining = target.filter((t) => t.id !== id).map((t) => t.id)
    reorder.mutate({ status, orderedIds: [...remaining, id] })
  }

  if (isError && !data) {
    return (
      <ErrorState
        kind={errorKindFrom(error, online)}
        title="We cannot load your tasks"
        onRetry={() => void refetch()}
      />
    )
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {COLUMNS.map((column) => {
        const tasks = byColumn[column.status]
        const isOver = overColumn === column.status

        return (
          <section
            key={column.status}
            onDragOver={(e) => {
              e.preventDefault()
              setOverColumn(column.status)
            }}
            onDragLeave={(e) => {
              // Ignore moves between children of the same column.
              if (!e.currentTarget.contains(e.relatedTarget as Node)) setOverColumn(null)
            }}
            onDrop={(e) => {
              e.preventDefault()
              handleDrop(column.status)
            }}
            className={cn(
              'flex flex-col rounded-[var(--radius-md)] border p-2.5 transition-colors',
              isOver
                ? 'border-[var(--color-accent)] bg-[var(--color-accent-tint)]'
                : 'border-[var(--color-rule)] bg-[var(--color-paper-2)]',
            )}
          >
            <div className="mb-2.5 flex items-baseline justify-between gap-2 px-1">
              <h3
                className="text-[13px] font-semibold text-[var(--color-ink)]"
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                {column.label}
              </h3>
              <span
                className="text-[11px] text-[var(--color-ink-3)]"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {tasks.length}
              </span>
            </div>

            <div className="flex min-h-[80px] flex-col gap-2">
              {isLoading ? (
                <>
                  <Skeleton className="h-14 w-full rounded-[var(--radius-sm)]" />
                  <Skeleton className="h-14 w-full rounded-[var(--radius-sm)]" />
                </>
              ) : tasks.length === 0 ? (
                <EmptyState
                  icon={TaskSquare}
                  message={column.hint}
                  className="px-3 py-6 text-[12px]"
                />
              ) : (
                tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    dragging={draggingId === task.id}
                    onDragStart={(e) => {
                      setDraggingId(task.id)
                      e.dataTransfer.effectAllowed = 'move'
                      // Firefox will not start a drag without payload data.
                      e.dataTransfer.setData('text/plain', task.id)
                    }}
                    onDelete={() => deleteTask.mutate(task.id)}
                  />
                ))
              )}
            </div>

            {!isLoading && (
              <div className="mt-2">
                <AddCard
                  status={column.status}
                  onAdd={(title) => createTask.mutate({ title, status: column.status })}
                />
              </div>
            )}

            {/* Keyboard-reachable fallback for moving a card without dragging. */}
            {tasks.length > 0 && column.status !== 'done' && (
              <button
                type="button"
                onClick={() => {
                  const first = tasks[0]
                  if (!first) return
                  updateTask.mutate({
                    id: first.id,
                    status: column.status === 'todo' ? 'doing' : 'done',
                  })
                }}
                className="mt-1 cursor-pointer rounded border-none bg-transparent px-2 py-1 text-left text-[11.5px] text-[var(--color-ink-3)] transition-colors hover:text-[var(--color-accent)]"
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                Move top card to {column.status === 'todo' ? 'In progress' : 'Done'} →
              </button>
            )}
          </section>
        )
      })}
    </div>
  )
}
