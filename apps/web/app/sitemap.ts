import type { MetadataRoute } from 'next'
import { locales } from '@/lib/i18n/locales'

const BASE_URL = 'https://propellastudy.com'

const STATIC_ROUTES = [
  { path: '', changeFrequency: 'daily' as const, priority: 1.0 },
  { path: '/highschool', changeFrequency: 'daily' as const, priority: 0.9 },
  { path: '/undergraduate', changeFrequency: 'daily' as const, priority: 0.9 },
  { path: '/pricing', changeFrequency: 'weekly' as const, priority: 0.8 },
  { path: '/testimonials', changeFrequency: 'weekly' as const, priority: 0.7 },
  { path: '/signup', changeFrequency: 'monthly' as const, priority: 0.8 },
  { path: '/login', changeFrequency: 'monthly' as const, priority: 0.6 },
  { path: '/privacy', changeFrequency: 'monthly' as const, priority: 0.4 },
  { path: '/terms', changeFrequency: 'monthly' as const, priority: 0.4 },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = []

  for (const route of STATIC_ROUTES) {
    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}${route.path}`,
        lastModified: new Date(),
        changeFrequency: route.changeFrequency,
        priority: locale === 'en' ? route.priority : route.priority * 0.9,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, `${BASE_URL}/${l}${route.path}`]),
          ),
        },
      })
    }
  }

  return entries
}
