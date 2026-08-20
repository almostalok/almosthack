# AlmostHack Architecture Specification

## Overview

AlmostHack is built as a single monorepo structured around a **Modular Monolith** backend architecture and a feature-organized Next.js frontend application.

```
almosthack/
├── apps/
│   ├── api/       # NestJS Modular Monolith API Engine
│   ├── web/       # Next.js App Router Web Interface
│   └── worker/    # NestJS Async Background Worker
└── packages/
    ├── api-client/     # Framework-agnostic typed HTTP client & error normalization
    ├── config/         # Shared TypeScript and tooling configurations
    ├── design-system/  # Core design tokens, global styles, and Tailwind utilities
    ├── events/         # Standalone event contracts, envelopes, and versioning
    ├── hooks/          # Shared custom React hooks
    ├── types/          # Shared TypeScript domain contracts and API types
    ├── ui/             # Cross-application reusable UI component library
    ├── utils/          # Generic stateless utility functions
    └── validation/     # Shared Zod validation schemas for shared query & boundary contracts
```

---

## Architectural Principles

### 1. Modular Monolith Backend (`apps/api`)
The backend is designed as a modular monolith using NestJS. Rather than microservices, domain boundaries are isolated within dedicated NestJS modules inside `apps/api/src/modules/`:
- `auth/`: Authentication & authorization guard scaffolding
- `users/`: User profiles, credentials, and user preferences
- `organizations/`: Organization management & team memberships
- `hackathons/`: Hackathon lifecycle, configuration, & schedules
- `rounds/`: Judging rounds, criteria, and submissions routing
- `teams/`: Participant team formation and roster management
- `repositories/`: GitHub repository connections & SHA commit tracking
- `submissions/`: Project submissions, code links, & metadata
- `judging/`: Double-blind calibrated judging, scoring, & consensus
- `integrity/`: Code integrity checking & plagiarism detection boundary
- `results/`: Deterministic score aggregation, competition ranking, approval workflow, & public leaderboard
- `appeals/`: Score dispute resolution and audit trail review
- `notifications/`: User alert delivery & event broadcasts
- `audit/`: Immutable audit logging & verification streams

### 2. Monorepo Package Boundaries (`packages/`)
- **`packages/api-client`**: Framework-agnostic HTTP communication layer (`@almosthack/api-client`) handling request ID propagation, response normalization, timeout handling, and typed HTTP methods.
- **`packages/config`**: Base TypeScript configurations (`tsconfig.base.json`).
- **`packages/design-system`**: Design tokens (`colors.ts`, `typography.ts`, `animations.ts`) and global CSS definitions.
- **`packages/events`**: Standalone event contract envelope (`@almosthack/events`) defining immutable event metadata (`id`, `type`, `version`, `occurredAt`, `correlationId`, `payload`).
- **`packages/hooks`**: Custom client React hooks (`useTheme`, `useKeyboardShortcuts`, `useCommandPalette`).
- **`packages/types`**: Cross-boundary interfaces (`user.ts`, `auth.ts`, `audit.ts`, `rbac.ts`, `api.ts`).
- **`packages/ui`**: Atomic and complex UI components (`Button`, `Card`, `CommandPalette`, `SidebarNav`, `TopHeader`).
- **`packages/utils`**: Pure, stateless helper utilities (`cn`, `formatters`).
- **`packages/validation`**: Shared Zod schemas (`@almosthack/validation`) for cross-boundary contracts (pagination, identifiers, sort parameters).

### 5. Authentication Architecture (Server-Side Session Authentication)
- **Primary Credential**: Opaque 32-byte cryptographically secure random session token stored in HttpOnly cookie (`almosthack_session`).
- **Database Storage**: PostgreSQL `sessions` table storing SHA-256 token hash (`tokenHash`), expiration date (7 days), active status (`revokedAt IS NULL`), IP address, and user agent.
- **Session Protection**: `SessionAuthGuard` validates token hash, checks revocation and absolute expiration, attaches authenticated identity (`request.user`) to NestJS execution context.
- **Password Hashing**: `bcrypt` with cost factor 10.
- **Role Foundation**: Automatic server-side assignment of `RoleName.PARTICIPANT` on registration. Client cannot override roles.
- **API Client Integration**: `@almosthack/api-client` configured with `credentials: 'include'` for cross-origin cookie transmission.

