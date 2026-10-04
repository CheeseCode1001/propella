import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'
import pkg from './package.json'

const withNextIntl = createNextIntlPlugin('./lib/i18n/request.ts')

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.0.2'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
      },
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion', 'recharts'],
  },
  env: {
    NEXT_PUBLIC_APP_VERSION: pkg.version,
  },
}

export default withNextIntl(nextConfig)
