'use client'

import { useState } from 'react'
import { Link, usePathname } from '@/lib/i18n/navigation'
import { Home2, BookSquare, Element3, Note1, Profile } from 'iconsax-reactjs'
import type { Icon as IconsaxIcon } from 'iconsax-reactjs'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils/cn'
import { NavIcon } from '@/components/common/nav-icon'
import { ToolsSheet } from './tools-sheet'

// Everything reachable from the Tools sheet, so the centre button can show as
// active while the student is on one of them.
const TOOLS_ROUTES = [
  '/planner',
  '/quizzes',
  '/mocks',
  '/marathon',
  '/assistant',
  '/progress',
  '/leaderboard',
  '/study',
]

function isToolsRoute(pathname: string) {
  return TOOLS_ROUTES.some((r) => pathname === r || pathname.startsWith(r + '/'))
}

export function MobileNav() {
  const pathname = usePathname()
  const [sheetOpen, setSheetOpen] = useState(false)
  const t = useTranslations('nav')

  const toolsActive = isToolsRoute(pathname) || sheetOpen

  return (
    <>
      <nav
        className="md:hidden flex items-center justify-around fixed bottom-0 left-0 right-0 z-40"
        style={{
          height: 64,
          backgroundColor: 'var(--color-paper)',
          borderTop: '1px solid var(--color-rule)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        <NavTab href="/dashboard" icon={Home2} label={t('dashboard')} pathname={pathname} />
        <NavTab href="/roadmap" icon={BookSquare} label={t('roadmap')} pathname={pathname} />

        {/* Tools — raised primary button in the centre */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <button
            onClick={() => setSheetOpen(true)}
            aria-label={t('tools')}
            aria-expanded={sheetOpen}
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              backgroundColor: 'var(--color-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12,
              boxShadow: '0 4px 12px color-mix(in srgb, var(--color-accent) 40%, transparent)',
              flexShrink: 0,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <Element3 size={24} color="white" variant={toolsActive ? 'Bold' : 'Linear'} />
          </button>
        </div>

        <NavTab href="/notes" icon={Note1} label={t('notes')} pathname={pathname} />
        <NavTab href="/settings" icon={Profile} label={t('profile')} pathname={pathname} />
      </nav>

      <ToolsSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </>
  )
}

interface NavTabProps {
  href: string
  icon: IconsaxIcon
  label: string
  pathname: string
}

function NavTab({ href, icon, label, pathname }: NavTabProps) {
  const isActive = pathname === href || pathname.startsWith(href + '/')
  return (
    <Link
      href={href}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'flex flex-col items-center gap-0.5 rounded-[var(--radius-md)] px-3 py-1.5',
        'no-underline transition-colors duration-100',
        // Tinted rather than filled: a solid block per tab is heavy on a bar
        // this small, so the accent goes on the icon and label instead.
        isActive ? 'text-[var(--color-accent)]' : 'text-[var(--color-ink-3)]',
      )}
    >
      <NavIcon icon={icon} active={isActive} size={21} />
      <span
        style={{
          fontSize: 10,
          fontWeight: isActive ? 600 : 500,
          fontFamily: 'var(--font-sans)',
        }}
      >
        {label}
      </span>
    </Link>
  )
}
