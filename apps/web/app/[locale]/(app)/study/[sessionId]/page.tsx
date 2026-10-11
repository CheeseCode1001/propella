'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { Link, useRouter } from '@/lib/i18n/navigation'
import { useTranslations } from 'next-intl'
import ReactMarkdown from 'react-markdown'
import { Pause, Play, X, FileText, MessageCircle, BookOpen } from 'lucide-react'
import { api } from '@/lib/api-client'
import { Button } from '@/components/ui/button'

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

const MOCK_CONTENT = `## Overview

This topic covers the fundamental principles and concepts you need to master for your exam.

### Key Concepts

- Understand the core definitions and terminology
- Apply theoretical knowledge to practical scenarios
- Analyse relationships between concepts
- Evaluate different approaches and their implications

### Important Principles

The foundational ideas in this topic build on prior knowledge. Pay attention to:

1. **Core definitions** — Memorise precise definitions as examiners test these directly
2. **Application** — Practice applying concepts to novel scenarios
3. **Analysis** — Break down complex problems into component parts
4. **Synthesis** — Combine multiple ideas to form coherent arguments

### Exam Tips

Past papers reveal that questions frequently test:
- Direct recall of definitions (30% of marks)
- Application to real-world scenarios (40% of marks)
- Extended analytical writing (30% of marks)

Focus your revision on areas with high exam weight. Use active recall rather than passive re-reading.`

