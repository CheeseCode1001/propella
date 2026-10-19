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
  Share,
  Book1,
  Flash,
  Eye,
  DocumentCopy,
} from 'iconsax-reactjs'
import {
  Sparkles,
  BookOpen,
  HelpCircle,
  Layers,
  Copy,
  Check,
  Search,
  FileText,
  Clock,
} from 'lucide-react'
import { api } from '@/lib/api-client'
import { useAuthStore } from '@/lib/stores/auth-store'
import { useSubjects } from '@/lib/hooks/use-subjects'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/ui/modal'
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
  course?: {
    code: string
    title: string
  }
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

interface NoteItem {
  id: string
  title: string
  content: string
  subjectSlug?: string | null
  topicSlug?: string | null
  createdAt: string
  updatedAt: string
}

export default function FilesPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)
  const isUndergrad = Boolean(user?.undergraduateMode)
  const { data: allSubjects = [] } = useSubjects()

  // --------------------------------------------------------------------------
  // UNDERGRADUATE STATE & LOGIC
  // --------------------------------------------------------------------------
  const [selectedYear, setSelectedYear] = useState<number>(1)
  const [activeUndergradTab, setActiveUndergradTab] = useState<'my-files' | 'shared-notes'>('my-files')
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

  // Share Note Modal
  const [sharingFile, setSharingFile] = useState<CourseFile | null>(null)
  const [copiedShareLink, setCopiedShareLink] = useState(false)

  // Queries
  const { data: coursesData, isLoading: isLoadingCourses } = useQuery({
    queryKey: ['courses'],
    queryFn: () => api.get<{ data: CoursesData }>('/courses').then((r) => r.data),
    enabled: isUndergrad,
  })

  const { data: publicFilesData = [], isLoading: isLoadingPublicFiles } = useQuery({
    queryKey: ['public-course-files'],
    queryFn: () => api.get<{ data: CourseFile[] }>('/courses/files/public').then((r) => r.data),
    enabled: isUndergrad && activeUndergradTab === 'shared-notes',
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
    mutationFn: ({
      courseId,
      file,
    }: {
      courseId: string
      file: { name: string; fileUrl: string; fileType: string; fileSize: number; textContent?: string }
    }) => api.post(`/courses/${courseId}/files`, file),
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
        textContent: fileContent.slice(0, 10000),
      },
    })
  }

  // --------------------------------------------------------------------------
  // SECONDARY SCHOOL STATE & LOGIC
  // --------------------------------------------------------------------------
  const [isAddMaterialOpen, setIsAddMaterialOpen] = useState(false)
  const [materialTitle, setMaterialTitle] = useState('')
  const [materialSubject, setMaterialSubject] = useState('')
  const [materialContent, setMaterialContent] = useState('')
  const [materialInputMethod, setMaterialInputMethod] = useState<'upload' | 'paste'>('upload')
  const [materialSaving, setMaterialSaving] = useState(false)
  const [searchMaterial, setSearchMaterial] = useState('')

  // AI Summary Modal
  const [summaryData, setSummaryData] = useState<{
    title: string
    summary: string
    keyPoints: string[]
    examTips: string[]
  } | null>(null)
  const [isSummarizing, setIsSummarizing] = useState(false)

  // AI Revision Aids Modal
  const [revisionAidsData, setRevisionAidsData] = useState<{
    title: string
    flashcards: Array<{ front: string; back: string }>
    keyQuestions: Array<{ question: string; answer: string }>
  } | null>(null)
  const [revealedAnswers, setRevealedAnswers] = useState<Record<number, boolean>>({})
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({})
  const [isGeneratingAids, setIsGeneratingAids] = useState(false)

  // AI Quiz Generator Modal
  const [quizGenMaterial, setQuizGenMaterial] = useState<NoteItem | null>(null)
  const [quizMode, setQuizMode] = useState<'study' | 'exam'>('study')
  const [quizFormat, setQuizFormat] = useState<'objective' | 'theory'>('objective')
  const [quizArrangeBy, setQuizArrangeBy] = useState<'random' | 'topic'>('random')
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false)

  // Notes Query
  const { data: notesData = [], isLoading: isLoadingNotes } = useQuery({
    queryKey: ['notes', searchMaterial],
    queryFn: () =>
      api
        .get<{ data: NoteItem[] }>(`/notes${searchMaterial ? `?search=${encodeURIComponent(searchMaterial)}` : ''}`)
        .then((r) => r.data),
    enabled: !isUndergrad,
  })

  async function handleSaveMaterial(e: React.FormEvent) {
    e.preventDefault()
    if (!materialTitle.trim() || !materialContent.trim()) return
    setMaterialSaving(true)
    try {
      await api.post('/notes', {
        title: materialTitle.trim(),
        content: materialContent.trim(),
        subjectSlug: materialSubject || null,
      })
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      setIsAddMaterialOpen(false)
      setMaterialTitle('')
      setMaterialSubject('')
      setMaterialContent('')
    } catch (err) {
      console.error('Failed to save material', err)
    } finally {
      setMaterialSaving(false)
    }
  }

  async function handleSummarize(note: NoteItem) {
    setIsSummarizing(true)
    try {
      const res = await api.post<{
        data: { summary: string; keyPoints: string[]; examTips: string[] }
      }>('/notes/summarize', { content: note.content })
      setSummaryData({
        title: note.title,
        summary: res.data.summary,
        keyPoints: res.data.keyPoints,
        examTips: res.data.examTips,
      })
    } catch (err) {
      console.error('Failed to summarize material', err)
      alert('Unable to generate summary right now. Please try again.')
    } finally {
      setIsSummarizing(false)
    }
  }

  async function handleGenerateRevisionAids(note: NoteItem) {
    setIsGeneratingAids(true)
    try {
      const res = await api.post<{
        data: {
          flashcards: Array<{ front: string; back: string }>
          keyQuestions: Array<{ question: string; answer: string }>
        }
      }>('/notes/revision-aids', { content: note.content })
      setRevisionAidsData({
        title: note.title,
        flashcards: res.data.flashcards,
        keyQuestions: res.data.keyQuestions,
      })
      setRevealedAnswers({})
      setFlippedCards({})
    } catch (err) {
      console.error('Failed to generate revision aids', err)
      alert('Unable to generate revision aids right now. Please try again.')
    } finally {
      setIsGeneratingAids(false)
    }
  }

  async function handleCreateQuizFromMaterial() {
    if (!quizGenMaterial) return
    setIsGeneratingQuiz(true)
    try {
      const res = await api.post<{ data: { id: string } }>('/quizzes/generate', {
        noteContent: quizGenMaterial.content,
        documentName: quizGenMaterial.title,
        mode: quizMode,
        format: quizFormat,
        arrangeBy: quizArrangeBy,
      })
      setQuizGenMaterial(null)
      router.push(`/quizzes/${res.data.id}`)
    } catch (err) {
      console.error('Failed to generate quiz from material', err)
      alert('Failed to generate practice quiz. Please check that note has adequate content.')
    } finally {
      setIsGeneratingQuiz(false)
    }
  }

  // --------------------------------------------------------------------------
  // RENDER: SECONDARY SCHOOL STUDENT VIEW
  // --------------------------------------------------------------------------
  if (!isUndergrad) {
    return (
      <div className="mx-auto max-w-[1040px] px-4 py-8 md:px-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen size={24} className="text-[var(--color-accent)]" />
              <h1
                className="text-[26px] font-semibold text-[var(--color-ink)]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Study Files & Smart AI Reader
              </h1>
            </div>
            <p className="mt-1 text-[14px] text-[var(--color-ink-2)]">
              Upload or paste your e-texts, textbooks, notes, and revision sheets. Let AI summarize them, generate practice quizzes, and boost your revision.
            </p>
          </div>
          <Button
            variant="accent"
            onClick={() => setIsAddMaterialOpen(true)}
            className="flex items-center gap-2 shrink-0"
          >
            <Add size={18} color="white" />
            <span>Upload or Paste Notes</span>
          </Button>
        </div>

        {/* Search Bar */}
        <div className="mt-6 flex items-center gap-3">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-ink-3)]"
            />
            <Input
              placeholder="Search your reading materials and notes..."
              value={searchMaterial}
              onChange={(e) => setSearchMaterial(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Notes Grid */}
        <div className="mt-6">
          {isLoadingNotes ? (
            <div className="py-20 text-center text-[14px] text-[var(--color-ink-3)]">
              Loading reading materials...
            </div>
          ) : notesData.length === 0 ? (
            <div className="rounded-[var(--radius-lg)] border border-[var(--color-rule)] bg-[var(--color-card)] p-12">
              <EmptyState
                icon={BookOpen}
                title="No reading materials yet"
                message="Upload your textbooks, class notes, or paste paragraphs from your revision sheets. The AI will immediately help you summarize and generate practice questions!"
                action={
                  <Button variant="accent" onClick={() => setIsAddMaterialOpen(true)}>
                    Upload or Paste Material
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {notesData.map((note) => (
                <Card
                  key={note.id}
                  className="flex flex-col justify-between overflow-hidden border border-[var(--color-rule)] hover:border-[var(--color-accent)]/50 transition-all shadow-sm"
                >
                  <CardContent className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <FileText size={18} className="text-[var(--color-accent)] shrink-0" />
                          <h3 className="text-[16px] font-semibold text-[var(--color-ink)] line-clamp-1">
                            {note.title}
                          </h3>
                        </div>
                        {note.subjectSlug && (
                          <Badge variant="default" className="text-[11px] uppercase tracking-wider shrink-0">
                            {note.subjectSlug}
                          </Badge>
                        )}
                      </div>

                      <p className="mt-3 text-[13px] text-[var(--color-ink-2)] line-clamp-3 leading-relaxed">
                        {note.content}
                      </p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-[var(--color-rule)] flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[11px] text-[var(--color-ink-3)] flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(note.updatedAt).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Summarize */}
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleSummarize(note)}
                          disabled={isSummarizing}
                          className="h-8 text-[12px] px-2.5 flex items-center gap-1"
                        >
                          <Sparkles size={13} className="text-[var(--color-accent)]" />
                          <span>Summarize</span>
                        </Button>

                        {/* Quiz */}
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setQuizGenMaterial(note)}
                          className="h-8 text-[12px] px-2.5 flex items-center gap-1 text-[var(--color-accent)]"
                        >
                          <HelpCircle size={13} />
                          <span>Generate Quiz</span>
                        </Button>

                        {/* Revision */}
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleGenerateRevisionAids(note)}
                          disabled={isGeneratingAids}
                          className="h-8 text-[12px] px-2.5 flex items-center gap-1 text-emerald-600"
                        >
                          <Layers size={13} />
                          <span>Revision Aids</span>
                        </Button>

                        {/* Delete */}
                        <button
                          onClick={async () => {
                            if (confirm(`Delete "${note.title}"?`)) {
                              await api.del(`/notes/${note.id}`)
                              queryClient.invalidateQueries({ queryKey: ['notes'] })
                            }
                          }}
                          className="p-1.5 text-[var(--color-ink-3)] hover:text-[#dc2626] transition-colors rounded"
                          title="Delete"
                        >
                          <Trash size={15} />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Modal: Add Material (Upload or Paste) */}
        <Modal
          open={isAddMaterialOpen}
          onClose={() => setIsAddMaterialOpen(false)}
          title="Add Study Material"
          subtitle="Upload e-texts, textbooks or paste revision notes for AI processing"
          size="md"
          footer={
            <div className="flex items-center justify-end gap-3">
              <Button variant="outline" onClick={() => setIsAddMaterialOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="accent"
                disabled={materialSaving || !materialTitle.trim() || !materialContent.trim()}
                onClick={handleSaveMaterial}
              >
                {materialSaving ? 'Saving...' : 'Save & Prepare with AI'}
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Document Title / Topic Name</Label>
              <Input
                id="title"
                placeholder="e.g. Photosynthesis & Cellular Respiration Notes"
                value={materialTitle}
                onChange={(e) => setMaterialTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="subject">Subject Track (Optional)</Label>
              <select
                id="subject"
                value={materialSubject}
                onChange={(e) => setMaterialSubject(e.target.value)}
                className="w-full rounded-md border border-[var(--color-rule)] bg-[var(--color-card)] p-2.5 text-[13px] text-[var(--color-ink)] outline-none focus:border-[var(--color-accent)]"
              >
                <option value="">-- Choose Subject --</option>
                {allSubjects.map((s) => (
                  <option key={s.id} value={s.slug}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Input Method Toggle */}
            <div className="flex gap-2 p-1 rounded-lg bg-[var(--color-paper-2)] border border-[var(--color-rule)]">
              <button
                type="button"
                onClick={() => setMaterialInputMethod('upload')}
                className={`flex-1 py-1.5 text-xs font-medium rounded transition-all ${
                  materialInputMethod === 'upload'
                    ? 'bg-white shadow text-[var(--color-ink)]'
                    : 'text-[var(--color-ink-3)] hover:text-[var(--color-ink)]'
                }`}
              >
                Upload File (PDF / DOCX / TXT)
              </button>
              <button
                type="button"
                onClick={() => setMaterialInputMethod('paste')}
                className={`flex-1 py-1.5 text-xs font-medium rounded transition-all ${
                  materialInputMethod === 'paste'
                    ? 'bg-white shadow text-[var(--color-ink)]'
                    : 'text-[var(--color-ink-3)] hover:text-[var(--color-ink)]'
                }`}
              >
                Paste Text / Notes Directly
              </button>
            </div>

            {materialInputMethod === 'upload' ? (
              <div>
                <Label htmlFor="uploadMaterial">Choose Document</Label>
                <input
                  id="uploadMaterial"
                  type="file"
                  accept=".pdf,.docx,.txt,.md"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    if (!materialTitle) setMaterialTitle(file.name.replace(/\.[^/.]+$/, ''))
                    const reader = new FileReader()
                    reader.onload = (event) => {
                      setMaterialContent((event.target?.result as string) || '')
                    }
                    reader.readAsText(file)
                  }}
                  className="mt-1 block w-full text-[13px] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-[13px] file:font-semibold file:bg-[var(--color-paper-3)] file:text-[var(--color-ink)] hover:file:bg-[var(--color-paper-2)] cursor-pointer"
                />
                <p className="mt-1 text-[11px] text-[var(--color-ink-3)]">
                  Supports text, markdown, and formatted text documents.
                </p>
              </div>
            ) : null}

            <div>
              <Label htmlFor="content">Reading Content / Notes</Label>
              <textarea
                id="content"
                rows={6}
                value={materialContent}
                onChange={(e) => setMaterialContent(e.target.value)}
                placeholder="Paste reading material, definitions, or textbook paragraphs here..."
                className="mt-1 w-full rounded-md border border-[var(--color-rule)] bg-[var(--color-paper)] p-2.5 text-[13px] text-[var(--color-ink)] outline-none focus:border-[var(--color-accent)]"
                required
              />
            </div>
          </div>
        </Modal>

        {/* Modal: AI Summary */}
        <Modal
          open={Boolean(summaryData)}
          onClose={() => setSummaryData(null)}
          title={`Summary: ${summaryData?.title ?? ''}`}
          subtitle="AI-synthesized key takeaways, definitions, and high-yield exam tips"
          size="lg"
          footer={
            <div className="flex justify-end">
              <Button variant="accent" onClick={() => setSummaryData(null)}>
                Got it
              </Button>
            </div>
          }
        >
          {summaryData && (
            <div className="space-y-5 py-2">
              <div className="p-4 rounded-lg bg-[var(--color-accent-tint)] border border-[var(--color-accent)]/20">
                <h4 className="text-xs font-bold text-[var(--color-accent)] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Sparkles size={14} /> Executive Summary
                </h4>
                <p className="text-[13.5px] text-[var(--color-ink)] leading-relaxed whitespace-pre-line">
                  {summaryData.summary}
                </p>
              </div>

              {summaryData.keyPoints?.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-[var(--color-ink)] uppercase tracking-wider mb-2">
                    Key Concepts & Core Definitions
                  </h4>
                  <ul className="space-y-2">
                    {summaryData.keyPoints.map((pt, i) => (
                      <li
                        key={i}
                        className="text-[13px] text-[var(--color-ink-2)] flex items-start gap-2"
                      >
                        <span className="text-[var(--color-accent)] font-bold">•</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {summaryData.examTips?.length > 0 && (
                <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <h4 className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2">
                    High-Yield Exam Tips & Traps
                  </h4>
                  <ul className="space-y-1.5">
                    {summaryData.examTips.map((tip, i) => (
                      <li key={i} className="text-[13px] text-amber-900 flex items-start gap-2">
                        <span className="font-bold">✓</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </Modal>

        {/* Modal: Revision Aids (Flashcards & Self-Test) */}
        <Modal
          open={Boolean(revisionAidsData)}
          onClose={() => setRevisionAidsData(null)}
          title={`Revision Aids: ${revisionAidsData?.title ?? ''}`}
          subtitle="Active recall flashcards and self-test exam questions"
          size="lg"
          footer={
            <div className="flex justify-end">
              <Button variant="accent" onClick={() => setRevisionAidsData(null)}>
                Done Revising
              </Button>
            </div>
          }
        >
          {revisionAidsData && (
            <div className="space-y-6 py-2">
              {/* Flashcards Section */}
              <div>
                <h4 className="text-xs font-bold text-[var(--color-ink)] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Layers size={14} className="text-[var(--color-accent)]" /> Active Recall Flashcards ({revisionAidsData.flashcards.length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {revisionAidsData.flashcards.map((fc, i) => {
                    const isFlipped = Boolean(flippedCards[i])
                    return (
                      <div
                        key={i}
                        onClick={() =>
                          setFlippedCards((prev) => ({ ...prev, [i]: !prev[i] }))
                        }
                        className="p-4 rounded-lg border border-[var(--color-rule)] bg-[var(--color-card)] hover:border-[var(--color-accent)] cursor-pointer transition-all min-h-[110px] flex flex-col justify-between"
                      >
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-3)] block mb-1">
                            {isFlipped ? 'Answer' : 'Question (Click to flip)'}
                          </span>
                          <p className="text-[13px] font-medium text-[var(--color-ink)] leading-snug">
                            {isFlipped ? fc.back : fc.front}
                          </p>
                        </div>
                        <span className="text-[11px] text-[var(--color-accent)] font-medium self-end mt-2">
                          {isFlipped ? 'Show question' : 'Show answer'}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Self Test Questions */}
              <div>
                <h4 className="text-xs font-bold text-[var(--color-ink)] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <HelpCircle size={14} className="text-emerald-600" /> Self-Test Questions ({revisionAidsData.keyQuestions.length})
                </h4>
                <div className="space-y-3">
                  {revisionAidsData.keyQuestions.map((q, i) => {
                    const isRevealed = Boolean(revealedAnswers[i])
                    return (
                      <div
                        key={i}
                        className="p-4 rounded-lg border border-[var(--color-rule)] bg-[var(--color-paper-2)] space-y-2"
                      >
                        <p className="text-[13.5px] font-semibold text-[var(--color-ink)]">
                          {i + 1}. {q.question}
                        </p>
                        {isRevealed ? (
                          <div className="pt-2 text-[13px] text-emerald-800 bg-emerald-500/10 p-3 rounded border border-emerald-500/20">
                            <strong>Model Answer:</strong> {q.answer}
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              setRevealedAnswers((prev) => ({ ...prev, [i]: true }))
                            }
                            className="text-xs font-medium text-[var(--color-accent)] hover:underline"
                          >
                            Reveal answer & explanation
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </Modal>

        {/* Modal: Customizable AI Quiz Generator */}
        <Modal
          open={Boolean(quizGenMaterial)}
          onClose={() => setQuizGenMaterial(null)}
          title="Customizable AI Practice Quiz"
          subtitle={`Generate practice questions directly from "${quizGenMaterial?.title}"`}
          size="md"
          footer={
            <div className="flex items-center justify-end gap-3">
              <Button variant="outline" onClick={() => setQuizGenMaterial(null)}>
                Cancel
              </Button>
              <Button
                variant="accent"
                disabled={isGeneratingQuiz}
                onClick={handleCreateQuizFromMaterial}
              >
                {isGeneratingQuiz ? 'Generating Quiz...' : 'Start Practice Quiz'}
              </Button>
            </div>
          }
        >
          <div className="space-y-4 py-1">
            {/* Mode: Study vs Exam */}
            <div>
              <Label>Quiz Mode</Label>
              <div className="grid grid-cols-2 gap-2 mt-1.5">
                <button
                  type="button"
                  onClick={() => setQuizMode('study')}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    quizMode === 'study'
                      ? 'border-[var(--color-accent)] bg-[var(--color-accent-tint)] text-[var(--color-ink)]'
                      : 'border-[var(--color-rule)] bg-[var(--color-card)] text-[var(--color-ink-2)]'
                  }`}
                >
                  <p className="text-xs font-bold text-[var(--color-accent)]">Study Mode</p>
                  <p className="text-[11px] mt-0.5">Instant explanations with each question</p>
                </button>

                <button
                  type="button"
                  onClick={() => setQuizMode('exam')}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    quizMode === 'exam'
                      ? 'border-[var(--color-accent)] bg-[var(--color-accent-tint)] text-[var(--color-ink)]'
                      : 'border-[var(--color-rule)] bg-[var(--color-card)] text-[var(--color-ink-2)]'
                  }`}
                >
                  <p className="text-xs font-bold text-[var(--color-accent)]">Exam Mode</p>
                  <p className="text-[11px] mt-0.5">Timed CBT, explanations held until review</p>
                </button>
              </div>
            </div>

            {/* Format: Objective vs Theory */}
            <div>
              <Label>Question Format</Label>
              <div className="grid grid-cols-2 gap-2 mt-1.5">
                <button
                  type="button"
                  onClick={() => setQuizFormat('objective')}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    quizFormat === 'objective'
                      ? 'border-[var(--color-accent)] bg-[var(--color-accent-tint)] text-[var(--color-ink)]'
                      : 'border-[var(--color-rule)] bg-[var(--color-card)] text-[var(--color-ink-2)]'
                  }`}
                >
                  <p className="text-xs font-bold">Objective (MCQ)</p>
                  <p className="text-[11px] text-[var(--color-ink-3)] mt-0.5">
                    Multiple choice with options A–D
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setQuizFormat('theory')}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    quizFormat === 'theory'
                      ? 'border-[var(--color-accent)] bg-[var(--color-accent-tint)] text-[var(--color-ink)]'
                      : 'border-[var(--color-rule)] bg-[var(--color-card)] text-[var(--color-ink-2)]'
                  }`}
                >
                  <p className="text-xs font-bold">Theory & Structured</p>
                  <p className="text-[11px] text-[var(--color-ink-3)] mt-0.5">
                    Written questions and step-by-step solutions
                  </p>
                </button>
              </div>
            </div>

            {/* Arrangement: Random vs By Topic */}
            <div>
              <Label>Question Order / Arrangement</Label>
              <div className="grid grid-cols-2 gap-2 mt-1.5">
                <button
                  type="button"
                  onClick={() => setQuizArrangeBy('random')}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    quizArrangeBy === 'random'
                      ? 'border-[var(--color-accent)] bg-[var(--color-accent-tint)] text-[var(--color-ink)]'
                      : 'border-[var(--color-rule)] bg-[var(--color-card)] text-[var(--color-ink-2)]'
                  }`}
                >
                  <p className="text-xs font-bold">Random Order</p>
                  <p className="text-[11px] text-[var(--color-ink-3)] mt-0.5">
                    Shuffled for real test unpredictability
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setQuizArrangeBy('topic')}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    quizArrangeBy === 'topic'
                      ? 'border-[var(--color-accent)] bg-[var(--color-accent-tint)] text-[var(--color-ink)]'
                      : 'border-[var(--color-rule)] bg-[var(--color-card)] text-[var(--color-ink-2)]'
                  }`}
                >
                  <p className="text-xs font-bold">By Concept / Topic</p>
                  <p className="text-[11px] text-[var(--color-ink-3)] mt-0.5">
                    Organized sequentially by sections
                  </p>
                </button>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    )
  }

  // --------------------------------------------------------------------------
  // RENDER: UNDERGRADUATE STUDENT VIEW
  // --------------------------------------------------------------------------
  const coursesInYear = coursesData?.byYear?.[selectedYear] || []

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
            Organize lecture notes, handouts, and share study materials with coursemates.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="accent"
            onClick={() => setIsAddCourseOpen(true)}
            className="flex items-center gap-2"
          >
            <Add size={18} color="white" />
            <span>Add Course</span>
          </Button>
        </div>
      </div>

      {/* Tabs: My Courses vs Shared Notes */}
      <div className="mt-6 flex border-b border-[var(--color-rule)]">
        <button
          onClick={() => setActiveUndergradTab('my-files')}
          className={`px-5 py-2.5 text-[14px] font-medium border-b-2 transition-all ${
            activeUndergradTab === 'my-files'
              ? 'border-[var(--color-accent)] text-[var(--color-accent)] font-semibold'
              : 'border-transparent text-[var(--color-ink-2)] hover:text-[var(--color-ink)]'
          }`}
        >
          My Courses & Files
        </button>
        <button
          onClick={() => setActiveUndergradTab('shared-notes')}
          className={`px-5 py-2.5 text-[14px] font-medium border-b-2 transition-all flex items-center gap-2 ${
            activeUndergradTab === 'shared-notes'
              ? 'border-[var(--color-accent)] text-[var(--color-accent)] font-semibold'
              : 'border-transparent text-[var(--color-ink-2)] hover:text-[var(--color-ink)]'
          }`}
        >
          <Share size={16} />
          <span>Peer Shared Notes</span>
          {publicFilesData.length > 0 && (
            <Badge variant="default" className="text-[10px] px-1.5 py-0">
              {publicFilesData.length}
            </Badge>
          )}
        </button>
      </div>

      {activeUndergradTab === 'my-files' ? (
        <>
          {/* Year Tabs */}
          <div className="mt-4 flex gap-2 border-b border-[var(--color-rule)] pb-px">
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
            {isLoadingCourses ? (
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
                                  Uploaded{' '}
                                  {new Date(file.createdAt).toLocaleDateString('en-GB', {
                                    day: 'numeric',
                                    month: 'short',
                                  })}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {/* Share Note */}
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => {
                                  setSharingFile({ ...file, course: { code: course.code, title: course.title } })
                                  setCopiedShareLink(false)
                                }}
                                className="flex items-center gap-1 text-[12px]"
                              >
                                <Share size={13} />
                                <span>Share Note</span>
                              </Button>

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
        </>
      ) : (
        /* Shared Peer Notes Tab */
        <div className="mt-6 space-y-4">
          <p className="text-xs text-[var(--color-ink-3)]">
            Explore and study course notes, handouts, and summaries publicly shared by coursemates and university peers.
          </p>
          {isLoadingPublicFiles ? (
            <div className="py-20 text-center text-[14px] text-[var(--color-ink-3)]">
              Loading shared notes...
            </div>
          ) : publicFilesData.length === 0 ? (
            <div className="rounded-[var(--radius-lg)] border border-[var(--color-rule)] bg-[var(--color-card)] p-12 text-center">
              <EmptyState
                icon={Share}
                title="No shared notes available yet"
                message="Be the first to share your course notes with your coursemates!"
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {publicFilesData.map((f) => (
                <Card key={f.id} className="border border-[var(--color-rule)] p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <DocumentText size={20} className="text-[var(--color-accent)]" />
                        <h4 className="text-[15px] font-semibold text-[var(--color-ink)] line-clamp-1">
                          {f.name}
                        </h4>
                      </div>
                      {f.course?.code && (
                        <Badge variant="default" className="text-[11px] font-mono">
                          {f.course.code}
                        </Badge>
                      )}
                    </div>
                    {f.textContent && (
                      <p className="mt-2 text-[12.5px] text-[var(--color-ink-2)] line-clamp-3">
                        {f.textContent}
                      </p>
                    )}
                  </div>
                  <div className="mt-4 pt-3 border-t border-[var(--color-rule)] flex items-center justify-between">
                    <span className="text-[11px] text-[var(--color-ink-3)]">
                      {f.course?.title || 'Shared Document'}
                    </span>
                    <Button
                      size="sm"
                      variant="accent"
                      onClick={() => router.push(`/assistant?fileId=${f.id}`)}
                      className="text-[12px] flex items-center gap-1.5"
                    >
                      <Magicpen size={13} color="white" />
                      <span>Study with AI</span>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

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

      {/* Share Note Modal */}
      <Modal
        open={Boolean(sharingFile)}
        onClose={() => setSharingFile(null)}
        title="Share Course Note"
        subtitle={`Generate a shareable link for "${sharingFile?.name}"`}
        size="md"
        footer={
          <div className="flex justify-end">
            <Button variant="accent" onClick={() => setSharingFile(null)}>
              Done
            </Button>
          </div>
        }
      >
        {sharingFile && (
          <div className="space-y-4 py-2">
            <p className="text-xs text-[var(--color-ink-2)] leading-relaxed">
              Anyone with this link or your coursemates on Propella can preview this note and interact with the AI study assistant based on it.
            </p>

            <div className="flex items-center gap-2 p-2 rounded-lg border border-[var(--color-rule)] bg-[var(--color-paper-2)]">
              <input
                readOnly
                value={
                  typeof window !== 'undefined'
                    ? `${window.location.origin}/files/shared/${sharingFile.id}`
                    : `https://propella.app/files/shared/${sharingFile.id}`
                }
                className="flex-1 bg-transparent text-xs text-[var(--color-ink)] outline-none font-mono"
              />
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  const url = `${window.location.origin}/files/shared/${sharingFile.id}`
                  navigator.clipboard.writeText(url)
                  setCopiedShareLink(true)
                  setTimeout(() => setCopiedShareLink(false), 2500)
                }}
                className="flex items-center gap-1.5 text-xs h-8"
              >
                {copiedShareLink ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                <span>{copiedShareLink ? 'Copied' : 'Copy Link'}</span>
              </Button>
            </div>

            <div className="p-3 rounded-lg bg-[var(--color-accent-tint)] border border-[var(--color-accent)]/20 text-xs text-[var(--color-ink)]">
              💡 <strong>Tip:</strong> You can also share this link in your class WhatsApp or Telegram groups for group revision sessions!
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
