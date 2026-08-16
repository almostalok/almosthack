# AlmostHack Architecture Specification

## Overview

AlmostHack is built as a single monorepo structured around a **Modular Monolith** backend architecture and a feature-organized Next.js frontend application.

```
almosthack/
├── apps/
│   ├── api/       # NestJS Modular Monolith API Engine
│   ├── web/       # Next.js App Router Web Interface
│   └── worker/    # NestJS Async Background Worker
└── packages/
    ├── api-client/     # Framework-agnostic typed HTTP client & error normalization
    ├── config/         # Shared TypeScript and tooling configurations
    ├── design-system/  # Core design tokens, global styles, and Tailwind utilities
    ├── events/         # Standalone event contracts, envelopes, and versioning
    ├── hooks/          # Shared custom React hooks
    ├── types/          # Shared TypeScript domain contracts and API types
    ├── ui/             # Cross-application reusable UI component library
    ├── utils/          # Generic stateless utility functions
    └── validation/     # Shared Zod validation schemas for shared query & boundary contracts
```

---

## Architectural Principles

### 1. Modular Monolith Backend (`apps/api`)
The backend is designed as a modular monolith using NestJS. Rather than microservices, domain boundaries are isolated within dedicated NestJS modules inside `apps/api/src/modules/`:
- `auth/`: Authentication & authorization guard scaffolding
- `users/`: User profiles, credentials, and user preferences
- `organizations/`: Organization management & team memberships
- `hackathons/`: Hackathon lifecycle, configuration, & schedules
- `rounds/`: Judging rounds, criteria, and submissions routing
- `teams/`: Participant team formation and roster management
- `repositories/`: GitHub repository connections & SHA commit tracking
- `submissions/`: Project submissions, code links, & metadata
- `judging/`: Double-blind calibrated judging, scoring, & consensus
- `integrity/`: Code integrity checking & plagiarism detection boundary
- `appeals/`: Score dispute resolution and audit trail review
- `notifications/`: User alert delivery & event broadcasts
- `audit/`: Immutable audit logging & verification streams

### 2. Monorepo Package Boundaries (`packages/`)
- **`packages/api-client`**: Framework-agnostic HTTP communication layer (`@almosthack/api-client`) handling request ID propagation, response normalization, timeout handling, and typed HTTP methods.
- **`packages/config`**: Base TypeScript configurations (`tsconfig.base.json`).
- **`packages/design-system`**: Design tokens (`colors.ts`, `typography.ts`, `animations.ts`) and global CSS definitions.
- **`packages/events`**: Standalone event contract envelope (`@almosthack/events`) defining immutable event metadata (`id`, `type`, `version`, `occurredAt`, `correlationId`, `payload`).
- **`packages/hooks`**: Custom client React hooks (`useTheme`, `useKeyboardShortcuts`, `useCommandPalette`).
- **`packages/types`**: Cross-boundary interfaces (`user.ts`, `auth.ts`, `audit.ts`, `rbac.ts`, `api.ts`).
- **`packages/ui`**: Atomic and complex UI components (`Button`, `Card`, `CommandPalette`, `SidebarNav`, `TopHeader`).
- **`packages/utils`**: Pure, stateless helper utilities (`cn`, `formatters`).
- **`packages/validation`**: Shared Zod schemas (`@almosthack/validation`) for cross-boundary contracts (pagination, identifiers, sort parameters).

### 3. Data Ownership & Storage
- Single PostgreSQL database managed via Prisma ORM (`apps/api/prisma/schema.prisma`).
- Redis cache & session store for rate-limiting, temporary key storage, and future background worker queueing.

### 4. Future Background Worker Boundary
Async background jobs (e.g. commit integrity scans, plagiarism checking, batch email delivery) will be executed by dedicated worker processes sharing the core `apps/api` domain modules and Prisma service model, avoiding early microservice decomposition.
