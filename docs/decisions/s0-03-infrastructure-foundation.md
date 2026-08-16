# Architectural Decision Record: S0-03 Infrastructure Foundation

## Context & Objectives

AlmostHack requires reliable asynchronous background processing for non-blocking compute (e.g. repo audits, judging calculations, automated checks) without burdening the primary HTTP API process. S0-03 establishes the foundational asynchronous messaging architecture and background execution layer.

---

## Technical Decisions

### 1. Redis as In-Memory Storage & Broker
- **Why Redis**: Redis provides fast, atomic data structures ideal for message queuing, distributed locking, and transient caching. PostgreSQL remains the transactional relational source of truth; Redis handles queue structures and ephemeral job metadata.
- **Client**: `ioredis` is selected as the single unified Redis client abstraction (`RedisService`), avoiding client duplication and maintaining connection pooling lifecycle.

### 2. BullMQ for Queue Abstraction
- **Why BullMQ**: Built natively for Redis and Node.js with built-in support for job retries, backoff strategies, concurrency control, job state events, and atomic job locking via Lua scripts.
- **Queue Producer Abstraction**: `QueueService` in `apps/api` wraps BullMQ `Queue` instances, ensuring domain modules never interact directly with raw Redis connections or raw BullMQ internals.

### 3. Separate Worker Application (`apps/worker`)
- **Why Isolated Worker**: Running background job processing inside the HTTP API application can lead to event-loop blocking, uneven CPU load distribution, and coupled deployment constraints.
- **Architecture**: `apps/worker` is built using NestJS `createApplicationContext(WorkerModule)`—it initializes full NestJS dependency injection, structured logging, and configuration validation without starting an HTTP server listener.

### 4. Retry Policy & Idempotency
- **Retry Strategy**: Default retry policy is set to 3 attempts with exponential backoff (`delay: 1000ms`).
- **Idempotency Approach**: Jobs support explicit `jobId` assignment via `QueueService.addJob(...)`. BullMQ deduplicates active and waiting jobs with identical job IDs.

### 5. Correlation ID Propagation
- **Observability**: `X-Request-ID` generated or received by the NestJS API top-level middleware is explicitly attached as `correlationId` to the enqueued job payload.
- **Worker Logging**: Worker logs report `jobId`, `queueName`, `jobName`, `attempt`, `durationMs`, and `correlationId`, ensuring end-to-end request tracing.

### 6. Graceful Worker Shutdown
- **Lifecycle**: `apps/worker` enables shutdown hooks (`app.enableShutdownHooks()`).
- **Behavior**: On SIGTERM/SIGINT, active workers stop accepting new jobs, wait for active jobs to complete, close BullMQ workers, and close Redis connections cleanly.

---

## Out-of-Scope Confirmation

The following product features were intentionally **NOT** implemented in S0-03:
- ❌ Authentication / Users domain logic
- ❌ GitHub integration / Webhooks
- ❌ Hackathons, Rounds, Teams, Submissions
- ❌ Judging, Calibration, Plagiarism, Integrity
- ❌ Notifications, Chat, Meetings, Whiteboard
- ❌ Kafka, Kubernetes, WebSockets, or Microservices expansion
- ❌ Prisma schema modifications
