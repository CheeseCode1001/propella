'use client'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils/cn'
import { forwardRef } from 'react'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none',
  {
    variants: {
      variant: {
        default: 'bg-[var(--color-ink)] text-[var(--color-paper)] hover:brightness-105 active:scale-[0.98]',
        accent: 'bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-2)] active:scale-[0.98]',
        secondary: 'bg-[var(--color-paper-2)] border border-[var(--color-rule-2)] text-[var(--color-ink)] hover:bg-[var(--color-paper-3)]',
        ghost: 'text-[var(--color-ink-2)] hover:bg-[var(--color-paper-3)]',
        danger: 'bg-[var(--color-danger)] text-white hover:brightness-110 active:scale-[0.98]',
        link: 'text-[var(--color-accent)] underline-offset-[3px] decoration-[1px] hover:underline p-0 h-auto',
      },
      size: {
        sm: 'px-3 py-1.5 text-[13px] rounded-[var(--radius-sm)]',
        default: 'px-4 py-2.5 text-[14px] rounded-[var(--radius-sm)]',
        lg: 'px-5 py-3 text-[15px] rounded-[var(--radius-sm)]',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  },
)
Button.displayName = 'Button'

export { buttonVariants }
