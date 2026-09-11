'use client'
import { useMemo, useState } from 'react'
import { Link } from '@/lib/i18n/navigation'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Trophy, Check, Lock } from 'lucide-react'
import { format } from 'date-fns'
import { useRoadmap } from '@/lib/hooks/use-roadmap'
import { useSubjects } from '@/lib/hooks/use-subjects'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/empty-state'
import { FilterPills } from '@/components/common/filter-pills'
import { BookSquare } from 'iconsax-reactjs'
import type { ExamType, RoadmapNode } from '@propella/shared'

// Exams are shown in the order candidates normally sit them.
const EXAM_ORDER: ExamType[] = ['jamb', 'waec', 'neco', 'undergraduate']
const EXAM_LABELS: Record<ExamType, string> = {
  jamb: 'JAMB / UTME',
  waec: 'WAEC',
  neco: 'NECO',
  undergraduate: 'Undergraduate',
}

function getSubjectColor(slug: string): string {
  const map: Record<string, string> = {
    english: 'var(--color-subj-english)',
    mathematics: 'var(--color-subj-math)',
    physics: 'var(--color-subj-physics)',
    chemistry: 'var(--color-subj-chemistry)',
    biology: 'var(--color-subj-biology)',
    economics: 'var(--color-subj-economics)',
    government: 'var(--color-subj-government)',
    literature: 'var(--color-subj-literature)',
  }
  return map[slug] ?? 'var(--color-subj-default)'
}

function nodeDotStyle(status: RoadmapNode['status'], isMilestone: boolean) {
  const base: React.CSSProperties = {
    width: 12,
    height: 12,
    borderRadius: '50%',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 1,
  }

  if (isMilestone) {
    return {
      ...base,
      width: 24,
      height: 24,
      backgroundColor: 'var(--color-accent-tint)',
      border: '2px solid var(--color-accent)',
    }
  }

  switch (status) {
    case 'completed':
      return { ...base, backgroundColor: 'var(--color-accent)' }
    case 'in-progress':
      return { ...base, backgroundColor: 'var(--color-paper)', border: '2px solid var(--color-accent)' }
    case 'ready':
      return { ...base, backgroundColor: 'var(--color-accent-tint)', border: '2px solid var(--color-accent)' }
    case 'needs-revision':
      return { ...base, backgroundColor: 'var(--color-warning)' }
    case 'locked':
    default:
      return { ...base, backgroundColor: 'var(--color-paper-3)', border: '2px solid var(--color-rule-2)' }
  }
}

function statusBadgeVariant(status: RoadmapNode['status']) {
  if (status === 'completed') return 'success' as const
  if (status === 'in-progress') return 'accent' as const
  if (status === 'needs-revision') return 'warning' as const
  return 'default' as const
}

function statusLabel(status: RoadmapNode['status']) {
  if (status === 'in-progress') return 'In Progress'
  if (status === 'needs-revision') return 'Needs Revision'
  if (status === 'completed') return 'Completed'
  if (status === 'ready') return 'Ready'
  return 'Locked'
}

