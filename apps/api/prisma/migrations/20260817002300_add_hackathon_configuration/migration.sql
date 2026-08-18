-- CreateEnum
CREATE TYPE "ParticipationMode" AS ENUM ('INDIVIDUAL', 'TEAM', 'BOTH');

-- CreateEnum
CREATE TYPE "EligibilityType" AS ENUM ('OPEN', 'STUDENTS_ONLY', 'INVITE_ONLY');

-- CreateEnum
CREATE TYPE "AIUsagePolicy" AS ENUM ('ALLOWED', 'RESTRICTED', 'PROHIBITED');

-- CreateEnum
CREATE TYPE "PreExistingCodePolicy" AS ENUM ('PROHIBITED', 'ALLOWED', 'ALLOWED_WITH_DISCLOSURE');

-- CreateEnum
CREATE TYPE "OpenSourcePolicy" AS ENUM ('ALLOWED', 'ALLOWED_WITH_ATTRIBUTION', 'RESTRICTED', 'PROHIBITED');

-- CreateEnum
CREATE TYPE "RepositoryPolicy" AS ENUM ('PLATFORM_MANAGED', 'EXTERNAL_ALLOWED');

-- CreateTable
CREATE TABLE "hackathon_configurations" (
    "id" TEXT NOT NULL,
    "hackathonId" TEXT NOT NULL,
    "participationMode" "ParticipationMode" NOT NULL DEFAULT 'BOTH',
    "minTeamSize" INTEGER DEFAULT 1,
    "maxTeamSize" INTEGER DEFAULT 4,
    "eligibilityType" "EligibilityType" NOT NULL DEFAULT 'OPEN',
    "allowedBranches" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "allowedColleges" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "graduationYearFrom" INTEGER,
    "graduationYearTo" INTEGER,
    "aiUsagePolicy" "AIUsagePolicy" NOT NULL DEFAULT 'ALLOWED',
    "aiDisclosureRequired" BOOLEAN NOT NULL DEFAULT false,
    "preExistingCodePolicy" "PreExistingCodePolicy" NOT NULL DEFAULT 'PROHIBITED',
    "openSourcePolicy" "OpenSourcePolicy" NOT NULL DEFAULT 'ALLOWED_WITH_ATTRIBUTION',
    "githubRequired" BOOLEAN NOT NULL DEFAULT true,
    "repositoryPolicy" "RepositoryPolicy" NOT NULL DEFAULT 'PLATFORM_MANAGED',
    "rulesMarkdown" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hackathon_configurations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "hackathon_configurations_hackathonId_key" ON "hackathon_configurations"("hackathonId");

-- AddForeignKey
ALTER TABLE "hackathon_configurations" ADD CONSTRAINT "hackathon_configurations_hackathonId_fkey" FOREIGN KEY ("hackathonId") REFERENCES "hackathons"("id") ON DELETE CASCADE ON UPDATE CASCADE;
