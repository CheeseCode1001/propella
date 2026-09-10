'use client'

import { useQuery } from '@tanstack/react-query'
import { Providers } from '../providers'
import { Shell, PageHeader } from '@/components/shell'
import { api } from '@/lib/api'

interface Batch {
  id: string
  filename: string
  exam: string | null
  rowsTotal: number
  rowsImported: number
  rowsSkipped: number
  rowsFailed: number
  errors: Array<{ row: number; reason: string }>
  createdAt: string
}

function ImportHistory() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-imports'],
    queryFn: () =>
      api.get<{ data: { batches: Batch[] } }>('/admin/imports?limit=50').then((r) => r.data.batches),
  })

  if (isLoading) return <p style={{ color: 'var(--ink-3)' }}>Loading…</p>
  if (!data || data.length === 0) {
    return (
      <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--ink-3)' }}>
        <p style={{ margin: 0, fontWeight: 600, color: 'var(--ink-2)' }}>No imports yet</p>
        <p style={{ margin: '6px 0 0', fontSize: 13 }}>
          Every past-question upload is recorded here, including rejected rows.
        </p>
      </div>
    )
  }

  return (
    <div className="card">
      <table className="data">
        <thead>
          <tr>
            <th>File</th>
            <th style={{ width: 80 }}>Exam</th>
            <th style={{ width: 70 }}>Rows</th>
            <th style={{ width: 84 }}>Imported</th>
            <th style={{ width: 84 }}>Skipped</th>
            <th style={{ width: 84 }}>Rejected</th>
            <th style={{ width: 150 }}>When</th>
          </tr>
        </thead>
        <tbody>
          {data.map((b) => (
            <tr key={b.id}>
              <td style={{ fontWeight: 500 }}>
                {b.filename}
                {b.errors.length > 0 && (
                  <details style={{ marginTop: 6 }}>
                    <summary style={{ cursor: 'pointer', fontSize: 12, color: 'var(--ink-3)' }}>
                      Show rejected rows
                    </summary>
                    <ul
                      style={{
                        margin: '6px 0 0',
                        paddingLeft: 18,
                        fontSize: 12,
                        color: 'var(--ink-2)',
                      }}
                    >
                      {b.errors.slice(0, 30).map((e, i) => (
                        <li key={i}>
                          Row {e.row}: {e.reason}
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
              </td>
              <td style={{ color: 'var(--ink-2)' }}>{b.exam?.toUpperCase() ?? '—'}</td>
              <td style={{ color: 'var(--ink-2)' }}>{b.rowsTotal}</td>
              <td style={{ color: 'var(--success)', fontWeight: 600 }}>{b.rowsImported}</td>
              <td style={{ color: 'var(--ink-3)' }}>{b.rowsSkipped}</td>
              <td style={{ color: b.rowsFailed > 0 ? 'var(--danger)' : 'var(--ink-3)' }}>
                {b.rowsFailed}
              </td>
              <td style={{ fontSize: 12.5, color: 'var(--ink-2)' }}>
                {new Date(b.createdAt).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function ImportsPage() {
  return (
    <Providers>
      <Shell>
        <PageHeader title="Import history" subtitle="Every past-question upload, with rejections." />
        <ImportHistory />
      </Shell>
    </Providers>
  )
}
