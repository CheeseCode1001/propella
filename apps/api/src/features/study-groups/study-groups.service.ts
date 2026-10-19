import { prisma } from '../../config/db'
import { AppError, NotFoundError } from '../../middleware/error-handler'
import { ensureReferralCode } from '../referrals/referrals.service'
import { env } from '../../config/env'
import { logger } from '../../config/logger'

export interface StudyGroupMember {
  userId: string
  name: string
  joinedAt: string
  role: 'creator' | 'member'
}

export interface GroupMessage {
  id: string
  userId: string
  userName: string
  content: string
  createdAt: string
}

export interface StudyGroupItem {
  id: string
  name: string
  description: string
  subject: string
  targetExam: string // 'JAMB' | 'WAEC' | 'NECO' | 'Undergraduate'
  creatorId: string
  creatorName: string
  referralCode: string
  inviteLink: string
  members: StudyGroupMember[]
  messages: GroupMessage[]
  weeklyGoal: {
    targetQuestions: number
    completedQuestions: number
    title: string
  }
  activeFocusSession?: {
    startedAt: string
    durationMinutes: number
    topic: string
  } | null
  createdAt: string
}

// In-memory persistent store with realistic pre-seeded study groups
const studyGroupsStore = new Map<string, StudyGroupItem>()

function seedDefaultGroups() {
  if (studyGroupsStore.size > 0) return

  const defaultGroup1: StudyGroupItem = {
    id: 'sg-jamb-achievers',
    name: 'UTME 300+ Achievers Club',
    description: 'High-intensity daily CBT drilling for candidates targeting 300+ in JAMB.',
    subject: 'All Science Subjects',
    targetExam: 'JAMB',
    creatorId: 'sys-creator-1',
    creatorName: 'Emeka O.',
    referralCode: 'PROP300',
    inviteLink: `${env.FRONTEND_URL}/register?ref=PROP300`,
    members: [
      { userId: 'sys-creator-1', name: 'Emeka O.', joinedAt: new Date(Date.now() - 7 * 86400000).toISOString(), role: 'creator' },
      { userId: 'sys-user-2', name: 'Amina B.', joinedAt: new Date(Date.now() - 5 * 86400000).toISOString(), role: 'member' },
      { userId: 'sys-user-3', name: 'Femi A.', joinedAt: new Date(Date.now() - 3 * 86400000).toISOString(), role: 'member' },
    ],
    messages: [
      { id: 'm1', userId: 'sys-creator-1', userName: 'Emeka O.', content: 'Welcome everyone! Today we are drilling 40 questions on organic chemistry.', createdAt: new Date(Date.now() - 86400000).toISOString() },
      { id: 'm2', userId: 'sys-user-2', userName: 'Amina B.', content: 'On it! Already reviewed functional groups.', createdAt: new Date(Date.now() - 3600000).toISOString() },
    ],
    weeklyGoal: {
      targetQuestions: 250,
      completedQuestions: 180,
      title: 'Complete 250 Past CBT Questions',
    },
    activeFocusSession: null,
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
  }

  const defaultGroup2: StudyGroupItem = {
    id: 'sg-unilag-eng',
    name: 'Unilag Engineering 200L Study Hub',
    description: 'Sharing lecture notes, past questions, and collaborative calculus problem-solving.',
    subject: 'MTH 201 & PHY 201',
    targetExam: 'Undergraduate',
    creatorId: 'sys-creator-2',
    creatorName: 'David K.',
    referralCode: 'UNILAG200',
    inviteLink: `${env.FRONTEND_URL}/register?ref=UNILAG200`,
    members: [
      { userId: 'sys-creator-2', name: 'David K.', joinedAt: new Date(Date.now() - 10 * 86400000).toISOString(), role: 'creator' },
      { userId: 'sys-user-4', name: 'Zainab M.', joinedAt: new Date(Date.now() - 4 * 86400000).toISOString(), role: 'member' },
    ],
    messages: [
      { id: 'm3', userId: 'sys-creator-2', userName: 'David K.', content: 'Uploaded the differential equations summary to Course Files.', createdAt: new Date(Date.now() - 7200000).toISOString() },
    ],
    weeklyGoal: {
      targetQuestions: 150,
      completedQuestions: 95,
      title: 'Differential Equations Mastery',
    },
    activeFocusSession: null,
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
  }

  studyGroupsStore.set(defaultGroup1.id, defaultGroup1)
  studyGroupsStore.set(defaultGroup2.id, defaultGroup2)
}

seedDefaultGroups()