### 6. User Identity & Profile Architecture (`S1-02`)
- **Data Model**: Profile fields (`college`, `branch`, `graduationYear`, `skills`, `linkedinUrl`, `portfolioUrl`, `avatarUrl`, `bio`) reside on the `User` model in PostgreSQL, ensuring single-table read performance (0 JOIN overhead) and simple lifecycle management.
- **Endpoints**: `GET /api/v1/users/me` (profile retrieval) & `PATCH /api/v1/users/me` (partial profile update).
- **Ownership & Authorization**: Derived exclusively from authenticated session (`SessionAuthGuard` + `@CurrentUser()`). Body `userId` parameter is rejected.
- **Security & Whitelist**: Forbidden fields (`id`, `email`, `roles`, `passwordHash`, `isVerified`, `createdAt`, `updatedAt`, `sessions`) are excluded from DTO and automatically rejected with 400 Bad Request if supplied.
- **URL & Input Hardening**: String normalization (trimming), skills deduplication, and URL protocol checks (`http://` / `https://` required, `javascript:` protocol rejected).

### 7. RBAC & Authorization Foundation (`S1-03`)
- **Core Pipeline**: `HTTP Request` → `SessionAuthGuard` (Authentication) → `PermissionsGuard` (Authorization) → `AuthorizationService` (Evaluation) → `Controller Action`.
- **Role Model**: 6 canonical roles (`ADMIN`, `ORGANIZER`, `JUDGE`, `PARTICIPANT`, `MENTOR`, `SPONSOR`), strictly server-controlled.
- **Permission Registry**: Strongly-typed `Permission` constants and `PermissionAction` union string values in `@almosthack/types`.
- **Least Privilege & Admin Semantics**: Roles mapped strictly to permissions (`ROLE_PERMISSIONS`). `ADMIN` receives explicit platform permissions without hidden code bypasses.
- **Scope Contract Abstraction**: Standardized representation for `GLOBAL`, `ORGANIZATION`, `HACKATHON`, `ROUND`, `TEAM`, `SUBMISSION` scopes via `@RequireScope(...)`. Scope IDs are not blindly trusted and will be evaluated by domain-specific resource resolvers.
- **Deny-by-Default & Security**: Unauthenticated requests yield `401 Unauthorized`. Forbidden requests yield generic `403 Forbidden` (`FORBIDDEN`) without leaking permission metadata to clients. Failed authorization attempts for protected actions log `AUTHORIZATION_DENIED` to `AuditLog`.
- **Test Endpoint Isolation**: Development test routes under `/api/v1/auth/test/*` are disabled with 403 Forbidden when `NODE_ENV === 'production'`.

### 8. Organization Domain & Scoped Authorization (`S1-04`)
- **Resource Boundary**: Real, persistent organization resource model (`Organization` and `OrganizationMember`).
- **Platform vs Organization Roles**: Platform roles (`RoleName`) and Organization roles (`OrganizationRole`: `OWNER`, `ADMIN`, `MEMBER`) are strictly decoupled. Organization membership is required for organization-scoped operations.
- **Transactional Invariants**: Every organization is created transactionally with an initial `OWNER`. Sole `OWNER` cannot be demoted or removed. Ownership transfer is atomic (New owner → `OWNER`, Old owner → `ADMIN`).
- **Scoped Authorization**: Scoped routes evaluate caller's database `OrganizationMember` role permissions via `AuthorizationService.canAsync`. Platform `ADMIN` retains explicit `PLATFORM_ORGANIZATION_MANAGE` operational access.
- **Slug Strategy**: Conservative URL-safe slug regex (`[a-z0-9]+(?:-[a-z0-9]+)*`), deterministic normalization, and explicit `409 Conflict` (`ORGANIZATION_SLUG_CONFLICT`) on collision.
- **Destructive Deletion**: Hard deletion of organization and members inside a transaction, requiring explicit body confirmation matching the organization slug.

