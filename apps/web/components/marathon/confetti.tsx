'use client'

const COLORS = [
  'var(--color-accent)',
  'var(--color-success)',
  'var(--color-warning)',
  'var(--color-danger)',
]

const MAX_PIECES = 48

/**
 * Deterministic pseudo-random table, built once at module scope.
 *
 * Calling Math.random() during render would be impure (and would produce a
 * server/client hydration mismatch). A fixed seeded sequence looks just as
 * scattered on screen while staying pure and stable.
 */
const PIECES = (() => {
  let seed = 0x9e3779b9
  const next = () => {
    // xorshift32 — small, fast, good enough for scattering confetti.
    seed ^= seed << 13
    seed ^= seed >>> 17
    seed ^= seed << 5
    return ((seed >>> 0) % 10000) / 10000
  }

  return Array.from({ length: MAX_PIECES }, (_, i) => ({
    id: i,
    left: next() * 100,
    delay: next() * 0.45,
    duration: 1.5 + next() * 1.1,
    drift: (next() - 0.5) * 60,
    spin: next() * 360 + 540,
    size: 5 + next() * 5,
    color: COLORS[i % COLORS.length]!,
  }))
})()

/**
 * Small self-contained confetti burst. Deliberately dependency-free — a canvas
 * library would be far more weight than a one-off celebration needs.
 */
export function Confetti({ pieces = 36 }: { pieces?: number }) {
  const bits = PIECES.slice(0, Math.min(pieces, MAX_PIECES))

  return (
    <div
      aria-hidden
      className="propella-confetti"
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        borderRadius: 'inherit',
      }}
    >
      {bits.map((b) => (
        <span
          key={b.id}
          style={{
            position: 'absolute',
            top: -12,
            left: `${b.left}%`,
            width: b.size,
            height: b.size * 1.6,
            backgroundColor: b.color,
            borderRadius: 1,
            opacity: 0,
            animation: `propella-confetti-fall ${b.duration}s ease-in ${b.delay}s forwards`,
            // Custom properties consumed by the keyframes below.
            ['--drift' as string]: `${b.drift}px`,
            ['--spin' as string]: `${b.spin}deg`,
          }}
        />
      ))}
      <style>{`
        @keyframes propella-confetti-fall {
          0%   { opacity: 1; transform: translate(0, 0) rotate(0deg); }
          100% { opacity: 0; transform: translate(var(--drift), 260px) rotate(var(--spin)); }
        }
        @media (prefers-reduced-motion: reduce) {
          .propella-confetti > span { animation: none !important; opacity: 0 !important; }
        }
      `}</style>
    </div>
  )
}
