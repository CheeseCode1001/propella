'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'
import { Providers } from '../providers'
import { Shell, PageHeader } from '@/components/shell'
import { api } from '@/lib/api'

type Audience = 'all' | 'active' | 'unverified'

const AUDIENCES: { value: Audience; label: string; hint: string }[] = [
  { value: 'all', label: 'All students', hint: 'Every student account.' },
  { value: 'active', label: 'Active students', hint: 'Studied in the last 30 days.' },
  {
    value: 'unverified',
    label: 'Unverified accounts',
    hint: 'Signed up but never confirmed their email.',
  },
]

const TITLE_MAX = 80
const BODY_MAX = 200

interface BroadcastResult {
  recipients: number
  pushesDelivered: number
}

function BroadcastForm() {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [deeplink, setDeeplink] = useState('')
  const [audience, setAudience] = useState<Audience>('all')
  const [confirming, setConfirming] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<BroadcastResult | null>(null)

  const ready = title.trim().length > 0 && body.trim().length > 0

  async function send() {
    setError(null)
    setResult(null)
    setSending(true)
    try {
      const res = await api.post<{ data: BroadcastResult }>('/admin/broadcast', {
        title: title.trim(),
        body: body.trim(),
        audience,
        deeplink: deeplink.trim() || null,
      })
      setResult(res.data)
      setTitle('')
      setBody('')
      setDeeplink('')
      setConfirming(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send that announcement')
      setConfirming(false)
    } finally {
      setSending(false)
    }
  }

  const audienceLabel = AUDIENCES.find((a) => a.value === audience)?.label ?? 'students'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 640 }}>
      <div className="card" style={{ padding: 16 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Write an announcement</h2>
        <p style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 14 }}>
          This appears in every recipient&apos;s notifications, and as a push on devices where
          they have turned notifications on. It cannot be recalled once sent.
        </p>

        <label style={{ display: 'block', fontSize: 13, marginBottom: 6 }}>
          Title
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value.slice(0, TITLE_MAX))}
            placeholder="New past questions added"
            style={{ width: '100%', marginTop: 4 }}
          />
        </label>
        <p style={{ fontSize: 11, color: 'var(--ink-3)', marginBottom: 12 }}>
          {title.length}/{TITLE_MAX}
        </p>

        <label style={{ display: 'block', fontSize: 13, marginBottom: 6 }}>
          Message
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value.slice(0, BODY_MAX))}
            placeholder="2019–2023 Chemistry papers are now available in practice."
            rows={3}
            style={{ width: '100%', marginTop: 4, resize: 'vertical' }}
          />
        </label>
        <p style={{ fontSize: 11, color: 'var(--ink-3)', marginBottom: 12 }}>
          {body.length}/{BODY_MAX}
        </p>

        <label style={{ display: 'block', fontSize: 13, marginBottom: 6 }}>
          Link (optional)
          <input
            value={deeplink}
            onChange={(e) => setDeeplink(e.target.value)}
            placeholder="/quizzes"
            style={{ width: '100%', marginTop: 4 }}
          />
        </label>
        <p style={{ fontSize: 11, color: 'var(--ink-3)' }}>
          Where tapping the notification takes them. Defaults to the dashboard.
        </p>
      </div>

      <div className="card" style={{ padding: 16 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 10 }}>Who receives it</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {AUDIENCES.map((a) => (
            <label
              key={a.value}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 6,
                border: `1px solid ${audience === a.value ? 'var(--accent)' : 'var(--rule)'}`,
                background: audience === a.value ? 'var(--accent-tint)' : 'transparent',
                cursor: 'pointer',
              }}
            >
              <input
                type="radio"
                name="audience"
                checked={audience === a.value}
                onChange={() => setAudience(a.value)}
                style={{ marginTop: 2 }}
              />
              <span>
                <span style={{ display: 'block', fontSize: 13.5, fontWeight: 500 }}>{a.label}</span>
                <span style={{ display: 'block', fontSize: 12, color: 'var(--ink-2)' }}>
                  {a.hint}
                </span>
              </span>
            </label>
          ))}
        </div>
      </div>

      {error && (
        <p role="alert" style={{ fontSize: 13, color: 'var(--danger)' }}>
          {error}
        </p>
      )}

      {result && (
        <p role="status" style={{ fontSize: 13, color: 'var(--success)' }}>
          Sent to {result.recipients} student{result.recipients === 1 ? '' : 's'}.{' '}
          {result.pushesDelivered} push notification
          {result.pushesDelivered === 1 ? '' : 's'} delivered.
        </p>
      )}

      {/* Two steps on purpose: this reaches every student at once. */}
      {confirming ? (
        <div className="card" style={{ padding: 16, borderColor: 'var(--accent)' }}>
          <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
            Send this to {audienceLabel.toLowerCase()}?
          </p>
          <p style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 14 }}>
            It will appear in their notifications straight away and cannot be undone.
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="btn btn-primary"
              onClick={() => void send()}
              disabled={sending}
              type="button"
            >
              <Send size={14} />
              {sending ? 'Sending…' : 'Yes, send it'}
            </button>
            <button
              className="btn"
              onClick={() => setConfirming(false)}
              disabled={sending}
              type="button"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div>
          <button
            className="btn btn-primary"
            onClick={() => setConfirming(true)}
            disabled={!ready}
            type="button"
          >
            <Send size={14} />
            Review and send
          </button>
        </div>
      )}
    </div>
  )
}

export default function BroadcastPage() {
  return (
    <Providers>
      <Shell>
        <PageHeader
          title="Announcements"
          subtitle="Send a notification to students. Use it sparingly — it reaches everyone."
        />
        <BroadcastForm />
      </Shell>
    </Providers>
  )
}
