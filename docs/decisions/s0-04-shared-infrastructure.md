# S0-04 Architecture Decision Record: Shared Infrastructure

## Status
Accepted

## Context
Before product feature modules (such as Authentication & Identity) are built, AlmostHack requires formal shared contracts and communication boundaries between `apps/web`, `apps/api`, and `apps/worker`. 

Without strict shared contracts:
1. Frontend code might perform ad-hoc HTTP fetches with inconsistent error parsing or missing request ID propagation.
2. Shared packages could accidentally import database ORMs (Prisma) or framework runtime utilities (NestJS / Next.js), violating clean architectural boundaries.
3. Event definitions across backend and worker background jobs could become fragmented without a standardized envelope, explicit versioning, and correlation metadata.

## Key Decisions

### 1. Package Boundaries & Responsibilities

- **`@almosthack/api-client` (`packages/api-client`)**: Framework-agnostic HTTP communication layer using native `fetch`. It handles base URL resolution, HTTP methods (`get`, `post`, `put`, `patch`, `delete`), request ID propagation (`X-Request-ID`), timeout handling (`AbortController`), safe JSON parsing, and normalization of non-2xx responses into structured `ApiClientError` instances.
- **`@almosthack/validation` (`packages/validation`)**: Framework-agnostic Zod schemas for shared contract primitives (e.g. `paginationQuerySchema`, `idParamSchema`, `flexIdParamSchema`). Authoritative security validation remains strictly on the NestJS backend via `ValidationPipe`; shared validation exists solely for cross-boundary contract alignment.
- **`@almosthack/events` (`packages/events`)**: Pure TypeScript event contracts and envelope construction utilities (`createEventEnvelope`). It contains zero infrastructure dependencies (no Redis, BullMQ, NestJS, Postgres, or HTTP).

### 2. Standardized API Response & Error Contracts

- **Success Envelope**:
  ```ts
  {
    success: true,
    data: T,
    meta?: Record<string, unknown>
  }
  ```
- **Error Envelope**:
  ```ts
  {
    success: false,
    error: {
      code: string,
      message: string,
      requestId: string,
      details?: unknown
    }
  }
  ```

### 3. Request Correlation & Event Envelope

- **Request ID Propagation**: Every HTTP request sent via `@almosthack/api-client` attaches an `X-Request-ID` header. If not provided by the caller, a unique ID is auto-generated.
- **Event Envelope Standard**:
  ```ts
  {
    id: string;             // Unique event ID (UUID/auto-generated)
    type: string;           // Explicit past-tense domain event name (e.g. "UserCreated")
    version: number;        // Explicit numeric event version (e.g. 1)
    occurredAt: string;     // ISO 8601 UTC timestamp string
    correlationId: string;  // Trace ID propagated from HTTP request / operation
    actorId?: string;       // Optional actor identifier
    organizationId?: string;// Optional organization context
    aggregateType?: string; // Optional aggregate domain entity name
    aggregateId?: string;   // Optional aggregate entity ID
    payload: TPayload;      // Strongly-typed payload
  }
  ```

### 4. Dependency Direction Guidelines

Strict unidirectional dependency hierarchy enforced:
```
apps/web   → api-client, types, validation, events
apps/api   → types, validation, events, utils
apps/worker → types, events, utils
```
- Shared packages MUST NOT depend on application layers (`apps/*`).
- Shared packages MUST NOT depend on database ORMs (Prisma) or infrastructure services (Redis/BullMQ).

## Consequences

- Clean separation between frontend components and HTTP transportation details.
- Frontend and worker applications share consistent types, schemas, and event contracts without tight coupling.
- Foundation established for S0-05 (Authentication & Identity) and subsequent product feature modules.
