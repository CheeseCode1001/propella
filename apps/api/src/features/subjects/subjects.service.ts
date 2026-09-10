import type { Subject } from '../../config/db'
import { prisma } from '../../config/db'
import { NotFoundError } from '../../middleware/error-handler'

export async function getAllSubjects(): Promise<Subject[]> {
  return prisma.subject.findMany({ orderBy: { name: 'asc' } })
}

export async function getSubjectBySlug(slug: string): Promise<Subject> {
  const subject = await prisma.subject.findUnique({ where: { slug } })
  if (!subject) {
    throw new NotFoundError(`Subject '${slug}' not found`)
  }
  return subject
}
