# ALMOSTHACK — AUDIT INFRASTRUCTURE, PERFORMANCE & DEVOPS REPORT

**Audit Date:** October 13, 2026  
**Auditor:** DevOps Engineer, Site Reliability Engineer & Staff Infrastructure Architect  
**Scope:** Container configurations, Docker Compose, CI/CD pipelines, release mechanisms, database reliability, performance bottlenecks, observability, and disaster recovery.

---

## 1. Deployment & Infrastructure Readiness

### 1.1 Container Build Configuration
The repository provides three separate multi-stage Dockerfiles:
1. `apps/api/Dockerfile`: Multi-stage build (Alpine Linux, Node 20, pnpm 9.4.0, Turbo prune, non-root user). Verified syntactically correct and hygienic.
2. `apps/web/Dockerfile`: Multi-stage build (Alpine Linux, Node 20, Next.js standalone output, non-root user). Accepts build args `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_APP_URL`.
3. `apps/worker/Dockerfile`: Multi-stage build (Alpine Linux, Node 20, pnpm 9.4.0).

### 1.2 Docker Compose Orchestration (`docker-compose.yml`)
A local orchestration file configures five services:
- `postgres`: PostgreSQL 16 Alpine with named volume `postgres_data` and healthcheck (`pg_isready`).
- `redis`: Redis 7 Alpine with named volume `redis_data` and healthcheck (`redis-cli ping`).
- `api`: Port 4000, depends on healthy postgres and redis.
- `web`: Port 3000, depends on healthy api.
- `worker`: Background worker container, depends on healthy postgres and redis.

### 1.3 Missing Production Infrastructure Code (IaC)
- **Kubernetes / Helm:** No Kubernetes manifests, Helm charts, or Kustomize overlays exist.
- **Terraform / AWS / CloudFormation:** Zero infrastructure-as-code scripts exist.
- **Reverse Proxy / Ingress:** No Nginx, Traefik, or Caddy configuration is provided. TLS termination is entirely unconfigured.
- **Database Backups:** No automated backup scripts, WAL archiving, or snapshot policies are defined.

---

## 2. CI/CD Release Pipeline Deficiencies

### 2.1 The "Phantom Deployment" Defect (`deploy-production.yml`)
A critical release engineering defect exists in `.github/workflows/deploy-production.yml` (Step 7, Lines 49–56):
```yaml
- name: 7. Build Production Docker Images (Immutable Commit Tag)
  run: |
    docker build -t almosthack-api:${{ github.sha }} -f apps/api/Dockerfile .
    docker build -t almosthack-web:${{ github.sha }} -f apps/web/Dockerfile \
      --build-arg NEXT_PUBLIC_API_URL=${{ secrets.PROD_API_URL }} \
      --build-arg NEXT_PUBLIC_APP_URL=${{ secrets.PROD_WEB_URL }} .
    docker build -t almosthack-worker:${{ github.sha }} -f apps/worker/Dockerfile .
```
Following image builds, the workflow **does not execute**:
1. `docker push` to AWS ECR, GitHub Container Registry (GHCR), or Docker Hub.
2. Any deployment trigger (e.g. `aws ecs update-service`, `kubectl set image`, or SSH deployment command).
3. In Step 8, it runs `scripts/health-check.js` against `${{ secrets.PROD_API_URL }}`. Because no deployment took place, this probe either checks an outdated running instance or fails entirely.
*Conclusion:* Automated deployments to production do not exist.

### 2.2 Missing Staging Validation Workflow
`.github/workflows/deploy-staging.yml` suffers from the identical flaw: it builds images on the ephemeral GitHub runner without pushing or deploying them.

---

## 3. Performance & Scalability Findings

### 3.1 Frontend Bundle Size Analysis (Next.js 14 Production Build)
From the successful production build output of `@almosthack/web`:
- **Shared First Load JS:** `87.5 kB` (Excellent; well below the 150 kB budget).
  - `chunks/2749`: 31.9 kB
  - `chunks/5b8f`: 53.6 kB
