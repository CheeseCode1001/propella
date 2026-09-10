import type { Metadata, Viewport } from 'next'
import { Fraunces, Geist, JetBrains_Mono, Noto_Sans, Noto_Serif } from 'next/font/google'
import './globals.css'
import { PWARegister } from '@/components/common/pwa-register'

export const metadata: Metadata = {
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'Propella' },
  icons: {
    icon: [{ url: '/icon-192.png', sizes: '192x192', type: 'image/png' }],
    apple: [{ url: '/icon-192.png', sizes: '192x192', type: 'image/png' }],
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#6E3A5F' },
    { media: '(prefers-color-scheme: dark)', color: '#14120F' },
  ],
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

const fraunces = Fraunces({
  subsets: ['latin'],
  axes: ['opsz', 'SOFT', 'WONK'],
  variable: '--font-fraunces',
  display: 'swap',
})

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
})

const notoSans = Noto_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-noto-sans',
  display: 'swap',
})

const notoSerif = Noto_Serif({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-noto-serif',
  display: 'swap',
})

const fontVars = [
  fraunces.variable,
  geist.variable,
  jetbrainsMono.variable,
  notoSans.variable,
  notoSerif.variable,
].join(' ')

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <body className={fontVars}>
        {children}
        <PWARegister />
      </body>
    </html>
  )
}
