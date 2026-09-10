'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ShieldCheck, ShieldOff, UserPlus } from 'lucide-react'
import { Providers } from '../providers'
import { Shell, PageHeader } from '@/components/shell'
import { api } from '@/lib/api'

interface AdminAccount {
  id: string
  name: string
  email: string
  emailVerified: boolean
  createdAt: string
}

interface AdminsResponse {
  data: { admins: AdminAccount[] }
}

function Administrators() {
  const queryClient = useQueryClient()
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [working, setWorking] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-admins'],
    queryFn: () => api.get<AdminsResponse>('/admin/admins').then((r) => r.data.admins),
  })

  async function handleGrant(e: React.FormEvent) {
    e.preventDefault()
    const value = email.trim()
    if (!value || working) return

    setError(null)
    setNotice(null)
    setWorking(true)
    try {
      await api.post('/admin/admins', { email: value })
      setEmail('')
      setNotice(`${value} now has admin access.`)
      void queryClient.invalidateQueries({ queryKey: ['admin-admins'] })
      void queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not grant admin access')
    } finally {
      setWorking(false)
    }
  }

  async function handleRevoke(admin: AdminAccount) {
    if (!window.confirm(`Remove admin access from ${admin.email}?`)) return

    setError(null)
    setNotice(null)
    try {
      await api.patch(`/admin/users/${admin.id}/role`, { role: 'student' })
      setNotice(`${admin.email} no longer has admin access.`)
      void queryClient.invalidateQueries({ queryKey: ['admin-admins'] })
      void queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not remove admin access')
    }
  }

  const admins = data ?? []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Grant access */}
      <div className="card" style={{ padding: 16 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Give someone admin access</h2>
        <p style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 12 }}>
          They need a Propella account first. Enter the email address they signed up with.
        </p>

        <form onSubmit={handleGrant} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            aria-label="Email address"
            style={{ flex: 1, minWidth: 220 }}
          />
          <button type="submit" className="btn btn-primary" disabled={working}>
            <UserPlus size={14} />
            {working ? 'Granting…' : 'Grant access'}
          </button>
        </form>

        {error && (
          <p role="alert" style={{ marginTop: 10, fontSize: 13, color: 'var(--danger)' }}>
            {error}
          </p>
        )}
        {notice && (
          <p role="status" style={{ marginTop: 10, fontSize: 13, color: 'var(--success)' }}>
            {notice}
          </p>
        )}
      </div>

      {/* Current admins */}
      <div className="card">
        <div style={{ padding: 14, borderBottom: '1px solid var(--rule)' }}>
          <h2 style={{ fontSize: 15, fontWeight: 600 }}>
            Administrators{admins.length > 0 ? ` (${admins.length})` : ''}
          </h2>
        </div>

        {isLoading ? (
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                style={{ height: 40, borderRadius: 6, background: 'var(--paper-3)' }}
              />
            ))}
          </div>
        ) : admins.length === 0 ? (
          <p style={{ padding: 16, fontSize: 13, color: 'var(--ink-2)' }}>
            No administrators found.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th style={{ width: 110 }}>Status</th>
                  <th style={{ width: 106 }}>Since</th>
                  <th style={{ width: 120 }} />
                </tr>
              </thead>
              <tbody>
                {admins.map((a) => (
                  <tr key={a.id}>
                    <td style={{ fontWeight: 500 }}>{a.name}</td>
                    <td style={{ color: 'var(--ink-2)' }}>{a.email}</td>
                    <td>
                      <span
                        className="pill"
                        style={{ background: 'var(--accent-tint)', color: 'var(--accent)' }}
                      >
                        <ShieldCheck size={12} />
                        admin
                      </span>
                    </td>
                    <td style={{ fontSize: 12.5, color: 'var(--ink-2)' }}>
                      {new Date(a.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <button
                        className="btn btn-danger"
                        style={{ padding: '5px 10px', fontSize: 12.5 }}
                        onClick={() => void handleRevoke(a)}
                        type="button"
                        // The last admin must keep access or nobody can get back in.
                        disabled={admins.length <= 1}
                        title={
                          admins.length <= 1
                            ? 'There must be at least one administrator'
                            : undefined
                        }
                      >
                        <ShieldOff size={14} />
                        Revoke
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default function AdministratorsPage() {
  return (
    <Providers>
      <Shell>
        <PageHeader
          title="Administrators"
          subtitle="Who can sign in to this console, and what they can reach."
        />
        <Administrators />
      </Shell>
    </Providers>
  )
}
