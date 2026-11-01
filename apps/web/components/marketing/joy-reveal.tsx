'use client'

import { useEffect, useRef, type ReactNode, type HTMLAttributes } from 'react'
import gsap from 'gsap'
import { cn } from '@/lib/utils/cn'

interface JoyRevealProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  delay?: number
  y?: number
  scale?: number
  duration?: number
  className?: string
}

/**
 * GSAP-powered viewport reveal component.
 * Uses hardware-accelerated transforms and power3.out easing for buttery smooth reveals.
 */
export function JoyReveal({
  children,
  delay = 0,
  y = 28,
  scale = 1,
  duration = 0.7,
  className,
  ...props
}: JoyRevealProps) {
  const elRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = elRef.current
    if (!el) return

    // Set initial GSAP state
    gsap.set(el, { opacity: 0, y, scale })

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            gsap.to(el, {
              opacity: 1,
              y: 0,
              scale: 1,
              duration,
              delay,
              ease: 'power3.out',
              clearProps: 'transform',
            })
            observer.unobserve(el)
          }
        })
      },
      { threshold: 0.08, rootMargin: '0px 0px -30px 0px' },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [delay, y, scale, duration])

  return (
    <div ref={elRef} className={cn(className)} {...props}>
      {children}
    </div>
  )
}

interface JoyStaggerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  className?: string
  staggerDelay?: number
}

/**
 * GSAP-powered staggered animation container.
 * Animates all child `JoyStaggerItem` elements in sequence when container enters viewport.
 */
export function JoyStagger({ children, className, staggerDelay = 0.1, ...props }: JoyStaggerProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const items = container.querySelectorAll<HTMLElement>('[data-joy-stagger-item]')
    if (!items.length) return

    gsap.set(items, { opacity: 0, y: 22 })

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            gsap.to(items, {
              opacity: 1,
              y: 0,
              duration: 0.65,
              stagger: staggerDelay,
              ease: 'power3.out',
              clearProps: 'transform',
            })
            observer.unobserve(container)
          }
        })
      },
      { threshold: 0.05, rootMargin: '0px 0px -20px 0px' },
    )

    observer.observe(container)
    return () => observer.disconnect()
  }, [staggerDelay])

  return (
    <div ref={containerRef} className={cn(className)} {...props}>
      {children}
    </div>
  )
}

export function JoyStaggerItem({
  children,
  className,
}: {
  children: ReactNode
  className?: string
  y?: number
}) {
  return (
    <div data-joy-stagger-item className={cn(className)}>
      {children}
    </div>
  )
}
