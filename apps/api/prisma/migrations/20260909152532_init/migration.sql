-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "ExamType" AS ENUM ('jamb', 'waec', 'neco');

-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('free', 'scholar');

-- CreateEnum
CREATE TYPE "Theme" AS ENUM ('system', 'light', 'dark');

-- CreateEnum
CREATE TYPE "Locale" AS ENUM ('en', 'yo', 'ha', 'ig');

-- CreateEnum
CREATE TYPE "InstitutionType" AS ENUM ('university', 'polytechnic', 'college');

-- CreateEnum
CREATE TYPE "LearningStyle" AS ENUM ('visual', 'reading', 'practice', 'mixed');

-- CreateEnum
CREATE TYPE "QuizType" AS ENUM ('topic', 'subject', 'mixed', 'weakness', 'mock');

-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('easy', 'medium', 'hard', 'adaptive');

-- CreateEnum
CREATE TYPE "QuizMode" AS ENUM ('study', 'exam');

-- CreateEnum
CREATE TYPE "MarathonStatus" AS ENUM ('running', 'paused', 'completed', 'abandoned');

-- CreateEnum
CREATE TYPE "XPSource" AS ENUM ('study_session', 'quiz', 'mock', 'marathon', 'streak_milestone', 'topic_completed', 'milestone_unlocked', 'daily_challenge');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('study_reminder', 'revision_due', 'streak_warning', 'streak_milestone', 'mock_available', 'quiz_result', 'topic_unlocked', 'rank_up', 'badge_earned', 'weekly_review', 'system', 'plan_change');

-- CreateEnum
CREATE TYPE "ReminderType" AS ENUM ('study_session', 'revision', 'mock', 'streak_warning', 'weekly_review');

-- CreateEnum
CREATE TYPE "ReminderChannel" AS ENUM ('push', 'email');

