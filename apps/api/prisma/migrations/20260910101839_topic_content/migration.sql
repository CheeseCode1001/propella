-- CreateTable
CREATE TABLE "topic_content" (
    "id" TEXT NOT NULL,
    "exam" "ExamType" NOT NULL,
    "subjectSlug" TEXT NOT NULL,
    "topicSlug" TEXT NOT NULL,
    "topicName" TEXT NOT NULL,
    "subjectName" TEXT NOT NULL,
    "intro" TEXT NOT NULL,
    "sections" JSONB NOT NULL DEFAULT '[]',
    "examples" JSONB NOT NULL DEFAULT '[]',
    "summary" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "topic_content_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "topic_content_exam_subjectSlug_topicSlug_key" ON "topic_content"("exam", "subjectSlug", "topicSlug");
