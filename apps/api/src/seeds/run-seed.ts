import { prisma, connectDB, disconnectDB } from '../config/db'
import { subjects } from './subjects'
import { seedSuperAdmin } from './super-admin'

/**
 * Loads the JAMB/WAEC/NECO syllabus. Safe to re-run: each subject is upserted
 * by slug, so editing seeds/subjects.ts and re-seeding updates the syllabus in
 * place instead of doing nothing.
 */
async function seed(): Promise<void> {
  await connectDB()

  for (const subject of subjects) {
    const data = {
      name: subject.name,
      examTypes: subject.examTypes,
      description: subject.description,
      hue: subject.hue,
      topics: subject.topics,
    }

    await prisma.subject.upsert({
      where: { slug: subject.slug },
      create: { slug: subject.slug, ...data },
      update: data,
    })
  }

  const total = await prisma.subject.count()
  const topicCount = subjects.reduce((sum, s) => sum + s.topics.length, 0)
  console.log(`Seeded ${subjects.length} subjects (${topicCount} topics). ${total} in database.`)

  await seedSuperAdmin()
}

seed()
  .then(async () => {
    await disconnectDB()
    process.exit(0)
  })
  .catch(async (err: unknown) => {
    console.error('Seed failed:', err)
    await disconnectDB().catch(() => undefined)
    process.exit(1)
  })
