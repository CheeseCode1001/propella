'use client'

import { useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Upload, Trash2, Download, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { Providers } from '../providers'
import { Shell, PageHeader } from '@/components/shell'
import { api } from '@/lib/api'

interface PastQuestion {
  id: string
  exam: string
  year: number
  subjectSlug: string
  topicSlug: string | null
  stem: string
  options: Array<{ id: string; text: string }>
  correctOptionId: string
  explanation: string | null
  source: string | null
}

interface ListResponse {
  data: { questions: PastQuestion[]; total: number; page: number; limit: number }
}

interface Facets {
  data: {
    subjects: Array<{ subjectSlug: string; count: number }>
    years: Array<{ year: number; count: number }>
  }
}

interface ImportSummary {
  data: {
    batchId: string
    total: number
    imported: number
    skipped: number
    failed: number
    errors: Array<{ row: number; reason: string }>
  }
}

const TEMPLATE = [
  'exam,year,subject,topic,question,a,b,c,d,answer,explanation,source',
  'jamb,2019,physics,motion,"A body starts from rest and accelerates at 2 m/s². What is its velocity after 5 s?","5 m/s","10 m/s","15 m/s","20 m/s",B,"v = u + at = 0 + 2×5 = 10 m/s","JAMB 2019"',
  'waec,2021,chemistry,mole-concept,"How many moles are in 44 g of CO₂? (C=12, O=16)","0.5","1.0","1.5","2.0",B,"n = m/M = 44/44 = 1 mole","WAEC 2021"',
].join('\n')

function UploadPanel() {
  const queryClient = useQueryClient()
  const fileRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [summary, setSummary] = useState<ImportSummary['data'] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [filename, setFilename] = useState<string | null>(null)

  async function handleFile(file: File) {
    setBusy(true)
    setError(null)
    setSummary(null)
    setFilename(file.name)

    try {
      const content = await file.text()
      const format = file.name.toLowerCase().endsWith('.json') ? 'json' : 'csv'
      const res = await api.post<ImportSummary>('/admin/past-questions/import', {
        filename: file.name,
        format,
        content,
      })
      setSummary(res.data)
      void queryClient.invalidateQueries({ queryKey: ['past-questions'] })
      void queryClient.invalidateQueries({ queryKey: ['pq-facets'] })
      void queryClient.invalidateQueries({ queryKey: ['admin-metrics'] })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setBusy(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  function downloadTemplate() {
    const blob = new Blob([TEMPLATE], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'propella-past-questions-template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="card" style={{ padding: 20, marginBottom: 24 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ minWidth: 260, flex: 1 }}>
          <h2 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 650 }}>Upload past questions</h2>
          <p style={{ margin: 0, color: 'var(--ink-2)', fontSize: 13, lineHeight: 1.6 }}>
            CSV or JSON. Required columns: <code>exam</code>, <code>year</code>,{' '}
            <code>subject</code>, <code>question</code>, <code>a</code>–<code>d</code>,{' '}
            <code>answer</code>. Optional: <code>topic</code>, <code>explanation</code>,{' '}
            <code>source</code>. Re-uploading the same file is safe — duplicates are skipped.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <button className="btn" onClick={downloadTemplate} type="button">
            <Download size={15} />
            Template
          </button>
          <button
            className="btn btn-primary"
            onClick={() => fileRef.current?.click()}
            disabled={busy}
            type="button"
          >
            <Upload size={15} />
            {busy ? 'Importing…' : 'Choose file'}
          </button>
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept=".csv,.json,text/csv,application/json"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) void handleFile(file)
        }}
      />

      {error && (
        <p
          role="alert"
          style={{
            marginTop: 14,
            padding: '10px 12px',
            borderRadius: 'var(--radius)',
            background: 'var(--danger-tint)',
            color: 'var(--danger)',
            fontSize: 13,
          }}
        >
          {error}
        </p>
      )}

      {summary && (
        <div
          style={{
            marginTop: 16,
            padding: '12px 14px',
            borderRadius: 'var(--radius)',
            background: summary.failed > 0 ? 'var(--warning-tint)' : 'var(--success-tint)',
            border: `1px solid ${summary.failed > 0 ? 'var(--warning)' : 'var(--success)'}33`,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              fontWeight: 600,
              color: summary.failed > 0 ? 'var(--warning)' : 'var(--success)',
              marginBottom: 6,
            }}
          >
            {summary.failed > 0 ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
            {filename}
          </div>
          <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>
            {summary.total} rows read · <strong>{summary.imported} imported</strong> ·{' '}
            {summary.skipped} already present · {summary.failed} rejected
          </div>

          {summary.errors.length > 0 && (
            <details style={{ marginTop: 10 }}>
              <summary style={{ cursor: 'pointer', fontSize: 12.5, color: 'var(--ink-2)' }}>
                Show {summary.errors.length} rejected row
                {summary.errors.length === 1 ? '' : 's'}
              </summary>
              <ul style={{ margin: '8px 0 0', paddingLeft: 18, fontSize: 12.5, color: 'var(--ink-2)' }}>
                {summary.errors.slice(0, 50).map((e, i) => (
                  <li key={i} style={{ marginBottom: 3 }}>
                    Row {e.row}: {e.reason}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}
    </div>
  )
}

function QuestionBank() {
  const queryClient = useQueryClient()
  const [exam, setExam] = useState('')
  const [subjectSlug, setSubjectSlug] = useState('')
  const [year, setYear] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const params = new URLSearchParams({ page: String(page), limit: '25' })
  if (exam) params.set('exam', exam)
  if (subjectSlug) params.set('subjectSlug', subjectSlug)
  if (year) params.set('year', year)
  if (search) params.set('search', search)

  const { data, isLoading } = useQuery({
    queryKey: ['past-questions', exam, subjectSlug, year, search, page],
    queryFn: () => api.get<ListResponse>(`/admin/past-questions?${params}`).then((r) => r.data),
  })

  const { data: facets } = useQuery({
    queryKey: ['pq-facets'],
    queryFn: () => api.get<Facets>('/admin/past-questions/facets').then((r) => r.data),
  })

  async function remove(id: string) {
    if (!window.confirm('Delete this question permanently?')) return
    await api.delete(`/admin/past-questions/${id}`)
    void queryClient.invalidateQueries({ queryKey: ['past-questions'] })
    void queryClient.invalidateQueries({ queryKey: ['admin-metrics'] })
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1

  function reset<T>(setter: (v: T) => void) {
    return (v: T) => {
      setter(v)
      setPage(1)
    }
  }

  return (
    <div className="card">
      <div
        style={{
          display: 'flex',
          gap: 10,
          padding: 14,
          borderBottom: '1px solid var(--rule)',
          flexWrap: 'wrap',
        }}
      >
        <select
          className="field"
          style={{ width: 130 }}
          value={exam}
          onChange={(e) => reset(setExam)(e.target.value)}
        >
          <option value="">All exams</option>
          <option value="jamb">JAMB</option>
          <option value="waec">WAEC</option>
          <option value="neco">NECO</option>
        </select>

        <select
          className="field"
          style={{ width: 170 }}
          value={subjectSlug}
          onChange={(e) => reset(setSubjectSlug)(e.target.value)}
        >
          <option value="">All subjects</option>
          {facets?.subjects.map((s) => (
            <option key={s.subjectSlug} value={s.subjectSlug}>
              {s.subjectSlug} ({s.count})
            </option>
          ))}
        </select>

        <select
          className="field"
          style={{ width: 120 }}
          value={year}
          onChange={(e) => reset(setYear)(e.target.value)}
        >
          <option value="">All years</option>
          {facets?.years.map((y) => (
            <option key={y.year} value={String(y.year)}>
              {y.year} ({y.count})
            </option>
          ))}
        </select>

        <input
          className="field"
          style={{ flex: 1, minWidth: 180 }}
          placeholder="Search question text…"
          value={search}
          onChange={(e) => reset(setSearch)(e.target.value)}
        />
      </div>

      {isLoading ? (
        <p style={{ padding: 24, color: 'var(--ink-3)' }}>Loading…</p>
      ) : !data || data.questions.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-3)' }}>
          <p style={{ margin: 0, fontWeight: 600, color: 'var(--ink-2)' }}>No questions yet</p>
          <p style={{ margin: '6px 0 0', fontSize: 13 }}>
            Upload a CSV above to build the past-questions bank.
          </p>
        </div>
      ) : (
        <>
          <table className="data">
            <thead>
              <tr>
                <th style={{ width: 90 }}>Exam</th>
                <th style={{ width: 64 }}>Year</th>
                <th style={{ width: 130 }}>Subject</th>
                <th>Question</th>
                <th style={{ width: 66 }}>Answer</th>
                <th style={{ width: 44 }} />
              </tr>
            </thead>
            <tbody>
              {data.questions.map((q) => (
                <tr key={q.id}>
                  <td>
                    <span
                      className="pill"
                      style={{ background: 'var(--accent-tint)', color: 'var(--accent)' }}
                    >
                      {q.exam.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ color: 'var(--ink-2)' }}>{q.year}</td>
                  <td style={{ color: 'var(--ink-2)' }}>
                    {q.subjectSlug}
                    {q.topicSlug && (
                      <div style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>{q.topicSlug}</div>
                    )}
                  </td>
                  <td style={{ maxWidth: 460 }}>
                    <div style={{ marginBottom: 4 }}>{q.stem}</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>
                      {q.options.map((o) => `${o.id}. ${o.text}`).join('   ')}
                    </div>
                  </td>
                  <td>
                    <span
                      className="pill"
                      style={{ background: 'var(--success-tint)', color: 'var(--success)' }}
                    >
                      {q.correctOptionId}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-danger"
                      style={{ padding: '5px 8px' }}
                      onClick={() => void remove(q.id)}
                      aria-label="Delete question"
                      type="button"
                    >
                      <Trash2 size={14} />
                    </button>
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
            <span>
              {data.total.toLocaleString()} question{data.total === 1 ? '' : 's'}
            </span>
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

export default function PastQuestionsPage() {
  return (
    <Providers>
      <Shell>
        <PageHeader
          title="Past questions"
          subtitle="The bank that mock exams and topic practice are served from."
        />
        <UploadPanel />
        <QuestionBank />
      </Shell>
    </Providers>
  )
}
