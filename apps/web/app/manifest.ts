import type { MetadataRoute } from 'next'

/**
 * Served at /manifest.webmanifest. The intl proxy matcher ignores paths
 * containing a dot, so this is reachable without a locale prefix.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Propella — JAMB, WAEC & NECO preparation',
    short_name: 'Propella',
    description:
      'Build a personalised study path for JAMB, WAEC and NECO. Structured repetition, AI quizzes and mock exams.',
    start_url: '/en/dashboard',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#FBF9F4',
    theme_color: '#6E3A5F',
    categories: ['education', 'productivity'],
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'Dashboard', url: '/en/dashboard' },
      { name: 'Syllabus', url: '/en/roadmap' },
      { name: 'Quizzes', url: '/en/quizzes' },
    ],
  }
}
