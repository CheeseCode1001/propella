'use client'

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Link } from '@/lib/i18n/navigation'
import { api } from '@/lib/api-client'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils/cn'

type TaskStatus = 'todo' | 'doing' | 'done'

const COLUMNS: { value: TaskStatus; label: string }[] = [
  { value: 'todo', label: 'To do' },
  { value: 'doing', label: 'In progress' },
  { value: 'done', label: 'Done' },
]

interface TopicTodoModalProps {
  open: boolean
  onClose: () => void
  subjectSlug: string
  subjectName: string
  topicSlug: string
  topicName: string
}

/**
 * Adds a planner task from the topic being read.
 *
 * Carries the subject and topic through, so the card on the planner board says
 * what it is about instead of just "Revise this".
 */
export function TopicTodoModal({
  open,
  onClose,
  subjectSlug,
  subjectName,
  topicSlug,
  topicName,
}: TopicTodoModalProps) {
  const queryClient = useQueryClient()
  const [title, setTitle] = useState(`Revise ${topicName}`)
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState<TaskStatus>('todo')
  const [dueDate, setDueDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function save() {
    if (!title.trim() || saving) return

    setSaving(true)
    setError(null)
    try {
      await api.post('/planner/tasks', {
        title: title.trim(),
        notes: notes.trim(),
        status,
        subjectSlug,
        topicSlug,
        // Midday avoids a date shifting a day either way across time zones.
        dueDate: dueDate ? new Date(`${dueDate}T12:00:00`).toISOString() : null,
      })
      await queryClient.invalidateQueries({ queryKey: ['planner-tasks'] })
      setSaved(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add that task.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add to your planner"
      subtitle={`${subjectName} · ${topicName}`}
      footer={
        saved ? (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[13px] text-[var(--color-success)]">Added to your board.</p>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/planner">Open planner</Link>
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setSaved(false)}>
                Add another
              </Button>
              <Button variant="accent" size="sm" onClick={onClose}>
                Done
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="accent"
              size="sm"
              onClick={() => void save()}
              disabled={!title.trim() || saving}
            >
              {saving ? 'Adding…' : 'Add task'}
            </Button>
          </div>
        )
      }
    >
      {saved ? (
        <p className="text-[14px] leading-[1.6] text-[var(--color-ink-2)]">
          <strong className="text-[var(--color-ink)]">{title}</strong> is on your planner board
          under {COLUMNS.find((c) => c.value === status)?.label.toLowerCase()}.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          <div>
            <Label htmlFor="todo-title">Task</Label>
            <Input
              id="todo-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={160}
              autoFocus
              placeholder={`Revise ${topicName}`}
            />
          </div>

          <div>
            <Label htmlFor="todo-notes">Notes (optional)</Label>
            <textarea
              id="todo-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Anything you want to remember about this task"
              className="w-full resize-y rounded-[var(--radius-sm)] border border-[var(--color-rule-2)] bg-[var(--color-paper)] px-3.5 py-2.5 text-[14px] leading-[1.6] text-[var(--color-ink)] outline-none focus:border-[var(--color-accent)]"
              style={{ fontFamily: 'var(--font-sans)' }}
            />
          </div>

          <div>
            <Label>Column</Label>
            <div className="flex gap-2">
              {COLUMNS.map((column) => (
                <button
                  key={column.value}
                  type="button"
                  onClick={() => setStatus(column.value)}
                  className={cn(
                    'flex-1 cursor-pointer rounded-[var(--radius-sm)] border px-3 py-2 text-[13px] font-medium transition-colors',
                    status === column.value
                      ? 'border-[var(--color-accent)] bg-[var(--color-accent-tint)] text-[var(--color-accent)]'
                      : 'border-[var(--color-rule-2)] bg-[var(--color-paper)] text-[var(--color-ink-2)]',
                  )}
                  style={{ fontFamily: 'var(--font-sans)' }}
                >
                  {column.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="todo-due">Due date (optional)</Label>
            <Input
              id="todo-due"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          {error && <p className="text-[13px] text-[var(--color-danger)]">{error}</p>}
        </div>
      )}
    </Modal>
  )
}
