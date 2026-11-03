'use client'

import { useRef, useState, type ReactNode } from 'react'
import { ArrowLeft, ArrowRight, Pause, Play } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

/** Autoplaying, muted background video with a Joyloo-style play/pause pill. */
export function JoyVideo({
  src,
  poster,
  label,
  className,
  overlay,
  children,
  controlsPosition = 'bottom-right',
}: {
  src: string
  poster: string
  label: string
  className?: string
  overlay?: string
  children?: ReactNode
  controlsPosition?: 'bottom-right' | 'top-right'
}) {
  const ref = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(true)

  const toggle = () => {
    const v = ref.current
    if (!v) return
    if (v.paused) {
      void v.play()
      setPlaying(true)
    } else {
      v.pause()
      setPlaying(false)
    }
  }

  return (
    <div className={cn('relative overflow-hidden bg-[#2a1a10]', className)}>
      <video
        ref={ref}
        className="absolute inset-0 h-full w-full object-cover"
        src={src}
        poster={poster}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={label}
      />
      {overlay && <div className="absolute inset-0" style={{ background: overlay }} />}
      {children}
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? 'Pause video' : 'Play video'}
        className={cn(
          'absolute z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white text-black shadow-md backdrop-blur transition',
          controlsPosition === 'bottom-right' ? 'bottom-5 right-5' : 'top-5 right-5',
        )}
      >
        {playing ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
      </button>
    </div>
  )
}

/** Horizontal snap scroller with Joyloo round prev / next buttons. */
export function JoyScroller({
  children,
  tone = 'light',
  className,
  controlsClassName,
}: {
  children: ReactNode
  tone?: 'light' | 'dark'
  className?: string
  controlsClassName?: string
}) {
  const ref = useRef<HTMLDivElement>(null)

  const scroll = (dir: 1 | -1) => {
    const el = ref.current
    if (!el) return
    el.scrollBy({ left: dir * Math.max(el.clientWidth * 0.8, 280), behavior: 'smooth' })
  }

  return (
    <div className={className}>
      <div
        ref={ref}
        className="scrollbar-hide -mx-6 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth px-6 pb-2 lg:mx-0 lg:px-0"
      >
        {children}
      </div>
      <div className={cn('mt-8 flex items-center justify-end gap-3', controlsClassName)}>
        <button
          type="button"
          onClick={() => scroll(-1)}
          aria-label="Previous"
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-full border transition',
            tone === 'dark'
              ? 'border-white/25 text-white hover:bg-white/10'
              : 'border-[var(--color-rule-2)] text-[var(--color-ink)] hover:bg-white',
          )}
        >
          <ArrowLeft size={18} />
        </button>
        <button
          type="button"
          onClick={() => scroll(1)}
          aria-label="Next"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-accent)] text-white shadow-md transition hover:bg-[var(--color-accent-2)]"
        >
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  )
}

