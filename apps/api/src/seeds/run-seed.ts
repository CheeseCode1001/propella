import { prisma, connectDB, disconnectDB } from '../config/db'
import { subjects, validateSyllabus } from './syllabus'
import { seedSuperAdmin } from './super-admin'

/**
 * Loads the JAMB/WAEC/NECO syllabus. Safe to re-run: each subject is upserted
 * by slug, so editing seeds/syllabus/*.ts and re-seeding updates the syllabus
 * in place instead of doing nothing.
 */
async function seed(): Promise<void> {
  // A prerequisite pointing at a topic that does not exist, or at one taught
  // later, would silently lock that topic out of every student's roadmap.
  // Better to refuse than to write a syllabus nobody can finish.
  const problems = validateSyllabus()
  if (problems.length > 0) {
    console.error('Syllabus is not valid:')
    problems.forEach((problem) => console.error(`  - ${problem}`))
    throw new Error('Refusing to seed an invalid syllabus')
  }

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
