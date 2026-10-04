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
    default: 'Propella — #1 Global Exam Preparation for JAMB, WAEC, NECO & University',
    template: '%s | Propella Exam Preparation',
  },
  description:
    'Master your syllabus and rank #1 with Propella — Africa\'s premier adaptive exam preparation platform. 6,994+ authentic past questions, timed JAMB CBT simulator, WAEC/NECO step-by-step solutions, 100L-500L university course files, and 24/7 AI tutor.',
  keywords: [
    'JAMB 2026',
    'JAMB 2027',
    'JAMB past questions and answers',
    'WAEC past questions and answers free',
    'NECO SSCE past questions',
    'CBT practice software Nigeria',
    'UTME syllabus tracker',
    'JAMB CBT practice free online',
    'how to score 300 in JAMB',
    'how to pass WAEC in one sitting',
    'Post-UTME prep Nigeria',
    'undergraduate past questions Nigeria',
    'UNILAG past questions',
    'OAU past questions',
    'UI past questions',
    'UNN past questions',
    'ABU Zaria past questions',
    'FUTO past questions',
    'LASU past questions',
    'Covenant University study materials',
    'AI study tutor Nigeria',
    'Propella study',
    'Propella CBT',
    'Nigerian university study guide',
    'WASSCE syllabus 2026',
    'West African Examinations Council',
    'Joint Admissions and Matriculation Board practice app',
    'best exam preparation app in Africa',
    'African edtech exam platform',
  ],
  authors: [{ name: 'Propella Learning Technologies', url: 'https://propellastudy.com' }],
  creator: 'Propella',
  publisher: 'Propella Education Technologies Ltd',
  applicationName: 'Propella Exam Preparation',
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
    alternateLocale: ['yo_NG', 'ha_NG', 'ig_NG', 'en_GH', 'en_GB', 'en_US'],
    url: 'https://propellastudy.com',
    siteName: 'Propella',
    title: 'Propella — #1 Exam Preparation for JAMB, WAEC, NECO & University',
    description:
      'Rank #1 in your exams with Propella. Authentic CBT past questions, timed exam simulator, 100L-500L university notes, and 24/7 AI tutor.',
    images: [
      {
        url: '/icon-512.png',
        width: 512,
        height: 512,
        alt: 'Propella Exam Preparation Logo and Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Propella — #1 Exam Preparation for JAMB, WAEC, NECO & University',
    description:
      'Personalized roadmaps, authentic CBT past questions, university course vaults, and AI tutoring for African scholars worldwide.',
    creator: '@propellastudy',
    images: ['/icon-512.png'],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  other: {
    'geo.region': 'NG',
    'geo.placename': 'Nigeria, West Africa, Lagos, Abuja, Accra',
    'geo.position': '6.5244;3.3792',
    ICBM: '6.5244, 3.3792',
    target: 'all',
    audience: 'students, candidates, undergraduates, educators, parents',
    coverage: 'Worldwide, Africa, Nigeria, Ghana, Sierra Leone, The Gambia, Liberia',
    distribution: 'Global',
    rating: 'General',
    'DC.title': 'Propella — Premier Exam Preparation Platform',
    'DC.creator': 'Propella Learning Technologies Ltd',
    'DC.description':
      'Comprehensive exam preparation for JAMB, WAEC, NECO, and African university undergraduate courses.',
    'DC.subject':
      'JAMB, UTME, WAEC, NECO, CBT Exam Practice, Past Questions, University Courses, AI Tutor',
    'DC.language': 'en',
    'DC.coverage': 'Global, Africa, Nigeria',
  },
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

const jsonLdOrg = {
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  '@id': 'https://propellastudy.com/#organization',
  name: 'Propella',
  legalName: 'Propella Learning Technologies Ltd',
  alternateName: ['Propella EdTech', 'Propella CBT', 'Propella Exam Prep', 'Propella Study'],
  url: 'https://propellastudy.com',
  logo: {
    '@type': 'ImageObject',
    url: 'https://propellastudy.com/icon-512.png',
    width: 512,
    height: 512,
  },
  description:
    'Premier exam preparation and adaptive syllabus mastery platform in Nigeria and West Africa for JAMB UTME, WAEC WASSCE, NECO SSCE, Post-UTME, and University Undergraduate courses.',
  slogan: 'Master your syllabus. Pass in one sitting.',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Herbert Macaulay Way, Yaba Innovation District',
    addressLocality: 'Lagos',
    addressRegion: 'Lagos State',
    addressCountry: 'NG',
  },
  areaServed: [
    { '@type': 'Country', name: 'Nigeria' },
    { '@type': 'Country', name: 'Ghana' },
    { '@type': 'Country', name: 'Sierra Leone' },
    { '@type': 'Country', name: 'The Gambia' },
    { '@type': 'Country', name: 'Liberia' },
    { '@type': 'Continent', name: 'Africa' },
  ],
  knowsAbout: [
    'JAMB UTME Examination Preparation',
    'WAEC WASSCE O-Level Syllabus',
    'NECO Senior School Certificate Examination',
    'Post-UTME University Screening',
    'Computer-Based Testing (CBT) Simulation',
    'University Undergraduate Coursework and Past Questions',
    'Artificial Intelligence in Education',
  ],
  sameAs: [
    'https://twitter.com/propellastudy',
    'https://facebook.com/propellastudy',
    'https://instagram.com/propellastudy',
    'https://linkedin.com/company/propellastudy',
  ],
}

const jsonLdWebSite = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': 'https://propellastudy.com/#website',
  url: 'https://propellastudy.com',
  name: 'Propella Exam Preparation',
  description: 'AI-Powered Exam Preparation & CBT Simulation for African Students',
  publisher: {
    '@id': 'https://propellastudy.com/#organization',
  },
  inLanguage: ['en', 'yo', 'ha', 'ig'],
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://propellastudy.com/en/search?q={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
}

