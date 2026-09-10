import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Propella Admin',
    short_name: 'Propella Admin',
    description: 'Administration console for the Propella study platform.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#FBF9F4',
    theme_color: '#6E3A5F',
    categories: ['education', 'productivity'],
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'Past questions', url: '/past-questions' },
      { name: 'Users', url: '/users' },
    ],
  }
}
