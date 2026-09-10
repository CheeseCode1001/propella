'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { BarChart3, Users, FileQuestion, History, LogOut, ShieldCheck, Megaphone } from 'lucide-react'
import { api, ApiError, getToken, setToken } from '@/lib/api'

const NAV = [
  { href: '/', label: 'Overview', icon: BarChart3 },
  { href: '/past-questions', label: 'Past questions', icon: FileQuestion },
  { href: '/imports', label: 'Import history', icon: History },
  { href: '/users', label: 'Users', icon: Users },
  { href: '/broadcast', label: 'Announcements', icon: Megaphone },
  { href: '/administrators', label: 'Administrators', icon: ShieldCheck },
]

/**
 * Wraps every authenticated page: verifies the token really belongs to an
 * admin (the API answers 403 otherwise) before rendering anything.
 */
export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [state, setState] = useState<'checking' | 'ok'>('checking')

  useEffect(() => {
    if (!getToken()) {
      router.replace('/login')
      return
    }
    let cancelled = false
    api
      .get('/admin/metrics')
      .then(() => {
        if (!cancelled) setState('ok')
      })
      .catch((err: unknown) => {
        if (cancelled) return
        if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
          setToken(null)
          router.replace('/login')
        } else {
          // Network trouble should not bounce an admin back to the login form.
          setState('ok')
        }
      })
    return () => {
      cancelled = true
    }
  }, [router])

  if (state === 'checking') {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', color: 'var(--ink-3)' }}>
        Checking access…
      </div>
    )
  }

  function signOut() {
    setToken(null)
    router.replace('/login')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside
        style={{
          width: 218,
          flexShrink: 0,
          background: 'var(--paper-2)',
          borderRight: '1px solid var(--rule)',
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          height: '100vh',
        }}
      >
        <div
          style={{
            padding: '18px 20px',
            borderBottom: '1px solid var(--rule)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <ShieldCheck size={18} color="var(--accent)" />
          <div>
            <div style={{ fontWeight: 700, letterSpacing: '-0.01em' }}>Propella</div>
            <div style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.06em' }}>ADMIN</div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '8px 0' }}>
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '9px 20px',
                  fontWeight: 500,
                  color: active ? 'var(--ink)' : 'var(--ink-2)',
                  background: active ? 'var(--paper-3)' : 'transparent',
                  borderLeft: active ? '2px solid var(--accent)' : '2px solid transparent',
                }}
              >
                <Icon size={16} />
                {label}
              </Link>
            )
          })}
        </nav>

        <div style={{ padding: 12, borderTop: '1px solid var(--rule)' }}>
          <button className="btn" style={{ width: '100%' }} onClick={signOut}>
            <LogOut size={15} />
            Sign out
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, minWidth: 0, padding: '28px 32px 60px' }}>{children}</main>
    </div>
  )
}

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header style={{ marginBottom: 24 }}>
      <h1 style={{ margin: 0, fontSize: 24, fontWeight: 650, letterSpacing: '-0.02em' }}>{title}</h1>
      {subtitle && (
        <p style={{ margin: '4px 0 0', color: 'var(--ink-2)', fontSize: 13.5 }}>{subtitle}</p>
      )}
    </header>
  )
}
