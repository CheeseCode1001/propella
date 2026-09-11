'use client'

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Link } from '@/lib/i18n/navigation'
import { api } from '@/lib/api-client'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface TopicNoteModalProps {
  open: boolean
  onClose: () => void
  subjectSlug: string
  subjectName: string
  topicSlug: string
  topicName: string
}

/**
 * Writes a note without leaving the topic.
 *
 * The note is filed against the subject and topic, so it shows up under this
 * topic on the notes page rather than as a loose scrap.
 */
export function TopicNoteModal({
  open,
  onClose,
  subjectSlug,
  subjectName,
  topicSlug,
  topicName,
}: TopicNoteModalProps) {
  const queryClient = useQueryClient()
  const [title, setTitle] = useState(topicName)
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function save() {
    if (!content.trim() || saving) return

    setSaving(true)
    setError(null)
    try {
      await api.post('/notes', {
        title: title.trim() || topicName,
        content: content.trim(),
        subjectSlug,
        topicSlug,
      })
      // So the notes page shows it without a manual refresh.
      await queryClient.invalidateQueries({ queryKey: ['notes'] })
      setSaved(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save that note.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Take a note"
      subtitle={`${subjectName} · ${topicName}`}
      footer={
        saved ? (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[13px] text-[var(--color-success)]">Saved to your notes.</p>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/notes">Open notes</Link>
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setSaved(false)}>
                Write another
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
              disabled={!content.trim() || saving}
            >
              {saving ? 'Saving…' : 'Save note'}
            </Button>
          </div>
        )
      }
    >
      {saved ? (
        <p className="text-[14px] leading-[1.6] text-[var(--color-ink-2)]">
          Your note is filed under <strong className="text-[var(--color-ink)]">{topicName}</strong>{' '}
          in {subjectName}. You can find it any time on the notes page.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          <div>
            <Label htmlFor="note-title">Title</Label>
            <Input
              id="note-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              placeholder={topicName}
            />
          </div>

          <div>
            <Label htmlFor="note-content">Your note</Label>
            <textarea
              id="note-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={9}
              autoFocus
              placeholder="What do you want to remember from this topic?"
              className="w-full resize-y rounded-[var(--radius-sm)] border border-[var(--color-rule-2)] bg-[var(--color-paper)] px-3.5 py-2.5 text-[14px] leading-[1.6] text-[var(--color-ink)] outline-none focus:border-[var(--color-accent)]"
              style={{ fontFamily: 'var(--font-sans)', minHeight: 160 }}
            />
          </div>

          {error && <p className="text-[13px] text-[var(--color-danger)]">{error}</p>}
        </div>
      )}
    </Modal>
  )
}
