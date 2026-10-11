'use client'
import { useState } from 'react'
import { useRouter } from '@/lib/i18n/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { LogOut } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { useAuthStore } from '@/lib/stores/auth-store'
import { api } from '@/lib/api-client'
import { Button } from '@/components/ui/button'

interface SignOutDialogProps {
  open: boolean
  onClose: () => void
}

export function SignOutDialog({ open, onClose }: SignOutDialogProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const logout = useAuthStore((s) => s.logout)
  const queryClient = useQueryClient()
  const tAuth = useTranslations('auth')
  const tCommon = useTranslations('common')

  async function handleConfirm() {
    setLoading(true)
    try {
      await api.post('/auth/logout')
    } catch {
      // clear client state regardless of server response
    }
    queryClient.clear()
    logout()
    router.push('/login')
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
            onClick={loading ? undefined : onClose}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 200,
              backgroundColor: 'rgba(0,0,0,0.45)',
            }}
            aria-hidden="true"
          />

          {/* Flex wrapper handles centering so Framer Motion's transform is free for scale/y animations */}
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 201,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
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
            aria-labelledby="signout-title"
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
            {/* Icon */}
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                backgroundColor: 'var(--color-accent-tint)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
              }}
            >
              <LogOut size={18} strokeWidth={1.5} style={{ color: 'var(--color-accent)' }} />
            </div>

            <h2
              id="signout-title"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 20,
                fontWeight: 500,
                color: 'var(--color-ink)',
                marginBottom: 8,
                lineHeight: 1.3,
              }}
            >
              Sign out of Propella?
            </h2>

            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 14,
                color: 'var(--color-ink-2)',
                lineHeight: 1.6,
                marginBottom: 24,
              }}
            >
              You can sign back in anytime. Your streak and progress are saved.
            </p>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <Button variant="ghost" onClick={onClose} disabled={loading}>
                {tCommon('cancel')}
              </Button>
              <button
                onClick={handleConfirm}
                disabled={loading}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  paddingInline: 16,
                  paddingBlock: 10,
                  fontSize: 14,
                  fontWeight: 500,
                  fontFamily: 'var(--font-sans)',
                  color: 'white',
                  backgroundColor: loading ? 'var(--color-ink-3)' : 'var(--color-accent)',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.15s',
                }}
              >
                <LogOut size={14} strokeWidth={1.5} />
                {loading ? 'Signing out…' : tAuth('logout')}
              </button>
            </div>
          </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
