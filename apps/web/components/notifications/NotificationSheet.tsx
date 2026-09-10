'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { useNotifications, type Notification } from '@/lib/hooks/use-notifications'
import { useMarkRead } from '@/lib/hooks/use-mark-read'
import { useMarkAllRead } from '@/lib/hooks/use-mark-all-read'
import { NotificationRow } from './NotificationRow'
import { NotificationEmpty } from './NotificationEmpty'
import { NotificationSkeleton } from './NotificationSkeleton'
import { Button } from '@/components/ui/button'

interface NotificationSheetProps {
  open: boolean
  onClose: () => void
}

export function NotificationSheet({ open, onClose }: NotificationSheetProps) {
  const router = useRouter()
  const { data, isLoading, isError, refetch } = useNotifications()
  const markRead = useMarkRead()
  const markAllRead = useMarkAllRead()
  const t = useTranslations('notifications')

  // Refetch when sheet opens
  useEffect(() => {
    if (open) refetch()
  }, [open, refetch])

  function handleNotificationClick(notification: Notification) {
    if (!notification.readAt) {
      markRead.mutate(notification.id)
    }
    onClose()
    if (notification.deeplink) {
      router.push(notification.deeplink)
    }
  }

  const unreadCount = data?.unreadCount ?? 0

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.3)',
              zIndex: 40,
            }}
          />

          {/* Sheet */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.24, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: '100%',
              background: 'var(--color-paper)',
              zIndex: 50,
              display: 'flex',
              flexDirection: 'column',
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
                background: 'var(--color-paper)',
                borderBottom: '1px solid var(--color-rule)',
                flexShrink: 0,
              }}
            >
              <button
                onClick={onClose}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 4,
                  color: 'var(--color-ink)',
                  display: 'flex',
                  alignItems: 'center',
                }}
                aria-label="Close"
              >
                <ChevronLeft size={22} strokeWidth={1.5} />
              </button>

              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 18,
                  fontWeight: 500,
                  color: 'var(--color-ink)',
                  position: 'absolute',
                  left: '50%',
                  transform: 'translateX(-50%)',
                }}
              >
                {t('title')}
              </span>

              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => markAllRead.mutate()}
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
                paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
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
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
