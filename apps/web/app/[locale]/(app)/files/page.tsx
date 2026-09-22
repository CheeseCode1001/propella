'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from '@/lib/i18n/navigation'
import {
  Folder2,
  DocumentUpload,
  DocumentText,
  Add,
  Trash,
  Magicpen,
  CloseCircle,
  TickCircle,
} from 'iconsax-reactjs'
import { api } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/common/empty-state'

interface CourseFile {
  id: string
  courseId: string
  name: string
  fileUrl: string
  fileType: string
  fileSize: number
  textContent?: string | null
  createdAt: string
}

interface Course {
  id: string
  code: string
  title: string
  year: number
  semester?: number | null
  files: CourseFile[]
}

interface CoursesData {
  courses: Course[]
  byYear: Record<number, Course[]>
}

export default function FilesPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [selectedYear, setSelectedYear] = useState<number>(1)
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false)
  const [activeUploadCourseId, setActiveUploadCourseId] = useState<string | null>(null)

  // Course Form
  const [courseCode, setCourseCode] = useState('')
  const [courseTitle, setCourseTitle] = useState('')
  const [courseSemester, setCourseSemester] = useState<number>(1)

  // File Upload Form
  const [fileName, setFileName] = useState('')
  const [fileContent, setFileContent] = useState('')
  const [uploadError, setUploadError] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: () => api.get<{ data: CoursesData }>('/courses').then((r) => r.data),
  })

  const createCourseMutation = useMutation({
    mutationFn: (newCourse: { code: string; title: string; year: number; semester: number }) =>
      api.post('/courses', newCourse),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] })
      setIsAddCourseOpen(false)
      setCourseCode('')
      setCourseTitle('')
    },
  })

  const deleteCourseMutation = useMutation({
    mutationFn: (courseId: string) => api.del(`/courses/${courseId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['courses'] }),
  })

  const uploadFileMutation = useMutation({
    mutationFn: ({ courseId, file }: { courseId: string; file: { name: string; fileUrl: string; fileType: string; fileSize: number; textContent?: string } }) =>
      api.post(`/courses/${courseId}/files`, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] })
      setActiveUploadCourseId(null)
      setFileName('')
      setFileContent('')
      setUploadError(null)
    },
  })

  const deleteFileMutation = useMutation({
    mutationFn: (fileId: string) => api.del(`/courses/files/${fileId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['courses'] }),
  })

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadError(null)
    setFileName(file.name.replace(/\.[^/.]+$/, ''))

    const reader = new FileReader()
    if (file.type.includes('text') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      reader.onload = (event) => {
        setFileContent(event.target?.result as string)
      }
      reader.readAsText(file)
    } else {
      // For PDF / Docx, store data URL and basic metadata
      reader.onload = (event) => {
        setFileContent((event.target?.result as string) || '')
      }
      reader.readAsDataURL(file)
    }
  }

  const submitFile = (courseId: string) => {
    if (!fileName.trim()) {
      setUploadError('Please provide a name for this document')
      return
    }
    uploadFileMutation.mutate({
      courseId,
      file: {
        name: fileName.trim(),
        fileUrl: '/static/uploads/document.pdf',
        fileType: 'document',
        fileSize: fileContent.length,
        textContent: fileContent.slice(0, 8000), // context for AI
      },
    })
  }

  const coursesInYear = data?.byYear?.[selectedYear] || []

  return (
    <div className="mx-auto max-w-[1040px] px-4 py-8 md:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Folder2 size={24} color="var(--color-accent)" variant="Bold" />
            <h1
              className="text-[26px] font-semibold text-[var(--color-ink)]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Course Files & Materials
            </h1>
          </div>
          <p className="mt-1 text-[14px] text-[var(--color-ink-2)]">
            Organize lecture notes, handouts, and textbooks by course and academic year.
          </p>
        </div>
        <Button
          variant="accent"
          onClick={() => setIsAddCourseOpen(true)}
          className="flex items-center gap-2"
        >
          <Add size={18} color="white" />
          <span>Add Course</span>
        </Button>
      </div>

      {/* Year Tabs */}
      <div className="mt-8 flex gap-2 border-b border-[var(--color-rule)] pb-px">
        {[1, 2, 3, 4, 5].map((year) => {
          const active = selectedYear === year
          return (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className={`relative px-5 py-2.5 text-[14px] font-medium transition-colors ${
                active
                  ? 'text-[var(--color-accent)] font-semibold'
                  : 'text-[var(--color-ink-2)] hover:text-[var(--color-ink)]'
              }`}
            >
              Year {year} ({year}00L)
              {active && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--color-accent)]" />
              )}
            </button>
          )
        })}
      </div>

      {/* Course List */}
      <div className="mt-6 space-y-6">
        {isLoading ? (
          <div className="py-20 text-center text-[14px] text-[var(--color-ink-3)]">
            Loading course files...
          </div>
        ) : coursesInYear.length === 0 ? (
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-rule)] bg-[var(--color-card)] p-12">
            <EmptyState
              icon={Folder2}
              title={`No courses added for Year ${selectedYear}`}
              message="Group your course materials, slides, and handouts according to the courses you take this year."
              action={
                <Button variant="accent" onClick={() => setIsAddCourseOpen(true)}>
                  Add Course for Year {selectedYear}
                </Button>
              }
            />
          </div>
        ) : (
          coursesInYear.map((course) => (
            <Card key={course.id} className="overflow-hidden border border-[var(--color-rule)]">
              {/* Course Header */}
              <div
                className="flex items-center justify-between border-b border-[var(--color-rule)] px-6 py-4"
                style={{ backgroundColor: 'var(--color-paper-2)' }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="font-mono text-[14px] font-bold text-[var(--color-accent)]"
                    style={{ letterSpacing: '0.04em' }}
                  >
                    {course.code}
                  </span>
                  <span className="text-[15px] font-semibold text-[var(--color-ink)]">
                    {course.title}
                  </span>
                  {course.semester && (
                    <Badge variant="default" className="text-[11px]">
                      Semester {course.semester}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setActiveUploadCourseId(course.id)}
                    className="flex items-center gap-1.5 text-[12px]"
                  >
                    <DocumentUpload size={14} />
                    <span>Upload File</span>
                  </Button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete course ${course.code} and its files?`)) {
                        deleteCourseMutation.mutate(course.id)
                      }
                    }}
                    className="p-1.5 text-[var(--color-ink-3)] hover:text-[#dc2626] transition-colors"
                    title="Delete course"
                  >
                    <Trash size={16} />
                  </button>
                </div>
              </div>

              {/* Course Files Content */}
              <CardContent className="p-6">
                {course.files.length === 0 ? (
                  <p className="text-[13px] text-[var(--color-ink-3)] italic">
                    No files uploaded yet. Click &quot;Upload File&quot; to add lecture notes, PDFs, or assignments.
                  </p>
                ) : (
                  <div className="divide-y divide-[var(--color-rule)]">
                    {course.files.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <DocumentText size={20} color="var(--color-accent)" variant="Bulk" />
                          <div className="min-w-0">
                            <p className="text-[14px] font-medium text-[var(--color-ink)] truncate">
                              {file.name}
                            </p>
                            <p className="text-[12px] text-[var(--color-ink-3)]">
                              Uploaded {new Date(file.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Ask AI quick action */}
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              router.push(`/assistant?fileId=${file.id}`)
                            }}
                            className="flex items-center gap-1 text-[12px] text-[var(--color-accent)]"
                          >
                            <Magicpen size={14} color="var(--color-accent)" />
                            <span>Ask AI</span>
                          </Button>
                          <button
                            onClick={() => deleteFileMutation.mutate(file.id)}
                            className="p-1.5 text-[var(--color-ink-3)] hover:text-[#dc2626] transition-colors"
                            title="Delete file"
                          >
                            <CloseCircle size={15} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add Course Modal */}
      {isAddCourseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-[440px] rounded-[var(--radius-lg)] border border-[var(--color-rule)] bg-[var(--color-card)] p-6 shadow-lg">
            <h2 className="text-[18px] font-semibold text-[var(--color-ink)]">
              Add Course (Year {selectedYear})
            </h2>
            <p className="mt-1 text-[13px] text-[var(--color-ink-2)]">
              Create a course to classify your materials and notes.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                createCourseMutation.mutate({
                  code: courseCode,
                  title: courseTitle,
                  year: selectedYear,
                  semester: courseSemester,
                })
              }}
              className="mt-5 space-y-4"
            >
              <div>
                <Label htmlFor="courseCode">Course Code</Label>
                <Input
                  id="courseCode"
                  placeholder="e.g. CSC 101, MTH 201"
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="courseTitle">Course Title</Label>
                <Input
                  id="courseTitle"
                  placeholder="e.g. Introduction to Programming"
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label>Semester</Label>
                <div className="mt-1.5 flex gap-4">
                  {[1, 2].map((s) => (
                    <label key={s} className="flex items-center gap-2 text-[14px] cursor-pointer">
                      <input
                        type="radio"
                        name="semester"
                        checked={courseSemester === s}
                        onChange={() => setCourseSemester(s)}
                      />
                      <span>Semester {s}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsAddCourseOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="accent"
                  disabled={createCourseMutation.isPending}
                >
                  {createCourseMutation.isPending ? 'Adding...' : 'Add Course'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload File Modal */}
      {activeUploadCourseId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-[480px] rounded-[var(--radius-lg)] border border-[var(--color-rule)] bg-[var(--color-card)] p-6 shadow-lg">
            <h2 className="text-[18px] font-semibold text-[var(--color-ink)]">
              Upload Course File
            </h2>
            <p className="mt-1 text-[13px] text-[var(--color-ink-2)]">
              Upload PDF handouts, notes, or lecture slides to reference in your studies and AI assistant.
            </p>

            <div className="mt-5 space-y-4">
              <div>
                <Label htmlFor="docName">Document Name / Topic</Label>
                <Input
                  id="docName"
                  placeholder="e.g. Week 1 - Intro to Calculus Lecture Slides"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="docFile">Select File (PDF, DOCX, TXT)</Label>
                <input
                  id="docFile"
                  type="file"
                  onChange={handleFileUpload}
                  accept=".pdf,.docx,.txt,.md,.pptx"
                  className="mt-1.5 block w-full text-[13px] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-[13px] file:font-semibold file:bg-[var(--color-paper-3)] file:text-[var(--color-ink)] hover:file:bg-[var(--color-paper-2)] cursor-pointer"
                />
              </div>

              <div>
                <Label htmlFor="textContent">Document Notes / Extracted Summary (Optional)</Label>
                <textarea
                  id="textContent"
                  rows={4}
                  value={fileContent}
                  onChange={(e) => setFileContent(e.target.value)}
                  placeholder="Paste lecture notes or key summary here so the AI tutor can reference it during your study sessions..."
                  className="mt-1.5 w-full rounded-md border border-[var(--color-rule)] bg-[var(--color-paper)] p-2.5 text-[13px] text-[var(--color-ink)] outline-none focus:border-[var(--color-accent)]"
                />
              </div>

              {uploadError && (
                <p className="text-[12px] text-[#dc2626]">{uploadError}</p>
              )}

              <div className="mt-6 flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setActiveUploadCourseId(null)
                    setFileName('')
                    setFileContent('')
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="accent"
                  disabled={uploadFileMutation.isPending}
                  onClick={() => submitFile(activeUploadCourseId)}
                >
                  {uploadFileMutation.isPending ? 'Uploading...' : 'Save File'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
