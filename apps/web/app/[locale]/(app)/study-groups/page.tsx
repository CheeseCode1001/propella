'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Users,
  UserPlus,
  Copy,
  Check,
  Sparkles,
  MessageSquare,
  Clock,
  Send,
  Plus,
  Play,
  Trophy,
  ArrowRight,
  ShieldCheck,
  Coins,
} from 'lucide-react'
import { api } from '@/lib/api-client'
import { useAuthStore } from '@/lib/stores/auth-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/ui/modal'
import { EmptyState } from '@/components/common/empty-state'

interface StudyGroupMember {
  userId: string
  name: string
  joinedAt: string
  role: 'creator' | 'member'
}

interface GroupMessage {
  id: string
  userId: string
  userName: string
  content: string
  createdAt: string
}

interface StudyGroupItem {
  id: string
  name: string
  description: string
  subject: string
  targetExam: string
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

interface StudyGroupsResponse {
  myGroups: StudyGroupItem[]
  discoverGroups: StudyGroupItem[]
  referralBalance: number
  referralCode: string
}

export default function StudyGroupsPage() {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)

  const [activeTab, setActiveTab] = useState<'my-groups' | 'discover'>('my-groups')
  const [selectedGroup, setSelectedGroup] = useState<StudyGroupItem | null>(null)
  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedGroupInvite, setCopiedGroupInvite] = useState(false)

  // Creation modal
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [groupDesc, setGroupDesc] = useState('')
  const [groupSubject, setGroupSubject] = useState('')
  const [groupTargetExam, setGroupTargetExam] = useState<'JAMB' | 'WAEC' | 'NECO' | 'Undergraduate'>(
    user?.undergraduateMode ? 'Undergraduate' : 'JAMB',
  )
  const [weeklyGoalQuestions, setWeeklyGoalQuestions] = useState(150)

  // Message input
  const [messageText, setMessageText] = useState('')
  // Focus session modal
  const [isFocusModalOpen, setIsFocusModalOpen] = useState(false)
  const [focusTopic, setFocusTopic] = useState('')
  const [focusDuration, setFocusDuration] = useState(25)

  const { data, isLoading } = useQuery({
    queryKey: ['study-groups'],
    queryFn: () => api.get<{ data: StudyGroupsResponse }>('/study-groups').then((r) => r.data),
  })

  const createGroupMutation = useMutation({
    mutationFn: (newGroup: {
      name: string
      description: string
      subject: string
      targetExam: string
      weeklyTargetQuestions: number
    }) => api.post<{ data: StudyGroupItem }>('/study-groups', newGroup),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['study-groups'] })
      setIsCreateOpen(false)
      setGroupName('')
      setGroupDesc('')
      setGroupSubject('')
      if (res?.data) setSelectedGroup(res.data)
    },
  })

  const joinGroupMutation = useMutation({
    mutationFn: (groupId: string) =>
      api.post<{ data: StudyGroupItem }>(`/study-groups/${groupId}/join`, {}),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['study-groups'] })
      if (res?.data) setSelectedGroup(res.data)
    },
  })

  const postMessageMutation = useMutation({
    mutationFn: ({ groupId, content }: { groupId: string; content: string }) =>
      api.post<{ data: GroupMessage }>(`/study-groups/${groupId}/messages`, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-groups'] })
      setMessageText('')
    },
  })

  const startFocusMutation = useMutation({
    mutationFn: ({
      groupId,
      durationMinutes,
      topic,
    }: {
      groupId: string
      durationMinutes: number
      topic: string
    }) =>
      api.post<{ data: StudyGroupItem }>(`/study-groups/${groupId}/focus`, {
        durationMinutes,
        topic,
      }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['study-groups'] })
      setIsFocusModalOpen(false)
      if (res?.data) setSelectedGroup(res.data)
    },
  })

  const currentGroup =
    data?.myGroups.find((g) => g.id === selectedGroup?.id) ||
    data?.discoverGroups.find((g) => g.id === selectedGroup?.id) ||
    selectedGroup

  const referralCode = data?.referralCode || user?.id?.substring(0, 8).toUpperCase() || 'PROPELLA'
  const inviteLink =
    typeof window !== 'undefined'
      ? `${window.location.origin}/register?ref=${referralCode}`
      : `https://propella.app/register?ref=${referralCode}`

  function copyReferral() {
    navigator.clipboard.writeText(inviteLink)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2500)
  }

  function handleSendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!messageText.trim() || !currentGroup) return
    postMessageMutation.mutate({ groupId: currentGroup.id, content: messageText.trim() })
  }

  return (
    <div className="mx-auto max-w-[1060px] px-4 py-8 md:px-8">
      {/* Referral Funds & Invite Banner */}
      <div className="mb-8 rounded-2xl bg-gradient-to-r from-[var(--color-accent)]/20 via-[var(--color-accent)]/10 to-transparent border border-[var(--color-accent)]/30 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[var(--color-accent)] text-white">
              <Users size={18} />
            </span>
            <h2 className="text-[19px] font-bold text-[var(--color-ink)]">
              Study Groups & Collaborative Learning
            </h2>
          </div>
          <p className="text-[13.5px] text-[var(--color-ink-2)] max-w-2xl leading-relaxed">
            Create study groups, invite your coursemates or secondary school friends using your referral code, and earn{' '}
            <strong className="text-[var(--color-ink)]">₦1,000 + 50 AI questions</strong> in referral cash for every student who joins!
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-medium text-[var(--color-ink-3)]">
            <span className="flex items-center gap-1.5 text-emerald-600 font-bold text-sm">
              <Coins size={16} />
              Referral Funds Balance: ₦{(data?.referralBalance ?? 0).toLocaleString()}
            </span>
            <span>•</span>
            <span>Your Referral Code: <strong className="text-[var(--color-accent)] font-mono text-sm">{referralCode}</strong></span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={copyReferral}
            className="flex items-center justify-center gap-2 text-xs h-10 border-[var(--color-accent)]/40 hover:bg-[var(--color-accent-tint)]"
          >
            {copiedLink ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
            <span>{copiedLink ? 'Copied Invite Link!' : 'Copy Invite Link'}</span>
          </Button>

          <Button
            variant="accent"
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center justify-center gap-2 text-xs h-10"
          >
            <Plus size={16} />
            <span>Create Study Group</span>
          </Button>
        </div>
      </div>

      {/* Main Study Groups View */}
      {currentGroup ? (
        /* Selected Group Detail & Discussion Wall */
        <div className="space-y-6">
          <button
            onClick={() => setSelectedGroup(null)}
            className="text-xs font-semibold text-[var(--color-accent)] hover:underline flex items-center gap-1"
          >
            &larr; Back to all study groups
          </button>

          <Card className="border border-[var(--color-rule)] overflow-hidden">
            {/* Group Header */}
            <div className="p-6 border-b border-[var(--color-rule)] bg-[var(--color-paper-2)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-[22px] font-bold text-[var(--color-ink)]">
                    {currentGroup.name}
                  </h2>
                  <Badge variant="default" className="text-[11px] font-semibold">
                    {currentGroup.targetExam}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-[var(--color-ink-2)]">
                  Subject: <strong className="text-[var(--color-ink)]">{currentGroup.subject}</strong> • Created by {currentGroup.creatorName} • {currentGroup.members.length} Active Members
                </p>
                <p className="mt-2 text-xs text-[var(--color-ink-3)] max-w-2xl leading-relaxed">
                  {currentGroup.description}
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const groupLink = `${inviteLink}&group=${currentGroup.id}`
                    navigator.clipboard.writeText(groupLink)
                    setCopiedGroupInvite(true)
                    setTimeout(() => setCopiedGroupInvite(false), 2500)
                  }}
                  className="flex items-center gap-1.5 text-xs h-9"
                >
                  {copiedGroupInvite ? <Check size={14} className="text-emerald-600" /> : <UserPlus size={14} />}
                  <span>{copiedGroupInvite ? 'Group Link Copied!' : 'Invite Coursemates'}</span>
                </Button>

                <Button
                  size="sm"
                  variant="accent"
                  onClick={() => {
                    setFocusTopic(currentGroup.subject)
                    setIsFocusModalOpen(true)
                  }}
                  className="flex items-center gap-1.5 text-xs h-9 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <Play size={13} fill="currentColor" />
                  <span>Start Group Focus</span>
                </Button>
              </div>
            </div>

            {/* Weekly Target Progress & Active Focus Session */}
            <div className="px-6 py-4 bg-[var(--color-paper)] border-b border-[var(--color-rule)] grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                  <span className="text-[var(--color-ink)] flex items-center gap-1.5">
                    <Trophy size={14} className="text-amber-500" /> {currentGroup.weeklyGoal.title}
                  </span>
                  <span className="text-[var(--color-ink-3)] font-mono">
                    {currentGroup.weeklyGoal.completedQuestions} / {currentGroup.weeklyGoal.targetQuestions} questions
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-[var(--color-paper-3)] overflow-hidden">
                  <div
                    className="h-full bg-[var(--color-accent)] rounded-full transition-all"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.round(
                          (currentGroup.weeklyGoal.completedQuestions /
                            currentGroup.weeklyGoal.targetQuestions) *
                            100,
                        ),
                      )}%`,
                    }}
                  />
                </div>
              </div>

              {currentGroup.activeFocusSession ? (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
                      🔴 Live Focus Study Session
                    </span>
                    <p className="text-xs font-semibold text-[var(--color-ink)] mt-0.5">
                      {currentGroup.activeFocusSession.topic} ({currentGroup.activeFocusSession.durationMinutes} mins)
                    </p>
                  </div>
                  <Badge variant="default" className="bg-emerald-600 text-white text-[11px]">
                    In Progress
                  </Badge>
                </div>
              ) : (
                <div className="text-xs text-[var(--color-ink-3)] italic">
                  No active focus timer. Click &quot;Start Group Focus&quot; to initiate a synchronized Pomodoro study session.
                </div>
              )}
            </div>

            {/* Group Discussion & Message Wall */}
            <div className="p-6 space-y-4">
              <h3 className="text-sm font-bold text-[var(--color-ink)] uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare size={15} /> Group Discussion & Problem Solving
              </h3>

              {/* Message List */}
              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {currentGroup.messages.map((m) => (
                  <div
                    key={m.id}
                    className="p-3 rounded-lg border border-[var(--color-rule)] bg-[var(--color-paper-2)] space-y-1"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-[var(--color-ink)]">{m.userName}</span>
                      <span className="text-[var(--color-ink-3)] font-mono">
                        {new Date(m.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-[13px] text-[var(--color-ink-2)] leading-relaxed">{m.content}</p>
                  </div>
                ))}
              </div>

              {/* Post Message Form */}
              <form onSubmit={handleSendMessage} className="flex items-center gap-2 pt-2">
                <Input
                  placeholder="Share a past question, study tip, or question for the group..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="submit"
                  variant="accent"
                  disabled={!messageText.trim() || postMessageMutation.isPending}
                  className="shrink-0 flex items-center gap-1 text-xs"
                >
                  <Send size={14} />
                  <span>Send</span>
                </Button>
              </form>
            </div>
          </Card>
        </div>
      ) : (
        /* Tabs: My Groups vs Discover */
        <div>
          <div className="flex border-b border-[var(--color-rule)] mb-6">
            <button
              onClick={() => setActiveTab('my-groups')}
              className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-all ${
                activeTab === 'my-groups'
                  ? 'border-[var(--color-accent)] text-[var(--color-accent)] font-semibold'
                  : 'border-transparent text-[var(--color-ink-2)] hover:text-[var(--color-ink)]'
              }`}
            >
              My Study Groups ({data?.myGroups.length ?? 0})
            </button>
            <button
              onClick={() => setActiveTab('discover')}
              className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-all ${
                activeTab === 'discover'
                  ? 'border-[var(--color-accent)] text-[var(--color-accent)] font-semibold'
                  : 'border-transparent text-[var(--color-ink-2)] hover:text-[var(--color-ink)]'
              }`}
            >
              Discover Groups ({data?.discoverGroups.length ?? 0})
            </button>
          </div>

          {isLoading ? (
            <div className="py-20 text-center text-sm text-[var(--color-ink-3)]">
              Loading study groups...
            </div>
          ) : activeTab === 'my-groups' ? (
            /* My Groups Grid */
            data?.myGroups.length === 0 ? (
              <div className="rounded-[var(--radius-lg)] border border-[var(--color-rule)] bg-[var(--color-card)] p-12 text-center">
                <EmptyState
                  icon={Users}
                  title="You haven't joined or created any study groups yet"
                  message="Start a study circle with your friends or coursemates, invite them with your code, and earn ₦1,000 for each friend who signs up!"
                  action={
                    <Button variant="accent" onClick={() => setIsCreateOpen(true)}>
                      Create Your First Study Group
                    </Button>
                  }
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data?.myGroups.map((group) => (
                  <Card
                    key={group.id}
                    className="border border-[var(--color-rule)] p-5 flex flex-col justify-between hover:border-[var(--color-accent)] transition-all cursor-pointer"
                    onClick={() => setSelectedGroup(group)}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-[16px] font-bold text-[var(--color-ink)]">{group.name}</h3>
                        <Badge variant="default" className="text-[11px]">
                          {group.targetExam}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-[var(--color-accent)] font-medium">
                        {group.subject} • {group.members.length} Members
                      </p>
                      <p className="mt-2 text-xs text-[var(--color-ink-2)] line-clamp-2 leading-relaxed">
                        {group.description}
                      </p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-[var(--color-rule)] flex items-center justify-between text-xs">
                      <span className="text-[var(--color-ink-3)]">
                        Goal: {group.weeklyGoal.completedQuestions}/{group.weeklyGoal.targetQuestions} Qs
                      </span>
                      <span className="text-[var(--color-accent)] font-semibold flex items-center gap-1">
                        Open Group <ArrowRight size={13} />
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            )
          ) : (
            /* Discover Groups Grid */
            data?.discoverGroups.length === 0 ? (
              <div className="rounded-[var(--radius-lg)] border border-[var(--color-rule)] bg-[var(--color-card)] p-12 text-center">
                <EmptyState
                  icon={Users}
                  title="No other public groups available"
                  message="Create a new study group and invite your classmates!"
                  action={
                    <Button variant="accent" onClick={() => setIsCreateOpen(true)}>
                      Create Study Group
                    </Button>
                  }
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data?.discoverGroups.map((group) => (
                  <Card
                    key={group.id}
                    className="border border-[var(--color-rule)] p-5 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-[16px] font-bold text-[var(--color-ink)]">{group.name}</h3>
                        <Badge variant="default" className="text-[11px]">
                          {group.targetExam}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-[var(--color-accent)] font-medium">
                        {group.subject} • {group.members.length} Members
                      </p>
                      <p className="mt-2 text-xs text-[var(--color-ink-2)] line-clamp-2 leading-relaxed">
                        {group.description}
                      </p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-[var(--color-rule)] flex items-center justify-between">
                      <span className="text-xs text-[var(--color-ink-3)]">
                        Created by {group.creatorName}
                      </span>
                      <Button
                        size="sm"
                        variant="accent"
                        disabled={joinGroupMutation.isPending}
                        onClick={() => joinGroupMutation.mutate(group.id)}
                        className="text-xs"
                      >
                        Join Study Group
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )
          )}
        </div>
      )}

      {/* Modal: Create Study Group */}
      <Modal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create a Collaborative Study Group"
        subtitle="Bring your classmates together, run focus sessions, and earn referral funds"
        size="md"
        footer={
          <div className="flex items-center justify-end gap-3">
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="accent"
              disabled={createGroupMutation.isPending || !groupName.trim()}
              onClick={() => {
                createGroupMutation.mutate({
                  name: groupName.trim(),
                  description: groupDesc.trim(),
                  subject: groupSubject.trim() || 'General Studies',
                  targetExam: groupTargetExam,
                  weeklyTargetQuestions: Number(weeklyGoalQuestions) || 150,
                })
              }}
            >
              {createGroupMutation.isPending ? 'Creating...' : 'Create & Get Invite Link'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4 py-1">
          <div>
            <Label htmlFor="gName">Group Name</Label>
            <Input
              id="gName"
              placeholder="e.g. Unilag CSC 201 Champions or WAEC Physics Distinction Squad"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="gExam">Target Exam / Level</Label>
              <select
                id="gExam"
                value={groupTargetExam}
                onChange={(e) => setGroupTargetExam(e.target.value as any)}
                className="w-full rounded-md border border-[var(--color-rule)] bg-[var(--color-card)] p-2.5 text-xs text-[var(--color-ink)] outline-none"
              >
                <option value="JAMB">JAMB UTME</option>
                <option value="WAEC">WAEC WASSCE</option>
                <option value="NECO">NECO SSCE</option>
                <option value="Undergraduate">Undergraduate University</option>
              </select>
            </div>

            <div>
              <Label htmlFor="gSubject">Subject / Course Code</Label>
              <Input
                id="gSubject"
                placeholder="e.g. Mathematics, MTH 201"
                value={groupSubject}
                onChange={(e) => setGroupSubject(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="gDesc">Group Description / Goal</Label>
            <textarea
              id="gDesc"
              rows={3}
              placeholder="What are the group's study rules, meeting times, and targets?"
              value={groupDesc}
              onChange={(e) => setGroupDesc(e.target.value)}
              className="w-full rounded-md border border-[var(--color-rule)] bg-[var(--color-paper)] p-2.5 text-xs text-[var(--color-ink)] outline-none"
            />
          </div>

          <div className="p-3 rounded-lg bg-[var(--color-accent-tint)] border border-[var(--color-accent)]/20 text-xs text-[var(--color-ink)]">
            💰 <strong>Referral Reward:</strong> Every classmate you invite to this study group with your invite link earns you <strong>₦1,000 cash</strong> in your referral balance once they register!
          </div>
        </div>
      </Modal>

      {/* Modal: Start Focus Session */}
      <Modal
        open={isFocusModalOpen}
        onClose={() => setIsFocusModalOpen(false)}
        title="Start Synchronized Group Focus Session"
        subtitle="A shared study timer for all group members"
        size="md"
        footer={
          <div className="flex items-center justify-end gap-3">
            <Button variant="outline" onClick={() => setIsFocusModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="accent"
              disabled={startFocusMutation.isPending}
              onClick={() => {
                if (currentGroup) {
                  startFocusMutation.mutate({
                    groupId: currentGroup.id,
                    durationMinutes: focusDuration,
                    topic: focusTopic.trim() || currentGroup.subject,
                  })
                }
              }}
            >
              {startFocusMutation.isPending ? 'Starting...' : 'Start Session'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4 py-1">
          <div>
            <Label htmlFor="fTopic">Focus Topic</Label>
            <Input
              id="fTopic"
              value={focusTopic}
              onChange={(e) => setFocusTopic(e.target.value)}
              placeholder="e.g. Calculus Problems or Past Questions 2020-2023"
            />
          </div>

          <div>
            <Label htmlFor="fDuration">Duration (Minutes)</Label>
            <select
              id="fDuration"
              value={focusDuration}
              onChange={(e) => setFocusDuration(Number(e.target.value))}
              className="w-full rounded-md border border-[var(--color-rule)] bg-[var(--color-card)] p-2.5 text-xs text-[var(--color-ink)] outline-none"
            >
              <option value={15}>15 Minutes (Sprint)</option>
              <option value={25}>25 Minutes (Standard Pomodoro)</option>
              <option value={45}>45 Minutes (Deep Work)</option>
              <option value={60}>60 Minutes (Intensive Study)</option>
            </select>
          </div>
        </div>
      </Modal>
    </div>
  )
}
