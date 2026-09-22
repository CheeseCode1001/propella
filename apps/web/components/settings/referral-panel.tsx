import { useCallback, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Copy, TickCircle, Share, Gift, Profile2User, Wallet3, CardSend, InfoCircle } from 'iconsax-reactjs'
import { format } from 'date-fns'
import { api } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/empty-state'
import { ErrorState, errorKindFrom } from '@/components/common/error-state'
import { useOnlineStatus } from '@/lib/hooks/use-online-status'

interface WithdrawalItem {
  id: string
  amount: number
  bankName: string
  accountName: string
  accountNumber: string
  status: 'pending' | 'approved' | 'rejected'
  rejectionReason: string | null
  approvedAt: string | null
  createdAt: string
}

interface ReferralSummary {
  code: string
  shareUrl: string
  creditBalance: number
  referralBalance: number
  creditsPerReferral: number
  creditsForJoining: number
  cashRewardPerReferral: number
  minReferralsForWithdrawal: number
  canWithdraw: boolean
  totalInvited: number
  totalQualified: number
  pending: number
  creditsEarned: number
  invitees: { name: string; joinedAt: string; qualified: boolean }[]
  withdrawals: WithdrawalItem[]
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div
      className="rounded-[var(--radius-md)] border border-[var(--color-rule)] px-3 py-3 text-center"
      style={{ backgroundColor: 'var(--color-paper-2)' }}
    >
      <p
        className="text-[22px] font-semibold text-[var(--color-ink)]"
        style={{ fontFamily: 'var(--font-sans)' }}
      >
        {value}
      </p>
      <p className="mt-0.5 text-[11.5px] leading-tight text-[var(--color-ink-3)]">{label}</p>
    </div>
  )
}