### 9. Hackathon Core & Lifecycle Architecture (`S2-01`)
- **Resource Ownership**: Every `Hackathon` belongs to exactly one `Organization` (`organizationId`), creating an unambiguous authorization and multi-tenant isolation boundary.
- **State Machine**: Canonical lifecycle states: `DRAFT`, `PUBLISHED`, `LIVE`, `COMPLETED`, `ARCHIVED`. State transitions strictly enforced (`DRAFT` → `PUBLISHED` via `/publish`, `COMPLETED` → `ARCHIVED` via `/archive`).
- **Independent Registration State**: `RegistrationStatus` (`NOT_OPEN`, `OPEN`, `CLOSED`) is derived independently from registration window timestamps and server UTC time. Hackathon status never conflates registration, round, or submission states.
- **Server-Authoritative Time**: All lifecycle evaluations derive effective state from database server UTC timestamps (`startsAt`, `endsAt`, `registrationStartsAt`, `registrationEndsAt`). Client local browser clocks are ignored.
- **Organization-Scoped Slugs**: Slugs are unique per organization (`organizationId` + `slug` unique constraint), allowing `org-a/hackathon` and `org-b/hackathon` to coexist.
- **Editability Rules**:
  - `DRAFT`: all configuration fields editable.
  - `PUBLISHED`: safe metadata and schedule adjustments permitted.
  - `LIVE`: schedule fields restricted from casual modification.
  - `COMPLETED` & `ARCHIVED`: read-only operationally.
- **Audit Trails**: All lifecycle actions emit structured `AuditLog` events (`hackathon.created`, `hackathon.updated`, `hackathon.published`, `hackathon.archived`).

### 10. Hackathon Configuration & Rules Architecture (`S2-02`)
- **1-to-1 Configuration Entity**: `HackathonConfiguration` entity linked strictly 1-to-1 with `Hackathon` via `hackathonId` with `onDelete: Cascade`. Auto-created on hackathon creation with default settings.
- **Strongly Typed Policies**: Enums enforce `ParticipationMode` (`INDIVIDUAL`, `TEAM`, `BOTH`), `EligibilityType` (`OPEN`, `STUDENTS_ONLY`, `INVITE_ONLY`), `AIUsagePolicy` (`ALLOWED`, `RESTRICTED`, `PROHIBITED`), `PreExistingCodePolicy` (`PROHIBITED`, `ALLOWED`, `ALLOWED_WITH_DISCLOSURE`), `OpenSourcePolicy` (`ALLOWED`, `ALLOWED_WITH_ATTRIBUTION`, `RESTRICTED`, `PROHIBITED`), and `RepositoryPolicy` (`PLATFORM_MANAGED`, `EXTERNAL_ALLOWED`).
- **Policy Invariants**:
  - `INDIVIDUAL` participation mode normalizes `minTeamSize` and `maxTeamSize` to `null`.
  - `TEAM`/`BOTH` modes enforce `1 <= minTeamSize <= maxTeamSize <= 100`.
  - Academic eligibility supports array normalization (trimmed, deduplicated case-insensitively) and graduation year range validation (`graduationYearFrom <= graduationYearTo`).
- **Lifecycle Locking**: Core policy fields and human-readable markdown rules become immutable/locked once the effective status reaches `LIVE`, `COMPLETED`, or `ARCHIVED` (`409 HACKATHON_CONFIGURATION_LOCKED`).
- **Visibility & Rules Access**: Public published/live hackathon rules are publicly readable (`GET /hackathons/:id/rules`). Private or DRAFT hackathons require `HACKATHON_READ` authorization.
- **Audit Trails**: Policy configuration updates and markdown rules modifications produce structured `AuditLog` records (`hackathon.configuration_updated`, `hackathon.rules_updated`).

### 11. Hackathon Tracks & Challenges Architecture (`S2-03`)
- **Domain Hierarchy**: `Organization -> Hackathon -> Tracks -> Challenges`
  - `HackathonTrack`: Belongs 1:N to `Hackathon` (`onDelete: Cascade`). Slugs scoped per hackathon (`@@unique([hackathonId, slug])`).
  - `HackathonChallenge`: Belongs 1:N to `HackathonTrack` (`onDelete: Cascade`). Slugs scoped per track (`@@unique([trackId, slug])`).
