-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('student', 'admin');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'student';

-- CreateTable
CREATE TABLE "past_questions" (
    "id" TEXT NOT NULL,
    "exam" "ExamType" NOT NULL,
    "year" INTEGER NOT NULL,
    "subjectSlug" TEXT NOT NULL,
    "topicSlug" TEXT,
    "stem" TEXT NOT NULL,
    "options" JSONB NOT NULL,
    "correctOptionId" TEXT NOT NULL,
    "explanation" TEXT,
    "source" TEXT,
    "fingerprint" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "past_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "import_batches" (
    "id" TEXT NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "exam" "ExamType",
    "rowsTotal" INTEGER NOT NULL,
    "rowsImported" INTEGER NOT NULL,
    "rowsSkipped" INTEGER NOT NULL,
    "rowsFailed" INTEGER NOT NULL,
    "errors" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "import_batches_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "past_questions_fingerprint_key" ON "past_questions"("fingerprint");

-- CreateIndex
CREATE INDEX "past_questions_exam_subjectSlug_idx" ON "past_questions"("exam", "subjectSlug");

-- CreateIndex
CREATE INDEX "past_questions_exam_subjectSlug_topicSlug_idx" ON "past_questions"("exam", "subjectSlug", "topicSlug");

-- CreateIndex
CREATE INDEX "past_questions_exam_year_idx" ON "past_questions"("exam", "year");

-- CreateIndex
CREATE INDEX "import_batches_createdAt_idx" ON "import_batches"("createdAt");
