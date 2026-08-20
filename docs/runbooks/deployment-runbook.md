# Production Deployment & Release Runbook

## 1. Pre-Deployment Verification Checklist
1. **CI Status**: Verify all CI matrix checks have passed on the release commit SHA (`.github/workflows/ci.yml`).
2. **Security Audit**: Run `pnpm audit:security` to ensure zero secret leakage and valid migration locks.
3. **Staging Validation**: Confirm staging deployment completed successfully and passed `scripts/smoke-test.js`.
4. **Database Backups**: Verify automated point-in-time recovery (PITR) snapshot exists for PostgreSQL before running migrations.

---

## 2. Step-by-Step Production Release Execution

### Step 1: Concurrency & Lock Acquisition
Ensure no parallel deployments or destructive maintenance operations are running.

### Step 2: Pre-Deployment Migration Audit
```bash
pnpm --filter @almosthack/api exec prisma migrate status
```
*Verification*: Ensure output shows unapplied migrations match the expected release files in `apps/api/prisma/migrations/`.

### Step 3: Apply Database Migrations
```bash
pnpm --filter @almosthack/api exec prisma migrate deploy
```
*Verification*: Output must confirm `All migrations have been successfully applied`.

### Step 4: Container Build & Tagging
Build immutable container images tagged with the exact Git commit SHA:
```bash
docker build -t almosthack-api:${COMMIT_SHA} -f apps/api/Dockerfile .
docker build -t almosthack-web:${COMMIT_SHA} -f apps/web/Dockerfile \
  --build-arg NEXT_PUBLIC_API_URL=${PROD_API_URL} \
  --build-arg NEXT_PUBLIC_APP_URL=${PROD_WEB_URL} .
docker build -t almosthack-worker:${COMMIT_SHA} -f apps/worker/Dockerfile .
```

### Step 5: Rolling Deployment of Background Workers
Deploy new worker containers first. Background workers consume BullMQ queues and tolerate schema additions.

### Step 6: Rolling Deployment of API Backend
Deploy new API containers. Traffic shifts once `/health/ready` returns HTTP 200.

### Step 7: Rolling Deployment of Web Frontend
Deploy Next.js standalone containers.

### Step 8: Post-Deployment Health & Version Check
```bash
node scripts/health-check.js /health/live
node scripts/health-check.js /health/ready
node scripts/health-check.js /health/version
```
*Verification*: Check that `/health/version` returns the exact `commitSha` of the deployed release.

### Step 9: Post-Deployment Smoke Test
```bash
API_URL=https://api.almosthack.com node scripts/smoke-test.js
```
*Verification*: All 10 smoke test steps must report `✅ PASS`.

---

## 3. Rollback Procedures

### Immediate Rollback Triggers:
- HTTP 500/503 error rate exceeds 1% in the first 5 minutes.
- Database connection pool exhaustion or unrecoverable query timeouts.
- `/health/ready` failing repeatedly across all replicas.
- Smoke tests failing on core flows.

### Rollback Steps:
1. **Container Rollback**: Re-point load balancer / orchestrator to previous stable commit SHA container tag (`${PREVIOUS_COMMIT_SHA}`).
2. **Worker Rollback**: Roll back worker containers to `${PREVIOUS_COMMIT_SHA}`.
3. **Database Considerations**:
   - Backward-compatible schema additions (expand phase) do NOT need to be reverted immediately.
   - If a rollback migration is strictly required, apply tested down-migration script manually.
4. **Post-Rollback Verification**: Run `scripts/smoke-test.js` against the rolled-back target to confirm operational stability.
