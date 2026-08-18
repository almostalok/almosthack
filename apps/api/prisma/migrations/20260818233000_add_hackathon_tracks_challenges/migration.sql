-- CreateEnum
CREATE TYPE "ChallengeStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "hackathon_tracks" (
    "id" TEXT NOT NULL,
    "hackathonId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "shortDescription" TEXT,
    "description" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hackathon_tracks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hackathon_challenges" (
    "id" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "problemStatement" TEXT NOT NULL,
    "requirements" TEXT,
    "constraints" TEXT,
    "expectedOutcome" TEXT,
    "resources" JSONB NOT NULL DEFAULT '[]',
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "status" "ChallengeStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hackathon_challenges_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "hackathon_tracks_hackathonId_idx" ON "hackathon_tracks"("hackathonId");

-- CreateIndex
CREATE INDEX "hackathon_tracks_displayOrder_idx" ON "hackathon_tracks"("displayOrder");

-- CreateIndex
CREATE UNIQUE INDEX "hackathon_tracks_hackathonId_slug_key" ON "hackathon_tracks"("hackathonId", "slug");

-- CreateIndex
CREATE INDEX "hackathon_challenges_trackId_idx" ON "hackathon_challenges"("trackId");

-- CreateIndex
CREATE INDEX "hackathon_challenges_status_idx" ON "hackathon_challenges"("status");

-- CreateIndex
CREATE INDEX "hackathon_challenges_displayOrder_idx" ON "hackathon_challenges"("displayOrder");

-- CreateIndex
CREATE UNIQUE INDEX "hackathon_challenges_trackId_slug_key" ON "hackathon_challenges"("trackId", "slug");

-- AddForeignKey
ALTER TABLE "hackathon_tracks" ADD CONSTRAINT "hackathon_tracks_hackathonId_fkey" FOREIGN KEY ("hackathonId") REFERENCES "hackathons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hackathon_challenges" ADD CONSTRAINT "hackathon_challenges_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "hackathon_tracks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
