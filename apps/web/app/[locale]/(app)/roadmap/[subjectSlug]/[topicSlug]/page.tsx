import { redirect } from 'next/navigation'

interface PageProps {
  params: Promise<{ locale: string; subjectSlug: string; topicSlug: string }>
}

/**
 * Legacy topic URL.
 *
 * Topics used to open here, in a tabbed page whose Study and Practice tabs were
 * never built — which is why some topics appeared blank. The reader at
 * /topics/[subject]/[topic] is the real thing, so this now just forwards, and
 * any existing link or bookmark still lands somewhere useful.
 */
export default async function LegacyTopicRedirect({ params }: PageProps) {
  const { locale, subjectSlug, topicSlug } = await params
  redirect(`/${locale}/topics/${subjectSlug}/${topicSlug}`)
}
