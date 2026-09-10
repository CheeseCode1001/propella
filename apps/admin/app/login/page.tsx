'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShieldCheck } from 'lucide-react'
import { api, ApiError, setToken } from '@/lib/api'

interface LoginResponse {
  data: { accessToken: string; user: { name: string; email: string } }
}

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const res = await api.post<LoginResponse>('/auth/login', { email, password })
      setToken(res.data.accessToken)

      // Signing in is not enough — the account must actually hold the admin
      // role, which only the API can confirm.
      try {
        await api.get('/admin/metrics')
      } catch (err) {
        setToken(null)
        if (err instanceof ApiError && err.status === 403) {
          throw new Error('That account does not have administrator access.')
        }
        throw err
      }

      router.replace('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign in')
      setBusy(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 20 }}>
      <div className="card" style={{ width: '100%', maxWidth: 380, padding: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 20 }}>
          <ShieldCheck size={20} color="var(--accent)" />
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>Propella Admin</div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>Administrator sign in</div>
          </div>
        </div>

        <form onSubmit={onSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label className="label" htmlFor="email">
              Email address
            </label>
            <input
              id="email"
              className="field"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: 18 }}>
            <label className="label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              className="field"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <p
              role="alert"
              style={{
                color: 'var(--danger)',
                background: 'var(--danger-tint)',
                padding: '9px 12px',
                borderRadius: 'var(--radius)',
                marginBottom: 14,
                fontSize: 13,
              }}
            >
              {error}
            </p>
          )}

          <button className="btn btn-primary" style={{ width: '100%' }} disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p style={{ marginTop: 16, fontSize: 12, color: 'var(--ink-3)', lineHeight: 1.6 }}>
          Admin access is granted from the server:
          <br />
          <code style={{ fontSize: 11.5 }}>
            pnpm --filter @propella/api admin:grant you@example.com
          </code>
        </p>
      </div>
    </div>
  )
}