export default function StudySessionPage() {
  const params = useParams()
  const router = useRouter()
  const t = useTranslations('study')
  const tTopics = useTranslations('topics')
  const tNav = useTranslations('nav')
  const sessionId = params.sessionId as string

  const [elapsed, setElapsed] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [notesOpen, setNotesOpen] = useState(false)
  const [notes, setNotes] = useState('')
  const [showSummary, setShowSummary] = useState(false)
  const [summaryData, setSummaryData] = useState<{ durationSec: number; xpAwarded: number } | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const elapsedRef = useRef(0)

  useEffect(() => {
    if (isPaused) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }

    intervalRef.current = setInterval(() => {
      elapsedRef.current += 1
      setElapsed((prev) => prev + 1)
    }, 1000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isPaused])

  const handleDone = useCallback(async () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    const durationSec = elapsedRef.current

    try {
      const result = await api.post<{ data: { xpAwarded: number } }>(
        `/sessions/${sessionId}/end`,
        { durationSec, notesMarkdown: notes || undefined },
      )
      setSummaryData({ durationSec, xpAwarded: result.data.xpAwarded })
      setShowSummary(true)

      setTimeout(() => {
        router.push('/roadmap')
      }, 3000)
    } catch {
      router.push('/roadmap')
    }
  }, [sessionId, notes, router])

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-paper)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Minimal top bar */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 52,
          backgroundColor: 'var(--color-paper)',
          borderBottom: '1px solid var(--color-rule)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          zIndex: 50,
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 18,
            color: 'var(--color-ink)',
            letterSpacing: '0.02em',
          }}
        >
          {formatTime(elapsed)}
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsPaused((p) => !p)}
            aria-label={isPaused ? t('resumeSession') : t('pauseSession')}
          >
            {isPaused ? <Play size={16} /> : <Pause size={16} />}
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13 }}>
              {isPaused ? t('resumeSession') : t('pauseSession')}
            </span>
          </Button>

          <Button variant="accent" size="sm" onClick={handleDone}>
            <X size={14} />
            Done
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div
        style={{
          flex: 1,
          paddingTop: 52,
          paddingBottom: 80,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            maxWidth: 680,
            width: '100%',
            padding: '40px 24px',
          }}
        >
          {isPaused && (
            <div
              style={{
                backgroundColor: 'var(--color-paper-2)',
                border: '1px solid var(--color-rule)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 16px',
                marginBottom: 24,
                fontFamily: 'var(--font-sans)',
                fontSize: 13,
                color: 'var(--color-ink-2)',
                textAlign: 'center',
              }}
            >
              Session paused. Click Resume to continue.
            </div>
          )}

          <div
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 15,
              lineHeight: 1.75,
              color: 'var(--color-ink)',
            }}
          >
            <ReactMarkdown
              components={{
                h2: ({ children }) => (
                  <h2
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 26,
                      fontWeight: 500,
                      color: 'var(--color-ink)',
                      marginBottom: 16,
                      marginTop: 32,
                    }}
                  >
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: 17,
                      fontWeight: 600,
                      color: 'var(--color-ink)',
                      marginBottom: 10,
                      marginTop: 24,
                    }}
                  >
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: 15,
                      lineHeight: 1.75,
                      color: 'var(--color-ink)',
                      marginBottom: 14,
                    }}
                  >
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul style={{ paddingLeft: 20, marginBottom: 14 }}>{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol style={{ paddingLeft: 20, marginBottom: 14 }}>{children}</ol>
                ),
                li: ({ children }) => (
                  <li
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: 15,
                      lineHeight: 1.7,
                      color: 'var(--color-ink)',
                      marginBottom: 4,
                    }}
                  >
                    {children}
                  </li>
                ),
                strong: ({ children }) => (
                  <strong style={{ fontWeight: 600, color: 'var(--color-ink)' }}>
                    {children}
                  </strong>
                ),
              }}
            >
              {MOCK_CONTENT}
            </ReactMarkdown>
          </div>
        </div>
      </div>

      {/* Bottom action bar */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'var(--color-paper)',
          borderTop: '1px solid var(--color-rule)',
          padding: '12px 24px',
          display: 'flex',
          gap: 12,
          alignItems: 'center',
          zIndex: 50,
        }}
      >
        <Button variant="secondary" size="sm" onClick={() => setNotesOpen(true)}>
          <FileText size={14} />
          {tTopics('notes')}
        </Button>
        <Button variant="secondary" size="sm" asChild>
          <Link href="/assistant">
            <MessageCircle size={14} />
            {tTopics('askAi')}
          </Link>
        </Button>
        <Button variant="accent" size="sm" asChild>
          <Link href="/quizzes">
            <BookOpen size={14} />
            {tTopics('startPractice')}
          </Link>
        </Button>
      </div>

      {/* Notes sheet */}
      {notesOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
          }}
        >
          {/* Backdrop */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.3)',
            }}
            onClick={() => setNotesOpen(false)}
          />

          {/* Sheet */}
          <div
            style={{
              position: 'relative',
              backgroundColor: 'var(--color-paper)',
              borderTopLeftRadius: 'var(--radius-lg)',
              borderTopRightRadius: 'var(--radius-lg)',
              height: '60vh',
              display: 'flex',
              flexDirection: 'column',
              padding: 24,
              gap: 12,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <h3
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 15,
                  fontWeight: 600,
                  color: 'var(--color-ink)',
                  margin: 0,
                }}
              >
                {t('notes')}
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setNotesOpen(false)}>
                <X size={14} />
              </Button>
            </div>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('notesPlaceholder')}
              style={{
                flex: 1,
                resize: 'none',
                fontFamily: 'var(--font-sans)',
                fontSize: 14,
                lineHeight: 1.6,
                color: 'var(--color-ink)',
                backgroundColor: 'var(--color-paper-2)',
                border: '1px solid var(--color-rule)',
                borderRadius: 'var(--radius-sm)',
                padding: 12,
                outline: 'none',
              }}
            />

            <Button variant="accent" onClick={() => setNotesOpen(false)}>
              Save notes
            </Button>
          </div>
        </div>
      )}

      {/* Summary card */}
      {showSummary && summaryData && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.4)',
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--color-card)',
              borderRadius: 'var(--radius-lg)',
              padding: 32,
              maxWidth: 320,
              width: '90%',
              textAlign: 'center',
              boxShadow: 'var(--shadow-md)',
              animation: 'fadeIn 0.3s ease',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 28,
                fontWeight: 500,
                color: 'var(--color-ink)',
                marginBottom: 8,
              }}
            >
              {formatTime(summaryData.durationSec)}
            </p>
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 14,
                color: 'var(--color-ink-2)',
                marginBottom: 16,
              }}
            >
              Great session! Returning to roadmap...
            </p>
            {summaryData.xpAwarded > 0 && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  backgroundColor: 'var(--color-accent-tint)',
                  color: 'var(--color-accent)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '6px 12px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                {t('xpEarned', { xp: summaryData.xpAwarded })}
              </div>
            )}
          </div>
          <style>{`@keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }`}</style>
        </div>
      )}
    </div>
  )
}
