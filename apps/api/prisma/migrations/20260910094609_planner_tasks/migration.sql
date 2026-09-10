-- CreateEnum
CREATE TYPE "PlannerTaskStatus" AS ENUM ('todo', 'doing', 'done');

-- CreateTable
CREATE TABLE "planner_tasks" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "notes" TEXT NOT NULL DEFAULT '',
    "status" "PlannerTaskStatus" NOT NULL DEFAULT 'todo',
    "position" INTEGER NOT NULL DEFAULT 0,
    "dueDate" TIMESTAMP(3),
    "subjectSlug" TEXT,
    "topicSlug" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "planner_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "planner_tasks_userId_status_position_idx" ON "planner_tasks"("userId", "status", "position");

-- AddForeignKey
ALTER TABLE "planner_tasks" ADD CONSTRAINT "planner_tasks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
