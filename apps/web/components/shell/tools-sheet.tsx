'use client'

import { useState } from 'react'
import { motion, AnimatePresence, useDragControls } from 'framer-motion'
import { useRouter } from '@/lib/i18n/navigation'
import { X, ChevronRight, BookOpen, ClipboardCheck, FileText, Timer, Sparkles, TrendingUp, Trophy, Globe, Sun, Moon } from 'lucide-react'
import { useReducedMotion } from 'framer-motion'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils/cn'
import { localeMetadata, type Locale } from '@/lib/i18n/locales'
import { LocaleSwitcher } from '@/components/common/locale-switcher'

interface ToolsSheetProps {
  open: boolean
  onClose: () => void
}

export function ToolsSheet({ open, onClose }: ToolsSheetProps) {
  const router = useRouter()
  const shouldReduceMotion = useReducedMotion()
  const dragControls = useDragControls()
  const tNav = useTranslations('nav')
  const tSettings = useTranslations('settings')

  const tools = [
    {
      href: '/planner',
      icon: BookOpen,
      label: tNav('planner'),
      description: 'Today and this week',
    },
    {
      href: '/quizzes',
      icon: ClipboardCheck,
      label: tNav('quizzes'),
      description: 'Practice by topic',
    },
    {
      href: '/mocks',
      icon: FileText,
      label: tNav('mocks'),
      description: 'Full exam simulations',
    },
    {
      href: '/marathon',
      icon: Timer,
      label: tNav('marathon'),
      description: 'Long focused runs',
    },
    {
      href: '/assistant',
      icon: Sparkles,
      label: tNav('assistant'),
      description: 'Ask anything from your syllabus',
    },
    {
      href: '/progress',
      icon: TrendingUp,
      label: tNav('progress'),
      description: 'Mastery, streaks, trends',
    },
    {
      href: '/leaderboard',
      icon: Trophy,
      label: tNav('leaderboard'),
      description: 'How you rank this week',
    },
  ]

  async function navigateTo(href: string) {
    onClose()
    await new Promise<void>((r) => setTimeout(r, 200))
    router.push(href)
  }

  const sheetVariants = shouldReduceMotion
    ? {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
      }
    : {
        hidden: { y: '100%' },
        visible: { y: 0 },
      }

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.22, ease: 'easeOut' }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 50,
              backgroundColor: 'rgba(0,0,0,0.4)',
            }}
            aria-hidden="true"
          />

          {/* Sheet */}
          <motion.div
            key="sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Tools"
            variants={sheetVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
            drag="y"
            dragControls={dragControls}
            dragConstraints={{ top: 0 }}
            dragElastic={{ top: 0, bottom: 0.3 }}
            onDragEnd={(_e, info) => {
              if (info.offset.y > 100 || info.velocity.y > 500) {
                onClose()
              }
            }}
            style={{
              position: 'fixed',
              left: 0,
              right: 0,
              bottom: 0,
              top: 48,
              zIndex: 51,
              backgroundColor: 'var(--color-paper)',
              borderTopLeftRadius: 'var(--radius-lg)',
              borderTopRightRadius: 'var(--radius-lg)',
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
            }}
          >
            {/* Drag handle */}
            <div
              onPointerDown={(e) => dragControls.start(e)}
              style={{
                display: 'flex',
                justifyContent: 'center',
                paddingTop: 12,
                paddingBottom: 4,
                cursor: 'grab',
                touchAction: 'none',
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 4,
                  borderRadius: 9999,
                  backgroundColor: 'var(--color-paper-3)',
                }}
              />
            </div>

            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 20px 12px',
                borderBottom: '1px solid var(--color-rule)',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 22,
                  fontWeight: 500,
                  color: 'var(--color-ink)',
                  lineHeight: 1.3,
                }}
              >
                {tNav('tools')}
              </span>
              <button
                onClick={onClose}
                aria-label="Close tools"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 32,
                  height: 32,
                  color: 'var(--color-ink-3)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>

            {/* Tool rows */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {tools.map((tool, idx) => {
                const Icon = tool.icon
                return (
                  <button
                    key={tool.href}
                    onClick={() => navigateTo(tool.href)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      width: '100%',
                      minHeight: 64,
                      padding: '12px 20px',
                      background: 'none',
                      border: 'none',
                      borderBottom:
                        idx < tools.length - 1
                          ? '1px solid var(--color-rule)'
                          : 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    {/* Icon box */}
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        flexShrink: 0,
                        backgroundColor: 'var(--color-paper-2)',
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon size={20} strokeWidth={1.5} color="var(--color-ink)" />
                    </div>

                    {/* Labels */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontFamily: 'var(--font-sans)',
                          fontSize: 16,
                          fontWeight: 500,
                          color: 'var(--color-ink)',
                          lineHeight: 1.4,
                        }}
                      >
                        {tool.label}
                      </div>
                      <div
                        style={{
                          fontFamily: 'var(--font-sans)',
                          fontSize: 13,
                          fontWeight: 400,
                          color: 'var(--color-ink-2)',
                          lineHeight: 1.4,
                          marginTop: 1,
                        }}
                      >
                        {tool.description}
                      </div>
                    </div>

                    {/* Chevron */}
                    <ChevronRight size={18} strokeWidth={1.5} color="var(--color-ink-3)" style={{ flexShrink: 0 }} />
                  </button>
                )
              })}

              {/* Theme row */}
              <ThemeRow themeLabel={tSettings('theme') || 'Theme'} />

              {/* Language row */}
              <LanguageRow onClose={onClose} languageLabel={tSettings('language')} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function LanguageRow({ onClose, languageLabel }: { onClose: () => void; languageLabel: string }) {
  const [open, setOpen] = useState(false)
  const params = useParams()
  const currentLocale = (params.locale as Locale) ?? 'en'

  return (
    <>
      <div style={{ borderTop: '1px solid var(--color-rule)' }}>
        <button
          onClick={() => setOpen((v) => !v)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            width: '100%',
            minHeight: 64,
            padding: '12px 20px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              flexShrink: 0,
              backgroundColor: 'var(--color-paper-2)',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Globe size={20} strokeWidth={1.5} color="var(--color-ink)" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--color-ink)' }}>{languageLabel}</div>
            <div style={{ fontSize: 13, color: 'var(--color-ink-2)', marginTop: 1 }}>
              {localeMetadata[currentLocale].nativeLabel}
            </div>
          </div>
          <ChevronRight size={18} strokeWidth={1.5} color="var(--color-ink-3)" style={{ flexShrink: 0 }} />
        </button>
      </div>

      {open && (
        <div style={{ borderTop: '1px solid var(--color-rule)', background: 'var(--color-paper-2)' }}>
          <LocaleSwitcher variant="inline" onSelect={() => { setOpen(false); onClose() }} />
        </div>
      )}
    </>
  )
}

function ThemeRow({ themeLabel }: { themeLabel: string }) {
  const { resolvedTheme, setTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  return (
    <div style={{ borderTop: '1px solid var(--color-rule)' }}>
      <button
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          width: '100%',
          minHeight: 64,
          padding: '12px 20px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            flexShrink: 0,
            backgroundColor: 'var(--color-paper-2)',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {isDark ? (
            <Moon size={20} strokeWidth={1.5} color="var(--color-ink)" />
          ) : (
            <Sun size={20} strokeWidth={1.5} color="var(--color-ink)" />
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--color-ink)' }}>{themeLabel}</div>
          <div style={{ fontSize: 13, color: 'var(--color-ink-2)', marginTop: 1 }}>
            {isDark ? 'Dark mode' : 'Light mode'}
          </div>
        </div>
        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-accent)' }}>
          {isDark ? 'Light' : 'Dark'}
        </span>
      </button>
    </div>
  )
}