function RoadmapNodeCard({ node, onClick }: { node: RoadmapNode; onClick: () => void }) {
  const t = useTranslations('roadmap')
  const subjectColor = getSubjectColor(node.subjectSlug)

  return (
    <div
      style={{
        border: `1px solid var(--color-rule)`,
        borderRadius: 'var(--radius-md)',
        padding: 16,
        backgroundColor: 'var(--color-card)',
        cursor: node.status !== 'locked' ? 'pointer' : 'default',
        borderTop: node.isMilestone ? `2px solid var(--color-accent)` : undefined,
        overflow: 'hidden',
        position: 'relative',
      }}
      onClick={node.status !== 'locked' ? onClick : undefined}
    >
      {/* Left subject color bar */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 3,
          backgroundColor: subjectColor,
        }}
      />
      <div style={{ paddingLeft: 8 }}>
        {/* Milestone overline */}
        {node.isMilestone && (
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              letterSpacing: '0.1em',
              color: 'var(--color-accent)',
              textTransform: 'uppercase',
              marginBottom: 4,
            }}
          >
            Milestone — {node.milestoneLabel}
          </p>
        )}

        {/* Topic name */}
        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 500,
            fontSize: 18,
            color: 'var(--color-ink)',
            marginBottom: 4,
            lineHeight: 1.3,
          }}
        >
          {node.topicName}
        </h3>

        {/* Subject + order */}
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--color-ink-3)',
            marginBottom: 12,
          }}
        >
          {node.subjectName} · Topic {node.topicOrder} of {node.topicTotal}
        </p>

        {/* Status row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <Badge variant={statusBadgeVariant(node.status)}>
            {node.status === 'in-progress' ? t('inProgress')
              : node.status === 'needs-revision' ? t('needsRevision')
              : node.status === 'completed' ? t('completed')
              : node.status === 'ready' ? t('ready')
              : t('locked')}
          </Badge>

          {node.status === 'completed' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Check size={12} strokeWidth={1.5} style={{ color: 'var(--color-success)' }} />
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--color-ink-3)' }}>
                Completed{' '}
                {node.lastStudiedAt ? format(new Date(node.lastStudiedAt), 'MMM d') : ''}
              </span>
            </div>
          )}

          {node.status === 'in-progress' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 120 }}>
              <div
                style={{
                  flex: 1,
                  height: 4,
                  backgroundColor: 'var(--color-paper-3)',
                  borderRadius: 2,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${node.mastery}%`,
                    backgroundColor: 'var(--color-accent)',
                    borderRadius: 2,
                  }}
                />
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-ink-3)', flexShrink: 0 }}>
                {node.mastery}%
              </span>
            </div>
          )}

          {node.status === 'ready' && (
            <Button
              variant="accent"
              size="sm"
              asChild
              onClick={(e) => e.stopPropagation()}
            >
              {/* Opens the reader, which is untimed — a timed session is
                  something the student starts deliberately, not by tapping a topic. */}
              <Link href={`/topics/${node.subjectSlug}/${node.topicSlug}`}>Read</Link>
            </Button>
          )}

          {node.status === 'locked' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Lock size={12} strokeWidth={1.5} style={{ color: 'var(--color-ink-3)' }} />
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--color-ink-3)' }}>
                Unlocks after previous topics
              </span>
            </div>
          )}

          {node.status === 'needs-revision' && node.nextRevisionAt && (
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--color-warning)' }}>
              Due {format(new Date(node.nextRevisionAt), 'MMM d')}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

function TimelineNodeRow({ node, isLast }: { node: RoadmapNode; isLast: boolean }) {
  const router = useRouter()

  function handleClick() {
    // Straight to the reader. The old /roadmap/[subject]/[topic] page only ever
    // filled two of its four tabs, which is why some topics opened blank.
    router.push(`/topics/${node.subjectSlug}/${node.topicSlug}`)
  }

  return (
    <div style={{display: 'flex', gap: 16, position: 'relative' }}>
      {/* Timeline line + dot column */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          flexShrink: 0,
          width: 24,
          paddingTop: 16,
        }}
      >
        {/* Dot */}
        <div style={nodeDotStyle(node.status, node.isMilestone)}>
          {node.isMilestone && (
            <Trophy size={12} strokeWidth={1.5} style={{ color: 'var(--color-accent)' }} />
          )}
          {!node.isMilestone && node.status === 'completed' && (
            <Check size={6} strokeWidth={2.5} style={{ color: 'white' }} />
          )}
        </div>
        {/* Connecting line */}
        {!isLast && (
          <div
            style={{
              width: 1,
              flex: 1,
              backgroundColor: 'var(--color-rule)',
              marginTop: 4,
              minHeight: 24,
            }}
          />
        )}
      </div>

      {/* Card */}
      <div style={{ flex: 1, paddingBottom: isLast ? 0 : 16 }}>
        <RoadmapNodeCard node={node} onClick={handleClick} />
      </div>
    </div>
  )
}

