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
  Folder2,
  DocumentText1,
  Crown1,
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
import { AiThinkingBubble, AiStreamingBubble } from '@/components/ai/ai-chat-bubble-status'
import { useAuthStore } from '@/lib/stores/auth-store'
import { usePaywallStore } from '@/lib/stores/paywall-store'
import type { EntitlementStatusDto } from '@propella/shared'

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
  const [selectedFileId, setSelectedFileId] = useState<string | null>(searchParams.get('fileId') ?? null)
  const [showFilePicker, setShowFilePicker] = useState(false)
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

  const { data: coursesData } = useQuery({
    queryKey: ['courses-with-files'],
    queryFn: () =>
      api
        .get<{ data: Array<{ id: string; code: string; title: string; files: Array<{ id: string; name: string; fileType: string }> }> }>('/courses')
        .then((r) => r.data)
        .catch(() => []),
  })

  const user = useAuthStore((s) => s.user)
  const openPaywall = usePaywallStore((s) => s.openPaywall)

  const { data: entitlements } = useQuery({
    queryKey: ['entitlements-status'],
    queryFn: () =>
      api
        .get<{ data: EntitlementStatusDto }>('/entitlements/status')
        .then((r) => r.data),
    enabled: Boolean(user && user.plan === 'free'),
  })

  const isFreePlan = user?.plan === 'free'
  const isAiLocked = Boolean(
    isFreePlan &&
      (entitlements?.remaining?.aiQuestions === 0 || entitlements?.isPaywallLocked),
  )

  const allFiles = (coursesData ?? []).flatMap((c) =>
    (c.files ?? []).map((f) => ({
      ...f,
      courseCode: c.code,
    }))
  )

  const activeFile = allFiles.find((f) => f.id === selectedFileId)

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

      if (isAiLocked) {
        openPaywall(
          'ai_assistant',
          'You have reached your Free Trial limit of AI questions. Upgrade to Scholar to continue asking questions.',
        )
        return
      }

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
        let token = getAccessToken()
        let response = await fetch(`${API_URL}/api/assistant/threads/${threadId}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          credentials: 'include',
          body: JSON.stringify({
            content,
            attachedFileId: selectedFileId || undefined,
          }),
        })

        if (response.status === 401) {
          try {
            const refreshRes = await api.post<{ data: { accessToken: string } }>('/auth/refresh')
            token = refreshRes.data.accessToken
            response = await fetch(`${API_URL}/api/assistant/threads/${threadId}/messages`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
              credentials: 'include',
              body: JSON.stringify({
                content,
                attachedFileId: selectedFileId || undefined,
              }),
            })
          } catch {
            // silent fallback
          }
        }

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}))
          const errMsg = errData?.error || errData?.message || 'Could not send message. Please try again.'
          if (
            response.status === 403 ||
            errMsg.toLowerCase().includes('trial') ||
            errMsg.toLowerCase().includes('paywall') ||
            errMsg.toLowerCase().includes('scholar')
          ) {
            openPaywall('ai_assistant', errMsg)
            await queryClient.invalidateQueries({ queryKey: ['entitlements-status'] })
          }
          throw new Error(errMsg)
        }

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
      } catch (err: any) {
        console.error('Assistant streaming error:', err)
      } finally {
        setIsStreaming(false)
        setStreamingText('')
        if (voiceMode && fullText.trim()) speak(fullText)
        await queryClient.invalidateQueries({ queryKey: ['chat-thread', threadId] })
        await queryClient.invalidateQueries({ queryKey: ['chat-threads'] })
      }
    },
    [activeThreadId, isStreaming, queryClient, dictation, voiceMode, speak, selectedFileId],
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

  useEffect(() => {
    const fileId = searchParams.get('fileId')
    if (fileId) {
      setSelectedFileId(fileId)
    }
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
              {isStreaming && !streamingText && <AiThinkingBubble label="Propella is thinking" />}
              {isStreaming && streamingText && <AiStreamingBubble text={streamingText} />}
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

          {activeFile && (
            <div className="mb-2 flex items-center gap-2 rounded-lg bg-[var(--color-accent-tint)] px-3 py-1.5 text-xs text-[var(--color-ink)] w-fit border border-[var(--color-accent)]/30">
              <Folder2 size={15} color="var(--color-accent)" variant="Bold" />
              <span className="font-semibold text-[var(--color-accent)]">{activeFile.courseCode}:</span>
              <span className="truncate max-w-[240px]">{activeFile.name}</span>
              <button
                type="button"
                onClick={() => setSelectedFileId(null)}
                aria-label="Remove attached file"
                className="ml-1 rounded px-1 hover:bg-black/10 transition-colors text-[var(--color-ink-3)] hover:text-rose-500 font-bold"
              >
                ✕
              </button>
            </div>
          )}

          {isAiLocked && (
            <div className="mb-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-amber-500/15 border border-amber-500/30">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
                  <Crown1 size={18} variant="Bold" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[var(--color-ink)]">
                    Free Trial AI Query Limit Reached ({entitlements?.trialUsage?.aiQuestionsLimit ?? 3}/{entitlements?.trialUsage?.aiQuestionsLimit ?? 3})
                  </p>
                  <p className="text-[11px] text-[var(--color-ink-muted)]">
                    Subscribe to Scholar for unlimited 24/7 AI explanations and question breakdowns.
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => openPaywall('ai_assistant')}
                className="bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs shrink-0"
              >
                Upgrade to Scholar
              </Button>
            </div>
          )}

          {isFreePlan && !isAiLocked && (
            <div className="mb-2 flex items-center justify-between text-[11px] text-[var(--color-ink-muted)] px-1">
              <span className="flex items-center gap-1 font-medium">
                🎯 Free Trial Sample:
                <strong className="text-[var(--color-ink)] font-bold">
                  {entitlements?.remaining?.aiQuestions ?? 3} AI questions remaining
                </strong>
              </span>
              <button
                type="button"
                onClick={() => openPaywall('ai_assistant')}
                className="text-amber-600 dark:text-amber-400 hover:underline font-semibold"
              >
                Unlock Unlimited &rarr;
              </button>
            </div>
          )}

          <div className="flex items-end gap-2">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isAiLocked
                  ? 'Free trial sample limit reached. Upgrade to continue...'
                  : dictation.listening
                    ? 'Listening…'
                    : t('placeholder')
              }
              rows={1}
              disabled={isStreaming || isAiLocked}
              className="min-w-0 flex-1 resize-none rounded-[var(--radius-sm)] border border-[var(--color-rule-2)] bg-[var(--color-paper)] px-3.5 py-2.5 text-[14px] leading-normal text-[var(--color-ink)] outline-none"
              style={{ fontFamily: 'var(--font-sans)', maxHeight: 120, overflow: 'hidden' }}
            />

            {allFiles.length > 0 && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowFilePicker((v) => !v)}
                  aria-label="Reference Course File"
                  title="Reference a course file from your library"
                  className={cn(
                    'shrink-0 cursor-pointer rounded-[var(--radius-sm)] border p-2.5 transition-colors',
                    activeFile
                      ? 'border-[var(--color-accent)] bg-[var(--color-accent-tint)] text-[var(--color-accent)]'
                      : 'border-[var(--color-rule-2)] bg-[var(--color-paper)] text-[var(--color-ink-2)] hover:text-[var(--color-accent)]',
                  )}
                >
                  <Folder2 size={16} color="currentColor" variant={activeFile ? 'Bold' : 'Linear'} />
                </button>

                {showFilePicker && (
                  <div className="absolute bottom-full right-0 mb-2 w-72 max-h-60 overflow-y-auto rounded-xl border border-[var(--color-rule)] bg-[var(--color-paper-2)] p-2 shadow-xl z-50">
                    <p className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-ink-3)]">
                      Reference Course File
                    </p>
                    <div className="flex flex-col gap-1 mt-1">
                      {allFiles.map((file) => (
                        <button
                          key={file.id}
                          type="button"
                          onClick={() => {
                            setSelectedFileId(file.id)
                            setShowFilePicker(false)
                          }}
                          className={cn(
                            'flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors',
                            selectedFileId === file.id
                              ? 'bg-[var(--color-accent)] text-white font-medium'
                              : 'text-[var(--color-ink)] hover:bg-[var(--color-paper-3)]',
                          )}
                        >
                          <DocumentText1 size={14} color="currentColor" variant="Linear" />
                          <div className="min-w-0 flex-1 truncate">
                            <span className="font-semibold opacity-85 mr-1">[{file.courseCode}]</span>
                            <span>{file.name}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

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
