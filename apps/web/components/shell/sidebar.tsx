'use client'
// Locale-aware: next/navigation's usePathname keeps the /en prefix, which never
// matches these locale-less hrefs — that is why nothing looked active.
import { Link, usePathname } from '@/lib/i18n/navigation'
import {
  Home2, BookSquare, Calendar, TaskSquare, DocumentText,
  Timer1, Magicpen, Chart2, Cup, Profile, Card, Notification,
  MessageQuestion, LogoutCurve, Lock1, Note1,
} from 'iconsax-reactjs'
import { NavIcon } from '@/components/common/nav-icon'
import { useTranslations } from 'next-intl'
import { Logo } from '@/components/common/logo'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/lib/stores/auth-store'
import { SignOutDialog } from '@/components/auth/sign-out-dialog'
import { LocaleSwitcher } from '@/components/common/locale-switcher'
import { cn } from '@/lib/utils/cn'
import { useState, useRef, useEffect } from 'react'
import { useMarathonActive } from '@/lib/stores/marathon-store'

export function Sidebar() {
  const pathname = usePathname()
  const user = useAuthStore((s) => s.user)
  const tNav = useTranslations('nav')
  const tAuth = useTranslations('auth')

  const marathonActive = useMarathonActive()

  // While a marathon is running the destinations that pull attention away from
  // studying are locked. Study surfaces stay reachable.
  const navItems = [
    { href: '/dashboard', icon: Home2, label: tNav('dashboard'), lockable: false },
    { href: '/roadmap', icon: BookSquare, label: tNav('roadmap'), lockable: false },
    { href: '/notes', icon: Note1, label: tNav('notes'), lockable: false },
    { href: '/planner', icon: Calendar, label: tNav('planner'), lockable: false },
    { href: '/quizzes', icon: TaskSquare, label: tNav('quizzes'), lockable: false },
    { href: '/mocks', icon: DocumentText, label: tNav('mocks'), lockable: false },
    { href: '/marathon', icon: Timer1, label: tNav('marathon'), lockable: false },
    { href: '/assistant', icon: Magicpen, label: tNav('assistant'), lockable: false },
    { href: '/progress', icon: Chart2, label: tNav('progress'), lockable: true },
    { href: '/leaderboard', icon: Cup, label: tNav('leaderboard'), lockable: true },
  ]
  const [menuOpen, setMenuOpen] = useState(false)
  const [signOutOpen, setSignOutOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  const initial = user?.name?.charAt(0).toUpperCase() ?? 'U'

  return (
    <aside
      className="hidden md:flex flex-col"
      style={{
        width: 220,
        minWidth: 220,
        flexShrink: 0,
        height: '100vh',
        position: 'sticky',
        top: 0,
        backgroundColor: 'var(--color-paper-2)',
        borderRight: '1px solid var(--color-rule)',
        overflowY: 'auto',
      }}
    >
      {/* Logo */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-rule)' }}>
        <Logo href="/dashboard" />
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-1.5" style={{ padding: '12px 0' }}>
        {navItems.map(({ href, icon: Icon, label, lockable }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          const locked = marathonActive && lockable

          if (locked) {
            return (
              <span
                key={href}
                aria-disabled="true"
                title="Locked until your marathon ends"
                className="mx-3 flex items-center gap-3 rounded-[var(--radius-sm)] px-3 py-1.5 text-[14px] font-medium text-[var(--color-ink-3)] cursor-not-allowed opacity-50 select-none"
              >
                <NavIcon icon={Icon} active={false} size={20} />
                <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 500 }}>{label}</span>
                <Lock1 size={14} color="currentColor" variant="Linear" style={{ marginLeft: 'auto' }} />
              </span>
            )
          }

          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'mx-3 flex items-center gap-3 rounded-[var(--radius-sm)] px-3 py-1.5',
                'text-[14px] font-medium no-underline transition-colors duration-100',
                isActive
                  // Active page reads as a solid primary block, not a hairline.
                  ? 'bg-[var(--color-accent)] text-white'
                  : 'text-[var(--color-ink-2)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-3)]',
              )}
            >
              {/* Icon and label both inherit the white from the parent. */}
              <NavIcon icon={Icon} active={isActive} size={20} />
              <span
                style={{ fontFamily: 'var(--font-sans)', fontWeight: isActive ? 600 : 500 }}
              >
                {label}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* User card */}
      <div
        style={{ borderTop: '1px solid var(--color-rule)', padding: '12px 16px', position: 'relative' }}
        ref={menuRef}
      >
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="flex items-center gap-3 w-full rounded-[var(--radius-md)] p-2 hover:bg-[var(--color-paper-3)] transition-colors"
        >
          {/* Avatar */}
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              backgroundColor: 'var(--color-paper-3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-sans)',
              fontWeight: 600,
              fontSize: 13,
              color: 'var(--color-ink)',
              flexShrink: 0,
              overflow: 'hidden',
            }}
          >
            {user?.avatarUrl ? (
              // Stored as a data URL, so next/image cannot optimise it.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatarUrl}
                alt=""
                width={32}
                height={32}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              initial
            )}
          </div>
          <div className="flex flex-col items-start min-w-0 flex-1">
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontWeight: 500,
                fontSize: 13,
                color: 'var(--color-ink)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '100%',
              }}
            >
              {user?.name ?? 'User'}
            </span>
            <Badge variant="default" className="mt-0.5" style={{ fontSize: 10 }}>
              {user?.plan ?? 'free'}
            </Badge>
          </div>
        </button>

        {/* Dropdown menu — opens upward */}
        {menuOpen && (
          <div
            style={{
              position: 'absolute',
              bottom: '100%',
              left: 16,
              right: 16,
              backgroundColor: 'var(--color-paper-2)',
              border: '1px solid var(--color-rule)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-md)',
              padding: '4px 0',
              marginBottom: 4,
            }}
          >
            {[
              { href: '/settings', icon: Profile, label: tNav('profile') },
              { href: '/settings?tab=plan', icon: Card, label: 'Plan & billing' },
              { href: '/settings?tab=notifications', icon: Notification, label: 'Notifications' },
              { href: '/help', icon: MessageQuestion, label: 'Help & support' },
            ].map(({ href, icon: Icon, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-[14px] font-medium text-[var(--color-ink-2)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-3)] no-underline transition-colors"
              >
                <Icon size={17} color="currentColor" variant="Linear" />
                {label}
              </Link>
            ))}

            {/* Language switcher */}
            <LocaleSwitcher variant="popover" onSelect={() => setMenuOpen(false)} />

            {/* Divider */}
            <div style={{ height: 1, backgroundColor: 'var(--color-rule)', margin: '4px 0' }} />

            <button
              onClick={() => { setMenuOpen(false); setSignOutOpen(true) }}
              disabled={marathonActive}
              title={marathonActive ? 'Finish or stop your marathon first' : undefined}
              className="flex items-center gap-2.5 px-3 py-2 text-[14px] font-medium w-full text-left transition-colors"
              style={{
                color: marathonActive ? 'var(--color-ink-3)' : 'var(--color-ink-2)',
                background: 'none',
                border: 'none',
                cursor: marathonActive ? 'not-allowed' : 'pointer',
                opacity: marathonActive ? 0.5 : 1,
              }}
              onMouseEnter={(e) => {
                if (!marathonActive) e.currentTarget.style.backgroundColor = 'var(--color-paper-3)'
              }}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              {marathonActive ? (
                <Lock1 size={17} color="currentColor" variant="Linear" />
              ) : (
                <LogoutCurve size={17} color="currentColor" variant="Linear" />
              )}
              {tAuth('logout')}
            </button>
          </div>
        )}
      </div>

      <SignOutDialog open={signOutOpen} onClose={() => setSignOutOpen(false)} />
    </aside>
  )
}