- **Challenge Content Model**: Explicit structured fields (`description`, `problemStatement`, `requirements`, `constraints`, `expectedOutcome`, `resources`).
- **Resource Security**: `resources` JSON array validated for safe protocols (`http:`, `https:`), rejecting dangerous URL schemes (`javascript:`, `data:`, `file:`, `vbscript:`). Max 20 resources per challenge.
- **Ordering & Reordering**: Deterministic integer `displayOrder` with batch transactional reordering APIs (`PATCH /hackathons/:id/tracks/reorder`, `PATCH /tracks/:id/challenges/reorder`).
- **Challenge Lifecycle Status**: `DRAFT`, `PUBLISHED`, `ARCHIVED`. Subordinate to Hackathon lifecycle; draft challenges are hidden from public queries.
- **LIVE Immutability**: All structural mutations (create, update, delete, reorder) for Tracks and Challenges are locked once Hackathon reaches `LIVE`, `COMPLETED`, or `ARCHIVED` (`409 HACKATHON_CONFIGURATION_LOCKED`).
- **Multi-Tenant Isolation & Nested Scope**: Validates parent-child relationships and organization membership. Cross-tenant or mismatched parent accesses are rejected with `403 Forbidden` / `404 Not Found`.
- **Audit Trails**: Track and Challenge CRUD/reorder mutations emit structured `AuditLog` records (`hackathon.track_created`, `hackathon.track_updated`, `hackathon.track_deleted`, `hackathon.tracks_reordered`, `hackathon.challenge_created`, `hackathon.challenge_updated`, `hackathon.challenge_deleted`, `hackathon.challenges_reordered`).

### 12. Participant Registration Architecture (`S2-04`)
- **Domain Hierarchy**: `User -> ParticipantRegistration -> Hackathon (-> Track -> Challenge)`
  - `ParticipantRegistration`: Belongs to `User` and `Hackathon`. `@@unique([hackathonId, userId])` enforces one registration per participant per hackathon at the database layer.
- **Server-Authoritative Evaluation**:
  - Registration window is evaluated against S2-01 authoritative registration window: $[registrationStartsAt, registrationEndsAt)$.
  - Lifecycle state enforcement: registrations are blocked when hackathon is `DRAFT`, `COMPLETED`, or `ARCHIVED`.
  - Eligibility evaluation: validated against S2-02 `HackathonConfiguration` (student requirement, allowed colleges, allowed branches, graduation year bounds).
- **Parent Scope Integrity**:
  - `trackId`: must belong to target `Hackathon` and be active.
  - `challengeId`: must belong to selected `HackathonTrack` and be `PUBLISHED`.
- **Reactivation & Idempotency**:
  - Withdrawn participants (`status = WITHDRAWN`) can reactivate registration during an open window without creating duplicate database rows.
- **Concurrency & Race Condition Defense**:
  - Unique composite constraint prevents duplicate concurrent registrations.

### 13. Teams & Team Formation Architecture (`S2-05`)
- **Domain Hierarchy**: `Hackathon -> Team -> TeamMember -> User` & `TeamInvitation -> User`
  - `Team`: Belongs 1:N to `Hackathon` (`onDelete: Cascade`). Slugs scoped per hackathon (`@@unique([hackathonId, slug])`).
  - `TeamMember`: Belongs 1:N to `Team` (`onDelete: Cascade`) and references `User`. `@@unique([teamId, userId])` prevents duplicate memberships.
  - `TeamInvitation`: Belongs 1:N to `Team` (`onDelete: Cascade`) and references `inviteeUserId` and `invitedByUserId`.
- **Core Invariants & Rules**:
  - **Prerequisite Registration**: A user must have an active `ParticipantRegistration` (`REGISTERED`) in the target hackathon to create or join a team.
  - **One-Team-Per-Hackathon**: A user cannot be an active member of more than one team per hackathon. Enforced via interactive database transactions and row-level locks on `ParticipantRegistration`.
  - **Captain Invariant**: Creator automatically becomes the `CAPTAIN`. Exactly one active Captain exists per team at all times. A Captain must transfer captaincy or dissolve the team to leave.
  - **Team Sizing**: `minTeamSize` and `maxTeamSize` from S2-02 `HackathonConfiguration` are strictly enforced upon invitations and acceptance.
  - **Participation Mode**: If `participationMode === 'INDIVIDUAL'`, team creation is rejected (`409 Conflict`).
