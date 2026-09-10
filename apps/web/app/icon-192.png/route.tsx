import { ImageResponse } from 'next/og'

export const contentType = 'image/png'
export const dynamic = 'force-static'

/**
 * PWA launcher icon. Generated rather than committed as a binary so it always
 * matches the brand colours in globals.css.
 *
 * The glyph sits inside the maskable "safe zone" (centre 80%), so Android can
 * crop it to any shape without clipping the letter.
 */
export function GET() {
  const size = 192
  return new ImageResponse(
    (
      <div
        style={{
          width: size,
          height: size,
          background: '#6E3A5F',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FBF9F4',
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
