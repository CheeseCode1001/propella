'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { format } from 'date-fns'
import { Note1, Add, SearchNormal1, Trash, Archive, ArchiveTick } from 'iconsax-reactjs'
import { api } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/empty-state'

interface Note {
  id: string
  title: string
  content: string
  subjectSlug: string | null
  topicSlug: string | null
  pinned: boolean
  createdAt: string
  updatedAt: string
}

function useNotes(search: string) {
  return useQuery({
    queryKey: ['notes', search],
    queryFn: () =>
      api
        .get<{ data: { notes: Note[] } }>(
          `/notes${search ? `?search=${encodeURIComponent(search)}` : ''}`,
        )
        .then((r) => r.data.notes),
  })
}

function NoteListSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="rounded-[var(--radius-md)] border border-[var(--color-rule)] p-3"
        >
          <Skeleton className="h-4 w-2/3 mb-2" />
          <Skeleton className="h-3 w-full mb-1.5" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      ))}
    </div>
  )
}

export default function NotesPage() {
  const t = useTranslations('notes')
  const queryClient = useQueryClient()

  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [draft, setDraft] = useState({ title: '', content: '' })
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle')

  const { data: notes, isLoading } = useNotes(search)

  // Falling back to the first note during render means the editor is never
  // blank when there is something to read, without an effect that sets state.
  const activeId = selectedId ?? notes?.[0]?.id ?? null
  const selected = useMemo(
    () => notes?.find((n) => n.id === activeId) ?? null,
    [notes, activeId],
  )

  // Load the note into the editor when the selection changes. This is React's
  // documented "adjust state while rendering" pattern — cheaper and more
  // predictable than syncing in an effect.
  const [loadedId, setLoadedId] = useState<string | null>(null)
  if (selected && selected.id !== loadedId) {
    setLoadedId(selected.id)
    setDraft({ title: selected.title, content: selected.content })
  }

  // Autosave a second after typing stops.
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (!selected) return
    if (draft.title === selected.title && draft.content === selected.content) return

    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      setSaveState('saving')
      void api
        .patch(`/notes/${selected.id}`, draft)
        .then(() => {
          setSaveState('saved')
          void queryClient.invalidateQueries({ queryKey: ['notes'] })
        })
        .catch(() => setSaveState('idle'))
    }, 1000)

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
    }
  }, [draft, selected, queryClient])

  async function createNote() {
    const res = await api.post<{ data: Note }>('/notes', {
      title: t('untitled'),
      content: '',
    })
    await queryClient.invalidateQueries({ queryKey: ['notes'] })
    setSelectedId(res.data.id)
    setDraft({ title: res.data.title, content: '' })
  }

  async function removeNote(id: string) {
    if (!window.confirm(t('delete') + '?')) return
    await api.del(`/notes/${id}`)
    if (selectedId === id) setSelectedId(null)
    await queryClient.invalidateQueries({ queryKey: ['notes'] })
  }

  async function togglePin(note: Note) {
    await api.patch(`/notes/${note.id}`, { pinned: !note.pinned })
    await queryClient.invalidateQueries({ queryKey: ['notes'] })
  }

  return (
    <div className="w-full">
      <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1
            className="text-[26px] lg:text-[32px] font-medium text-[var(--color-ink)] leading-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {t('title')}
          </h1>
          <p className="text-[13.5px] text-[var(--color-ink-3)] mt-1">{t('subtitle')}</p>
        </div>
        <Button variant="accent" onClick={() => void createNote()}>
          <Add size={17} color="currentColor" variant="Linear" />
          <span className="ml-1.5">{t('new')}</span>
        </Button>
      </header>

      <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
        {/* List */}
        <aside className="min-w-0">
          <div className="relative mb-3">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-3)]">
              <SearchNormal1 size={16} color="currentColor" variant="Linear" />
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('search')}
              className="w-full rounded-[var(--radius-sm)] border border-[var(--color-rule-2)] bg-[var(--color-paper-2)] py-2 pl-9 pr-3 text-[13.5px] text-[var(--color-ink)] outline-none focus:border-[var(--color-accent)]"
            />
          </div>

          {isLoading ? (
            <NoteListSkeleton />
          ) : !notes || notes.length === 0 ? (
            <EmptyState
              icon={Note1}
              title={t('emptyTitle')}
              message={t('empty')}
              action={
                <Button variant="secondary" size="sm" onClick={() => void createNote()}>
                  {t('new')}
                </Button>
              }
            />
          ) : (
            <div className="flex flex-col gap-2 lg:max-h-[calc(100vh-220px)] lg:overflow-y-auto">
              {notes.map((note) => {
                const active = note.id === activeId
                return (
                  <button
                    key={note.id}
                    onClick={() => setSelectedId(note.id)}
                    className={[
                      'w-full rounded-[var(--radius-md)] border p-3 text-left transition-colors',
                      active
                        ? 'border-[var(--color-accent)] bg-[var(--color-accent-tint)]'
                        : 'border-[var(--color-rule)] bg-[var(--color-card)] hover:bg-[var(--color-paper-3)]',
                    ].join(' ')}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[14px] font-semibold text-[var(--color-ink)] line-clamp-1">
                        {note.title || t('untitled')}
                      </span>
                      {note.pinned && (
                        <ArchiveTick size={14} color="var(--color-accent)" variant="Bold" />
                      )}
                    </div>
                    <p className="mt-1 line-clamp-2 text-[12.5px] leading-[1.5] text-[var(--color-ink-2)]">
                      {note.content || '—'}
                    </p>
                    <p className="mt-1.5 text-[11px] text-[var(--color-ink-3)]">
                      {note.topicSlug
                        ? note.topicSlug.replace(/-/g, ' ')
                        : t('general')}
                      {' · '}
                      {format(new Date(note.updatedAt), 'd MMM')}
                    </p>
                  </button>
                )
              })}
            </div>
          )}
        </aside>

        {/* Editor */}
        <section className="min-w-0">
          {isLoading ? (
            <div className="rounded-[var(--radius-md)] border border-[var(--color-rule)] p-4">
              <Skeleton className="h-7 w-1/2 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ) : !selected ? (
            <EmptyState
              icon={Note1}
              title={t('emptyTitle')}
              message={t('empty')}
              className="h-full"
            />
          ) : (
            <div className="rounded-[var(--radius-md)] border border-[var(--color-rule)] bg-[var(--color-card)]">
              <div className="flex items-center gap-2 border-b border-[var(--color-rule)] px-3 py-2">
                <span className="text-[11.5px] text-[var(--color-ink-3)]">
                  {saveState === 'saving' ? '…' : saveState === 'saved' ? t('saved') : ''}
                </span>
                <div className="ml-auto flex items-center gap-1">
                  <button
                    onClick={() => void togglePin(selected)}
                    aria-label="Pin note"
                    className="rounded p-1.5 text-[var(--color-ink-3)] hover:bg-[var(--color-paper-3)]"
                  >
                    <Archive
                      size={16}
                      color="currentColor"
                      variant={selected.pinned ? 'Bold' : 'Linear'}
                    />
                  </button>
                  <button
                    onClick={() => void removeNote(selected.id)}
                    aria-label={t('delete')}
                    className="rounded p-1.5 text-[var(--color-danger)] hover:bg-[var(--color-danger-tint)]"
                  >
                    <Trash size={16} color="currentColor" variant="Linear" />
                  </button>
                </div>
              </div>

              <input
                value={draft.title}
                onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                placeholder={t('untitled')}
                className="w-full border-none bg-transparent px-4 pt-4 pb-2 text-[20px] font-semibold text-[var(--color-ink)] outline-none"
                style={{ fontFamily: 'var(--font-display)' }}
              />
              <textarea
                value={draft.content}
                onChange={(e) => setDraft((d) => ({ ...d, content: e.target.value }))}
                placeholder="Start writing…"
                className="min-h-[45vh] w-full resize-y border-none bg-transparent px-4 pb-4 text-[14.5px] leading-[1.7] text-[var(--color-ink)] outline-none"
              />
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
