# AlmostHack — Production Deployment & Release Engineering Guide

## 1. Overview
AlmostHack is architected as a modular monorepo deployed using non-root Docker containers, serialized database migrations (`prisma migrate deploy`), environment isolation, and automated CI/CD validation.

---

## 2. Environments & Isolation Matrix

| Environment | Purpose | Database Strategy | Secrets Isolation |
|---|---|---|---|
| **Development** | Local workstation | Local Postgres + Redis | Local `.env` (gitignored) |
| **Test / CI** | Automated quality gates | Isolated ephemeral containers | GitHub Actions Secrets |
| **Staging** | Pre-production validation | Staging managed Postgres | Staging Vault / Secrets Manager |
| **Production** | Live hackathon traffic | High-availability RDS / Postgres | Production Vault / KMS |

---

## 3. Configuration & Secrets Categorization

Environment variables must follow the categorization guidelines defined in `.env.example`:

1. **PUBLIC**: Variables exposed to browser JavaScript (`NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_APP_URL`). **NEVER place secrets here.**
2. **SERVER**: Runtime listening ports and paths (`PORT`, `API_PREFIX`, `CORS_ORIGIN`).
3. **SECRET / AUTH**: Cryptographic keys (`JWT_SECRET`, `SESSION_SECRET`). Must be minimum 16 characters in production.
4. **DATABASE**: Connection URIs (`DATABASE_URL`). Must be authenticated and SSL-encrypted in production.
5. **REDIS**: BullMQ queue broker URIs (`REDIS_URL`).
6. **OBSERVABILITY**: Logging levels and rate limiting configurations (`LOG_LEVEL`, `RATE_LIMIT_MAX`, `RATE_LIMIT_WINDOW_MS`).
7. **THIRD_PARTY**: GitHub OAuth and webhook integrations (`GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`).

---

## 4. Container Architecture (Docker)

### API Container (`apps/api/Dockerfile`)
- **Base**: `node:20-alpine`
- **User**: Non-root `node` (UID 1000)
- **Port**: `4000`
- **Healthcheck**: `curl -f http://localhost:4000/health/live`
- **Graceful Shutdown**: Intercepts `SIGTERM` / `SIGINT`, draining active requests and BullMQ worker listeners.

### Web Frontend Container (`apps/web/Dockerfile`)
- **Base**: `node:20-alpine`
- **User**: Non-root `nextjs` (UID 1001)
- **Port**: `3000`
- **Healthcheck**: `curl -f http://localhost:3000`

### Worker Container (`apps/worker/Dockerfile`)
- **Base**: `node:20-alpine`
- **User**: Non-root `node` (UID 1000)
- **Runtime**: Dedicated NestJS context executing background BullMQ queues (`notifications`, `integrity-analysis`, `scoring`).

---

## 5. Database Migration Policy

> [!CAUTION]
> **Strict Production Rule**: Never execute `prisma db push` or `prisma migrate reset` against staging or production environments.

### Deployment Workflow:
1. **Pre-check**: Verify migration state:
   ```bash
   pnpm --filter @almosthack/api exec prisma migrate status
   ```
2. **Apply**: Apply unapplied migrations:
   ```bash
   pnpm --filter @almosthack/api exec prisma migrate deploy
   ```
3. **Zero-Downtime Migration Rule**:
   - Step 1 (Expand): Add nullable columns, new tables, or new models.
   - Step 2 (Deploy): Roll out application containers that read/write the new columns.
   - Step 3 (Contract): After old instances are drained, apply non-null constraints or drop deprecated columns.

---

## 6. Health & Diagnostics Verification

| Probe | Endpoint | Purpose | Target Response |
|---|---|---|---|
| **Liveness** | `GET /health/live` | Process vitality (container orchestrator restart trigger) | `200 OK` |
| **Readiness** | `GET /health/ready` | Dependency health check (PostgreSQL + Redis) | `200 OK` (or `503 Service Unavailable`) |
| **Version** | `GET /health/version` | Safe commit SHA & build metadata | `200 OK` |
| **Metrics** | `GET /metrics` | Prometheus metrics and latency histograms | `200 OK` |

---

## 7. Automated Smoke Testing

Post-deployment validation is performed using the non-destructive smoke testing suite:
```bash
API_URL=https://api.almosthack.com node scripts/smoke-test.js
```
Validates:
- Liveness, Readiness, and Version probes
- Metrics endpoint availability
- User registration, authentication, and session cookie issuance
- Organization and hackathon lifecycle
- Rules retrieval and notification preferences
