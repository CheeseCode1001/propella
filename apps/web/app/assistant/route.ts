import { NextResponse, type NextRequest } from 'next/server'

export function GET(request: NextRequest) {
  const locale = request.cookies.get('NEXT_LOCALE')?.value || 'en'
  const search = request.nextUrl.search
  return NextResponse.redirect(new URL(`/${locale}/assistant${search}`, request.url))
}
