import type { ExamType, PlanType, TopicStatus } from './constants'

// API response wrapper
export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface ApiError {
  error: string
  details?: unknown
}

// Auth
export interface AuthUser {
  id: string
  name: string
  email: string
  plan: PlanType
  onboardingCompleted: boolean
  onboardingStep: number
  theme: 'system' | 'light' | 'dark'
  timezone: string
  locale?: 'en' | 'yo' | 'ha' | 'ig'
  avatarUrl?: string
  emailVerified: boolean
}

export interface AuthTokens {
  accessToken: string
}

// Exam profile
export interface ExamProfile {
  id: string
  userId: string
  examType: ExamType
  examTypes?: ExamType[]
  examDate: string
  intendedCourse?: string
  institutionType?: 'university' | 'polytechnic' | 'college'
  learningStyle?: 'visual' | 'reading' | 'practice' | 'mixed'
  subjects: ExamSubject[]
  dailyStudyMinutes: number
  preferredStudyWindow: { start: string; end: string }
}

export interface ExamSubject {
  subjectId: string
  slug: string
  name: string
  isWeak: boolean
  isStrong: boolean
  currentMastery: number
  lastStudiedAt?: string
}

// Subject / Topic
export interface SubjectTopic {
  id: string
  slug: string
  name: string
  order: number
  description: string
  estimatedMinutes: number
  prerequisiteSlugs: string[]
  examWeight: number
  examTypes: ExamType[]
}

export interface Subject {
  id: string
  slug: string
  name: string
  examTypes: ExamType[]
  description: string
  hue: string
  topics: SubjectTopic[]
}

// Roadmap
export interface RoadmapNode {
  subjectSlug: string
  topicSlug: string
  topicName: string
  subjectName: string
  topicOrder: number
  topicTotal: number
  plannedStartDate: string
  plannedEndDate: string
  status: TopicStatus
  mastery: number
  revisionsCompleted: number
  revisionsScheduled: number
  lastStudiedAt?: string
  nextRevisionAt?: string
  sm2: { easeFactor: number; interval: number; repetitions: number }
  isMilestone: boolean
  milestoneLabel?: string
  estimatedMinutes: number
}

export interface Roadmap {
  id: string
  userId: string
  generatedAt: string
  examDate: string
  totalWeeks: number
  examReadiness: number
  nodes: RoadmapNode[]
  weeklyTargets: WeeklyTarget[]
}

export interface WeeklyTarget {
  weekStartDate: string
  topicsToComplete: number
  minutesGoal: number
  quizzesTargeted: number
}

// Gamification
export interface UserStreak {
  currentStreak: number
  longestStreak: number
  lastActiveDate: string
  freezesAvailable: number
}

export interface XPSummary {
  totalXP: number
  rankName: string
  nextRankName: string | null
  nextRankThreshold: number | null
  xpToNextRank: number | null
}

// Dashboard
export interface DashboardData {
  daysToExam: number
  examType: ExamType
  examTypes?: ExamType[]
  examDate: string
  todayTopics: TodayTopic[]
  streak: UserStreak
  xp: XPSummary
  weakestTopics: WeakTopic[]
  recentScores: DailyScore[]
  upcomingRevisions: UpcomingRevision[]
  examReadiness: number
}

export interface TodayTopic {
  subjectSlug: string
  subjectName: string
  topicSlug: string
  topicName: string
  estimatedMinutes: number
  status: TopicStatus
  nodeStatus: 'new' | 'revision' | 'quiz-due'
}

export interface WeakTopic {
  subjectSlug: string
  subjectName: string
  topicSlug: string
  topicName: string
  mastery: number
}

export interface DailyScore {
  date: string
  averageScore: number
}

export interface UpcomingRevision {
  subjectSlug: string
  subjectName: string
  topicSlug: string
  topicName: string
  nextRevisionAt: string
}
