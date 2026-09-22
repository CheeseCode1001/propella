import { prisma } from '../../config/db'
import { AppError, NotFoundError } from '../../middleware/error-handler'

export interface CreateCourseInput {
  code: string
  title: string
  year: number
  semester?: number | null
}

export interface UploadCourseFileInput {
  name: string
  fileUrl: string
  fileType: string
  fileSize: number
  textContent?: string | null
}

export async function listCourses(userId: string) {
  const courses = await prisma.course.findMany({
    where: { userId },
    orderBy: [{ year: 'asc' }, { code: 'asc' }],
    include: {
      files: {
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  // Group by year for convenience
  const byYear: Record<number, typeof courses> = { 1: [], 2: [], 3: [], 4: [], 5: [] }
  for (const c of courses) {
    if (!byYear[c.year]) byYear[c.year] = []
    byYear[c.year]!.push(c)
  }

  return { courses, byYear }
}

export async function createCourse(userId: string, input: CreateCourseInput) {
  const code = input.code.trim().toUpperCase()
  const title = input.title.trim()
  const year = Number(input.year)

  if (!code) throw new AppError(400, 'Course code is required (e.g. CSC 101)')
  if (!title) throw new AppError(400, 'Course title is required')
  if (isNaN(year) || year < 1 || year > 7) {
    throw new AppError(400, 'Academic year must be between 1 and 7 (e.g. 1 for 100L)')
  }

  return prisma.course.create({
    data: {
      userId,
      code,
      title,
      year,
      semester: input.semester ?? null,
    },
    include: { files: true },
  })
}

export async function deleteCourse(userId: string, courseId: string) {
  const course = await prisma.course.findFirst({
    where: { id: courseId, userId },
  })
  if (!course) throw new NotFoundError('Course not found')

  await prisma.course.delete({ where: { id: courseId } })
  return { success: true }
}

export async function uploadCourseFile(
  userId: string,
  courseId: string,
  input: UploadCourseFileInput,
) {
  const course = await prisma.course.findFirst({
    where: { id: courseId, userId },
  })
  if (!course) throw new NotFoundError('Course not found')

  const name = input.name.trim()
  if (!name) throw new AppError(400, 'File name is required')

  return prisma.courseFile.create({
    data: {
      userId,
      courseId,
      name,
      fileUrl: input.fileUrl,
      fileType: input.fileType || 'document',
      fileSize: input.fileSize || 0,
      textContent: input.textContent?.trim() || null,
    },
  })
}

export async function listAllFiles(userId: string) {
  return prisma.courseFile.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      course: {
        select: { id: true, code: true, title: true, year: true },
      },
    },
  })
}

export async function deleteCourseFile(userId: string, fileId: string) {
  const file = await prisma.courseFile.findFirst({
    where: { id: fileId, userId },
  })
  if (!file) throw new NotFoundError('File not found')

  await prisma.courseFile.delete({ where: { id: fileId } })
  return { success: true }
}
