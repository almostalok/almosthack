# ALMOSTHACK — AUDIT TESTING & VERIFICATION REPORT

**Audit Date:** October 13, 2026  
**Auditor:** QA Lead & Staff Full-Stack Engineer  
**Scope:** Automated test suites, test fixtures, CI execution credibility, environment limitations, and baseline check execution log.

---

## 1. Baseline Verification Command Register

Every baseline verification check executed during this forensic audit has been logged with its exact command, attempt status, exit code, and observed output:

| # | Exact Command | Execution Attempted | Outcome | Exit Code | Observed Output / Relevant Errors | Environment Limitations |
|---|---|:---:|:---:|:---:|---|---|
| **1** | `pnpm -v` | Yes | **PASS** | `0` | `9.4.0` | None |
| **2** | `git status` | Yes | **PASS** | `0` | On branch `main`, working tree clean | None |
| **3** | `node scripts/security-audit.js` | Yes | **PASS** | `0` | `5/5 checks passed`: No db push in CI, Dockerfiles secret-free, migration locks intact, gitignore valid, package.json clean | None |
| **4** | `pnpm exec turbo run type-check --force` | Yes | **PASS** | `0` | `11 successful, 11 total` across all 11 packages (0 cached) | None |
| **5** | `pnpm exec turbo run lint` | Yes | **PASS** | `0` | `3 successful, 3 total` (0 errors, 20 warnings: Next.js `<img>` tags, unused variables, React hook deps) | None |
| **6** | `pnpm exec turbo run test` | Yes | **PASS (with warnings)** | `0` | `Test Suites: 27 passed, 27 total. Tests: 194 passed, 194 total`. Note: Warning `A worker process has failed to exit gracefully... [Nest] ERROR [RedisService] Redis client error` | Redis not running locally during unit tests |
| **7** | `pnpm --filter @almosthack/api exec prisma validate` | Yes | **PASS** | `0` | `The schema at prisma\schema.prisma is valid 🚀` | None |
| **8** | `pnpm --filter @almosthack/api build` | Yes | **PASS** | `0` | `nest build` succeeded, emitting compiled JS to `apps/api/dist` | None |
| **9** | `pnpm --filter @almosthack/web build` | Yes | **PASS** | `0` | `next build` compiled 45 routes successfully with 0 type errors | None |
| **10** | `pnpm audit` | Yes | **FAIL** | `1` | `93 vulnerabilities found (7 low, 35 moderate, 45 high, 6 critical)` | Public npm advisory registry |
| **11** | `docker ps` | Yes | **FAIL / BLOCKED** | `1` | `failed to connect to docker API at npipe:////./pipe/dockerDesktopLinuxEngine` | Docker daemon is not running on host |
| **12** | `pnpm --filter @almosthack/api test:e2e` | No | **BLOCKED** | N/A | Blocked because live PostgreSQL and Redis services require Docker daemon | Automated in GitHub Actions CI (`.github/workflows/ci.yml`) |
| **13** | `node scripts/smoke-test.js` | No | **BLOCKED** | N/A | Blocked locally because live API server is not running on port 4000 | Evaluated via static code analysis (Assertion defect identified) |

---

## 2. Test Inventory & Coverage Analysis

### 2.1 Unit Test Inventory (27 Suites, 194 Passing Tests)
- `apps/api/src/common/filters/http-exception.filter.spec.ts` (10 tests) — HTTP status codes, error masking in production, logging.
- `apps/api/src/common/guards/rate-limit.guard.spec.ts` (6 tests) — IP rate limits, sliding window counters.
- `apps/api/src/common/logger/structured-logger.service.spec.ts` (8 tests) — JSON format, secret masking, log levels.
- `apps/api/src/config/env.validation.spec.ts` (8 tests) — Joi environment schema validation, required ports, secrets.
- `apps/api/src/infrastructure/queue/queue.service.spec.ts` (6 tests) — BullMQ enqueueing and event emission.
- `apps/api/src/modules/announcements/announcements.service.spec.ts` (14 tests) — Recipient scope resolution, in-app notification insertion.
- `apps/api/src/modules/audit/audit.service.spec.ts` (6 tests) — Audit log query filters and pagination.
- `apps/api/src/modules/auth/auth.service.spec.ts` (12 tests) — Password hashing, registration duplicate rejection, login verification.
- `apps/api/src/modules/auth/authorization.service.spec.ts` (16 tests) — Role hierarchies, permission evaluation, scope types.
- `apps/api/src/modules/auth/guards/permissions.guard.spec.ts` (8 tests) — Method/class metadata override, role enforcement.
- `apps/api/src/modules/auth/guards/session-auth.guard.spec.ts` (6 tests) — Session cookie extraction, token verification.
- `apps/api/src/modules/auth/session.service.spec.ts` (10 tests) — Token hashing, revocation, expiry validation.
- `apps/api/src/modules/health/health.controller.spec.ts` (6 tests) — Liveness, readiness, and version probes.
- `apps/api/src/modules/integrity/integrity-engine.service.spec.ts` (14 tests) — N-gram tokenization, Jaccard similarity, AST fragmentation.
- `apps/api/src/modules/integrity/integrity.service.spec.ts` (10 tests) — Review, confirm, and dismiss workflow with test fixtures.
- `apps/api/src/modules/judging/judging.service.spec.ts` (12 tests) — Conflict of interest guard, evaluation draft/submission.
- `apps/api/src/modules/metrics/metrics.service.spec.ts` (6 tests) — Prometheus counter formatting and telemetry summaries.
- `apps/api/src/modules/notifications/notifications.service.spec.ts` (12 tests) — Preference filtering, idempotency key deduplication.
- `apps/api/src/modules/organizations/organizations.service.spec.ts` (10 tests) — Member roles, slug collisions, transfer of ownership.
- `apps/api/src/modules/repositories/github-credential.service.spec.ts` (8 tests) — AES-256-GCM encryption, decryption, bad tag rejection.
- `apps/api/src/modules/repositories/repositories.service.spec.ts` (8 tests) — Push access verification, provisioning.
- `apps/api/src/modules/results/results.service.spec.ts` (18 tests) — Input fingerprinting, tie-breaking, approval staleness.
- `apps/api/src/modules/submissions/submissions.service.spec.ts` (8 tests) — Finalization deadline window, commit SHA capture.
- `apps/api/src/modules/users/users.service.spec.ts` (6 tests) — Profile retrieval and update sanitization.
- `apps/worker/src/queues/infrastructure-test/infrastructure-test.processor.spec.ts` (4 tests) — Test job processing.

