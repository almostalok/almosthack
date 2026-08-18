-- CreateEnum
CREATE TYPE "ParticipantRegistrationStatus" AS ENUM ('REGISTERED', 'WITHDRAWN');

-- CreateTable
CREATE TABLE "participant_registrations" (
    "id" TEXT NOT NULL,
    "hackathonId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "trackId" TEXT,
    "challengeId" TEXT,
    "status" "ParticipantRegistrationStatus" NOT NULL DEFAULT 'REGISTERED',
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "withdrawnAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "participant_registrations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "participant_registrations_hackathonId_idx" ON "participant_registrations"("hackathonId");

-- CreateIndex
CREATE INDEX "participant_registrations_userId_idx" ON "participant_registrations"("userId");

-- CreateIndex
CREATE INDEX "participant_registrations_status_idx" ON "participant_registrations"("status");

-- CreateIndex
CREATE UNIQUE INDEX "participant_registrations_hackathonId_userId_key" ON "participant_registrations"("hackathonId", "userId");

-- AddForeignKey
ALTER TABLE "participant_registrations" ADD CONSTRAINT "participant_registrations_hackathonId_fkey" FOREIGN KEY ("hackathonId") REFERENCES "hackathons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participant_registrations" ADD CONSTRAINT "participant_registrations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participant_registrations" ADD CONSTRAINT "participant_registrations_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "hackathon_tracks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participant_registrations" ADD CONSTRAINT "participant_registrations_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "hackathon_challenges"("id") ON DELETE SET NULL ON UPDATE CASCADE;
