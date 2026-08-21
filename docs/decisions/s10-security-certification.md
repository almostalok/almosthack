# Architectural Decision Record: S10 Security & Adversarial Certification

## Status
Accepted

## Context
Following the completion of S9 (PRD Gap Audit and non-UI gap closure with 100% PRD parity), AlmostHack required rigorous security hardening and adversarial certification. The objective of S10 was to treat every trust boundary as hostile, subject the system to systematic attack vectors (unauthenticated requests, token forging/replay, RBAC/privilege escalation, tenant boundary hopping/IDOR, mass assignment/prototype pollution, illegal lifecycle transitions, race conditions, SQL injection, and secret leakage), and verify defense-in-depth across the entire backend architecture.

## Architecture & Security Enforcement Decisions

### 1. Zero-Trust Boundary Validation
- All inbound requests pass through NestJS `ValidationPipe` configured with `whitelist: true`, `transform: true`, and `forbidNonWhitelisted: true`.
- Any unwhitelisted payload properties (such as attempting to inject `roles`, `isWinner`, `score`, or prototype properties like `__proto__` / `constructor`) are immediately rejected with `400 Bad Request`.

### 2. Session Integrity & Revocation
- Session tokens are generated as 32-byte cryptographically secure random values and stored as SHA-256 hashes in PostgreSQL.
- Session validation in `SessionAuthGuard` validates that `revokedAt IS NULL` and `expiresAt > NOW()`.
- Logging out immediately marks the session as revoked, preventing session replay.

### 3. Dual-Layer RBAC & Cross-Tenant Isolation
- Endpoints enforce authorization through `SessionAuthGuard` and `PermissionsGuard`.
- Dynamic permission resolution evaluates both global roles (`ADMIN`, `ORGANIZER`, `JUDGE`, `PARTICIPANT`) and scoped tenant roles (`OWNER`, `ADMIN`, `MEMBER`) via `@RequireScope` against database entities.
- Access attempts across organization or hackathon tenant boundaries return `403 Forbidden`.

### 4. Deterministic State Machine Enforcement
- All hackathon lifecycle transitions (Publish, Archive, Complete) strictly validate the current state in PostgreSQL.
- Illegal transitions (e.g. archiving a `DRAFT` hackathon or double-publishing an active event) are rejected with `409 Conflict` (Error Code: `INVALID_LIFECYCLE_TRANSITION`).

### 5. Atomic Concurrency & Race Condition Defense
- High-concurrency operations (such as hackathon participant registration) execute within Prisma transactions with database unique constraint guarantees (`hackathonId`, `userId`).
- Parallel duplicate requests result in exactly one successful operation and deterministic `409 Conflict` rejections without duplicate database state.

### 6. Information Disclosure & Error Sanitization
- All exceptions are processed through `HttpExceptionFilter`.
- In production, internal server error messages and database details are masked into generic error codes and correlated via unique UUID `requestId`s. Secrets, stack traces, and database connection URIs are scrubbed from all API responses.

## Consequences
- 18 E2E test suites (287 tests) passing.
- 27 unit test suites (194 tests) passing.
- 5/5 automated repository security hygiene checks passing.
- Workspace TypeScript compilation and lint checks clean.
- System is certified adversarial-hardened and production-ready.
