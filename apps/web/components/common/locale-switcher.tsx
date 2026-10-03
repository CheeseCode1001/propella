'use client'
import { useState, useTransition } from 'react'
import Cookies from 'js-cookie'
import { Globe, Check } from 'lucide-react'
import { usePathname, useRouter } from '@/lib/i18n/navigation'
import { useParams } from 'next/navigation'
import { locales, localeMetadata, type Locale } from '@/lib/i18n/locales'
import { api } from '@/lib/api-client'
import { useAuthStore } from '@/lib/stores/auth-store'

interface LocaleSwitcherProps {
  variant?: 'popover' | 'inline'
  onSelect?: () => void
}

export function LocaleSwitcher({ variant = 'popover', onSelect }: LocaleSwitcherProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams()
  const currentLocale = (params.locale as Locale) ?? 'en'
  const currentMeta = localeMetadata[currentLocale]

  async function handleLocaleChange(locale: Locale) {
    if (locale === currentLocale) {
      setOpen(false)
      onSelect?.()
      return
    }

    // Persist in cookie so middleware preserves it on refresh
    Cookies.set('NEXT_LOCALE', locale, { expires: 365, path: '/', sameSite: 'lax' })

    const currentUser = useAuthStore.getState().user
    if (currentUser) {
      useAuthStore.getState().setUser({ ...currentUser, locale })
      api.patch('/users/me', { locale }).catch(() => null)
    }

    setOpen(false)
    onSelect?.()

    // startTransition bypasses RSC cache and re-fetches the [locale] layout
    startTransition(() => {
      router.replace(pathname, { locale })
    })
  }

  if (variant === 'inline') {
    return (
      <div style={{ opacity: isPending ? 0.6 : 1, transition: 'opacity 150ms' }}>
        {locales.map((locale) => (
          <button
            key={locale}
            onClick={() => handleLocaleChange(locale)}
            disabled={isPending}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              padding: '12px 20px',
              background: 'none',
              border: 'none',
              borderBottom: '1px solid var(--color-rule)',
              cursor: isPending ? 'wait' : 'pointer',
              textAlign: 'left',
            }}
          >
            <div>
              <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--color-ink)' }}>
                {localeMetadata[locale].nativeLabel}
              </div>
              <div style={{ fontSize: 13, color: 'var(--color-ink-3)', marginTop: 2 }}>
                {localeMetadata[locale].label}
              </div>
            </div>
            {locale === currentLocale && (
              <Check size={18} strokeWidth={1.5} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
            )}
          </button>
        ))}
        <div style={{ padding: '12px 20px' }}>
          <a
            href={`mailto:support@propella.app?subject=Translation%20report%20-%20${currentLocale}&body=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
            style={{ fontSize: 13, color: 'var(--color-ink-3)', textDecoration: 'underline' }}
          >
            Report a translation
          </a>
        </div>
      </div>
    )
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2.5 px-3 py-2 text-[14px] font-medium w-full text-left transition-colors text-[var(--color-ink-2)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-3)]"
        style={{
          border: 'none',
          cursor: isPending ? 'wait' : 'pointer',
          opacity: isPending ? 0.6 : 1,
          transition: 'opacity 150ms',
        }}
      >
        <Globe size={16} strokeWidth={1.5} />
        <span style={{ flex: 1 }}>Language</span>
        <span style={{ fontSize: 12, color: 'var(--color-ink-3)' }}>{currentMeta.nativeLabel}</span>
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            bottom: '100%',
            left: 0,
            right: 0,
            backgroundColor: 'var(--color-paper-2)',
            border: '1px solid var(--color-rule)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-md)',
            padding: '4px 0',
            marginBottom: 4,
            zIndex: 10,
          }}
        >
          {locales.map((locale) => (
            <button
              key={locale}
              onClick={() => handleLocaleChange(locale)}
              disabled={isPending}
              className="flex items-center gap-2.5 px-3 py-2 text-[14px] font-medium w-full text-left hover:bg-[var(--color-paper-3)] transition-colors"
              style={{ background: 'none', border: 'none', cursor: isPending ? 'wait' : 'pointer', color: 'var(--color-ink-2)' }}
            >
              <span style={{ flex: 1 }}>{localeMetadata[locale].nativeLabel}</span>
              {locale === currentLocale && (
                <Check size={14} strokeWidth={1.5} style={{ color: 'var(--color-accent)' }} />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
