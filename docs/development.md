# AlmostHack Development Guide

## Prerequisites

Ensure you have the following installed on your local development machine:

- **Node.js**: `>= 20.0.0`
- **pnpm**: `>= 9.0.0`
- **Docker & Docker Compose** (for local PostgreSQL & Redis)

---

## Getting Started

### 1. Install Dependencies

Install all monorepo dependencies across `apps/` and `packages/`:

```bash
pnpm install
```

### 2. Infrastructure Services

Start the local PostgreSQL database and Redis server using Docker Compose:

```bash
docker-compose up -d
```

### 3. Database Migration

Generate Prisma client and apply database migrations:

```bash
cd apps/api
pnpm prisma:generate
pnpm prisma:migrate
cd ../..
```

### 4. Local Development Server

Run the Next.js frontend (`apps/web`), NestJS backend API (`apps/api`), and background worker (`apps/worker`) concurrently:

```bash
pnpm dev
```

- **Frontend Application**: `http://localhost:3000`
- **Backend API Engine**: `http://localhost:4000`
- **Background Worker**: Standalone NestJS application context processing queue jobs from Redis.
- **OpenAPI / Swagger Specs**: `http://localhost:4000/docs`

### 5. Infrastructure Queue Testing

To verify the `API → Redis → BullMQ → Worker` pipeline:

```bash
curl -X POST http://localhost:4000/api/v1/infrastructure-test/enqueue \
  -H "Content-Type: application/json" \
  -H "X-Request-ID: req_dev_test_123" \
  -d '{"message": "Hello Worker", "jobId": "test_job_1"}'
```

Check the worker terminal logs to see structured execution output including correlation ID propagation (`req_dev_test_123`), job attempt count, and processing duration.

---

## Command Reference

| Command | Action |
| :--- | :--- |
| `pnpm dev` | Run all applications (`web`, `api`, `worker`) concurrently |
| `pnpm build` | Build production bundles for all apps and packages |
| `pnpm lint` | Run ESLint across all apps and packages |
| `pnpm type-check` | Execute TypeScript compiler checks across all workspaces |
| `pnpm test` | Execute unit and integration tests across all workspaces |
| `pnpm --filter @almosthack/api test:e2e` | Run API E2E tests |
| `pnpm clean` | Clean build artifacts (`dist/`, `.next/`, `.turbo/`) |

