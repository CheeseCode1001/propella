'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Send } from 'lucide-react'
import { Magicpen } from 'iconsax-reactjs'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Link } from '@/lib/i18n/navigation'
import { api, getAccessToken } from '@/lib/api-client'
import { API_URL } from '@/lib/constants'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface TopicChatModalProps {
  open: boolean
  onClose: () => void
  subjectSlug: string
  subjectName: string
  topicSlug: string
  topicName: string
}

/**
 * Ask the assistant about the topic without leaving the page.
 *
 * This is not a separate chat system: it creates a real thread through the
 * usual endpoints, so everything said here appears on the assistant page
 * afterwards and can be picked back up there.
 */
export function TopicChatModal({
  open,
  onClose,
  subjectSlug,
  subjectName,
  topicSlug,
  topicName,
}: TopicChatModalProps) {
  const queryClient = useQueryClient()
  const [threadId, setThreadId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const endRef = useRef<HTMLDivElement>(null)

  const suggestions = [
    `Explain ${topicName} in simpler terms`,
    `What is most likely to be examined from ${topicName}?`,
    `Give me a worked example on ${topicName}`,
  ]

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingText])

  const send = useCallback(
    async (question: string) => {
      const content = question.trim()
      if (!content || streaming) return

      setError(null)
      setInput('')
      setMessages((prev) => [...prev, { role: 'user', content }])
      setStreaming(true)
      setStreamingText('')

      let reply = ''

      try {
        // One thread per modal session, created on the first question so
        // opening and closing without asking leaves nothing behind.
        let id = threadId
        if (!id) {
          const created = await api.post<{ data: { id: string } }>('/assistant/threads')
          id = created.data.id
          setThreadId(id)
        }

        const token = getAccessToken()
        const response = await fetch(`${API_URL}/api/assistant/threads/${id}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          credentials: 'include',
          body: JSON.stringify({
            content,
            // Gives the assistant the syllabus context it answers against.
            attachedTopic: { subjectSlug, topicSlug },
          }),
        })

        if (response.status === 429) {
          throw new Error(
            'You have asked a lot of questions just now. Please wait a moment and try again.',
          )
        }
        if (!response.ok) throw new Error('The assistant could not answer that. Please try again.')

        const reader = response.body?.getReader()
        const decoder = new TextDecoder()

        if (reader) {
          for (;;) {
            const { done, value } = await reader.read()
            if (done) break
            for (const line of decoder.decode(value).split('\n')) {
              if (line.startsWith('data: ') && !line.includes('[DONE]') && !line.includes('[ERROR]')) {
                reply += line.slice(6)
                setStreamingText(reply)
              }
            }
          }
        }

        if (reply.trim()) {
          setMessages((prev) => [...prev, { role: 'assistant', content: reply }])
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong.')
      } finally {
        setStreaming(false)
        setStreamingText('')
        // The conversation now exists on the assistant page too.
        await queryClient.invalidateQueries({ queryKey: ['chat-threads'] })
        if (threadId) {
          await queryClient.invalidateQueries({ queryKey: ['chat-thread', threadId] })
        }
      }
    },
    [streaming, threadId, subjectSlug, topicSlug, queryClient],
  )

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title="Ask about this topic"
      subtitle={`${subjectName} · ${topicName}`}
      footer={
        <div className="flex flex-col gap-2">
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  void send(input)
                }
              }}
              rows={1}
              disabled={streaming}
              placeholder={`Ask anything about ${topicName}…`}
              className="min-w-0 flex-1 resize-none rounded-[var(--radius-sm)] border border-[var(--color-rule-2)] bg-[var(--color-paper)] px-3.5 py-2.5 text-[14px] text-[var(--color-ink)] outline-none focus:border-[var(--color-accent)]"
              style={{ fontFamily: 'var(--font-sans)', maxHeight: 96 }}
            />
            <Button
              variant="accent"
              size="sm"
              onClick={() => void send(input)}
              disabled={!input.trim() || streaming}
              style={{ padding: '10px 14px' }}
            >
              <Send size={15} strokeWidth={1.5} />
            </Button>
          </div>

          {threadId && (
            <p className="text-[11.5px] text-[var(--color-ink-3)]">
              Saved to your{' '}
              <Link href="/assistant" className="text-[var(--color-accent)] underline">
                AI assistant
              </Link>
              .
            </p>
          )}
        </div>
      }
    >
      <div className="flex min-h-[280px] flex-col gap-4">
        {messages.length === 0 && !streaming && (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <div
              className="flex items-center justify-center rounded-full"
              style={{ width: 44, height: 44, backgroundColor: 'var(--color-accent-tint)' }}
            >
              <Magicpen size={22} color="var(--color-accent)" variant="Bold" />
            </div>
            <p className="max-w-[360px] text-[13.5px] leading-[1.6] text-[var(--color-ink-2)]">
              Ask anything about {topicName}. Everything you ask here is saved to your AI
              assistant, so you can carry on later.
            </p>

            <div className="flex w-full flex-col gap-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => void send(suggestion)}
                  className="cursor-pointer rounded-[var(--radius-sm)] border border-[var(--color-rule-2)] bg-[var(--color-paper)] px-3.5 py-2.5 text-left text-[13px] text-[var(--color-ink-2)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-ink)]"
                  style={{ fontFamily: 'var(--font-sans)' }}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message, i) => (
          <div
            key={i}
            className="flex flex-col"
            style={{ alignItems: message.role === 'user' ? 'flex-end' : 'flex-start' }}
          >
            <div
              className="max-w-[85%] text-[14px] leading-[1.6] text-[var(--color-ink)]"
              style={{
                padding: message.role === 'user' ? '10px 14px' : 0,
                backgroundColor:
                  message.role === 'user' ? 'var(--color-accent-tint)' : 'transparent',
                borderRadius: 'var(--radius-md)',
                fontFamily: 'var(--font-sans)',
              }}
            >
              {message.role === 'user' ? (
                <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{message.content}</p>
              ) : (
                <div className="prose-sm">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        ))}

        {streaming && (
          <div className="max-w-[85%] text-[14px] leading-[1.6] text-[var(--color-ink)]">
            {streamingText ? (
              <div className="prose-sm">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{streamingText}</ReactMarkdown>
              </div>
            ) : (
              <p className="text-[13px] text-[var(--color-ink-3)]">Thinking…</p>
            )}
          </div>
        )}

        {error && <p className="text-[13px] text-[var(--color-danger)]">{error}</p>}

        <div ref={endRef} />
      </div>
    </Modal>
  )
}