export async function listStudyGroups(userId: string): Promise<{
  myGroups: StudyGroupItem[]
  discoverGroups: StudyGroupItem[]
  referralBalance: number
  referralCode: string
}> {
  seedDefaultGroups()

  const [user, refCode] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { referralBalance: true, name: true },
    }),
    ensureReferralCode(userId),
  ])

  const allGroups = Array.from(studyGroupsStore.values())
  const myGroups = allGroups.filter((g) => g.members.some((m) => m.userId === userId))
  const discoverGroups = allGroups.filter((g) => !g.members.some((m) => m.userId === userId))

  return {
    myGroups,
    discoverGroups,
    referralBalance: user?.referralBalance ?? 0,
    referralCode: refCode,
  }
}

export async function createStudyGroup(
  userId: string,
  input: {
    name: string
    description?: string | undefined
    subject?: string | undefined
    targetExam?: string | undefined
    weeklyTargetQuestions?: number | undefined
  },
): Promise<StudyGroupItem> {
  const name = input.name.trim()
  if (!name) throw new AppError(400, 'Study group name is required')

  const [user, referralCode] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { name: true } }),
    ensureReferralCode(userId),
  ])

  const id = `sg-${Date.now()}`
  const newGroup: StudyGroupItem = {
    id,
    name,
    description: input.description?.trim() || 'A collaborative study group on Propella.',
    subject: input.subject?.trim() || 'General Studies',
    targetExam: input.targetExam || 'JAMB',
    creatorId: userId,
    creatorName: user?.name || 'Group Creator',
    referralCode,
    inviteLink: `${env.FRONTEND_URL}/register?ref=${referralCode}`,
    members: [
      {
        userId,
        name: user?.name || 'Creator',
        joinedAt: new Date().toISOString(),
        role: 'creator',
      },
    ],
    messages: [
      {
        id: `m-${Date.now()}`,
        userId,
        userName: user?.name || 'Creator',
        content: `Welcome to ${name}! Share your invite link with coursemates to study together and earn referral rewards.`,
        createdAt: new Date().toISOString(),
      },
    ],
    weeklyGoal: {
      targetQuestions: input.weeklyTargetQuestions || 100,
      completedQuestions: 0,
      title: `Solve ${input.weeklyTargetQuestions || 100} Questions`,
    },
    activeFocusSession: null,
    createdAt: new Date().toISOString(),
  }

  studyGroupsStore.set(id, newGroup)
  return newGroup
}

export async function getStudyGroup(userId: string, groupId: string): Promise<StudyGroupItem> {
  seedDefaultGroups()
  const group = studyGroupsStore.get(groupId)
  if (!group) throw new NotFoundError('Study group not found')
  return group
}

export async function joinStudyGroup(userId: string, groupId: string): Promise<StudyGroupItem> {
  seedDefaultGroups()
  const group = studyGroupsStore.get(groupId)
  if (!group) throw new NotFoundError('Study group not found')

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } })
  const alreadyMember = group.members.some((m) => m.userId === userId)

  if (!alreadyMember) {
    group.members.push({
      userId,
      name: user?.name || 'New Member',
      joinedAt: new Date().toISOString(),
      role: 'member',
    })
    group.messages.push({
      id: `m-${Date.now()}`,
      userId: 'system',
      userName: 'Propella',
      content: `${user?.name || 'A new student'} joined the study group! 🎉`,
      createdAt: new Date().toISOString(),
    })
    studyGroupsStore.set(groupId, group)
  }

  return group
}

export async function postGroupMessage(
  userId: string,
  groupId: string,
  content: string,
): Promise<GroupMessage> {
  seedDefaultGroups()
  const group = studyGroupsStore.get(groupId)
  if (!group) throw new NotFoundError('Study group not found')

  const text = content.trim()
  if (!text) throw new AppError(400, 'Message cannot be empty')

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } })
  const message: GroupMessage = {
    id: `m-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    userId,
    userName: user?.name || 'Student',
    content: text,
    createdAt: new Date().toISOString(),
  }

  group.messages.push(message)
  studyGroupsStore.set(groupId, group)
  return message
}

export async function startGroupFocus(
  userId: string,
  groupId: string,
  params: { durationMinutes: number; topic: string },
): Promise<StudyGroupItem> {
  seedDefaultGroups()
  const group = studyGroupsStore.get(groupId)
  if (!group) throw new NotFoundError('Study group not found')

  group.activeFocusSession = {
    startedAt: new Date().toISOString(),
    durationMinutes: params.durationMinutes || 25,
    topic: params.topic || 'Group Study Session',
  }

  group.messages.push({
    id: `m-${Date.now()}`,
    userId: 'system',
    userName: 'Propella',
    content: `⏱️ A ${params.durationMinutes || 25}-minute focus study session on "${params.topic}" was started! Let's study together.`,
    createdAt: new Date().toISOString(),
  })

  studyGroupsStore.set(groupId, group)
  return group
}
