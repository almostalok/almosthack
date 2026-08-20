-- CreateEnum
CREATE TYPE "ResultSetStatus" AS ENUM ('CALCULATED', 'UNDER_REVIEW', 'APPROVED', 'PUBLISHED', 'SUPERSEDED');

-- CreateEnum
CREATE TYPE "ResultEligibilityStatus" AS ENUM ('ELIGIBLE', 'INELIGIBLE', 'PENDING_REVIEW');

-- CreateTable
CREATE TABLE "result_sets" (
    "id" TEXT NOT NULL,
    "hackathonId" TEXT NOT NULL,
    "status" "ResultSetStatus" NOT NULL DEFAULT 'CALCULATED',
    "calculationVersion" INTEGER NOT NULL DEFAULT 1,
    "scoringConfigVersion" INTEGER NOT NULL DEFAULT 1,
    "tieBreakRule" TEXT NOT NULL DEFAULT 'WEIGHTED_CRITERIA_THEN_CONSENSUS',
    "inputFingerprint" TEXT NOT NULL,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "approvedByUserId" TEXT,
    "publishedByUserId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "result_sets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "result_entries" (
    "id" TEXT NOT NULL,
    "resultSetId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "trackId" TEXT,
    "score" DOUBLE PRECISION NOT NULL,
    "rank" INTEGER NOT NULL,
    "eligibilityStatus" "ResultEligibilityStatus" NOT NULL DEFAULT 'ELIGIBLE',
    "eligibilityReason" TEXT,
    "isWinner" BOOLEAN NOT NULL DEFAULT false,
    "awardTitle" TEXT,
    "judgeCount" INTEGER NOT NULL DEFAULT 0,
    "scoreBreakdown" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "result_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "result_sets_hackathonId_idx" ON "result_sets"("hackathonId");

-- CreateIndex
CREATE INDEX "result_sets_hackathonId_status_idx" ON "result_sets"("hackathonId", "status");

-- CreateIndex
CREATE INDEX "result_sets_status_idx" ON "result_sets"("status");

-- CreateIndex
CREATE INDEX "result_sets_inputFingerprint_idx" ON "result_sets"("inputFingerprint");

-- CreateIndex
CREATE INDEX "result_entries_resultSetId_idx" ON "result_entries"("resultSetId");

-- CreateIndex
CREATE INDEX "result_entries_resultSetId_rank_idx" ON "result_entries"("resultSetId", "rank");

-- CreateIndex
CREATE INDEX "result_entries_teamId_idx" ON "result_entries"("teamId");

-- CreateIndex
CREATE INDEX "result_entries_submissionId_idx" ON "result_entries"("submissionId");

-- CreateIndex
CREATE INDEX "result_entries_trackId_idx" ON "result_entries"("trackId");

-- CreateIndex
CREATE UNIQUE INDEX "result_entries_resultSetId_teamId_key" ON "result_entries"("resultSetId", "teamId");

-- AddForeignKey
ALTER TABLE "result_sets" ADD CONSTRAINT "result_sets_hackathonId_fkey" FOREIGN KEY ("hackathonId") REFERENCES "hackathons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "result_sets" ADD CONSTRAINT "result_sets_approvedByUserId_fkey" FOREIGN KEY ("approvedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "result_sets" ADD CONSTRAINT "result_sets_publishedByUserId_fkey" FOREIGN KEY ("publishedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "result_entries" ADD CONSTRAINT "result_entries_resultSetId_fkey" FOREIGN KEY ("resultSetId") REFERENCES "result_sets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "result_entries" ADD CONSTRAINT "result_entries_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "result_entries" ADD CONSTRAINT "result_entries_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "result_entries" ADD CONSTRAINT "result_entries_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "hackathon_tracks"("id") ON DELETE SET NULL ON UPDATE CASCADE;
