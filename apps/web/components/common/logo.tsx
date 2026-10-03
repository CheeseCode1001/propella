import { Link } from '@/lib/i18n/navigation'
import { cn } from '@/lib/utils/cn'

interface LogoProps {
  className?: string
  href?: string
  size?: number
  showText?: boolean
}

export function Logo({ className, href = '/', size = 32, showText = true }: LogoProps) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center gap-2.5 font-display font-medium text-[var(--color-ink)] tracking-tight no-underline group',
        className,
      )}
      style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}
    >
      <div
        className="relative shrink-0 overflow-hidden rounded-[10px] shadow-sm transition-transform duration-200 group-hover:scale-105"
        style={{ width: size, height: size }}
      >
        <img
          src="/logo.png"
          alt="Propella logo"
          width={size}
          height={size}
          className="h-full w-full object-cover"
        />
      </div>
      {showText && <span className="font-semibold text-[var(--color-ink)]">Propella</span>}
    </Link>
  )
}
