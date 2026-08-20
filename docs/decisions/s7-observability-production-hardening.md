# ADR: S7 Observability, Reliability & Production Hardening

## Status
Accepted

## Context
AlmostHack implements a comprehensive competitive hackathon lifecycle (S0-S6).
S7 establishes the observability, reliability, and security hardening layer required to operate AlmostHack reliably and safely in production environments.

Crucially, **S7 observes and protects the existing system**. It does NOT become a new source of truth for hackathons, registrations, teams, submissions, judging, integrity, results, or notifications.

## Decision Drivers
1. **Liveness vs Readiness Separation**:
   - Liveness (`/health/live` & `/health/liveness`) evaluates only whether the process is alive. It must NEVER query Postgres, Redis, or external network services, ensuring that temporary downstream outages do not trigger cascading container crash-loops.
   - Readiness (`/health/ready` & `/health/readiness`) verifies active connectivity to required runtime dependencies (PostgreSQL via `SELECT 1`, Redis via ping). Returns HTTP 200 when ready to serve traffic, and HTTP 503 during dependency degradation.
2. **Correlation & Request Tracing**:
   - Every incoming HTTP request is assigned a unique Request ID (`X-Request-ID`). If supplied by the client, it is validated and preserved; otherwise, a cryptographically secure UUID is generated.
   - `X-Request-ID` is echoed in all response headers and embedded within all application logs, security event logs, and error responses.
3. **Structured Logging & Sensitive Data Redaction**:
   - Structured JSON logger emitting standardized fields (`timestamp`, `level`, `service`, `environment`, `requestId`, `context`, `message`, `metadata`, `durationMs`).
   - Deep recursive redaction sanitizes passwords, Bearer tokens, JWTs, cookies, session secrets, API keys, client secrets, and private keys before any logging occurs.
4. **Metrics Collection & Bounded Cardinality**:
   - High-cardinality labels (such as `userId`, `organizationId`, `hackathonId`, `requestId`) are strictly forbidden in metric labels.
   - Dynamic path parameters (UUIDs and numeric IDs) are normalized into `:id` before metric aggregation.
   - Collects HTTP request counts, status class distributions, route latency stats (avg/min/max/count), error counters, authentication failures, authorization denials, rate limit rejections, and background job metrics.
   - Exposes structured JSON via `GET /metrics` and standard Prometheus text format via `GET /metrics/prometheus`.
5. **Rate Limiting & Abuse Prevention**:
   - Sliding-window in-memory rate limiter with automatic memory cleanup to protect critical endpoints (e.g. login, registration, password resets).
   - Standard rate limit response headers (`X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`, `Retry-After`) and HTTP 429 status code.
6. **Graceful Shutdown & Production Fail-Fast Configuration**:
   - Bounded graceful shutdown (10s) intercepts `SIGTERM` and `SIGINT` to drain in-flight requests and cleanly close database and Redis pools.
   - Centralized environment validation enforces production assertions at startup: rejects wildcard CORS (`*`), enforces minimum 16-character secret lengths, and validates required database URLs.
7. **Frontend Error Boundaries & Resilience**:
   - Next.js App Router error boundaries (`error.tsx`, `global-error.tsx`) capture rendering crashes and provide user recovery options with request correlation.
   - React Query client configured with bounded retries (0 retries for 4xx errors, 1 retry for 5xx/network errors, 0 retries for mutations).

## Architecture Overview

```
Client Request
      │ (with optional X-Request-ID)
      ▼
RequestIdMiddleware (Extracts / generates UUID; sets X-Request-ID header)
      │
Helmet Security Headers (nosniff, frameguard, Referrer-Policy, etc.)
      │
RateLimitGuard (Sliding window rate check; emits 429 on abuse)
      │
LoggingInterceptor (Tracks request duration, routes normalized metrics, structured access log)
      │
Controller & Service Execution
      │
      ├─────────── Success ──► TransformInterceptor ──► 2xx Response Envelope
      │
      └─────────── Exception ─► HttpExceptionFilter ──► Production Sanitized Error Envelope
```

## Security & Reliability Matrix

| Capability | Implementation | Production Behavior |
| :--- | :--- | :--- |
| **Liveness Probe** | `/health/live`, `/health/liveness` | 200 OK, zero external dependency |
| **Readiness Probe** | `/health/ready`, `/health/readiness` | 200 OK (Postgres & Redis UP), 503 Service Unavailable on outage |
| **Telemetry** | `/metrics`, `/metrics/prometheus` | Normalized `:id` routes, memory stats, latency distribution |
| **Request Correlation** | `X-Request-ID` | Propagated across headers, logs, error payloads |
| **Redaction** | `redaction.util.ts` | Masks credentials, tokens, secrets recursively |
| **Rate Limiting** | `RateLimitGuard` | 429 Too Many Requests with `Retry-After` header |
| **Security Headers** | Helmet | Blocks MIME sniffing, clickjacking, insecure referrer leak |
| **Graceful Shutdown** | `enableShutdownHooks` (10s max) | Closes connections cleanly on SIGTERM/SIGINT |
| **Error Handling** | `HttpExceptionFilter` | Sanitizes internal errors, hides stack traces in prod |
