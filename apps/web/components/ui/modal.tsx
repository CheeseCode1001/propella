'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CloseCircle } from 'iconsax-reactjs'

interface ModalProps {
  open: boolean
  title: string
  /** Small line under the title, e.g. which topic this belongs to. */
  subtitle?: string
  onClose: () => void
  children: React.ReactNode
  footer?: React.ReactNode
  /** Roomier for conversational content like the chat. */
  size?: 'md' | 'lg'
}

/**
 * A plain content modal, as opposed to ConfirmDialog which is for yes/no.
 *
 * Full height on a phone and a centred panel from `sm` up, because these hold
 * forms and conversations rather than a sentence.
 */
export function Modal({
  open,
  title,
  subtitle,
  onClose,
  children,
  footer,
  size = 'md',
}: ModalProps) {
  // Escape closes, and the page behind must not scroll while it is open.
  useEffect(() => {
    if (!open) return

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
    }
  }, [open, onClose])

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
            onClick={onClose}
            className="fixed inset-0 z-[200] bg-black/45"
            aria-hidden="true"
          />

          <div className="pointer-events-none fixed inset-0 z-[201] flex items-end justify-center sm:items-center sm:p-4">
            <motion.div
              key="panel"
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.98 }}
              transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
              role="dialog"
              aria-modal="true"
              aria-label={title}
              className="pointer-events-auto flex w-full flex-col overflow-hidden rounded-t-[var(--radius-lg)] sm:rounded-[var(--radius-lg)]"
              style={{
                maxWidth: size === 'lg' ? 720 : 560,
                // dvh keeps the panel clear of the mobile browser chrome.
                maxHeight: '88dvh',
                backgroundColor: 'var(--color-card)',
                border: '1px solid var(--color-rule)',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              <header className="flex shrink-0 items-start justify-between gap-3 border-b border-[var(--color-rule)] px-5 py-4">
                <div className="min-w-0">
                  <h2
                    className="text-[17px] font-semibold leading-tight text-[var(--color-ink)]"
                    style={{ fontFamily: 'var(--font-sans)' }}
                  >
                    {title}
                  </h2>
                  {subtitle && (
                    <p className="mt-0.5 truncate text-[12.5px] text-[var(--color-ink-3)]">
                      {subtitle}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="shrink-0 cursor-pointer rounded border-none bg-transparent p-0.5 text-[var(--color-ink-3)] transition-colors hover:text-[var(--color-ink)]"
                >
                  <CloseCircle size={20} color="currentColor" variant="Linear" />
                </button>
              </header>

              {/* min-h-0 lets this scroll instead of pushing the footer away. */}
              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>

              {footer && (
                <footer className="shrink-0 border-t border-[var(--color-rule)] px-5 py-3">
                  {footer}
                </footer>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
