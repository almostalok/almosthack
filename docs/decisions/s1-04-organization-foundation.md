# ADR S1-04: Organization Domain & Scoped Authorization Foundation

## Context & Problem Statement
In AlmostHack Sprint 1 — Task 04, the abstract `ORGANIZATION` scope contract established in S1-03 must be instantiated as a persistent, secure, resource-scoped domain. The architecture requires a complete vertical slice connecting identity, organization creation, transactional owner membership, role hierarchy, scoped authorization resolution, audit logging, API endpoints, and web UI.

## Decision Drivers
- **Resource Privacy & Isolation**: Platform roles (`RoleName`) MUST NOT be confused with or substituted for organization roles (`OrganizationRole`). Belonging to Organization A must give zero access to Organization B.
- **Transactional Invariants**: Every organization must be created transactionally with an initial `OWNER`. An organization can never exist without an owner, and the sole `OWNER` cannot be demoted or removed.
- **Explicit Conflict & Slug Behavior**: Slugs must be URL-safe (`[a-z0-9]+(?:-[a-z0-9]+)*`), deterministic, normalized, and strictly validated. Slug collisions return explicit `409 Conflict` (`ORGANIZATION_SLUG_CONFLICT`) rather than silent auto-incrementing.
- **Destructive Operation Safety**: Deleting an organization requires explicit API-level confirmation matching the organization slug, executing a transactional hard delete of memberships and organization metadata.

## Architectural Design

### 1. Domain Entities & Database Schema
- **`Organization`**: `id` (UUID v4), `name`, `slug` (unique), `description`, `logoUrl`, `websiteUrl`, `createdAt`, `updatedAt`.
- **`OrganizationMember`**: `id` (UUID v4), `organizationId`, `userId`, `role` (`OWNER`, `ADMIN`, `MEMBER`), `status` (`ACTIVE`, `SUSPENDED`), `joinedAt`, `createdAt`, `updatedAt`, with database-level `@@unique([organizationId, userId])` constraint.

### 2. Platform Roles vs Organization Roles
- **Platform Roles** (`RoleName`): `ADMIN`, `ORGANIZER`, `JUDGE`, `PARTICIPANT`, `MENTOR`, `SPONSOR`.
- **Organization Roles** (`OrganizationRole`):
  - `OWNER`: Full organization administration, profile settings, member management, role changes, ownership transfer, destructive deletion.
  - `ADMIN`: Organization administration, member addition/removal (MEMBER role only), profile updates. Cannot promote to OWNER, cannot remove/demote OWNER or other ADMINs.
  - `MEMBER`: Basic organization visibility and member listing.

### 3. Organization-Scoped Authorization Engine
- Scoped route endpoints (`/organizations/:organizationId/...`) pass parameter `:organizationId` to `PermissionsGuard` via `@Scope(ScopeType.ORGANIZATION, 'organizationId')`.
- `AuthorizationService.canAsync` resolves active `OrganizationMember` from PostgreSQL database:
  - If caller possesses platform `PLATFORM_ORGANIZATION_MANAGE` permission (platform `ADMIN`), operational access is granted.
  - Otherwise, caller's database `OrganizationRole` is resolved and evaluated against `ORGANIZATION_ROLE_PERMISSIONS`.
  - Client-provided claims are ignored; authorization decisions are authoritative on the server.

### 4. Ownership Semantics & Invariants
- **Creation**: `createOrganization` transactionally creates the `Organization` record and inserts `OrganizationMember` with `role: OWNER`.
- **Single Owner Minimum Invariant**: `removeMember` and `updateMemberRole` reject any mutation that would leave an organization with zero active `OWNER` records (`LAST_OWNER_CONSTRAINT`).
- **Atomic Ownership Transfer**: `transferOwnership` executes inside a database transaction: target member becomes `OWNER`, former owner becomes `ADMIN`.

### 5. Audit Logging
Every mutation emits a structured audit record into `AuditLog`:
- `ORGANIZATION_CREATED`
- `ORGANIZATION_UPDATED`
- `ORGANIZATION_DELETED`
- `ORGANIZATION_MEMBER_ADDED`
- `ORGANIZATION_MEMBER_REMOVED`
- `ORGANIZATION_MEMBER_ROLE_CHANGED`
- `ORGANIZATION_OWNERSHIP_TRANSFERRED`

## Consequences
- **Positive**: Complete domain isolation, strong transactional consistency, zero dependency on external invitation/billing SaaS, 100% compliant with S1-04 specification.
- **Out of Scope**: Hackathons, rounds, teams, GitHub OAuth, code repositories, judging, invitations via email SaaS, and public discovery remain cleanly excluded for future sprints.
