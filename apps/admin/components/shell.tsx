'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect } from 'react'
import { BarChart3, Users, FileQuestion, History, LogOut, ShieldCheck, Megaphone, Banknote } from 'lucide-react'
import { api, ApiError, getToken, setToken } from '@/lib/api'

const NAV = [
  { href: '/', label: 'Overview', icon: BarChart3 },
  { href: '/past-questions', label: 'Past questions', icon: FileQuestion },
  { href: '/imports', label: 'Import history', icon: History },
  { href: '/users', label: 'Users', icon: Users },
  { href: '/withdrawals', label: 'Withdrawals', icon: Banknote },
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

  useEffect(() => {
    // If no token exists at all, redirect to login
    if (!getToken()) {
      router.replace('/login')
      return
    }

    // Verify admin access in the background without blocking the UI
    let cancelled = false
    api
      .get('/admin/metrics')
      .catch((err: unknown) => {
        if (cancelled) return
        if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
          setToken(null)
          router.replace('/login')
        }
      })

    return () => {
      cancelled = true
    }
  }, [router])


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

        <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 3 }}>
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
                  padding: '9px 12px',
                  borderRadius: 8,
                  fontWeight: active ? 600 : 500,
                  fontSize: 13,
                  color: active ? 'var(--accent)' : 'var(--ink-2)',
                  background: active ? 'var(--accent-tint)' : 'transparent',
                  transition: 'background 120ms, color 120ms',
                }}
              >
                <Icon size={16} strokeWidth={active ? 2.2 : 1.8} />
                <span>{label}</span>
              </Link>
            )
          })}
        </nav>

        <div style={{ padding: '14px 12px', borderTop: '1px solid var(--rule)', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--accent)', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 700 }}>
              A
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Super Admin</div>
              <div style={{ fontSize: 10.5, color: 'var(--ink-3)' }}>Console Access</div>
            </div>
          </div>
          <button className="btn" style={{ width: '100%', fontSize: 12, padding: '7px 10px' }} onClick={signOut}>
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, minWidth: 0, padding: '28px 36px 64px', maxWidth: 1200, margin: '0 auto' }}>
        {children}
      </main>
    </div>
  )
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}) {
  return (
    <header style={{ marginBottom: 28, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--ink)' }}>{title}</h1>
        {subtitle && (
          <p style={{ margin: '5px 0 0', color: 'var(--ink-3)', fontSize: 13.5 }}>{subtitle}</p>
        )}
      </div>
      {actions && <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>{actions}</div>}
    </header>
  )
}