function SkeletonNode({ isLast }: { isLast: boolean }) {
  return (
    <div style={{width:"100%", display: 'flex', gap: 16, position: 'relative' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, width: 24, paddingTop: 16 }}>
        <Skeleton className="rounded-full" style={{ width: 12, height: 12 }} />
        {!isLast && (
          <div style={{ width: 1, flex: 1, backgroundColor: 'var(--color-rule)', marginTop: 4, minHeight: 40 }} />
        )}
      </div>
      <div style={{ flex: 1, paddingBottom: 16 }}>
        <div style={{ border: '1px solid var(--color-rule)', borderRadius: 8, padding: 16, backgroundColor: 'var(--color-card)' }}>
          <Skeleton className="h-5 w-40 mb-2" />
          <Skeleton className="h-3 w-32 mb-3" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-16" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function RoadmapPage() {
  const { data, isLoading } = useRoadmap()
  const { data: subjectsData } = useSubjects()
  const t = useTranslations('roadmap')

  // Null means "whatever the first available board is". Deriving the effective
  // value instead of storing it keeps the selection correct when the student's
  // subjects change, with no effect to sync it back.
  const [chosenExam, setChosenExam] = useState<ExamType | null>(null)
  const [chosenSubject, setChosenSubject] = useState<string>('all')

  // Which exams each subject belongs to, so the syllabus can be split by board.
  const examsBySubject = useMemo(
    () => new Map<string, ExamType[]>((subjectsData ?? []).map((s) => [s.slug, s.examTypes])),
    [subjectsData],
  )

  // Only offer boards the student actually has topics for.
  const availableExams = useMemo(
    () =>
      EXAM_ORDER.filter((exam) =>
        (data?.nodes ?? []).some((n) => examsBySubject.get(n.subjectSlug)?.includes(exam)),
      ),
    [data, examsBySubject],
  )

  // Fall back to the first board whenever the chosen one is not on offer.
  const activeExam: ExamType | null =
    chosenExam && availableExams.includes(chosenExam) ? chosenExam : (availableExams[0] ?? null)

  // Board first, then subject — the subject pills only list what this board has.
  const examNodes = useMemo(
    () =>
      (data?.nodes ?? []).filter((n) =>
        activeExam ? examsBySubject.get(n.subjectSlug)?.includes(activeExam) : true,
      ),
    [data, activeExam, examsBySubject],
  )

  const subjects = useMemo(
    () =>
      Array.from(new Map(examNodes.map((n) => [n.subjectSlug, n.subjectName])).entries()).map(
        ([slug, name]) => ({ slug, name }),
      ),
    [examNodes],
  )

  // A subject carried over from another board would filter down to nothing, so
  // it falls back to "all" rather than showing an empty syllabus.
  const activeSubject =
    chosenSubject !== 'all' && !subjects.some((s) => s.slug === chosenSubject)
      ? 'all'
      : chosenSubject

  const filteredNodes =
    activeSubject === 'all' ? examNodes : examNodes.filter((n) => n.subjectSlug === activeSubject)

  const completedCount = filteredNodes.filter((n) => n.status === 'completed').length

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 500,
            fontSize: 32,
            color: 'var(--color-ink)',
            marginBottom: 6,
          }}
        >
          {t('title')}
        </h1>
        {isLoading ? (
          <Skeleton className="h-4 w-48" />
        ) : data ? (
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--color-ink-3)' }}>
            {completedCount} of {filteredNodes.length} topics completed
          </p>
        ) : null}
      </div>

      {/* Board, then subject. Picking the board first keeps each syllabus short
          enough to scan instead of scrolling past every other exam. */}
      <div className="mb-8 flex flex-col gap-4">
        <FilterPills
          label="Exam"
          value={activeExam ?? ''}
          onChange={(exam) => setChosenExam(exam as ExamType)}
          options={availableExams.map((exam) => ({ value: exam, label: EXAM_LABELS[exam] }))}
        />
        <FilterPills
          label="Subject"
          value={activeSubject}
          onChange={setChosenSubject}
          options={[
            { value: 'all', label: 'All' },
            ...subjects.map(({ slug, name }) => ({ value: slug, label: name })),
          ]}
        />
      </div>

      {/* Vertical timeline */}
      <div style={{ width: "100%", margin: '0 auto' }}>
        {isLoading ? (
          <>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonNode key={i} isLast={i === 6} />
            ))}
          </>
        ) : (data?.nodes?.length ?? 0) === 0 ? (
          // No roadmap at all. Almost always means onboarding was never
          // finished — the plan is built from the subjects chosen there — so
          // say that rather than showing a blank page.
          <EmptyState
            icon={BookSquare}
            title="Your syllabus is not built yet"
            message="Tell us which exams you are sitting and which subjects you are taking, and we will lay out every topic in the order to study them."
            action={
              <Button variant="accent" size="sm" asChild>
                <Link href="/onboarding">Build my syllabus</Link>
              </Button>
            }
          />
        ) : filteredNodes.length === 0 ? (
          <EmptyState
            icon={BookSquare}
            title="No topics here yet"
            message={
              activeSubject === 'all'
                ? 'This exam has no topics on your syllabus yet. Add the subject in your settings and it will appear here.'
                : 'That subject has no topics for this exam yet. Try another subject, or switch exam.'
            }
            action={
              activeSubject !== 'all' ? (
                <Button variant="secondary" size="sm" onClick={() => setChosenSubject('all')}>
                  Show all subjects
                </Button>
              ) : undefined
            }
          />
        ) : (
          filteredNodes.map((node, idx) => (
            <TimelineNodeRow
              key={`${node.subjectSlug}-${node.topicSlug}`}
              node={node}
              isLast={idx === filteredNodes.length - 1}
            />
          ))
        )}
      </div>
    </div>
  )
}
