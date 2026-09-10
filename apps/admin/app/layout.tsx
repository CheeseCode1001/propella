import type { Metadata, Viewport } from 'next'
import './globals.css'
import { PWARegister } from '@/components/pwa-register'

export const metadata: Metadata = {
  title: 'Propella Admin',
  description: 'Administration console for the Propella study platform',
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'Propella Admin' },
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <PWARegister />
      </body>
    </html>
  )
}
