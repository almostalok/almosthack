# ADR S1-03: Production-Ready RBAC & Authorization Foundation

## Status
ACCEPTED

## Context
Following the completion of S1-01 (Authentication & Identity) and S1-02 (Identity & Profile), AlmostHack requires a robust, scalable, deny-by-default authorization architecture.

Authentication answers: *"Who are you?"*  
Authorization answers: *"What are you allowed to do?"*  
Scope answers: *"Where are you allowed to do it?"*

The system must support future domain expansion (Organizations, Hackathons, Rounds, Teams, Repositories, Submissions, Judging, Appeals, etc.) without requiring structural refactoring of authorization contracts.

## Key Decisions

### 1. Separation of Authentication & Authorization
- **Authentication**: Handled strictly by `SessionAuthGuard`, parsing HTTP cookies/headers into `req.user`.
- **Authorization**: Handled by `PermissionsGuard` and `RolesGuard`, using `AuthorizationService` to evaluate user roles, permissions, and scope contracts.

### 2. Canonical Roles
- `ADMIN`: Platform-level administrative capabilities.
- `ORGANIZER`: Hackathon creation and operation management.
- `JUDGE`: Evaluates assigned submissions and scores.
- `PARTICIPANT`: Participates in hackathons and submits projects.
- `MENTOR`: Provides mentorship and claims support tickets.
- `SPONSOR`: Manages permitted sponsorship assets and prize analytics.

Roles are strictly server-controlled and cannot be assigned by clients during registration or updates.

### 3. Canonical Permission Registry
Permissions are strongly-typed in `@almosthack/types` (`PermissionAction` union & `Permission` object enum):
- `profile:read_self`, `profile:update_self`
- `user:read_self`, `user:update_self`, `user:read`, `user:update`
- `system:health_read`, `system:manage`
- `audit:read`, `audit:export`
- `auth:manage_sessions`
- `hackathon:create`, `hackathon:update`, `hackathon:delete`, `hackathon:publish`, `hackathon:view`
- `submission:create`, `submission:update`, `submission:delete`, `submission:view`
- `judging:assign`, `judging:submit_score`, `judging:calibrate`, `judging:view_results`
- `mentor:claim_ticket`, `mentor:view_requests`
- `sponsor:view_analytics`, `sponsor:manage_prizes`

### 4. Role → Permission Mapping & Least Privilege
Every role is mapped to explicit permissions.
- `ADMIN`: Explicitly granted all platform permissions (no invisible, hardcoded bypass).
- `PARTICIPANT`: Granted self-profile management (`profile:read_self`, `profile:update_self`, `user:read_self`, `user:update_self`), hackathon view, and submission management.

### 5. Multi-Role & Multi-Permission Semantics
- `@RequireRoles(A, B)` defaults to **OR** semantics (user has role A OR role B). Configurable to **AND**.
- `@RequirePermissions(A, B)` defaults to **AND** semantics (user has permission A AND permission B). Configurable to **OR**.

### 6. Scope Abstraction Contract
- Supported Scope Types: `GLOBAL`, `ORGANIZATION`, `HACKATHON`, `ROUND`, `TEAM`, `SUBMISSION`.
- Scope metadata (`@RequireScope(ScopeType.HACKATHON, 'hackathonId')`) attaches scope context to authorization requests. Scope IDs are not blindly trusted; future resource ownership checks will evaluate resource membership when domains are implemented.

### 7. Deny-by-Default & Error Standardization
- Unauthenticated requests return `401 Unauthorized`.
- Authenticated requests lacking required roles, permissions, or valid context return `403 Forbidden` (`FORBIDDEN`).
- No internal permission/role names are leaked to clients in production HTTP error responses.
- Authorization failures for protected actions log `AUTHORIZATION_DENIED` events to `AuditLog`.

### 8. Frontend & Developer Test Endpoints
- Client-side helper functions (`hasRole`, `hasPermission`) are exported from `@almosthack/utils` for UI visibility.
- Test endpoints under `/api/v1/auth/test/*` demonstrate role, permission, and scope contract evaluation, and are strictly disabled (`403`) in `production` environment (`NODE_ENV === 'production'`).

## Consequences
- Clean separation between identity authentication and granular authorization.
- Zero external policy engine dependencies (Casbin, CASL, Oso, Redis cache avoided).
- `GET /users/me` and `PATCH /users/me` protected seamlessly with `PROFILE_READ_SELF` and `PROFILE_UPDATE_SELF`.
- Fully ready for future domain modules (Organizations, Hackathons, Submissions, Judging).