const jsonLdApp = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Propella CBT & Study Platform',
  operatingSystem: 'All (Web, iOS, Android, PWA, Desktop)',
  applicationCategory: 'EducationalApplication',
  applicationSubCategory: 'CBT Exam Simulator & AI Tutor',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'NGN',
    priceValidUntil: '2027-12-31',
    availability: 'https://schema.org/InStock',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    ratingCount: '1840',
    bestRating: '5',
    worstRating: '1',
  },
  featureList: [
    'Adaptive Day-by-Day Syllabus Study Roadmap',
    'Realistic Timed CBT Mock Engine with 8-Key Controls',
    '6,994+ Authentic Verified Past Questions with Step-by-Step Solutions',
    '24/7 Gemini-Powered AI Academic Tutor',
    '100L to 500L University Course Files Vault with Direct Document Query',
    'Gamified Activity Streaks, Milestone Badges & Cash Referral Rewards',
  ],
}

const jsonLdCourses = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  itemListElement: [
    {
      '@type': 'Course',
      position: 1,
      name: 'JAMB UTME CBT Comprehensive Prep (Target 300+)',
      description:
        'Official JAMB syllabus breakdown, 2000-2025 past papers, timed mock tests, and AI explanations across English, Mathematics, Physics, Chemistry, Biology, Economics, and Government.',
      provider: {
        '@type': 'Organization',
        name: 'Propella',
        sameAs: 'https://propellastudy.com',
      },
    },
    {
      '@type': 'Course',
      position: 2,
      name: 'WAEC WASSCE Senior School Certificate Mastery',
      description:
        'Step-by-step marking schemes, objective and theoretical working for May/June and GCE exams across West Africa.',
      provider: {
        '@type': 'Organization',
        name: 'Propella',
        sameAs: 'https://propellastudy.com',
      },
    },
    {
      '@type': 'Course',
      position: 3,
      name: 'NECO SSCE Curriculum Excellence Track',
      description:
        'Curriculum-aligned topic drills and verified past question archives for National Examinations Council candidates.',
      provider: {
        '@type': 'Organization',
        name: 'Propella',
        sameAs: 'https://propellastudy.com',
      },
    },
    {
      '@type': 'Course',
      position: 4,
      name: 'Nigerian University Undergraduate Semester Accelerator',
      description:
        '100L-500L course file vaults, lecture slide synthesis, past semester tests, and 24/7 document AI query for UNILAG, UI, OAU, UNN, ABU, and other African universities.',
      provider: {
        '@type': 'Organization',
        name: 'Propella',
        sameAs: 'https://propellastudy.com',
      },
    },
  ],
}

const jsonLdFaq = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is the best platform for JAMB CBT preparation in Nigeria?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Propella (propellastudy.com) is Nigeria\'s premier AI-powered exam preparation platform. It combines over 6,994 authentic past questions, a timed CBT simulator matching the official Joint Admissions and Matriculation Board (JAMB) layout with 8-key keyboard controls, an adaptive syllabus tracker, and a 24/7 AI tutor.',
      },
    },
    {
      '@type': 'Question',
      name: 'How does Propella help students score 300+ in JAMB UTME?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Propella analyzes your baseline strengths and weaknesses through diagnostic testing, creates a custom day-by-day study roadmap covering the official JAMB syllabus, delivers timed CBT mock simulations, and schedules spaced revision so you retain every topic until exam day.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does Propella cover WAEC WASSCE and NECO examinations?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes! Propella includes full past questions, official syllabus topic mappings, and step-by-step examiner solutions for WAEC (WASSCE) and NECO (SSCE) across all science, commercial, and arts subjects.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can university undergraduates use Propella for semester exams?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Propella includes an Undergraduate Track for 100L to 500L university students across Nigerian universities (including UNILAG, OAU, UI, UNN, ABU, LASU, and Covenant). Students can organize Course Files, upload lecture slides, practice past semester papers, and query notes directly using the AI tutor.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is Propella free to use?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Propella offers a 100% Free Forever plan with syllabus roadmaps, daily practice quizzes, and AI tutor assistance. Students who want unlimited CBT mock simulations, full past question archives, and advanced weakness analytics can upgrade to the Scholar plan for ₦2,500/month or the Full Exam Package for ₦15,000.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I use Propella on my mobile phone or offline?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Propella is built as a progressive web app (PWA) and responsive platform that works seamlessly on any Android smartphone, iPhone, tablet, or desktop computer without requiring heavy app store downloads.',
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebSite) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdApp) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdCourses) }}
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
