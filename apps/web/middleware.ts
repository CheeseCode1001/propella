import createMiddleware from 'next-intl/middleware'
import { locales, defaultLocale } from '@/lib/i18n/locales'

const handleMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
  localeDetection: true,
})

export default handleMiddleware
export const proxy = handleMiddleware
export const middleware = handleMiddleware

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}
