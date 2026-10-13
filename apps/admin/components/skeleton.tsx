'use client'

import React from 'react'

interface SkeletonProps {
  className?: string
  style?: React.CSSProperties
  width?: string | number
  height?: string | number
  borderRadius?: string | number
}

export function Skeleton({
  className = '',
  style,
  width,
  height,
  borderRadius,
}: SkeletonProps) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width,
        height,
        borderRadius: borderRadius ?? 'var(--radius)',
        ...style,
      }}
    />
  )
}

export function SkeletonText({
  lines = 3,
  className = '',
  gap = 8,
}: {
  lines?: number
  className?: string
  gap?: number
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap }} className={className}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height={14}
          width={i === lines - 1 && lines > 1 ? '65%' : '100%'}
        />
      ))}
    </div>
  )
}

export function SkeletonMetrics() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Users Section */}
      <section>
        <Skeleton width={120} height={18} style={{ marginBottom: 12 }} />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 14,
          }}
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card" style={{ padding: '18px 20px' }}>
              <Skeleton width="45%" height={12} style={{ marginBottom: 10 }} />
              <Skeleton width="60%" height={28} style={{ marginBottom: 8 }} />
              <Skeleton width="35%" height={11} />
            </div>
          ))}
        </div>
      </section>

      {/* Content Section */}
      <section>
        <Skeleton width={130} height={18} style={{ marginBottom: 12 }} />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 14,
          }}
        >
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card" style={{ padding: '18px 20px' }}>
              <Skeleton width="40%" height={12} style={{ marginBottom: 10 }} />
              <Skeleton width="55%" height={28} style={{ marginBottom: 8 }} />
              <Skeleton width="70%" height={11} />
            </div>
          ))}
        </div>
      </section>

      {/* Activity Section */}
      <section>
        <Skeleton width={140} height={18} style={{ marginBottom: 12 }} />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 14,
          }}
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card" style={{ padding: '18px 20px' }}>
              <Skeleton width="50%" height={12} style={{ marginBottom: 10 }} />
              <Skeleton width="50%" height={28} style={{ marginBottom: 8 }} />
              <Skeleton width="30%" height={11} />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export function SkeletonTable({
  rows = 5,
  cols = 5,
}: {
  rows?: number
  cols?: number
}) {
  return (
    <div style={{ width: '100%' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          padding: '12px 16px',
          borderBottom: '1px solid var(--rule)',
          gap: 12,
        }}
      >
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} height={13} width="70%" />
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {Array.from({ length: rows }).map((_, r) => (
          <div
            key={r}
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${cols}, 1fr)`,
              padding: '14px 16px',
              borderBottom: '1px solid var(--rule)',
              alignItems: 'center',
              gap: 12,
            }}
          >
            {Array.from({ length: cols }).map((_, c) => (
              <Skeleton
                key={c}
                height={14}
                width={c === 0 ? '80%' : c === cols - 1 ? '50%' : '65%'}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
