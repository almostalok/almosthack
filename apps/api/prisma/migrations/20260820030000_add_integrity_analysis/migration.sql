-- CreateEnum
CREATE TYPE "IntegrityAnalysisStatus" AS ENUM ('QUEUED', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "IntegrityFindingType" AS ENUM ('CODE_SIMILARITY', 'FILE_OVERLAP', 'STRUCTURAL_SIMILARITY', 'SUSPICIOUS_COPY_PATTERN');

-- CreateEnum
CREATE TYPE "IntegrityFindingStatus" AS ENUM ('OPEN', 'UNDER_REVIEW', 'CONFIRMED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "IntegritySeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateTable
CREATE TABLE "integrity_analyses" (
    "id" TEXT NOT NULL,
    "hackathonId" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "repositoryId" TEXT,
    "commitSha" TEXT NOT NULL,
    "status" "IntegrityAnalysisStatus" NOT NULL DEFAULT 'QUEUED',
    "engineVersion" TEXT NOT NULL DEFAULT '1.0.0',
    "configurationVersion" INTEGER NOT NULL DEFAULT 1,
    "summary" JSONB,
    "failureReason" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "integrity_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "integrity_findings" (
    "id" TEXT NOT NULL,
    "analysisId" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "comparisonSubmissionId" TEXT NOT NULL,
    "type" "IntegrityFindingType" NOT NULL,
    "severity" "IntegritySeverity" NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "similarity" DOUBLE PRECISION NOT NULL,
    "status" "IntegrityFindingStatus" NOT NULL DEFAULT 'OPEN',
    "summary" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "integrity_findings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "integrity_evidence" (
    "id" TEXT NOT NULL,
    "findingId" TEXT NOT NULL,
    "sourcePath" TEXT NOT NULL,
    "targetPath" TEXT NOT NULL,
    "sourceStart" INTEGER NOT NULL,
    "sourceEnd" INTEGER NOT NULL,
    "targetStart" INTEGER NOT NULL,
    "targetEnd" INTEGER NOT NULL,
    "matchedFragmentHash" TEXT,
    "similarityMetric" DOUBLE PRECISION,
    "sourceSnippet" TEXT,
    "targetSnippet" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "integrity_evidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "integrity_reviews" (
    "id" TEXT NOT NULL,
    "findingId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "fromStatus" "IntegrityFindingStatus" NOT NULL,
    "toStatus" "IntegrityFindingStatus" NOT NULL,
    "reason" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "integrity_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "integrity_analyses_hackathonId_idx" ON "integrity_analyses"("hackathonId");

-- CreateIndex
CREATE INDEX "integrity_analyses_submissionId_idx" ON "integrity_analyses"("submissionId");

-- CreateIndex
CREATE INDEX "integrity_analyses_status_idx" ON "integrity_analyses"("status");

-- CreateIndex
CREATE INDEX "integrity_findings_analysisId_idx" ON "integrity_findings"("analysisId");

-- CreateIndex
CREATE INDEX "integrity_findings_submissionId_idx" ON "integrity_findings"("submissionId");

-- CreateIndex
CREATE INDEX "integrity_findings_comparisonSubmissionId_idx" ON "integrity_findings"("comparisonSubmissionId");

-- CreateIndex
CREATE INDEX "integrity_findings_status_idx" ON "integrity_findings"("status");

-- CreateIndex
CREATE INDEX "integrity_findings_severity_idx" ON "integrity_findings"("severity");

-- CreateIndex
CREATE INDEX "integrity_evidence_findingId_idx" ON "integrity_evidence"("findingId");

-- CreateIndex
CREATE INDEX "integrity_reviews_findingId_idx" ON "integrity_reviews"("findingId");

-- CreateIndex
CREATE INDEX "integrity_reviews_reviewerId_idx" ON "integrity_reviews"("reviewerId");

-- AddForeignKey
ALTER TABLE "integrity_analyses" ADD CONSTRAINT "integrity_analyses_hackathonId_fkey" FOREIGN KEY ("hackathonId") REFERENCES "hackathons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "integrity_analyses" ADD CONSTRAINT "integrity_analyses_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "integrity_analyses" ADD CONSTRAINT "integrity_analyses_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "team_repositories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "integrity_findings" ADD CONSTRAINT "integrity_findings_analysisId_fkey" FOREIGN KEY ("analysisId") REFERENCES "integrity_analyses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "integrity_findings" ADD CONSTRAINT "integrity_findings_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "integrity_findings" ADD CONSTRAINT "integrity_findings_comparisonSubmissionId_fkey" FOREIGN KEY ("comparisonSubmissionId") REFERENCES "submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "integrity_evidence" ADD CONSTRAINT "integrity_evidence_findingId_fkey" FOREIGN KEY ("findingId") REFERENCES "integrity_findings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "integrity_reviews" ADD CONSTRAINT "integrity_reviews_findingId_fkey" FOREIGN KEY ("findingId") REFERENCES "integrity_findings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "integrity_reviews" ADD CONSTRAINT "integrity_reviews_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
