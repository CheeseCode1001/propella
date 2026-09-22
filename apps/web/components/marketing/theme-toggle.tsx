'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState, useRef } from 'react'
import { Sun, Moon, Laptop } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  if (!mounted) {
    return (
      <div className={cn('w-8 h-8 rounded-lg border border-[var(--color-rule)] bg-[var(--color-paper-2)]', className)} />
    )
  }

  const currentTheme = theme || 'system'

  return (
    <div className={cn('relative inline-block', className)} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Switch theme (system, light, dark)"
        title={`Current theme: ${currentTheme}`}
        className="flex items-center justify-center w-8 h-8 rounded-lg border border-[var(--color-rule)] bg-[var(--color-paper-2)] text-[var(--color-ink-2)] hover:text-[var(--color-ink)] hover:border-[var(--color-accent)] transition-all cursor-pointer"
      >
        {currentTheme === 'light' ? (
          <Sun size={15} />
        ) : currentTheme === 'dark' ? (
          <Moon size={15} />
        ) : (
          <Laptop size={15} />
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-32 rounded-xl border border-[var(--color-rule)] bg-[var(--color-paper-2)] p-1 shadow-lg z-50 animate-in fade-in slide-in-from-top-1 duration-150">
          {[
            { id: 'system', label: 'System', icon: Laptop },
            { id: 'light', label: 'Light', icon: Sun },
            { id: 'dark', label: 'Dark', icon: Moon },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setTheme(id)
                setOpen(false)
              }}
              className={cn(
                'flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors text-left cursor-pointer',
                currentTheme === id
                  ? 'bg-[var(--color-accent)] text-white'
                  : 'text-[var(--color-ink-2)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-3)]',
              )}
            >
              <Icon size={13} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
