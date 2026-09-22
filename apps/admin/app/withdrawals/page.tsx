'use client'

import { useEffect, useState } from 'react'
import { Shell } from '@/components/shell'
import { api, ApiError } from '@/lib/api'
import { Check, X, Clock } from 'lucide-react'

interface WithdrawalItem {
  id: string
  userId: string
  amount: number
  bankName: string
  accountName: string
  accountNumber: string
  status: 'pending' | 'approved' | 'rejected'
  rejectionReason: string | null
  approvedAt: string | null
  createdAt: string
  user: {
    id: string
    name: string
    email: string
    referralCode: string | null
    referralBalance: number
  }
}

export default function WithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<WithdrawalItem[]>([])
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<string | null>(null)
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  async function loadData() {
    try {
      setLoading(true)
      const res = await api.get<{ data: WithdrawalItem[] }>('/admin/withdrawals')
      setWithdrawals(res.data)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load withdrawal requests')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  async function handleApprove(id: string) {
    setError(null)
    setSubmitting(true)
    try {
      await api.post(`/admin/withdrawals/${id}/approve`, {})
      setSuccessMsg('Withdrawal request approved! Approval email sent to student.')
      setActionId(null)
      setActionType(null)
      await loadData()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to approve withdrawal')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleReject(id: string) {
    setError(null)
    setSubmitting(true)
    try {
      await api.post(`/admin/withdrawals/${id}/reject`, { reason: rejectReason })
      setSuccessMsg('Withdrawal rejected and balance refunded to user.')
      setActionId(null)
      setActionType(null)
      setRejectReason('')
      await loadData()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to reject withdrawal')
    } finally {
      setSubmitting(false)
    }
  }

  const filtered = withdrawals.filter((w) => (filter === 'all' ? true : w.status === filter))
  const pendingCount = withdrawals.filter((w) => w.status === 'pending').length

  return (
    <Shell>
      <div style={{ maxWidth: 1080 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 600, color: 'var(--ink)' }}>Referral Withdrawals</h1>
            <p style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 4 }}>
              Approve student bank withdrawals once they reach 5 qualifying referrals.
            </p>
          </div>
          {pendingCount > 0 && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 20,
                backgroundColor: 'rgba(217,119,6,0.1)',
                color: '#d97706',
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              <Clock size={15} />
              {pendingCount} Pending approval
            </span>
          )}
        </div>

        {error && (
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 8,
              color: '#dc2626',
              marginBottom: 16,
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}

        {successMsg && (
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: 'rgba(34,197,94,0.1)',
              border: '1px solid rgba(34,197,94,0.2)',
              borderRadius: 8,
              color: '#16a34a',
              marginBottom: 16,
              fontSize: 13,
            }}
          >
            {successMsg}
          </div>
        )}

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {(['pending', 'approved', 'rejected', 'all'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              style={{
                padding: '6px 14px',
                borderRadius: 6,
                border: '1px solid var(--rule)',
                backgroundColor: filter === tab ? 'var(--ink)' : 'var(--paper-2)',
                color: filter === tab ? 'var(--paper)' : 'var(--ink-2)',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="card" style={{ overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-3)', fontSize: 14 }}>
              Loading withdrawal requests...
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-3)', fontSize: 14 }}>
              No {filter !== 'all' ? filter : ''} withdrawal requests found.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--rule)', backgroundColor: 'var(--paper-2)', textAlign: 'left' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--ink)' }}>Student</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--ink)' }}>Amount</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--ink)' }}>Bank Details</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--ink)' }}>Requested</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--ink)' }}>Status</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--ink)', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--rule)' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--ink)' }}>{item.user.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{item.user.email}</div>
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--ink)' }}>
                      ₦{item.amount.toLocaleString()}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 500, color: 'var(--ink)' }}>{item.bankName}</div>
                      <div style={{ fontSize: 12, color: 'var(--ink-2)' }}>{item.accountNumber} ({item.accountName})</div>
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--ink-2)', fontSize: 12 }}>
                      {new Date(item.createdAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '3px 8px',
                          borderRadius: 4,
                          fontSize: 11,
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          backgroundColor:
                            item.status === 'approved'
                              ? 'rgba(34,197,94,0.1)'
                              : item.status === 'rejected'
                              ? 'rgba(239,68,68,0.1)'
                              : 'rgba(217,119,6,0.1)',
                          color:
                            item.status === 'approved'
                              ? '#16a34a'
                              : item.status === 'rejected'
                              ? '#dc2626'
                              : '#d97706',
                        }}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      {item.status === 'pending' ? (
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => {
                              setActionId(item.id)
                              setActionType('approve')
                            }}
                            className="btn btn-primary"
                            style={{ padding: '4px 10px', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                          >
                            <Check size={13} /> Approve
                          </button>
                          <button
                            onClick={() => {
                              setActionId(item.id)
                              setActionType('reject')
                            }}
                            className="btn btn-ghost"
                            style={{ padding: '4px 10px', fontSize: 12, color: '#dc2626' }}
                          >
                            <X size={13} /> Decline
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>
                          {item.status === 'approved' ? 'Disbursed' : item.rejectionReason || 'Declined'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Approve dialog */}
        {actionId && actionType === 'approve' && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 100,
            }}
          >
            <div className="card" style={{ maxWidth: 440, width: '90%', padding: 24 }}>
              <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 8, color: 'var(--ink)' }}>
                Confirm Withdrawal Approval
              </h3>
              <p style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.5, marginBottom: 20 }}>
                This will mark the withdrawal as approved, disburse the funds, and send an automated confirmation
                email informing the student their funds will arrive within 24 hours.
              </p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    setActionId(null)
                    setActionType(null)
                  }}
                  className="btn btn-ghost"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleApprove(actionId)}
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Approving...' : 'Confirm & Approve'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reject dialog */}
        {actionId && actionType === 'reject' && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 100,
            }}
          >
            <div className="card" style={{ maxWidth: 440, width: '90%', padding: 24 }}>
              <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 8, color: 'var(--ink)' }}>
                Decline Withdrawal Request
              </h3>
              <p style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.5, marginBottom: 12 }}>
                The user&apos;s digital currency balance will be refunded. Please provide a reason:
              </p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Account name does not match student verification records"
                rows={3}
                style={{ width: '100%', marginBottom: 16, fontSize: 13, resize: 'vertical' }}
              />
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    setActionId(null)
                    setActionType(null)
                    setRejectReason('')
                  }}
                  className="btn btn-ghost"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleReject(actionId)}
                  className="btn btn-danger"
                  style={{ backgroundColor: '#dc2626', color: '#fff' }}
                  disabled={submitting}
                >
                  {submitting ? 'Declining...' : 'Decline & Refund'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Shell>
  )
}
