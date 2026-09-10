'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Providers } from '../providers'
import { Shell, PageHeader } from '@/components/shell'
import { api } from '@/lib/api'

interface AdminUser {
  id: string
  name: string
  email: string
  role: 'student' | 'admin'
  plan: string
  emailVerified: boolean
  onboardingCompleted: boolean
  createdAt: string
  quizAttempts: number
  studySessions: number
}

interface UsersResponse {
  data: { users: AdminUser[]; total: number; page: number; limit: number }
}

function UsersTable() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [error] = useState<string | null>(null)

  const params = new URLSearchParams({ page: String(page), limit: '25' })
  if (search) params.set('search', search)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', search, page],
    queryFn: () => api.get<UsersResponse>(`/admin/users?${params}`).then((r) => r.data),
  })

  // Roles are deliberately not editable here — granting admin access is done on
  // the Administrators page, which is restricted to existing admins.
  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1

  return (
    <div className="card">
      <div style={{ padding: 14, borderBottom: '1px solid var(--rule)' }}>
        <input
          className="field"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
        />
      </div>

      {error && (
        <p
          role="alert"
          style={{
            margin: 0,
            padding: '10px 14px',
            background: 'var(--danger-tint)',
            color: 'var(--danger)',
            fontSize: 13,
          }}
        >
          {error}
        </p>
      )}

      {isLoading ? (
        <p style={{ padding: 24, color: 'var(--ink-3)' }}>Loading…</p>
      ) : !data || data.users.length === 0 ? (
        <p style={{ padding: 32, textAlign: 'center', color: 'var(--ink-3)' }}>No users found.</p>
      ) : (
        <>
          <table className="data">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th style={{ width: 88 }}>Role</th>
                <th style={{ width: 92 }}>Status</th>
                <th style={{ width: 92 }}>Activity</th>
                <th style={{ width: 106 }}>Joined</th>
              </tr>
            </thead>
            <tbody>
              {data.users.map((u) => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 500 }}>{u.name}</td>
                  <td style={{ color: 'var(--ink-2)' }}>{u.email}</td>
                  <td>
                    <span
                      className="pill"
                      style={
                        u.role === 'admin'
                          ? { background: 'var(--accent-tint)', color: 'var(--accent)' }
                          : { background: 'var(--paper-3)', color: 'var(--ink-2)' }
                      }
                    >
                      {u.role}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--ink-2)' }}>
                    <div style={{ color: u.emailVerified ? 'var(--success)' : 'var(--warning)' }}>
                      {u.emailVerified ? 'verified' : 'unverified'}
                    </div>
                    <div style={{ color: 'var(--ink-3)' }}>
                      {u.onboardingCompleted ? 'onboarded' : 'in setup'}
                    </div>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--ink-2)' }}>
                    <div>{u.quizAttempts} quizzes</div>
                    <div style={{ color: 'var(--ink-3)' }}>{u.studySessions} sessions</div>
                  </td>
                  <td style={{ fontSize: 12.5, color: 'var(--ink-2)' }}>
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 12,
              borderTop: '1px solid var(--rule)',
              fontSize: 13,
              color: 'var(--ink-2)',
            }}
          >
            <span>{data.total.toLocaleString()} users</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                className="btn"
                style={{ padding: '5px 10px' }}
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                type="button"
              >
                Previous
              </button>
              <span>
                {page} / {totalPages}
              </span>
              <button
                className="btn"
                style={{ padding: '5px 10px' }}
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                type="button"
              >
                Next
              </button>
            </span>
          </div>
        </>
      )}
    </div>
  )
}

export default function UsersPage() {
  return (
    <Providers>
      <Shell>
        <PageHeader
          title="Users"
          subtitle="Accounts, verification state and activity. Admin access is managed on the Administrators page."
        />
        <UsersTable />
      </Shell>
    </Providers>
  )
}
