'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Icon as IconsaxIcon } from 'iconsax-reactjs'
import { Button } from '@/components/ui/button'

interface ConfirmDialogProps {
  open: boolean
  title: string
  /** One or two sentences on what happens. Say it plainly — no scare wording. */
  description: string
  confirmLabel?: string
  cancelLabel?: string
  /** Red confirm button for destructive actions. */
  destructive?: boolean
  icon?: IconsaxIcon
  onConfirm: () => void | Promise<void>
  onClose: () => void
}

/**
 * The shared "are you sure?" dialog.
 *
 * Stays open while `onConfirm` is in flight so a slow request cannot be fired
 * twice, and closes itself once the caller's promise settles.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  icon: Icon,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const [working, setWorking] = useState(false)

  // Escape should back out, but not mid-request.
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !working) onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, working, onClose])

  async function handleConfirm() {
    setWorking(true)
    try {
      await onConfirm()
    } finally {
      setWorking(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={working ? undefined : onClose}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 200,
              backgroundColor: 'rgba(0,0,0,0.45)',
            }}
            aria-hidden="true"
          />

          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 201,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 16,
              pointerEvents: 'none',
            }}
          >
            <motion.div
              key="dialog"
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.18, ease: [0.32, 0.72, 0, 1] }}
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="confirm-dialog-title"
              style={{
                pointerEvents: 'auto',
                width: '100%',
                maxWidth: 400,
                backgroundColor: 'var(--color-card)',
                border: '1px solid var(--color-rule)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-md)',
                padding: '28px 24px 24px',
              }}
            >
              {Icon && (
                <div
                  className="mb-4 flex items-center justify-center rounded-full"
                  style={{
                    width: 40,
                    height: 40,
                    backgroundColor: destructive
                      ? 'var(--color-danger-tint)'
                      : 'var(--color-accent-tint)',
                    color: destructive ? 'var(--color-danger)' : 'var(--color-accent)',
                  }}
                >
                  <Icon size={18} color="currentColor" variant="Linear" />
                </div>
              )}

              <h2
                id="confirm-dialog-title"
                className="mb-2 text-[20px] font-medium leading-[1.3] text-[var(--color-ink)]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {title}
              </h2>

              <p className="mb-6 text-[14px] leading-[1.6] text-[var(--color-ink-2)]">
                {description}
              </p>

              <div className="flex justify-end gap-2">
                <Button variant="secondary" size="sm" onClick={onClose} disabled={working}>
                  {cancelLabel}
                </Button>
                <Button
                  variant={destructive ? 'danger' : 'accent'}
                  size="sm"
                  onClick={() => void handleConfirm()}
                  disabled={working}
                >
                  {working ? 'Working…' : confirmLabel}
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
