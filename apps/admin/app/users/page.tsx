'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, ChevronLeft, ChevronRight, Shield, Sparkles } from 'lucide-react'
import { Providers } from '../providers'
import { Shell, PageHeader } from '@/components/shell'
import { SkeletonTable } from '@/components/skeleton'
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

  const params = new URLSearchParams({ page: String(page), limit: '25' })
  if (search) params.set('search', search)

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-users', search, page],
    queryFn: () => api.get<UsersResponse>(`/admin/users?${params}`).then((r) => r.data),
  })

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1

  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      {/* Search Header */}
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--rule)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          background: 'var(--paper-2)',
        }}
      >
        <div style={{ position: 'relative', flex: 1, maxWidth: 380 }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--ink-3)',
            }}
          />
          <input
            className="field"
            style={{ paddingLeft: 36 }}
            placeholder="Search by student name or email…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
          />
        </div>

        {data && (
          <div style={{ fontSize: 12.5, color: 'var(--ink-3)', fontWeight: 500 }}>
            Showing <strong>{data.users.length}</strong> of <strong>{data.total}</strong> accounts
          </div>
        )}
      </div>

      {error && (
        <div
          role="alert"
          style={{
            margin: 16,
            padding: '12px 16px',
            background: 'var(--danger-tint)',
            color: 'var(--danger)',
            fontSize: 13,
            borderRadius: 8,
          }}
        >
          Failed to load users from the server.
        </div>
      )}

      {isLoading ? (
        <SkeletonTable rows={8} cols={6} />
      ) : !data || data.users.length === 0 ? (
        <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--ink-3)' }}>
          <p style={{ margin: 0, fontWeight: 600, fontSize: 15, color: 'var(--ink)' }}>No users found</p>
          <p style={{ margin: '6px 0 0', fontSize: 13 }}>
            {search ? 'Try adjusting your search query.' : 'Registered student accounts will show up here.'}
          </p>
        </div>
      ) : (
        <>
          <div style={{ overflowX: 'auto' }}>
            <table className="data">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Email</th>
                  <th style={{ width: 100 }}>Role</th>
                  <th style={{ width: 100 }}>Plan</th>
                  <th style={{ width: 120 }}>Status</th>
                  <th style={{ width: 120 }}>Activity</th>
                  <th style={{ width: 110 }}>Joined</th>
                </tr>
              </thead>
              <tbody>
                {data.users.map((u) => {
                  const initial = (u.name || u.email || 'U').charAt(0).toUpperCase()
                  const isScholar = u.plan === 'scholar'

                  return (
                    <tr key={u.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              backgroundColor: u.role === 'admin' ? 'var(--accent)' : 'var(--paper-3)',
                              color: u.role === 'admin' ? '#FFFFFF' : 'var(--ink)',
                              display: 'grid',
                              placeItems: 'center',
                              fontWeight: 700,
                              fontSize: 13,
                              flexShrink: 0,
                            }}
                          >
                            {initial}
                          </div>
                          <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{u.name || 'Unnamed'}</span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--ink-2)' }}>{u.email}</td>
                      <td>
                        <span
                          className={`pill ${u.role === 'admin' ? 'pill-accent' : 'pill-neutral'}`}
                        >
                          {u.role === 'admin' ? <Shield size={11} /> : null}
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`pill ${isScholar ? 'pill-accent' : 'pill-neutral'}`}
                        >
                          {isScholar ? <Sparkles size={11} /> : null}
                          {isScholar ? 'Scholar' : 'Free'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <span
                            className={`pill ${u.emailVerified ? 'pill-success' : 'pill-warning'}`}
                            style={{ fontSize: 10.5, padding: '1px 7px' }}
                          >
                            {u.emailVerified ? 'verified' : 'unverified'}
                          </span>
                          <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>
                            {u.onboardingCompleted ? 'onboarded' : 'pending setup'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: 12, color: 'var(--ink)' }}>
                          <strong>{u.quizAttempts}</strong> quizzes
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>
                          {u.studySessions} study blocks
                        </div>
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--ink-3)' }}>
                        {new Date(u.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div
            style={{
              padding: '12px 18px',
              borderTop: '1px solid var(--rule)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--paper-2)',
            }}
          >
            <span style={{ fontSize: 12.5, color: 'var(--ink-3)' }}>
              Page <strong>{page}</strong> of <strong>{totalPages}</strong>
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="btn"
                style={{ padding: '6px 10px', fontSize: 12 }}
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft size={14} />
                Previous
              </button>
              <button
                className="btn"
                style={{ padding: '6px 10px', fontSize: 12 }}
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
                <ChevronRight size={14} />
              </button>
            </div>
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
          title="User Accounts"
          subtitle="Directory of registered candidates, verification state, and learning usage"
        />
        <UsersTable />
      </Shell>
    </Providers>
  )
}