- **Page-specific JS Bundles:**
  - Landing Page (`/`): `26.5 kB` page size / `168 kB` total load.
  - Hackathon Overview (`/overview`): `9.78 kB` page size / `234 kB` total load.
  - Submissions (`/submissions`): `1.57 kB` page size / `237 kB` total load.
  - Teams (`/teams`): `1.5 kB` page size / `239 kB` total load.
  - Hackathon Workspace (`/[id]/workspace`): `422 B` page size / `224 kB` total load.
*Assessment:* Frontend bundle splitting and tree-shaking are highly optimized. Hydration overhead is minimal.

### 3.2 Backend Performance Bottlenecks

#### Bottleneck 1: Synchronous Pairwise Plagiarism Analysis in HTTP Thread
In `apps/api/src/modules/integrity/integrity.service.ts` (Lines 154–200):
```typescript
const peerSubmissions = await this.prisma.submission.findMany({ ... });
for (const peer of peerSubmissions) {
  const targetFiles = await this.fetchSubmissionFiles(peer);
  const result = this.engine.compareRepositories(submissionId, sourceFiles, peer.id, targetFiles, threshold);
  // Synchronous database writes per finding and evidence inside loop
}
```
*Impact:* On a hackathon with 100 submissions, triggering analysis compares 1 submission against 99 peers. In a complete run, N*(N-1)/2 comparisons are executed. Running AST tokenization, Jaccard similarity, and transactional database writes inside a single HTTP request will cause **gateway timeouts (504)** and tie up the Node.js event loop, degrading API response times for all other users.
*Remediation:* Enqueue integrity analysis as a background job via BullMQ in `apps/worker`.

#### Bottleneck 2: Database Indexes & Unindexed JSON Metadata Queries
Review of `apps/api/prisma/schema.prisma`:
- Standard primary keys and foreign key relations are indexed.
- However, `AuditLog.metadata` is queried in `AuditService.queryAuditLogs` using:
  ```typescript
  where.metadata = { path: ['organizationId'], equals: organizationId };
  ```
  In PostgreSQL, querying a JSONB column without a GIN index (`CREATE INDEX ON audit_logs USING gin (metadata)`) forces a **sequential table scan** over millions of rows, causing high query latency as the audit ledger expands.

---

## 4. Observability & Operational Readiness

### 4.1 Health Check Endpoints
The backend provides comprehensive health endpoints (`apps/api/src/modules/health`):
- `GET /health/live` — Liveness probe (HTTP 200, checks process uptime).
- `GET /health/ready` — Readiness probe (HTTP 200, executes DB query and Redis ping).
- `GET /health/version` — Version metadata (version, commit SHA, environment).

### 4.2 Telemetry & Metrics
- `GET /metrics` — Structured JSON metrics summary (request count, error rate, memory usage, uptime).
- `GET /metrics/prometheus` — Prometheus text format (`text/plain; version=0.0.4`) exposing standard counters and gauges.

### 4.3 Structured Logging & Request Tracing
- `StructuredLoggerService` emits standardized JSON logs (`timestamp`, `level`, `service`, `environment`, `context`, `message`, `metadata`, `stack`).
- `requestIdMiddleware` generates or propagates `X-Request-ID` across every HTTP request and attaches it to response headers.
- Graceful shutdown handles `SIGTERM` and `SIGINT` with a 10-second bounded timeout (`main.ts`).

### 4.4 Missing Operational Safeguards
- **Distributed Tracing:** No OpenTelemetry or AWS X-Ray instrumentation.
- **Alert Thresholds:** No Prometheus alerting rules or Grafana dashboards defined.
- **Disaster Recovery Runbook:** `docs/runbooks/incident-response.md` exists, but there is no verified disaster recovery automated failover.
