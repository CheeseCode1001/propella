'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Send, Plus } from 'lucide-react'
import {
  More,
  Edit2,
  Trash,
  Microphone2,
  MicrophoneSlash1,
  VolumeHigh,
  VolumeCross,
  Messages2,
} from 'iconsax-reactjs'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { formatDistanceToNow, format as formatDate } from 'date-fns'
import { useSearchParams } from 'next/navigation'
import { useRouter } from '@/lib/i18n/navigation'
import { useTranslations } from 'next-intl'
import { api, getAccessToken } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/empty-state'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useDictation, useSpeech } from '@/lib/hooks/use-speech'
import { API_URL } from '@/lib/constants'
import { cn } from '@/lib/utils/cn'

/** "5 minutes ago" for recent items, a plain date once that stops being useful. */
function relativeTime(iso: string): string {
  const date = new Date(iso)
  const ageMs = Date.now() - date.getTime()
  if (Number.isNaN(ageMs)) return ''
  if (ageMs < 7 * 24 * 60 * 60 * 1000) {
    return formatDistanceToNow(date, { addSuffix: true })
  }
  return formatDate(date, 'd MMM yyyy')
}

interface ChatThread {
  id: string
  title: string
  createdAt: string
  updatedAt: string
}

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

interface ThreadDetail {
  id: string
  title: string
  messages: ChatMessage[]
}

const SUGGESTED_PROMPTS = [
  'Explain how to solve simultaneous equations',
  'What is the cell cycle and why is it important?',
  'Summarize the causes of the Nigerian Civil War',
  'How do I calculate compound interest?',
]

function ThreadListItem({
  thread,
  active,
  onClick,
  onRename,
  onDelete,
}: {
  thread: ChatThread
  active: boolean
  onClick: () => void
  onRename: (title: string) => Promise<void>
  onDelete: () => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  // Null when not editing. Holding the draft here means a rename elsewhere (or
  // the AI titling the thread) shows through without an effect to sync it.
  const [draft, setDraft] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const editing = draft !== null
  const wrapRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    function onClickOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [menuOpen])

  async function commit() {
    const next = (draft ?? '').trim()
    setDraft(null)
    if (!next || next === thread.title) return

    setSaving(true)
    try {
      await onRename(next)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div ref={wrapRef} className="relative group">
      {editing ? (
        <input
          ref={inputRef}
          value={draft ?? thread.title}
          autoFocus
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => void commit()}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              void commit()
            } else if (e.key === 'Escape') {
              setDraft(null)
            }
          }}
          maxLength={80}
          aria-label="Conversation title"
          className="w-full rounded-[var(--radius-sm)] border border-[var(--color-accent)] bg-[var(--color-paper)] px-3 py-2 text-[13px] text-[var(--color-ink)] outline-none"
          style={{ fontFamily: 'var(--font-sans)' }}
        />
      ) : (
        <button
          onClick={onClick}
          className={
            active
              ? 'w-full cursor-pointer rounded-[var(--radius-sm)] border-none bg-[var(--color-accent-tint)] px-3.5 py-2.5 pr-9 text-left transition-colors'
              : 'w-full cursor-pointer rounded-[var(--radius-sm)] border-none bg-transparent px-3.5 py-2.5 pr-9 text-left transition-colors hover:bg-[var(--color-paper-3)]'
          }
        >
          <p
            className={
              active
                ? 'truncate text-[13px] font-medium text-[var(--color-accent)]'
                : 'truncate text-[13px] text-[var(--color-ink-2)]'
            }
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            {thread.title}
          </p>
          <p
            className="mt-0.5 text-[10px] text-[var(--color-ink-3)]"
            style={{ fontFamily: 'var(--font-mono)' }}
            title={formatDate(new Date(thread.updatedAt), "d MMM yyyy 'at' HH:mm")}
          >
            {relativeTime(thread.updatedAt)}
          </p>
        </button>
      )}

      {!editing && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            setMenuOpen((v) => !v)
          }}
          aria-label="Conversation options"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          className={
            menuOpen
              ? 'absolute right-1.5 top-2 cursor-pointer rounded border-none bg-transparent p-1 text-[var(--color-ink)] opacity-100'
              : 'absolute right-1.5 top-2 cursor-pointer rounded border-none bg-transparent p-1 text-[var(--color-ink-3)] opacity-0 transition-opacity hover:text-[var(--color-ink)] focus:opacity-100 group-hover:opacity-100'
          }
        >
          <More size={15} color="currentColor" variant="Linear" />
        </button>
      )}

      {menuOpen && (
        <div
          role="menu"
          className="absolute right-1.5 top-9 z-20 min-w-[140px] overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-rule)] bg-[var(--color-paper-2)] py-1"
          style={{ boxShadow: 'var(--shadow-md)' }}
        >
          <button
            role="menuitem"
            onClick={() => {
              setMenuOpen(false)
              setDraft(thread.title)
            }}
            className="flex w-full cursor-pointer items-center gap-2.5 border-none bg-transparent px-3 py-2 text-left text-[13px] text-[var(--color-ink-2)] transition-colors hover:bg-[var(--color-paper-3)] hover:text-[var(--color-ink)]"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            <Edit2 size={15} color="currentColor" variant="Linear" />
            Rename
          </button>
          <button
            role="menuitem"
            onClick={() => {
              setMenuOpen(false)
              onDelete()
            }}
            className="flex w-full cursor-pointer items-center gap-2.5 border-none bg-transparent px-3 py-2 text-left text-[13px] text-[var(--color-danger)] transition-colors hover:bg-[var(--color-paper-3)]"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            <Trash size={15} color="currentColor" variant="Linear" />
            Delete
          </button>
        </div>
      )}
    </div>
  )
}

