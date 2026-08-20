# ADR: S8 Production Deployment, CI/CD & Release Engineering

## Status
**ACCEPTED**

## Context
Following the completion of S0 through S7, AlmostHack is functionally complete and operationally observable. S8 establishes the release engineering, containerization, environment isolation, automated CI/CD pipelines, database migration safeguards, and incident runbooks required for production deployment.

## Key Decisions

### 1. Multi-Stage Non-Root Containerization
- **Multi-Stage Docker Builds**:
  - `apps/api/Dockerfile`: Multi-stage pnpm builder, pruned production dependencies, runs as non-root `node` (UID 1000). Exposes embedded container healthcheck probe.
  - `apps/web/Dockerfile`: Standalone Next.js runner with static asset isolation, runs as non-root `nextjs` (UID 1001). Zero secrets bundled into client chunks.
  - `apps/worker/Dockerfile`: Standalone worker runner for BullMQ background queues, runs as non-root `node` (UID 1000).
- **Security & Hygiene**:
  - Root `.dockerignore` blocks `.env`, local configurations, `.git`, `node_modules`, and build artifacts from ever leaking into container layers.
  - No secret tokens, credentials, or `.env` files are copied into images.

### 2. Strict Database Migration Integrity
- **Production Migrations**:
  - Production and staging deployments strictly use `prisma migrate deploy`.
  - Commands `prisma db push` and `prisma migrate reset` are strictly prohibited in production, staging, and CI deployment scripts.
  - Automated pre-deployment migration verification using `prisma migrate status` prevents drift and detects missing migrations prior to container deployment.

### 3. Build & Version Metadata Exposure
- Safe, non-sensitive runtime metadata exposed via `GET /health/version`:
  - `version`: Application version from `package.json`
  - `commitSha`: Immutable Git commit SHA (`GIT_COMMIT_SHA` / `COMMIT_SHA`)
  - `environment`: Runtime environment (`NODE_ENV`)
  - `buildTimestamp`: Deployment / build ISO timestamp
  - `service`: `almosthack-api`
- Explicit redaction prevents exposure of `DATABASE_URL`, `JWT_SECRET`, or credentials.

### 4. CI/CD Matrix & Automated Quality Gates
- **Continuous Integration (`.github/workflows/ci.yml`)**:
  - Runs on PRs and pushes to `main` and `develop`.
  - Concurrency group with `cancel-in-progress` for PRs.
  - Validates: Type checking (`tsc --noEmit`), linting (`eslint`), unit test suites (26 suites, 191 tests), production build across all workspaces, PostgreSQL + Redis service containers, `prisma migrate deploy`, and full E2E test suites (16 suites, 263 tests).
  - Enforces `scripts/security-audit.js` scanning for secret hygiene and migration integrity.
- **Staging Deployment (`.github/workflows/deploy-staging.yml`)**:
  - Auto-deploys from `develop` branch.
  - Applies migrations, builds immutable container artifacts tagged with Git SHA, checks health endpoints, and runs automated deployment smoke tests (`scripts/smoke-test.js`).
- **Production Release (`.github/workflows/deploy-production.yml`)**:
  - Deploys on release tags or pushes to `main` with concurrency locks and environment protection.
  - Executes serialized migrations, verifies `/health/version` and `/health/ready`, and runs non-destructive smoke tests.

### 5. Automated Deployment Smoke Testing & Health Probes
- `scripts/smoke-test.js`: Non-destructive end-to-end operational verification of liveness, readiness, versioning, Prometheus metrics, authentication, organizations, hackathons, rules, and notifications.
- `scripts/health-check.js`: Fast probe for Docker healthchecks and pipeline gating.

## Consequences
- **Positive**: Repeatable, deterministic zero-downtime releases with automated rollback triggers.
- **Positive**: Complete environment isolation preventing staging/production credential cross-contamination.
- **Positive**: High security posture with non-root containers, secret redaction, and strict migration locks.
