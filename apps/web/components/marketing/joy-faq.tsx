'use client'

import { useState, type ReactNode } from 'react'
import { Plus } from 'lucide-react'
import { Link } from '@/lib/i18n/navigation'
import { JoyEyebrow, JoyHeading } from '@/components/marketing/joy'
import { JoyReveal, JoyStagger, JoyStaggerItem } from '@/components/marketing/joy-reveal'
import { cn } from '@/lib/utils/cn'

export interface FaqItem {
  q: string
  a: string | ReactNode
}

interface JoyFaqSectionProps {
  eyebrow?: string
  title?: string
  subtitle?: string | ReactNode
  contactLinkText?: string
  faqs: FaqItem[]
  id?: string
  className?: string
  tone?: 'paper' | 'paper-2' | 'white'
  initialOpenIndex?: number | null
}

export function JoyFaqAccordion({
  faqs,
  initialOpenIndex = 0,
  className,
}: {
  faqs: FaqItem[]
  initialOpenIndex?: number | null
  className?: string
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(initialOpenIndex)

  function toggle(idx: number) {
    setOpenIndex((prev) => (prev === idx ? null : idx))
  }

  return (
    <JoyStagger className={cn('space-y-4', className)}>
      {faqs.map((f, i) => {
        const isOpen = openIndex === i
        return (
          <JoyStaggerItem key={typeof f.q === 'string' ? f.q : i}>
            <div
              className={cn(
                'rounded-[22px] border border-[var(--color-rule)] bg-white dark:bg-[#1A1813] transition-all duration-200 overflow-hidden shadow-sm',
                isOpen
                  ? 'border-[var(--color-accent)]/50 shadow-md ring-1 ring-[var(--color-accent)]/20'
                  : 'hover:border-[var(--color-rule-2)]',
              )}
            >
              <button
                type="button"
                onClick={() => toggle(i)}
                aria-expanded={isOpen}
                className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer select-none"
              >
                <span
                  className="text-[17px] sm:text-[18px] font-semibold text-[var(--color-ink)] pr-2 leading-snug"
                  style={{ fontFamily: "'Parkinsans', sans-serif", fontWeight: 600 }}
                >
                  {f.q}
                </span>
                <span
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)] text-white transition-transform duration-300 shadow-sm',
                    isOpen && 'rotate-45 bg-[#1A1917] dark:bg-white dark:text-[#1A1917]',
                  )}
                >
                  <Plus size={18} strokeWidth={2.4} />
                </span>
              </button>
              {isOpen && (
                <div className="px-5 pb-5 pt-1 sm:px-6 sm:pb-6 text-[15.5px] leading-[26px] text-[var(--color-ink)]/75 dark:text-[var(--color-ink)]/80 border-t border-[var(--color-rule)]/40">
                  <div className="pt-3" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                    {f.a}
                  </div>
                </div>
              )}
            </div>
          </JoyStaggerItem>
        )
      })}
    </JoyStagger>
  )
}

export function JoyFaqSection({
  eyebrow = 'FAQ',
  title = 'Questions scholars and parents often ask',
  subtitle,
  contactLinkText = 'Talk to our team',
  faqs,
  id = 'faq',
  className,
  tone = 'paper',
  initialOpenIndex = 0,
}: JoyFaqSectionProps) {
  const bgStyles = {
    paper: 'bg-[var(--color-paper)]',
    'paper-2': 'bg-[var(--color-paper-2)] border-y border-[var(--color-rule)]',
    white: 'bg-white dark:bg-[#1A1813]',
  }

  return (
    <section id={id} className={cn('py-24', bgStyles[tone], className)}>
      <div className="max-w-[1240px] mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 items-start">
          {/* Header left */}
          <JoyReveal className="lg:col-span-5">
            <JoyEyebrow className="mb-5">{eyebrow}</JoyEyebrow>
            <JoyHeading>{title}</JoyHeading>
            <p className="mt-5 text-[17px] leading-[26px] text-[var(--color-ink)]/70">
              {subtitle ?? (
                <>
                  Can&apos;t find what you need?{' '}
                  <Link
                    href="/contact"
                    className="font-semibold text-[var(--color-accent)] hover:underline inline-flex items-center gap-1"
                  >
                    {contactLinkText} →
                  </Link>
                </>
              )}
            </p>
          </JoyReveal>

          {/* Accordion right */}
          <div className="lg:col-span-7">
            <JoyFaqAccordion faqs={faqs} initialOpenIndex={initialOpenIndex} />
          </div>
        </div>
      </div>
    </section>
  )
}

