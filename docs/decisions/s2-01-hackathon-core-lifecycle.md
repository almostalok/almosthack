# ADR S2-01: Hackathon Core & Lifecycle

## Status

Accepted

## Context

AlmostHack Sprint 2 Task 01 establishes the foundational vertical slice for Hackathon Core & Lifecycle management. A hackathon represents an auditable operating shell under which rounds, submissions, judging, repositories, and leaderboards will execute.

## Architectural Principles & Decisions

### 1. Organization Ownership & Authorization Boundary

- Every `Hackathon` belongs to exactly one `Organization` (`organizationId`).
- A `Hackathon` cannot exist without an organization context.
- Authorization is strictly organization-scoped (`OrganizationMember` role mapping -> `OWNER`, `ADMIN`, `MEMBER`). Platform user roles alone (such as `ORGANIZER`) do not grant access to private organization hackathons.

### 2. Independent Lifecycle vs Registration State Machine

- `HackathonStatus` (`DRAFT`, `PUBLISHED`, `LIVE`, `COMPLETED`, `ARCHIVED`) governs the macro event lifecycle.
- `RegistrationStatus` (`NOT_OPEN`, `OPEN`, `CLOSED`) is derived independently from `registrationStartsAt`, `registrationEndsAt`, and current server UTC time.
- Future sprint states (rounds, submissions, judging) MUST NOT be conflated into hackathon status.

### 3. Server-Authoritative Time & Derived Live State

- All timestamp evaluations use server/database UTC time. Browser/client local clocks are ignored for lifecycle state derivation.
- Clients cannot arbitrarily set `status = LIVE` or `status = COMPLETED` via generic PATCH APIs.
- When an event is `PUBLISHED`, `LIVE` is derived when `now >= startsAt` and `COMPLETED` is derived when `now >= endsAt`.

### 4. Explicit Lifecycle Operations

- `DRAFT` -> `PUBLISHED` via `POST /api/v1/hackathons/:id/publish`.
- `COMPLETED` -> `ARCHIVED` via `POST /api/v1/hackathons/:id/archive`.
- Generic updates (`PATCH /api/v1/hackathons/:id`) explicitly reject state mutation fields (`status`, `publishedAt`, `completedAt`, `archivedAt`).

### 5. Chronological Date Invariants

- Enforced at API boundary and service layer:
  - `registrationStartsAt < registrationEndsAt`
  - `registrationEndsAt <= startsAt`
  - `startsAt < endsAt`

### 6. Timezone & Slug Strategy

- Timestamps stored in canonical UTC ISO 8601 format.
- IANA timezone identifier stored separately (e.g. `Asia/Kolkata`, `America/New_York`, `UTC`) for presentation formatting.
- Slugs are unique per organization (`@@unique([organizationId, slug])`).

### 7. Audit & Concurrency

- Every lifecycle change records an `AuditLog` entry (`hackathon.created`, `hackathon.updated`, `hackathon.published`, `hackathon.archived`).
- Transactions and conditional state checks protect against race conditions.

## Consequences

- Prevents status conflation across future round, submission, and judging state machines.
- Guarantees strict cross-organization access isolation.
- Establishes a predictable foundation for future Sprint 2 tasks (Rounds, Registrations, Submissions).