-- CreateEnum
CREATE TYPE "ReminderStatus" AS ENUM ('scheduled', 'sent', 'failed', 'cancelled');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "onboardingStep" INTEGER NOT NULL DEFAULT 0,
    "plan" "Plan" NOT NULL DEFAULT 'free',
    "planExpiresAt" TIMESTAMP(3),
    "notifyEmail" BOOLEAN NOT NULL DEFAULT true,
    "notifyPush" BOOLEAN NOT NULL DEFAULT true,
    "notifyStudyReminders" BOOLEAN NOT NULL DEFAULT true,
    "notifyStreakReminders" BOOLEAN NOT NULL DEFAULT true,
    "notifyWeeklyDigest" BOOLEAN NOT NULL DEFAULT true,
    "theme" "Theme" NOT NULL DEFAULT 'system',
    "timezone" TEXT NOT NULL DEFAULT 'Africa/Lagos',
    "locale" "Locale" NOT NULL DEFAULT 'en',
    "resetPasswordToken" TEXT,
    "resetPasswordExpires" TIMESTAMP(3),
    "emailVerifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_verifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subjects" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "examTypes" "ExamType"[],
    "description" TEXT NOT NULL,
    "hue" TEXT NOT NULL,
    "topics" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "examType" "ExamType" NOT NULL,
    "examTypes" "ExamType"[],
    "examDate" TIMESTAMP(3) NOT NULL,
    "intendedCourse" TEXT,
    "institutionType" "InstitutionType",
    "subjects" JSONB NOT NULL DEFAULT '[]',
    "dailyStudyMinutes" INTEGER NOT NULL DEFAULT 120,
    "studyWindowStart" TEXT NOT NULL DEFAULT '08:00',
    "studyWindowEnd" TEXT NOT NULL DEFAULT '22:00',
    "learningStyle" "LearningStyle",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exam_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roadmaps" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "examDate" TIMESTAMP(3) NOT NULL,
    "totalWeeks" INTEGER NOT NULL,
    "examReadiness" INTEGER NOT NULL DEFAULT 0,
    "nodes" JSONB NOT NULL DEFAULT '[]',
    "weeklyTargets" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roadmaps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quizzes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "QuizType" NOT NULL,
    "difficulty" "Difficulty" NOT NULL,
    "mode" "QuizMode" NOT NULL DEFAULT 'study',
    "topicSubjectSlug" TEXT,
    "topicTopicSlug" TEXT,
    "subjectSlug" TEXT,
    "questionCount" INTEGER NOT NULL,
    "timeLimit" INTEGER,
    "questions" JSONB NOT NULL DEFAULT '[]',
    "generatedByModel" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quizzes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_attempts" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "durationSec" INTEGER NOT NULL DEFAULT 0,
    "answers" JSONB NOT NULL DEFAULT '[]',
    "byTopic" JSONB NOT NULL DEFAULT '[]',
    "score" INTEGER NOT NULL DEFAULT 0,
    "xpAwarded" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quiz_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "study_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subjectSlug" TEXT NOT NULL,
    "topicSlug" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "durationSec" INTEGER NOT NULL DEFAULT 0,
    "isMarathon" BOOLEAN NOT NULL DEFAULT false,
    "pomodoros" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'in-progress',
    "notesMarkdown" TEXT,
    "xpAwarded" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "study_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marathon_runs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "plannedDurationMin" INTEGER NOT NULL,
    "actualDurationSec" INTEGER NOT NULL DEFAULT 0,
    "pomodoroLength" INTEGER NOT NULL DEFAULT 25,
    "pomodorosCompleted" INTEGER NOT NULL DEFAULT 0,
    "topicsCovered" JSONB NOT NULL DEFAULT '[]',
    "pauses" JSONB NOT NULL DEFAULT '[]',
    "xpAwarded" INTEGER NOT NULL DEFAULT 0,
    "status" "MarathonStatus" NOT NULL DEFAULT 'running',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marathon_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_threads" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'New conversation',
    "messages" JSONB NOT NULL DEFAULT '[]',
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chat_threads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "streaks" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastActiveDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "freezesAvailable" INTEGER NOT NULL DEFAULT 1,
    "freezesUsed" TIMESTAMP(3)[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "streaks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "xp_events" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "source" "XPSource" NOT NULL,
    "sourceId" TEXT,
    "amount" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "multiplier" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "xp_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "deeplink" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reminders" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "ReminderType" NOT NULL,
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "channel" "ReminderChannel" NOT NULL,
    "payload" JSONB NOT NULL,
    "sentAt" TIMESTAMP(3),
    "status" "ReminderStatus" NOT NULL DEFAULT 'scheduled',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reminders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_resetPasswordToken_key" ON "users"("resetPasswordToken");

-- CreateIndex
CREATE INDEX "users_createdAt_idx" ON "users"("createdAt");

-- CreateIndex
CREATE INDEX "email_verifications_userId_createdAt_idx" ON "email_verifications"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "email_verifications_expiresAt_idx" ON "email_verifications"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "subjects_slug_key" ON "subjects"("slug");

-- CreateIndex
CREATE INDEX "subjects_name_idx" ON "subjects"("name");

-- CreateIndex
CREATE UNIQUE INDEX "exam_profiles_userId_key" ON "exam_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "roadmaps_userId_key" ON "roadmaps"("userId");

-- CreateIndex
CREATE INDEX "quizzes_userId_createdAt_idx" ON "quizzes"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "quizzes_userId_type_createdAt_idx" ON "quizzes"("userId", "type", "createdAt");

-- CreateIndex
CREATE INDEX "quizzes_topicTopicSlug_idx" ON "quizzes"("topicTopicSlug");

-- CreateIndex
CREATE INDEX "quiz_attempts_userId_createdAt_idx" ON "quiz_attempts"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "quiz_attempts_quizId_idx" ON "quiz_attempts"("quizId");

-- CreateIndex
CREATE INDEX "quiz_attempts_userId_completedAt_idx" ON "quiz_attempts"("userId", "completedAt");

-- CreateIndex
CREATE INDEX "study_sessions_userId_startedAt_idx" ON "study_sessions"("userId", "startedAt");

-- CreateIndex
CREATE INDEX "study_sessions_userId_status_startedAt_idx" ON "study_sessions"("userId", "status", "startedAt");

-- CreateIndex
CREATE INDEX "marathon_runs_userId_createdAt_idx" ON "marathon_runs"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "chat_threads_userId_updatedAt_idx" ON "chat_threads"("userId", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "streaks_userId_key" ON "streaks"("userId");

-- CreateIndex
CREATE INDEX "streaks_currentStreak_lastActiveDate_idx" ON "streaks"("currentStreak", "lastActiveDate");

-- CreateIndex
CREATE INDEX "xp_events_userId_createdAt_idx" ON "xp_events"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "xp_events_createdAt_idx" ON "xp_events"("createdAt");

-- CreateIndex
CREATE INDEX "notifications_userId_createdAt_idx" ON "notifications"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "notifications_userId_readAt_idx" ON "notifications"("userId", "readAt");

-- CreateIndex
CREATE INDEX "notifications_userId_type_createdAt_idx" ON "notifications"("userId", "type", "createdAt");

-- CreateIndex
CREATE INDEX "notifications_expiresAt_idx" ON "notifications"("expiresAt");

-- CreateIndex
CREATE INDEX "reminders_status_scheduledFor_idx" ON "reminders"("status", "scheduledFor");

-- CreateIndex
CREATE INDEX "reminders_userId_type_scheduledFor_idx" ON "reminders"("userId", "type", "scheduledFor");

-- AddForeignKey
ALTER TABLE "email_verifications" ADD CONSTRAINT "email_verifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_profiles" ADD CONSTRAINT "exam_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roadmaps" ADD CONSTRAINT "roadmaps_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_sessions" ADD CONSTRAINT "study_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marathon_runs" ADD CONSTRAINT "marathon_runs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_threads" ADD CONSTRAINT "chat_threads_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "streaks" ADD CONSTRAINT "streaks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "xp_events" ADD CONSTRAINT "xp_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
