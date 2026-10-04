import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/*/dashboard',
          '/*/onboarding',
          '/*/roadmap',
          '/*/quizzes',
          '/*/marathon',
          '/*/mocks',
          '/*/settings',
          '/*/planner',
          '/*/notes',
          '/*/admin',
        ],
      },
      {
        userAgent: [
          'GPTBot',
          'ChatGPT-User',
          'OAI-SearchBot',
          'ClaudeBot',
          'PerplexityBot',
          'Google-Extended',
          'anthropic-ai',
          'cohere-ai',
          'Applebot-Extended',
          'Meta-ExternalAgent',
          'Bytespider',
          'Diffbot',
        ],
        allow: [
          '/',
          '/llms.txt',
          '/llms-full.txt',
          '/*/highschool',
          '/*/undergraduate',
          '/*/pricing',
          '/*/testimonials',
          '/*/contact',
          '/*/privacy',
          '/*/terms',
        ],
        disallow: ['/api/', '/*/dashboard', '/*/settings'],
      },
    ],
    sitemap: 'https://propellastudy.com/sitemap.xml',
    host: 'https://propellastudy.com',
  }
}