function MessageBubble({
  message,
  onSpeak,
  speaking,
  canSpeak,
}: {
  message: ChatMessage
  onSpeak: (text: string) => void
  speaking: boolean
  canSpeak: boolean
}) {
  const isUser = message.role === 'user'
  const stamp = message.createdAt ? new Date(message.createdAt) : null
  const stampValid = stamp !== null && !Number.isNaN(stamp.getTime())

  return (
    <div
      className="mb-4 flex flex-col"
      style={{ alignItems: isUser ? 'flex-end' : 'flex-start' }}
    >
      <div
        className="max-w-[85%] sm:max-w-[70%]"
        style={{
          padding: isUser ? '12px 16px' : '0',
          backgroundColor: isUser ? 'var(--color-accent-tint)' : 'transparent',
          borderRadius: 'var(--radius-md)',
          fontFamily: 'var(--font-sans)',
          fontSize: 14,
          color: 'var(--color-ink)',
          lineHeight: 1.6,
        }}
      >
        {isUser ? (
          <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{message.content}</p>
        ) : (
          <div className="prose-sm">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
          </div>
        )}
      </div>

      <div className="mt-1 flex items-center gap-2">
        {stampValid && (
          <span
            className="text-[10px] text-[var(--color-ink-3)]"
            style={{ fontFamily: 'var(--font-mono)' }}
            title={formatDate(stamp, "d MMM yyyy 'at' HH:mm")}
          >
            {formatDate(stamp, 'HH:mm')}
          </span>
        )}
        {!isUser && canSpeak && (
          <button
            onClick={() => onSpeak(message.content)}
            aria-label={speaking ? 'Stop reading aloud' : 'Read this answer aloud'}
            className="cursor-pointer rounded border-none bg-transparent p-0.5 text-[var(--color-ink-3)] transition-colors hover:text-[var(--color-accent)]"
          >
            {speaking ? (
              <VolumeCross size={14} color="currentColor" variant="Linear" />
            ) : (
              <VolumeHigh size={14} color="currentColor" variant="Linear" />
            )}
          </button>
        )}
      </div>
    </div>
  )
}

function StreamingBubble({ text }: { text: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 16 }}>
      <div
        style={{
          maxWidth: '70%',
          fontFamily: 'var(--font-sans)',
          fontSize: 14,
          color: 'var(--color-ink)',
          lineHeight: 1.6,
        }}
      >
        <div className="prose-sm">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
        </div>
        <span
          style={{
            display: 'inline-block',
            width: 2,
            height: 14,
            backgroundColor: 'var(--color-accent)',
            animation: 'blink 0.8s step-end infinite',
            marginLeft: 2,
            verticalAlign: 'middle',
          }}
        />
      </div>
    </div>
  )
}

