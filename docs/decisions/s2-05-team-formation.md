# ADR S2-05: Teams & Team Formation Architecture

## Status
Accepted

## Context
Following Participant Registration (S2-04), AlmostHack requires a robust, secure, and auditable team formation domain (S2-05). Registered participants must be able to create teams, become team Captains automatically, invite other eligible registered participants, manage team membership, transfer captaincy, leave teams, and dissolve teams, while strictly enforcing one-team-per-hackathon invariants, team size limits, and participation modes.

## Decision

### 1. Domain Modeling
- Extended PostgreSQL schema with 3 new tables: `Team`, `TeamMember`, and `TeamInvitation`.
- **`Team`**: `id` (UUID), `hackathonId`, `name`, `slug`, `description`, `status` (`ACTIVE`, `DISSOLVED`), `dissolvedAt`, `dissolvedByUserId`, `createdAt`, `updatedAt`.
  - Unique constraint: `@@unique([hackathonId, slug])` ensures team slugs are unique per hackathon.
- **`TeamMember`**: `id` (UUID), `teamId`, `userId`, `role` (`CAPTAIN`, `MEMBER`), `status` (`ACTIVE`, `LEFT`), `joinedAt`, `leftAt`, `createdAt`, `updatedAt`.
  - Unique constraint: `@@unique([teamId, userId])` prevents duplicate member records in the same team.
- **`TeamInvitation`**: `id` (UUID), `teamId`, `inviteeUserId`, `invitedByUserId`, `status` (`PENDING`, `ACCEPTED`, `DECLINED`, `CANCELLED`, `EXPIRED`), `expiresAt`, `respondedAt`, `createdAt`, `updatedAt`.
  - Index: `@@index([teamId, inviteeUserId, status])` for fast membership and invitation lookups.

### 2. Authorization & Invariant Enforcement
- **Registration Prerequisite**: Only participants with an active `ParticipantRegistration` (`REGISTERED`) in the hackathon can create or join teams.
- **One-Team-Per-Hackathon Invariant**: A participant can belong to at most one active team per hackathon. Checked and enforced via transactional row-level locks on `ParticipantRegistration`.
- **Captain Invariant**:
  - Team creator automatically becomes the `CAPTAIN`.
  - A team must have exactly one active Captain at all times.
  - A Captain cannot leave directly without transferring captaincy to an active member or dissolving the team.
- **Participation Mode & Team Size**:
  - If `participationMode === 'INDIVIDUAL'`, team creation is rejected (`409 Conflict`).
  - `minTeamSize` and `maxTeamSize` from S2-02 `HackathonConfiguration` are strictly enforced on invitations and acceptance.

### 3. Invitation State Machine
- `PENDING` $\to$ `ACCEPTED`: Updates invitation, creates/reactivates `TeamMember`, and automatically cancels all other pending invitations for the user in the hackathon.
- `PENDING` $\to$ `DECLINED`: Invitee rejects invitation.
- `PENDING` $\to$ `CANCELLED`: Team Captain cancels pending invitation.
- `PENDING` $\to$ `EXPIRED`: 7-day TTL expiration checked dynamically.

### 4. Concurrency & Race Condition Defense
- Database interactive transactions (`prisma.$transaction`) with participant registration row-locking serialize concurrent team creation and invitation acceptance.
- Parallel duplicate `createTeam` requests safely resolve to 1 `201 Created` and subsequent `409 Conflict (ALREADY_ON_TEAM)`.

### 5. Audit Logging & Realtime Events
- Emits structured audit logs and domain events within mutation transactions:
  - `team.created`
  - `team.updated`
  - `team.dissolved`
  - `team.invitation_created`
  - `team.invitation_cancelled`
  - `team.invitation_declined`
  - `team.member_joined`
  - `team.member_left`
  - `team.member_removed`
  - `team.captain_transferred`

### 6. Scope Discipline
- Strictly out of scope: GitHub OAuth, repository creation/linking, commit tracking, submissions, judging, scoring, leaderboards, plagiarism, appeals, sponsors, messaging, notifications infrastructure, analytics.

## Consequences
- Complete, type-safe team formation engine providing high consistency and auditability.
- Seamless frontend dashboard integration for participants and captains.
