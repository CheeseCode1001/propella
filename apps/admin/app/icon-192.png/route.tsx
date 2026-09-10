import { ImageResponse } from 'next/og'

export const contentType = 'image/png'
export const dynamic = 'force-static'

/** PWA launcher icon, generated so it always matches the admin palette. */
export function GET() {
  const size = 192
  return new ImageResponse(
    (
      <div
        style={{
          width: size,
          height: size,
          background: '#2F5FD0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FFFFFF',
          fontSize: size * 0.5,
          fontWeight: 700,
          fontFamily: 'serif',
        }}
      >
        P
      </div>
    ),
    { width: size, height: size },
  )
}