export default function AssistantPage() {
  const queryClient = useQueryClient()
  const t = useTranslations('assistant')
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null)
  const [inputValue, setInputValue] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const [pendingDelete, setPendingDelete] = useState<ChatThread | null>(null)
  /** Mobile only — the conversation list is always visible from lg up. */
  const [threadsOpen, setThreadsOpen] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()
  /** When on, replies are read out as they finish — hands-free revision. */
  const [voiceMode, setVoiceMode] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  // Guards the ?ask= handoff so a re-render cannot send the question twice.
  const handoffSentRef = useRef(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const { supported: canSpeak, speaking, speak, stop: stopSpeaking } = useSpeech()

  // Dictated phrases are appended to whatever is already typed, so a student can
  // start with the keyboard and finish with their voice (or the other way round).
  const appendDictation = useCallback((text: string) => {
    setInputValue((prev) => (prev ? `${prev.trim()} ${text}` : text))
  }, [])

  const dictation = useDictation({ onFinalText: appendDictation })

  const toggleSpeak = useCallback(
    (text: string) => {
      if (speaking) stopSpeaking()
      else speak(text)
    },
    [speaking, speak, stopSpeaking],
  )

  const { data: threadsData, isLoading: threadsLoading } = useQuery({
    queryKey: ['chat-threads'],
    queryFn: () =>
      api
        .get<{ data: { threads: ChatThread[] } }>('/assistant/threads')
        .then((r) => r.data.threads),
  })

  const { data: threadDetail, isLoading: threadLoading } = useQuery({
    queryKey: ['chat-thread', activeThreadId],
    queryFn: () =>
      api
        .get<{ data: ThreadDetail }>(`/assistant/threads/${activeThreadId}`)
        .then((r) => r.data),
    enabled: !!activeThreadId,
  })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [threadDetail?.messages, streamingText])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }, [inputValue])

  async function handleNewThread() {
    const result = await api.post<{ data: { id: string; title: string } }>('/assistant/threads')
    await queryClient.invalidateQueries({ queryKey: ['chat-threads'] })
    setActiveThreadId(result.data.id)
  }

  const handleRename = useCallback(
    async (threadId: string, title: string) => {
      await api.patch(`/assistant/threads/${threadId}`, { title })
      await queryClient.invalidateQueries({ queryKey: ['chat-threads'] })
      await queryClient.invalidateQueries({ queryKey: ['chat-thread', threadId] })
    },
    [queryClient],
  )

  const handleDelete = useCallback(
    async (threadId: string) => {
      await api.del(`/assistant/threads/${threadId}`)
      // Clear the reader if the conversation it was showing is now gone.
      setActiveThreadId((current) => (current === threadId ? null : current))
      setPendingDelete(null)
      await queryClient.invalidateQueries({ queryKey: ['chat-threads'] })
    },
    [queryClient],
  )

  const handleSend = useCallback(
    async (content: string) => {
      if (!content.trim() || isStreaming) return

      let threadId = activeThreadId

      // Create thread if none selected
      if (!threadId) {
        const result = await api.post<{ data: { id: string } }>('/assistant/threads')
        await queryClient.invalidateQueries({ queryKey: ['chat-threads'] })
        threadId = result.data.id
        setActiveThreadId(threadId)
      }

      // Keep the mic from typing into the next question while one is in flight.
      dictation.stop()
      setInputValue('')
      setIsStreaming(true)
      setStreamingText('')

      // Declared out here so the finally block can read the finished reply.
      let fullText = ''

      try {
        const token = getAccessToken()
        const response = await fetch(`${API_URL}/api/assistant/threads/${threadId}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          credentials: 'include',
          body: JSON.stringify({ content }),
        })

        const reader = response.body?.getReader()
        const decoder = new TextDecoder()

        if (reader) {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            const chunk = decoder.decode(value)
            const lines = chunk.split('\n')
            for (const line of lines) {
              if (line.startsWith('data: ') && !line.includes('[DONE]') && !line.includes('[ERROR]')) {
                fullText += line.slice(6)
                setStreamingText(fullText)
              }
            }
          }
        }
      } finally {
        setIsStreaming(false)
        setStreamingText('')
        if (voiceMode && fullText.trim()) speak(fullText)
        await queryClient.invalidateQueries({ queryKey: ['chat-thread', threadId] })
        await queryClient.invalidateQueries({ queryKey: ['chat-threads'] })
      }
    },
    [activeThreadId, isStreaming, queryClient, dictation, voiceMode, speak],
  )

  /**
   * Handoff from the topic reader: /assistant?ask=<question>.
   *
   * Sent once on arrival so the student lands on an answer already being
   * written, then the parameter is stripped so a refresh does not re-ask.
   */
  useEffect(() => {
    const question = searchParams.get('ask')
    if (!question || handoffSentRef.current) return

    handoffSentRef.current = true
    router.replace('/assistant')
    void handleSend(question)
    // handleSend is stable enough for a one-shot that guards itself with a ref.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void handleSend(inputValue)
    }
  }

  const messages = threadDetail?.messages ?? []
  const isEmpty = messages.length === 0 && !isStreaming

  return (
    // The shell marks /assistant full-bleed, so this fills whatever height is
    // left under the top bar. min-h-0 lets the transcript scroll instead of
    // stretching the page.
    <div className="flex min-h-0 w-full flex-1 overflow-hidden">
      {/* Conversations. A fixed column on desktop; on a phone the same list
          slides in over the chat, so past threads stay reachable there too. */}
      {threadsOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setThreadsOpen(false)}
          aria-hidden="true"
        />
      )}

      <div
        className={cn(
          'shrink-0 flex-col gap-1 overflow-y-auto border-r border-[var(--color-rule)]',
          'bg-[var(--color-paper)] p-3',
          threadsOpen
            ? 'fixed inset-y-0 left-0 z-50 flex w-[78vw] max-w-[280px] lg:static lg:z-auto lg:w-[280px]'
            : 'hidden lg:flex lg:w-[280px]',
        )}
      >
        <Button
          variant="accent"
          size="sm"
          onClick={handleNewThread}
          style={{marginBottom: 12, width: '100%', justifyContent: 'flex-start', gap: 8 }}
        >
          <Plus size={14} strokeWidth={1.5} />
          {t('newThread')}
        </Button>

        {threadsLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : !threadsData || threadsData.length === 0 ? (
          <EmptyState
            icon={Messages2}
            title="No conversations yet"
            message="Ask your first question and it will be saved here so you can pick the thread back up later."
            className="border-0 px-2 py-8"
          />
        ) : (
          threadsData.map((thread) => (
            <ThreadListItem
              key={thread.id}
              thread={thread}
              active={activeThreadId === thread.id}
              onClick={() => {
                setActiveThreadId(thread.id)
                setThreadsOpen(false)
              }}
              onRename={(title) => handleRename(thread.id, title)}
              onDelete={() => setPendingDelete(thread)}
            />
          ))
        )}
      </div>

      {/* Chat area */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        {/* Thread title, and the way into the list on a phone */}
        <div className="flex w-full shrink-0 items-center gap-2 border-b border-[var(--color-rule)] px-4 py-3 sm:px-5">
          <button
            type="button"
            onClick={() => setThreadsOpen(true)}
            aria-label="Show conversations"
            className="shrink-0 cursor-pointer mt-1 rounded-[var(--radius-sm)] border border-[var(--color-rule-2)] bg-[var(--color-paper)] p-1.5 text-[var(--color-ink-2)] transition-colors hover:text-[var(--color-accent)] lg:hidden"
          >
            <Messages2 size={16} color="currentColor" variant="Linear" />
          </button>

          <p
            className="min-w-0 flex-1 truncate text-[11px] mt-1 uppercase text-[var(--color-ink-3)]"
            style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}
          >
            {threadDetail ? threadDetail.title : 'New conversation'}
          </p>

          <Button
            variant="accent"
            size="sm"
            onClick={handleNewThread}
            aria-label="Start a new conversation"
            className="shrink-0 lg:hidden rounded-full"
          >
            <Plus size={14} strokeWidth={1.5} />
          </Button>
        </div>

        {/* Messages */}
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-4 sm:px-5 sm:pt-5">
          {isEmpty && !activeThreadId ? (
            <div
              style={{
                display: 'flex',
                width:"100%",
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                gap: 24,
                paddingBottom: 48,
              }}
            >
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 24,
                  fontWeight: 500,
                  color: 'var(--color-ink)',
                  textAlign: 'center',
                }}
              >
                What do you want to learn?
              </h2>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 480 }}>
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => void handleSend(prompt)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-rule-2)',
                      backgroundColor: 'var(--color-paper)',
                      color: 'white',
                      fontFamily: 'var(--font-sans)',
                      fontSize: 13,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      textAlign: 'left',
                    }}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : threadLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-16 w-3/4" />
              ))}
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  onSpeak={toggleSpeak}
                  speaking={speaking}
                  canSpeak={canSpeak}
                />
              ))}
              {isStreaming && streamingText && <StreamingBubble text={streamingText} />}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Composer */}
        <div
          className="w-full shrink-0 border-t border-[var(--color-rule)] px-3 py-3 sm:px-5 sm:py-4"
        >
          {dictation.listening && (
            <div className="mb-2 flex items-center gap-2">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-danger)] opacity-70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--color-danger)]" />
              </span>
              <p className="truncate text-[12px] text-[var(--color-ink-3)]">
                {dictation.interim || 'Listening — start speaking'}
              </p>
            </div>
          )}

          {dictation.error === 'permission-denied' && (
            <p className="mb-2 text-[12px] text-[var(--color-danger)]">
              Microphone access is blocked. Allow it in your browser settings to dictate.
            </p>
          )}

          <div className="flex items-end gap-2">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={dictation.listening ? 'Listening…' : t('placeholder')}
              rows={1}
              disabled={isStreaming}
              className="min-w-0 flex-1 resize-none rounded-[var(--radius-sm)] border border-[var(--color-rule-2)] bg-[var(--color-paper)] px-3.5 py-2.5 text-[14px] leading-normal text-[var(--color-ink)] outline-none"
              style={{ fontFamily: 'var(--font-sans)', maxHeight: 120, overflow: 'hidden' }}
            />

            {dictation.supported && (
              <button
                type="button"
                onClick={dictation.toggle}
                disabled={isStreaming}
                aria-label={dictation.listening ? 'Stop dictating' : 'Dictate a message'}
                aria-pressed={dictation.listening}
                title={dictation.listening ? 'Stop dictating' : 'Dictate a message'}
                className={
                  dictation.listening
                    ? 'shrink-0 cursor-pointer rounded-[var(--radius-sm)] border-none bg-[var(--color-danger)] p-2.5 text-white'
                    : 'shrink-0 cursor-pointer rounded-[var(--radius-sm)] border border-[var(--color-rule-2)] bg-[var(--color-paper)] p-2.5 text-[var(--color-ink-2)] transition-colors hover:text-[var(--color-accent)] disabled:opacity-50'
                }
              >
                {dictation.listening ? (
                  <MicrophoneSlash1 size={16} color="currentColor" variant="Bold" />
                ) : (
                  <Microphone2 size={16} color="currentColor" variant="Linear" />
                )}
              </button>
            )}

            {canSpeak && (
              <button
                type="button"
                onClick={() => {
                  if (voiceMode) stopSpeaking()
                  setVoiceMode((v) => !v)
                }}
                aria-label={voiceMode ? 'Turn off read answers aloud' : 'Read answers aloud'}
                aria-pressed={voiceMode}
                title={voiceMode ? 'Answers are read aloud' : 'Read answers aloud'}
                className={
                  voiceMode
                    ? 'shrink-0 cursor-pointer rounded-[var(--radius-sm)] border-none bg-[var(--color-accent)] p-2.5 text-white'
                    : 'shrink-0 cursor-pointer rounded-[var(--radius-sm)] border border-[var(--color-rule-2)] bg-[var(--color-paper)] p-2.5 text-[var(--color-ink-2)] transition-colors hover:text-[var(--color-accent)]'
                }
              >
                {voiceMode ? (
                  <VolumeHigh size={16} color="currentColor" variant="Bold" />
                ) : (
                  <VolumeCross size={16} color="currentColor" variant="Linear" />
                )}
              </button>
            )}

            <Button
              variant="accent"
              size="sm"
              onClick={() => void handleSend(inputValue)}
              disabled={!inputValue.trim() || isStreaming}
              style={{ flexShrink: 0, padding: '10px 14px' }}
            >
              <Send size={15} strokeWidth={1.5} />
            </Button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        icon={Trash}
        destructive
        title="Delete this conversation?"
        description={
          pendingDelete
            ? `"${pendingDelete.title}" and its messages will be removed from your list.`
            : ''
        }
        confirmLabel="Delete"
        onConfirm={() => (pendingDelete ? handleDelete(pendingDelete.id) : undefined)}
        onClose={() => setPendingDelete(null)}
      />

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .prose-sm p { margin: 0 0 8px 0; }
        .prose-sm p:last-child { margin-bottom: 0; }
        .prose-sm ul, .prose-sm ol { margin: 0 0 8px 1.2em; }
        .prose-sm code { background: var(--color-paper-3); padding: 1px 4px; border-radius: 3px; font-size: 12px; }
        .prose-sm pre { background: var(--color-paper-3); padding: 12px; border-radius: 6px; overflow-x: auto; }
      `}</style>
    </div>
  )
}
