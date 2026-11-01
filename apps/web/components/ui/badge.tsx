import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils/cn'

const badgeVariants = cva(
  'inline-flex items-center px-2.5 py-0.5 rounded-full font-[family-name:var(--font-hand)] text-[14px] leading-tight tracking-wide uppercase font-normal',
  {
    variants: {
      variant: {
        default: 'bg-[var(--color-paper-3)] text-[var(--color-ink-2)]',
        accent: 'bg-[var(--color-accent-tint)] text-[var(--color-accent)]',
        success: 'bg-[var(--color-success-tint)] text-[var(--color-success)]',
        warning: 'bg-[var(--color-warning-tint)] text-[var(--color-warning)]',
        danger: 'bg-[var(--color-danger-tint)] text-[var(--color-danger)]',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />
}
