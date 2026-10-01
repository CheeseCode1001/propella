import type { Metadata } from 'next'
import { ThemeProvider } from 'next-themes'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { Providers } from '@/components/providers'
import { Toaster } from '@/components/ui/toast'
import { HtmlLang } from '@/components/common/html-lang'
import { locales } from '@/lib/i18n/locales'
import { notFound } from 'next/navigation'

export const metadata: Metadata = {
  metadataBase: new URL('https://propellastudy.com'),
  title: {
    default: 'Propella — #1 Exam Preparation for JAMB, WAEC, NECO & University',
    template: '%s | Propella',
  },
  description:
    'Master your syllabus with Propella — Nigeria\'s leading adaptive exam prep platform. Authentic JAMB & WAEC past questions, timed CBT simulator, university course notes, and 24/7 AI tutor.',
  keywords: [
    'JAMB 2026',
    'JAMB past questions',
    'WAEC past questions',
    'NECO past questions',
    'CBT practice software Nigeria',
    'UTME syllabus tracker',
    'JAMB CBT practice free',
    'undergraduate past questions Nigeria',
    'UNILAG past questions',
    'OAU past questions',
    'UI past questions',
    'AI study tutor Nigeria',
    'Propella study',
    'Post-UTME prep',
    'Nigerian university study guide',
  ],
  authors: [{ name: 'Propella Learning Technologies', url: 'https://propellastudy.com' }],
  creator: 'Propella',
  publisher: 'Propella Education',
  category: 'Education',
  alternates: {
    canonical: 'https://propellastudy.com',
    languages: {
      en: 'https://propellastudy.com/en',
      yo: 'https://propellastudy.com/yo',
      ha: 'https://propellastudy.com/ha',
      ig: 'https://propellastudy.com/ig',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    alternateLocale: ['yo_NG', 'ha_NG', 'ig_NG'],
    url: 'https://propellastudy.com',
    siteName: 'Propella',
    title: 'Propella — #1 Exam Preparation for JAMB, WAEC, NECO & University',
    description:
      'Master your syllabus with Propella — Nigeria\'s leading adaptive exam prep platform. Authentic JAMB & WAEC past questions, timed CBT simulator, university course notes, and 24/7 AI tutor.',
    images: [
      {
        url: '/icon-512.png',
        width: 512,
        height: 512,
        alt: 'Propella Exam Preparation',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Propella — #1 Exam Preparation for JAMB, WAEC, NECO & University',
    description:
      'Personalized roadmaps, authentic CBT past questions, and AI tutoring for African students.',
    creator: '@propellastudy',
    images: ['/icon-512.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  other: {
    'geo.region': 'NG-LA',
    'geo.placename': 'Lagos, Nigeria',
    'geo.position': '6.5244;3.3792',
    ICBM: '6.5244, 3.3792',
    coverage: 'Nigeria, West Africa, Africa',
    distribution: 'Global',
    rating: 'General',
  },
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

const jsonLdOrg = {
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  name: 'Propella',
  url: 'https://propellastudy.com',
  logo: 'https://propellastudy.com/icon-512.png',
  description:
    'Premier exam preparation and adaptive syllabus mastery platform for JAMB, WAEC, NECO, and African university undergraduate courses.',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Lagos',
    addressCountry: 'NG',
  },
  sameAs: [
    'https://twitter.com/propellastudy',
  ],
}

const jsonLdApp = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Propella CBT & Study Platform',
  operatingSystem: 'All',
  applicationCategory: 'EducationalApplication',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'NGN',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    ratingCount: '1840',
  },
}

const jsonLdFaq = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is Propella?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Propella is an AI-powered study platform designed for West African students preparing for JAMB (UTME), WAEC (WASSCE), NECO, and undergraduate university examinations. It provides adaptive study roadmaps, timed CBT past question simulations, and an AI tutor.',
      },
    },
    {
      '@type': 'Question',
      name: 'How does Propella help me score 300+ in JAMB UTME?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Propella analyzes your strengths and weaknesses across all registered UTME subjects, builds a day-by-day roadmap covering the entire official syllabus, and simulates real CBT exams with instant feedback and AI-guided explanations.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does Propella support Nigerian University undergraduate courses?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, Propella features a dedicated Undergraduate Track where university and polytechnic students can track semester courses, upload study slides, practice 100L-500L past questions, and receive AI study support.',
      },
    },
  ],
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!(locales as readonly string[]).includes(locale)) {
    notFound()
  }

  const messages = await getMessages()

  return (
    <>
      <HtmlLang locale={locale} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrg) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdApp) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }}
      />
      <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem disableTransitionOnChange>
        <NextIntlClientProvider messages={messages}>
          <Providers>
            {children}
            <Toaster />
          </Providers>
        </NextIntlClientProvider>
      </ThemeProvider>
    </>
  )
}