- **Invitation Lifecycle & Concurrency**:
  - State machine: `PENDING` -> `ACCEPTED` / `DECLINED` / `CANCELLED` / `EXPIRED`.
  - Accepting an invitation automatically cancels all other pending invitations for that user across the hackathon.
  - Interactive transactions guarantee race-condition-safe execution for parallel team creation and acceptance.
- **Audit Trails**: Team events emit structured `AuditLog` records (`team.created`, `team.updated`, `team.dissolved`, `team.invitation_created`, `team.invitation_cancelled`, `team.invitation_declined`, `team.member_joined`, `team.member_left`, `team.member_removed`, `team.captain_transferred`).

### 17. Event Operations, Communications & Notifications Architecture (`S6`)
- **Domain Hierarchy**: `Hackathon -> Announcement -> User (Author)` & `User -> Notification` & `User -> NotificationPreference`
- **In-App Notification Engine**:
  - `Notification`: Stores in-app alerts with `deliveryStatus: DELIVERED`, `readAt`, and `idempotencyKey` `@unique`.
  - Scheduler processes due scheduled announcements without mutating upstream hackathon state.
  - Milestone checks dispatch registration closing and submission deadline alerts with daily idempotency keys.
- **Audit Trails**: Emits structured `AuditLog` records (`announcement.created`, `announcement.updated`, `announcement.scheduled`, `announcement.cancelled`, `announcement.published`).

### 18. Observability, Reliability & Production Hardening Architecture (`S7`)
- **Liveness & Readiness Separation**:
  - `GET /health/live` & `GET /health/liveness`: Pure process check without external database or Redis queries.
  - `GET /health/ready` & `GET /health/readiness`: Verifies PostgreSQL and Redis connectivity. Returns 200 when ready, 503 when dependencies fail.
- **Request Tracing & Distributed Correlation**:
  - `X-Request-ID` assigned via middleware (`crypto.randomUUID()` or sanitized client header), propagated in response headers, logs, and error envelopes.
- **Structured JSON Logging & Sensitive Data Redaction**:
  - Emits machine-parseable JSON lines with standardized schema (`timestamp`, `level`, `service`, `environment`, `requestId`, `context`, `message`, `metadata`, `durationMs`).
  - Deep recursive redaction of credentials, tokens, secrets, cookies, and keys (`[REDACTED]`).
- **Bounded Metric Telemetry**:
  - Metric route normalizer collapses dynamic parameters to `:id` to eliminate label cardinality explosion.
  - Endpoints `GET /metrics` (JSON) and `GET /metrics/prometheus` (OpenMetrics/Prometheus text format).
- **Abuse Prevention & Rate Limiting**:
  - Sliding-window in-memory guard with automated interval sweep for expired IPs.
  - Rate limit headers (`X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`, `Retry-After`) and 429 status code.
- **Fail-Fast Configuration & Bounded Graceful Shutdown**:
  - Startup validation blocks forbidden production configurations (wildcard CORS, short secrets).
  - 10-second bounded graceful shutdown intercepts `SIGTERM`/`SIGINT`.

### 19. Production Deployment, CI/CD & Release Engineering Architecture (`S8`)
- **Multi-Stage Container Architecture**:
  - API, Web, and Worker Dockerfiles implement multi-stage pinned Node.js 20 builds.
  - Runtime execution runs under non-root users (`node` UID 1000, `nextjs` UID 1001) with pruned runtime dependencies.
  - Containers embed liveness and readiness health checks.
- **Database Migration Automation & Integrity**:
  - Production deployments strictly execute `prisma migrate deploy`.
  - Prohibits destructive commands (`prisma db push`, `prisma migrate reset`) in staging and production.
  - Automated status verification detects schema drift prior to artifact release.
- **Automated CI/CD Quality Matrix**:
  - GitHub Actions matrix running type-checking, linting, unit tests (191 tests), monorepo builds, service-backed E2E tests (263 tests), and security audits.
  - Immutable commit SHA tagging for container images and deployments.
  - Concurrency group locks prevent race conditions during automated deployments.
- **Safe Build Metadata**:
  - `GET /health/version` securely surfaces version, Git commit SHA, environment, and build timestamp without exposing connection strings or secret tokens.
- **Automated Post-Deployment Smoke Testing**:
  - `scripts/smoke-test.js` non-destructively verifies end-to-end flows (health probes, metrics, auth, organizations, hackathons, rules, and notifications) post-release.
