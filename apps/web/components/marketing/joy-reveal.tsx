'use client'

import { type ReactNode } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils/cn'

interface JoyRevealProps extends HTMLMotionProps<'div'> {
  children: ReactNode
  delay?: number
  y?: number
  scale?: number
  duration?: number
  className?: string
}

export function JoyReveal({
  children,
  delay = 0,
  y = 28,
  scale = 1,
  duration = 0.6,
  className,
  ...props
}: JoyRevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y, scale }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{
        duration,
        delay,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  )
}

interface JoyStaggerProps {
  children: ReactNode
  className?: string
  staggerDelay?: number
}

export function JoyStagger({ children, className, staggerDelay = 0.1 }: JoyStaggerProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  )
}

export function JoyStaggerItem({
  children,
  className,
  y = 20,
}: {
  children: ReactNode
  className?: string
  y?: number
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.5,
            ease: [0.21, 0.47, 0.32, 0.98],
          },
        },
      }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  )
}

