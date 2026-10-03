import fs from 'node:fs'
import path from 'node:path'

export const dynamic = 'force-static'

export function GET() {
  const filePath = path.join(process.cwd(), 'public/icon-192.png')
  const fileBuffer = fs.readFileSync(filePath)
  return new Response(fileBuffer, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
