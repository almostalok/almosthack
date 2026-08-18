# ADR S2-04: Participant Registration Architecture

## Status
Accepted

## Context
Following the completion of Hackathon Core Lifecycle (S2-01), Configuration & Rules (S2-02), and Tracks & Challenges (S2-03), AlmostHack requires participant registration (S2-04) that enables authenticated users to register for published hackathons, select tracks/challenges, manage their enrollment, and withdraw according to server-authoritative rules.

## Decision

### 1. Domain Modeling
- Created `ParticipantRegistration` table in PostgreSQL mapped to Prisma.
- Fields: `id` (UUID), `hackathonId`, `userId`, `trackId` (nullable), `challengeId` (nullable), `status` (`REGISTERED` / `WITHDRAWN`), `registeredAt`, `withdrawnAt`, `createdAt`, `updatedAt`.
- Unique constraint: `@@unique([hackathonId, userId])` enforces one registration record per user per hackathon at the database layer.

### 2. Authorization & Invariant Validation
- Current authenticated session identity (`CurrentUser`) dictates the registered `userId`. Client-supplied user identities are rejected.
- Registration window is evaluated against S2-01 authoritative registration window: $[registrationStartsAt, registrationEndsAt)$.
- Hackathon lifecycle state is verified: registrations are rejected if hackathon is `DRAFT`, `COMPLETED`, or `ARCHIVED`.
- User eligibility is verified against S2-02 `HackathonConfiguration` constraints (student status, allowed colleges, allowed branches, graduation year boundaries).
- Track and Challenge parent scoping is validated: selected track must belong to the hackathon; selected challenge must belong to the selected track and be in `PUBLISHED` status.

### 3. Re-Registration & State Machine
- When a user withdraws (`status = WITHDRAWN`, `withdrawnAt = now()`), their record is preserved for auditing.
- If the user re-registers while the registration window remains open, the existing row is reactivated (`status = REGISTERED`, `withdrawnAt = null`, `registeredAt = now()`) atomically inside a Prisma transaction, preventing duplicate rows or unique constraint violations.

### 4. Concurrency & Race Condition Defense
- Database-level composite unique constraint `(hackathonId, userId)` guarantees that parallel registration requests from simultaneous browser tabs or automated tools result in exactly 1 successful registration and 1 graceful `409 Conflict (REGISTRATION_ALREADY_EXISTS)`.

### 5. Audit Logging
- Emits structured audit log entries atomically within database transactions:
  - `participant.registration_created`
  - `participant.registration_updated`
  - `participant.registration_withdrawn`

### 6. Scope Discipline
- Strictly out of scope: Teams, Team formation, GitHub repository orchestration, Submissions, Judging, Scoring, Analytics.

## Consequences
- Clean separation between participant registration identity and future team aggregation models.
- Immutable server-side eligibility and lifecycle enforcement.
