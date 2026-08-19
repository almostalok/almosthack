-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'FINALIZED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "JudgeAssignmentStatus" AS ENUM ('ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'REVOKED');

-- CreateEnum
CREATE TYPE "EvaluationStatus" AS ENUM ('DRAFT', 'SUBMITTED');

-- CreateTable
CREATE TABLE "submissions" (
    "id" TEXT NOT NULL,
    "hackathonId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "trackId" TEXT,
    "challengeId" TEXT,
    "repositoryId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "demoUrl" TEXT,
    "documentationUrl" TEXT,
    "commitSha" TEXT,
    "snapshotBranch" TEXT,
    "snapshotCapturedAt" TIMESTAMP(3),
    "status" "SubmissionStatus" NOT NULL DEFAULT 'DRAFT',
    "submittedAt" TIMESTAMP(3),
    "finalizedAt" TIMESTAMP(3),
    "withdrawnAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "judging_criteria" (
    "id" TEXT NOT NULL,
    "hackathonId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "maxScore" DOUBLE PRECISION NOT NULL DEFAULT 10.0,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "judging_criteria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "judge_assignments" (
    "id" TEXT NOT NULL,
    "hackathonId" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "judgeUserId" TEXT NOT NULL,
    "assignedByUserId" TEXT NOT NULL,
    "status" "JudgeAssignmentStatus" NOT NULL DEFAULT 'ASSIGNED',
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "judge_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "judge_evaluations" (
    "id" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "judgeUserId" TEXT NOT NULL,
    "status" "EvaluationStatus" NOT NULL DEFAULT 'DRAFT',
    "generalFeedback" TEXT,
    "totalScore" DOUBLE PRECISION,
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "judge_evaluations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evaluation_scores" (
    "id" TEXT NOT NULL,
    "evaluationId" TEXT NOT NULL,
    "criterionId" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "evaluation_scores_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "submissions_hackathonId_teamId_key" ON "submissions"("hackathonId", "teamId");

-- CreateIndex
CREATE INDEX "submissions_hackathonId_idx" ON "submissions"("hackathonId");

-- CreateIndex
CREATE INDEX "submissions_teamId_idx" ON "submissions"("teamId");

-- CreateIndex
CREATE INDEX "submissions_trackId_idx" ON "submissions"("trackId");

-- CreateIndex
CREATE INDEX "submissions_challengeId_idx" ON "submissions"("challengeId");

-- CreateIndex
CREATE INDEX "submissions_status_idx" ON "submissions"("status");

-- CreateIndex
CREATE INDEX "judging_criteria_hackathonId_idx" ON "judging_criteria"("hackathonId");

-- CreateIndex
CREATE INDEX "judging_criteria_displayOrder_idx" ON "judging_criteria"("displayOrder");

-- CreateIndex
CREATE UNIQUE INDEX "judge_assignments_submissionId_judgeUserId_key" ON "judge_assignments"("submissionId", "judgeUserId");

-- CreateIndex
CREATE INDEX "judge_assignments_hackathonId_idx" ON "judge_assignments"("hackathonId");

-- CreateIndex
CREATE INDEX "judge_assignments_judgeUserId_idx" ON "judge_assignments"("judgeUserId");

-- CreateIndex
CREATE INDEX "judge_assignments_submissionId_idx" ON "judge_assignments"("submissionId");

-- CreateIndex
CREATE INDEX "judge_assignments_status_idx" ON "judge_assignments"("status");

-- CreateIndex
CREATE UNIQUE INDEX "judge_evaluations_assignmentId_key" ON "judge_evaluations"("assignmentId");

-- CreateIndex
CREATE INDEX "judge_evaluations_submissionId_idx" ON "judge_evaluations"("submissionId");

-- CreateIndex
CREATE INDEX "judge_evaluations_judgeUserId_idx" ON "judge_evaluations"("judgeUserId");

-- CreateIndex
CREATE INDEX "judge_evaluations_status_idx" ON "judge_evaluations"("status");

-- CreateIndex
CREATE UNIQUE INDEX "evaluation_scores_evaluationId_criterionId_key" ON "evaluation_scores"("evaluationId", "criterionId");

-- CreateIndex
CREATE INDEX "evaluation_scores_evaluationId_idx" ON "evaluation_scores"("evaluationId");

-- CreateIndex
CREATE INDEX "evaluation_scores_criterionId_idx" ON "evaluation_scores"("criterionId");

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_hackathonId_fkey" FOREIGN KEY ("hackathonId") REFERENCES "hackathons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "hackathon_tracks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "hackathon_challenges"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "team_repositories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "judging_criteria" ADD CONSTRAINT "judging_criteria_hackathonId_fkey" FOREIGN KEY ("hackathonId") REFERENCES "hackathons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "judge_assignments" ADD CONSTRAINT "judge_assignments_hackathonId_fkey" FOREIGN KEY ("hackathonId") REFERENCES "hackathons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "judge_assignments" ADD CONSTRAINT "judge_assignments_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "judge_assignments" ADD CONSTRAINT "judge_assignments_judgeUserId_fkey" FOREIGN KEY ("judgeUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "judge_assignments" ADD CONSTRAINT "judge_assignments_assignedByUserId_fkey" FOREIGN KEY ("assignedByUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "judge_evaluations" ADD CONSTRAINT "judge_evaluations_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "judge_assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "judge_evaluations" ADD CONSTRAINT "judge_evaluations_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "judge_evaluations" ADD CONSTRAINT "judge_evaluations_judgeUserId_fkey" FOREIGN KEY ("judgeUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluation_scores" ADD CONSTRAINT "evaluation_scores_evaluationId_fkey" FOREIGN KEY ("evaluationId") REFERENCES "judge_evaluations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluation_scores" ADD CONSTRAINT "evaluation_scores_criterionId_fkey" FOREIGN KEY ("criterionId") REFERENCES "judging_criteria"("id") ON DELETE CASCADE ON UPDATE CASCADE;
