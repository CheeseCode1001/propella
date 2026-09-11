'use client'

import { useCallback, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Copy, TickCircle, Share, Gift, Profile2User } from 'iconsax-reactjs'
import { format } from 'date-fns'
import { api } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/empty-state'
import { ErrorState, errorKindFrom } from '@/components/common/error-state'
import { useOnlineStatus } from '@/lib/hooks/use-online-status'

interface ReferralSummary {
  code: string
  shareUrl: string
  creditBalance: number
  creditsPerReferral: number
  creditsForJoining: number
  totalInvited: number
  totalQualified: number
  pending: number
  creditsEarned: number
  invitees: { name: string; joinedAt: string; qualified: boolean }[]
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
      // Clipboard is blocked in some embedded browsers; the value is on screen
      // and selectable, so this is not worth an error message.
    }
  }, [])

  const share = useCallback(async (summary: ReferralSummary) => {
    const text = `I'm using Propella to prepare for JAMB. Join with my link and we both get AI credits: ${summary.shareUrl}`
    // The native sheet is the best option on a phone; fall back to copying.
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await navigator.share({ title: 'Study with me on Propella', text, url: summary.shareUrl })
        return
      } catch {
        // Cancelled, or not permitted — fall through to the clipboard.
      }
    }
    await navigator.clipboard.writeText(text).catch(() => undefined)
  }, [])

  // Without this the panel would sit on the loading skeleton forever whenever
  // the request fails, which reads as "the feature is missing".
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

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle style={{ fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
            Invite friends, earn AI credits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-[13.5px] leading-[1.6] text-[var(--color-ink-2)]">
            Share your code. When a friend joins and confirms their email, you get{' '}
            <strong className="text-[var(--color-ink)]">
              {data.creditsPerReferral} AI credits
            </strong>{' '}
            and they start with {data.creditsForJoining}. Credits go towards asking the AI
            assistant and generating quizzes.
          </p>

          {/* Balance */}
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
          <p className="mb-1.5 text-[12px] font-medium text-[var(--color-ink-2)]">Your code</p>
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
              {copied === 'code' ? 'Copied' : 'Copy'}
            </Button>
          </div>

          {/* Link */}
          <p className="mb-1.5 text-[12px] font-medium text-[var(--color-ink-2)]">Your link</p>
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
              {copied === 'link' ? 'Copied' : 'Copy'}
            </Button>
            <Button variant="accent" size="sm" onClick={() => void share(data)}>
              <Share size={14} color="currentColor" variant="Linear" />
              Share
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle style={{ fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
            Your invites
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 grid grid-cols-3 gap-2">
            <Stat label="Invited" value={data.totalInvited} />
            <Stat label="Joined" value={data.totalQualified} />
            <Stat label="Credits earned" value={data.creditsEarned} />
          </div>

          {data.invitees.length === 0 ? (
            <EmptyState
              icon={Profile2User}
              title="No invites yet"
              message="Share your code with a classmate. You will both get credits once they confirm their email."
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
                    {invitee.qualified ? `+${data.creditsPerReferral} credits` : 'Not confirmed yet'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
