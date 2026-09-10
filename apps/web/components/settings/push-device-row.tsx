'use client'

import { Notification as NotificationIcon } from 'iconsax-reactjs'
import { Button } from '@/components/ui/button'
import { usePushNotifications } from '@/lib/hooks/use-push-notifications'

/**
 * Per-device push enrolment.
 *
 * The preference above it decides whether Propella sends pushes at all; this
 * decides whether *this* browser receives them. Both are needed, so the row
 * explains the difference rather than showing two toggles that look redundant.
 */
export function PushDeviceRow({ enabled }: { enabled: boolean }) {
  const push = usePushNotifications()

  if (!push.supported) {
    return (
      <div className="border-t border-[var(--color-rule)] py-3">
        <p className="text-[13px] text-[var(--color-ink-2)]">
          This browser cannot receive push notifications. On iPhone, add Propella to your home
          screen first — notifications work from the installed app.
        </p>
      </div>
    )
  }

  const blocked = push.permission === 'denied'

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-rule)] py-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <NotificationIcon
            size={15}
            color={push.subscribed ? 'var(--color-success)' : 'var(--color-ink-3)'}
            variant={push.subscribed ? 'Bold' : 'Linear'}
          />
          <p
            className="text-[14px] font-medium text-[var(--color-ink)]"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            This device
          </p>
        </div>

        <p className="mt-1 text-[12px] leading-[1.5] text-[var(--color-ink-3)]">
          {push.error ? (
            <span className="text-[var(--color-danger)]">{push.error}</span>
          ) : blocked ? (
            'Notifications are blocked for this site. Allow them in your browser settings to switch this on.'
          ) : push.subscribed ? (
            'Set up to receive reminders and achievements here.'
          ) : (
            'Turn on to get reminders and achievements on this device.'
          )}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {push.subscribed ? (
          <>
            <Button variant="ghost" size="sm" onClick={() => void push.sendTest()}>
              Send a test
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={push.busy}
              onClick={() => void push.unsubscribe()}
            >
              {push.busy ? 'Working…' : 'Turn off'}
            </Button>
          </>
        ) : (
          <Button
            variant="secondary"
            size="sm"
            disabled={push.busy || blocked || !enabled}
            title={!enabled ? 'Switch on push notifications above first' : undefined}
            onClick={() => void push.subscribe()}
          >
            {push.busy ? 'Working…' : 'Turn on'}
          </Button>
        )}
      </div>
    </div>
  )
}
