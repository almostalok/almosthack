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

### 5. Authentication Architecture (Server-Side Session Authentication)
- **Primary Credential**: Opaque 32-byte cryptographically secure random session token stored in HttpOnly cookie (`almosthack_session`).
- **Database Storage**: PostgreSQL `sessions` table storing SHA-256 token hash (`tokenHash`), expiration date (7 days), active status (`revokedAt IS NULL`), IP address, and user agent.
- **Session Protection**: `SessionAuthGuard` validates token hash, checks revocation and absolute expiration, attaches authenticated identity (`request.user`) to NestJS execution context.
- **Password Hashing**: `bcrypt` with cost factor 10.
- **Role Foundation**: Automatic server-side assignment of `RoleName.PARTICIPANT` on registration. Client cannot override roles.
- **API Client Integration**: `@almosthack/api-client` configured with `credentials: 'include'` for cross-origin cookie transmission.

### 6. User Identity & Profile Architecture (`S1-02`)
- **Data Model**: Profile fields (`college`, `branch`, `graduationYear`, `skills`, `linkedinUrl`, `portfolioUrl`, `avatarUrl`, `bio`) reside on the `User` model in PostgreSQL, ensuring single-table read performance (0 JOIN overhead) and simple lifecycle management.
- **Endpoints**: `GET /api/v1/users/me` (profile retrieval) & `PATCH /api/v1/users/me` (partial profile update).
- **Ownership & Authorization**: Derived exclusively from authenticated session (`SessionAuthGuard` + `@CurrentUser()`). Body `userId` parameter is rejected.
- **Security & Whitelist**: Forbidden fields (`id`, `email`, `roles`, `passwordHash`, `isVerified`, `createdAt`, `updatedAt`, `sessions`) are excluded from DTO and automatically rejected with 400 Bad Request if supplied.
- **URL & Input Hardening**: String normalization (trimming), skills deduplication, and URL protocol checks (`http://` / `https://` required, `javascript:` protocol rejected).

### 7. RBAC & Authorization Foundation (`S1-03`)
- **Core Pipeline**: `HTTP Request` → `SessionAuthGuard` (Authentication) → `PermissionsGuard` (Authorization) → `AuthorizationService` (Evaluation) → `Controller Action`.
- **Role Model**: 6 canonical roles (`ADMIN`, `ORGANIZER`, `JUDGE`, `PARTICIPANT`, `MENTOR`, `SPONSOR`), strictly server-controlled.
- **Permission Registry**: Strongly-typed `Permission` constants and `PermissionAction` union string values in `@almosthack/types`.
- **Least Privilege & Admin Semantics**: Roles mapped strictly to permissions (`ROLE_PERMISSIONS`). `ADMIN` receives explicit platform permissions without hidden code bypasses.
- **Scope Contract Abstraction**: Standardized representation for `GLOBAL`, `ORGANIZATION`, `HACKATHON`, `ROUND`, `TEAM`, `SUBMISSION` scopes via `@RequireScope(...)`. Scope IDs are not blindly trusted and will be evaluated by domain-specific resource resolvers.
- **Deny-by-Default & Security**: Unauthenticated requests yield `401 Unauthorized`. Forbidden requests yield generic `403 Forbidden` (`FORBIDDEN`) without leaking permission metadata to clients. Failed authorization attempts for protected actions log `AUTHORIZATION_DENIED` to `AuditLog`.
- **Test Endpoint Isolation**: Development test routes under `/api/v1/auth/test/*` are disabled with 403 Forbidden when `NODE_ENV === 'production'`.

### 8. Organization Domain & Scoped Authorization (`S1-04`)
- **Resource Boundary**: Real, persistent organization resource model (`Organization` and `OrganizationMember`).
- **Platform vs Organization Roles**: Platform roles (`RoleName`) and Organization roles (`OrganizationRole`: `OWNER`, `ADMIN`, `MEMBER`) are strictly decoupled. Organization membership is required for organization-scoped operations.
- **Transactional Invariants**: Every organization is created transactionally with an initial `OWNER`. Sole `OWNER` cannot be demoted or removed. Ownership transfer is atomic (New owner → `OWNER`, Old owner → `ADMIN`).
- **Scoped Authorization**: Scoped routes evaluate caller's database `OrganizationMember` role permissions via `AuthorizationService.canAsync`. Platform `ADMIN` retains explicit `PLATFORM_ORGANIZATION_MANAGE` operational access.
- **Slug Strategy**: Conservative URL-safe slug regex (`[a-z0-9]+(?:-[a-z0-9]+)*`), deterministic normalization, and explicit `409 Conflict` (`ORGANIZATION_SLUG_CONFLICT`) on collision.
- **Destructive Deletion**: Hard deletion of organization and members inside a transaction, requiring explicit body confirmation matching the organization slug.




