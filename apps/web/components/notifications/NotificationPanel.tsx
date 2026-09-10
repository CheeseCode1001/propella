'use client'
import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useNotifications, type Notification } from '@/lib/hooks/use-notifications'
import { useMarkRead } from '@/lib/hooks/use-mark-read'
import { useMarkAllRead } from '@/lib/hooks/use-mark-all-read'
import { NotificationRow } from './NotificationRow'
import { NotificationEmpty } from './NotificationEmpty'
import { NotificationSkeleton } from './NotificationSkeleton'
import { Button } from '@/components/ui/button'

interface NotificationPanelProps {
  onClose: () => void
}

export function NotificationPanel({ onClose }: NotificationPanelProps) {
  const router = useRouter()
  const panelRef = useRef<HTMLDivElement>(null)
  const { data, isLoading, isError, refetch } = useNotifications()
  const markRead = useMarkRead()
  const markAllRead = useMarkAllRead()
  const t = useTranslations('notifications')

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [onClose])

  function handleNotificationClick(notification: Notification) {
    if (!notification.readAt) {
      markRead.mutate(notification.id)
    }
    onClose()
    if (notification.deeplink) {
      router.push(notification.deeplink)
    }
  }

  function handleMarkAllRead() {
    markAllRead.mutate()
  }

  const unreadCount = data?.unreadCount ?? 0

  return (
    <div
      ref={panelRef}
      style={{
        position: 'absolute',
        top: 'calc(100% + 8px)',
        right: 0,
        width: 400,
        maxHeight: 520,
        background: 'var(--color-card)',
        border: '1px solid var(--color-rule)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-md)',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          height: 56,
          padding: '0 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--color-paper-2)',
          borderBottom: '1px solid var(--color-rule)',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 18,
            fontWeight: 500,
            color: 'var(--color-ink)',
          }}
        >
          {t('title')}
        </span>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllRead}
            style={{ fontSize: 13, height: 'auto', padding: '4px 8px' }}
          >
            {t('markAllRead')}
          </Button>
        )}
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {isLoading && <NotificationSkeleton />}
        {isError && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px 16px',
              gap: 12,
            }}
          >
            <p style={{ fontSize: 13, color: 'var(--color-ink-2)', margin: 0 }}>
              Couldn&apos;t load notifications. Try again.
            </p>
            <Button variant="ghost" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        )}
        {!isLoading && !isError && data?.items.length === 0 && <NotificationEmpty />}
        {!isLoading && !isError && data?.items.map((n) => (
          <NotificationRow key={n.id} notification={n} onClick={handleNotificationClick} />
        ))}
      </div>

      {/* Footer */}
      <div
        style={{
          height: 48,
          padding: '0 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderTop: '1px solid var(--color-rule)',
          flexShrink: 0,
        }}
      >
        <button
          onClick={() => {
            onClose()
            router.push('/settings?tab=notifications')
          }}
          style={{
            fontSize: 13,
            color: 'var(--color-ink-3)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          {t('settingsLink')}
        </button>
      </div>
    </div>
  )
}