export function ReferralPanel() {
  const [copied, setCopied] = useState<'code' | 'link' | null>(null)
  const [withdrawOpen, setWithdrawOpen] = useState(false)
  const [bankName, setBankName] = useState('')
  const [accountName, setAccountName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [amount, setAmount] = useState<number>(0)
  const [submittingWithdrawal, setSubmittingWithdrawal] = useState(false)
  const [withdrawError, setWithdrawError] = useState<string | null>(null)
  const [withdrawSuccess, setWithdrawSuccess] = useState(false)
  const online = useOnlineStatus()

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['referrals'],
    queryFn: () => api.get<{ data: ReferralSummary }>('/referrals').then((r) => r.data),
  })

  const copy = useCallback(async (text: string, what: 'code' | 'link') => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(what)
      setTimeout(() => setCopied(null), 2000)
    } catch {
      // Clipboard fallback
    }
  }, [])

  const share = useCallback(async (summary: ReferralSummary) => {
    const text = `Join Propella with my invite link to study smart with AI and past questions: ${summary.shareUrl}`
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await navigator.share({ title: 'Study on Propella', text, url: summary.shareUrl })
        return
      } catch {
        // Fallback
      }
    }
    await navigator.clipboard.writeText(text).catch(() => undefined)
  }, [])

  async function handleWithdrawSubmit(e: React.FormEvent) {
    e.preventDefault()
    setWithdrawError(null)
    setSubmittingWithdrawal(true)
    try {
      await api.post('/referrals/withdraw', {
        bankName,
        accountName,
        accountNumber,
        amount: Number(amount),
      })
      setWithdrawSuccess(true)
      await refetch()
      setTimeout(() => {
        setWithdrawOpen(false)
        setWithdrawSuccess(false)
        setBankName('')
        setAccountName('')
        setAccountNumber('')
        setAmount(0)
      }, 2500)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit withdrawal request'
      setWithdrawError(msg)
    } finally {
      setSubmittingWithdrawal(false)
    }
  }

  if (isError || (!isLoading && !data)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle style={{ fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
            Invite friends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ErrorState
            kind={errorKindFrom(error, online)}
            title="We could not load your invite code"
            message="Your code is safe — this is just the page failing to fetch it. Try again in a moment."
            onRetry={() => void refetch()}
          />
        </CardContent>
      </Card>
    )
  }

  if (isLoading || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle style={{ fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
            Invite friends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="mb-4 h-24 w-full rounded-[var(--radius-md)]" />
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-[74px] w-full rounded-[var(--radius-md)]" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const qualifiedCount = data.totalQualified ?? 0
  const progressPercent = Math.min(100, Math.round((qualifiedCount / 5) * 100))

  return (
    <div className="flex flex-col gap-6">
      {/* Digital Currency & Withdrawal Card */}
      <Card className="border-[var(--color-accent)] shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-[var(--color-accent)] to-emerald-600 px-6 py-5 text-white">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/15 rounded-xl backdrop-blur-sm">
                <Wallet3 size={28} color="white" variant="Bold" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-white/80 font-medium">Digital Currency Balance</p>
                <h3 className="text-3xl font-extrabold tracking-tight">
                  ₦{(data.referralBalance ?? 0).toLocaleString()}
                </h3>
              </div>
            </div>

            <Button
              variant="secondary"
              onClick={() => {
                setAmount(data.referralBalance ?? 0)
                setWithdrawOpen(true)
              }}
              disabled={qualifiedCount < 5 || (data.referralBalance ?? 0) <= 0}
              className="bg-white text-[var(--color-accent)] hover:bg-white/95 font-semibold text-sm shadow-sm"
            >
              <CardSend size={18} className="mr-2" />
              Request Withdrawal
            </Button>
          </div>
        </div>

        <CardContent className="pt-5">
          <div className="rounded-xl bg-[var(--color-paper-2)] border border-[var(--color-rule)] p-4">
            <div className="flex items-center justify-between text-xs font-medium text-[var(--color-ink-2)] mb-2">
              <span>Withdrawal Unlock Milestone</span>
              <span className="font-semibold text-[var(--color-ink)]">{qualifiedCount} / 5 Qualified Referrals</span>
            </div>
            {/* Progress bar */}
            <div className="w-full h-2.5 bg-[var(--color-paper-3)] rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-[12px] text-[var(--color-ink-3)] mt-2">
              {qualifiedCount >= 5
                ? '🎉 You have unlocked cash withdrawals! You can withdraw your balance anytime.'
                : `Invite ${5 - qualifiedCount} more friend${5 - qualifiedCount === 1 ? '' : 's'} who subscribe/verify to unlock bank withdrawals.`}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Invite Friends / Link Card */}
      <Card>
        <CardHeader>
          <CardTitle style={{ fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
            Share & Earn
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-[13.5px] leading-[1.6] text-[var(--color-ink-2)]">
            Share your unique referral code. When a classmate joins and subscribes using your referral link, you receive <strong className="text-[var(--color-ink)]">₦{(data.cashRewardPerReferral ?? 1000).toLocaleString()} digital currency</strong> in your wallet plus <strong className="text-[var(--color-ink)]">{data.creditsPerReferral} AI study credits</strong>.
          </p>

          {/* AI Credits Mini Bar */}
          <div
            className="mb-4 flex items-center gap-3 rounded-[var(--radius-md)] px-4 py-3"
            style={{ backgroundColor: 'var(--color-accent-tint)' }}
          >
            <Gift size={22} color="var(--color-accent)" variant="Bold" />
            <div>
              <p
                className="text-[20px] font-semibold leading-none"
                style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-accent)' }}
              >
                {data.creditBalance}
              </p>
              <p className="mt-1 text-[12px] text-[var(--color-ink-2)]">AI credits available</p>
            </div>
          </div>

          {/* Code */}
          <p className="mb-1.5 text-[12px] font-medium text-[var(--color-ink-2)]">Your referral code</p>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <code
              className="flex-1 rounded-[var(--radius-sm)] border border-dashed border-[var(--color-rule-2)] px-3.5 py-2.5 text-[18px] font-semibold tracking-[0.18em] text-[var(--color-ink)]"
              style={{ fontFamily: 'var(--font-mono)', minWidth: 150 }}
            >
              {data.code}
            </code>
            <Button variant="secondary" size="sm" onClick={() => void copy(data.code, 'code')}>
              {copied === 'code' ? (
                <TickCircle size={14} color="currentColor" variant="Bold" />
              ) : (
                <Copy size={14} color="currentColor" variant="Linear" />
              )}
              {copied === 'code' ? 'Copied' : 'Copy code'}
            </Button>
          </div>

          {/* Link */}
          <p className="mb-1.5 text-[12px] font-medium text-[var(--color-ink-2)]">Your referral link</p>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="flex-1 truncate rounded-[var(--radius-sm)] border border-[var(--color-rule-2)] px-3 py-2 text-[12.5px] text-[var(--color-ink-2)]"
              style={{ fontFamily: 'var(--font-mono)', minWidth: 180 }}
              title={data.shareUrl}
            >
              {data.shareUrl}
            </span>
            <Button variant="secondary" size="sm" onClick={() => void copy(data.shareUrl, 'link')}>
              {copied === 'link' ? (
                <TickCircle size={14} color="currentColor" variant="Bold" />
              ) : (
                <Copy size={14} color="currentColor" variant="Linear" />
              )}
              {copied === 'link' ? 'Copied' : 'Copy link'}
            </Button>
            <Button variant="accent" size="sm" onClick={() => void share(data)}>
              <Share size={14} color="currentColor" variant="Linear" />
              Share link
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Withdrawal History Card */}
      {data.withdrawals && data.withdrawals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle style={{ fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
              Withdrawal Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col divide-y divide-[var(--color-rule)]">
              {data.withdrawals.map((w) => (
                <div key={w.id} className="py-3.5 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[15px] text-[var(--color-ink)]">
                        ₦{w.amount.toLocaleString()}
                      </span>
                      <span className="text-xs text-[var(--color-ink-3)] font-mono">
                        ({w.bankName} •••• {w.accountNumber.slice(-4)})
                      </span>
                    </div>
                    <p className="text-xs text-[var(--color-ink-3)] mt-0.5">
                      Requested {format(new Date(w.createdAt), 'd MMM yyyy, h:mm a')}
                    </p>
                    {w.rejectionReason && (
                      <p className="text-xs text-rose-600 mt-1">Reason: {w.rejectionReason}</p>
                    )}
                  </div>

                  <div>
                    {w.status === 'approved' && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 font-medium text-xs border border-emerald-500/20">
                        <TickCircle size={14} variant="Bold" />
                        <span>Approved — funds arrive under 24 hours</span>
                      </div>
                    )}
                    {w.status === 'pending' && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-600 font-medium text-xs border border-amber-500/20">
                        <InfoCircle size={14} variant="Bold" />
                        <span>Pending Admin Review</span>
                      </div>
                    )}
                    {w.status === 'rejected' && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-500/10 text-rose-600 font-medium text-xs border border-rose-500/20">
                        <span>Declined (Refunded)</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invites list */}
      <Card>
        <CardHeader>
          <CardTitle style={{ fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
            Your Invites
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 grid grid-cols-3 gap-2">
            <Stat label="Invited" value={data.totalInvited} />
            <Stat label="Subscribed / Joined" value={data.totalQualified} />
            <Stat label="Total AI Credits" value={data.creditsEarned} />
          </div>

          {data.invitees.length === 0 ? (
            <EmptyState
              icon={Profile2User}
              title="No invites yet"
              message="Share your code with friends. You will earn digital cash and credits once they join and subscribe."
            />
          ) : (
            <div className="flex flex-col divide-y divide-[var(--color-rule)]">
              {data.invitees.map((invitee, i) => (
                <div key={i} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p
                      className="truncate text-[14px] font-medium text-[var(--color-ink)]"
                      style={{ fontFamily: 'var(--font-sans)' }}
                    >
                      {invitee.name}
                    </p>
                    <p
                      className="text-[11.5px] text-[var(--color-ink-3)]"
                      style={{ fontFamily: 'var(--font-mono)' }}
                    >
                      {format(new Date(invitee.joinedAt), 'd MMM yyyy')}
                    </p>
                  </div>

                  <span
                    className="shrink-0 rounded-full px-2.5 py-1 text-[11.5px] font-medium"
                    style={
                      invitee.qualified
                        ? {
                            backgroundColor: 'var(--color-success-tint)',
                            color: 'var(--color-success)',
                          }
                        : {
                            backgroundColor: 'var(--color-paper-3)',
                            color: 'var(--color-ink-3)',
                          }
                    }
                  >
                    {invitee.qualified ? `+₦1,000 & +${data.creditsPerReferral} credits` : 'Pending verification'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Withdrawal Request Modal */}
      {withdrawOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--color-paper)] border border-[var(--color-rule)] rounded-2xl w-full max-w-md shadow-2xl p-6">
            <h3 className="text-lg font-bold text-[var(--color-ink)] mb-1">Request Cash Withdrawal</h3>
            <p className="text-xs text-[var(--color-ink-2)] mb-5">
              Submit your Nigerian bank account details. Once approved by our team, your funds arrive in under 24 hours.
            </p>

            {withdrawSuccess ? (
              <div className="py-8 text-center">
                <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <TickCircle size={32} variant="Bold" />
                </div>
                <h4 className="font-bold text-base text-[var(--color-ink)] mb-1">Request Submitted!</h4>
                <p className="text-xs text-[var(--color-ink-2)]">
                  Your withdrawal request has been sent for admin review. You can track its status in your profile.
                </p>
              </div>
            ) : (
              <form onSubmit={handleWithdrawSubmit} className="space-y-4">
                {withdrawError && (
                  <div className="p-3 text-xs bg-rose-500/10 border border-rose-500/20 text-rose-600 rounded-lg">
                    {withdrawError}
                  </div>
                )}

                <div>
                  <Label htmlFor="bankName" className="text-xs font-semibold text-[var(--color-ink-2)] mb-1 block">
                    Bank Name
                  </Label>
                  <Input
                    id="bankName"
                    placeholder="e.g. GTBank, Access Bank, Zenith, Kuda, OPay"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="accountName" className="text-xs font-semibold text-[var(--color-ink-2)] mb-1 block">
                    Account Name
                  </Label>
                  <Input
                    id="accountName"
                    placeholder="As registered on your bank account"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="accountNumber" className="text-xs font-semibold text-[var(--color-ink-2)] mb-1 block">
                    Account Number
                  </Label>
                  <Input
                    id="accountNumber"
                    placeholder="10-digit NUBAN account number"
                    maxLength={10}
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="amount" className="text-xs font-semibold text-[var(--color-ink-2)] mb-1 block">
                    Withdrawal Amount (₦)
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    min={1000}
                    max={data.referralBalance ?? 0}
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    required
                  />
                  <p className="text-[11px] text-[var(--color-ink-3)] mt-1">
                    Available balance: ₦{(data.referralBalance ?? 0).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setWithdrawOpen(false)}
                    disabled={submittingWithdrawal}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="accent"
                    disabled={submittingWithdrawal || (data.referralBalance ?? 0) <= 0}
                  >
                    {submittingWithdrawal ? 'Submitting...' : 'Submit Request'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
