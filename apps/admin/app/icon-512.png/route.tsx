import { ImageResponse } from 'next/og'

export const contentType = 'image/png'
export const dynamic = 'force-static'

/** Large PWA / splash icon. See icon-192.png for the maskable safe-zone note. */
export function GET() {
  const size = 512
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