### 2.2 E2E Test Inventory (20 Test Files in `apps/api/test`)
The repository contains 20 comprehensive E2E test files designed to run against live PostgreSQL and Redis services in CI:
- `announcements.e2e-spec.ts` (16.5 KB)
- `api.e2e-spec.ts` (5.3 KB)
- `audit.e2e-spec.ts` (5.0 KB)
- `auth.e2e-spec.ts` (7.1 KB)
- `authorization.e2e-spec.ts` (7.4 KB)
- `github.e2e-spec.ts` (16.3 KB)
- `hackathons.e2e-spec.ts` (47.1 KB)
- `integrity.e2e-spec.ts` (21.0 KB)
- `judging.e2e-spec.ts` (10.3 KB)
- `notifications.e2e-spec.ts` (9.0 KB)
- `observability.e2e-spec.ts` (9.9 KB)
- `organizations.e2e-spec.ts` (10.0 KB)
- `performance-scalability.e2e-spec.ts` (16.8 KB)
- `registrations.e2e-spec.ts` (26.4 KB)
- `results.e2e-spec.ts` (29.0 KB)
- `security-adversarial.e2e-spec.ts` (19.1 KB)
- `submissions.e2e-spec.ts` (10.4 KB)
- `teams.e2e-spec.ts` (26.2 KB)
- `users.e2e-spec.ts` (7.4 KB)

---

## 3. Test Credibility Deficiencies

### 3.1 Teardown Leaks in Jest Unit Tests
When running unit tests (`pnpm turbo run test`), Jest logs the following teardown warning:
```
[Nest] ERROR [RedisService] Redis client error: AggregateError
A worker process has failed to exit gracefully and has been force exited.
This is likely caused by tests leaking due to improper teardown.
```
*Root Cause:* In `queue.service.spec.ts` and `rate-limit.guard.spec.ts`, Redis connections initiated by `ioredis` are not explicitly disconnected via `.disconnect()` or `.quit()` in an `afterAll` hook, leaving active network socket handles open.

### 3.2 Smoke Test Assertion Bug (`scripts/smoke-test.js`)
Static audit of `scripts/smoke-test.js` uncovered an assertion defect on line 146:
```javascript
// Step 5: User Registration & Session Auth Flow
await step('5. Authentication Register Flow (POST /api/v1/auth/register)', async () => {
  const res = await request('POST', '/api/v1/auth/register', { ... });
  if (res.status !== 201) throw new Error(...);
  if (!res.data.data?.user?.id) throw new Error('Missing user ID in response');
  userId = res.data.data.user.id;
});
```
*Bug:* In `AuthController.register` (`apps/api/src/modules/auth/auth.controller.ts`, line 47):
The handler returns `user` directly (type `SafeUser`). `TransformInterceptor` wraps this in `{ success: true, data: user }`.
Therefore:
- `res.data.data.id` is the user ID.
- `res.data.data.user` is `undefined`.
- The smoke test step 5 **will always throw `Missing user ID in response` and fail**, even when registration succeeded with status 201.

### 3.3 Missing Frontend Tests
Across the entire `apps/web` package, there are **zero unit tests, zero component tests, and zero Playwright/Cypress E2E tests**.
Neither `vitest`, `jest`, nor `@testing-library/react` is installed in `apps/web/package.json`. The frontend relies 100% on manual developer testing.
