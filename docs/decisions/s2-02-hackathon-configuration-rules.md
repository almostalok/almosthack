# S2-02 — Hackathon Configuration & Rules Architecture Decision Record

## Status
ACCEPTED

## Context
S2-01 established the core Hackathon model, organization relationship, schedule parameters, macro lifecycle transitions, and registration window state derivation.
S2-02 establishes static policy configuration, participation constraints, eligibility rules, AI usage policy, code rules, open-source policy, GitHub integration requirements, repository provisioning policy, and participant-facing human-readable markdown rules before participant registration, team formation, GitHub integration, judging panels, and integrity analysis systems are created in subsequent sprints.

## Architectural Model & Persisted Schema
A dedicated 1-to-1 database model `HackathonConfiguration` is created, linked directly to `Hackathon` via `hackathonId` with `onDelete: Cascade`.

### Database Schema (`hackathon_configurations` table)
- `id`: Unique UUID identifier.
- `hackathonId`: Foreign key to `Hackathon` (Unique 1-to-1 relation).
- `participationMode`: Enum `ParticipationMode` (`INDIVIDUAL`, `TEAM`, `BOTH`) - Default: `BOTH`.
- `minTeamSize`: Int? - Default: 1 (Normalized to `null` under `INDIVIDUAL` mode).
- `maxTeamSize`: Int? - Default: 4 (Normalized to `null` under `INDIVIDUAL` mode).
- `eligibilityType`: Enum `EligibilityType` (`OPEN`, `STUDENTS_ONLY`, `INVITE_ONLY`) - Default: `OPEN`.
- `allowedBranches`: String[] - Normalized array (case-insensitive deduplication, trimmed).
- `allowedColleges`: String[] - Normalized array (case-insensitive deduplication, trimmed).
- `graduationYearFrom`: Int? - Bounds check: 1900..2200.
- `graduationYearTo`: Int? - Bounds check: 1900..2200 (`graduationYearFrom <= graduationYearTo`).
- `aiUsagePolicy`: Enum `AIUsagePolicy` (`ALLOWED`, `RESTRICTED`, `PROHIBITED`) - Default: `ALLOWED`.
- `aiDisclosureRequired`: Boolean - Default: `false`.
- `preExistingCodePolicy`: Enum `PreExistingCodePolicy` (`PROHIBITED`, `ALLOWED`, `ALLOWED_WITH_DISCLOSURE`) - Default: `PROHIBITED`.
- `openSourcePolicy`: Enum `OpenSourcePolicy` (`ALLOWED`, `ALLOWED_WITH_ATTRIBUTION`, `RESTRICTED`, `PROHIBITED`) - Default: `ALLOWED_WITH_ATTRIBUTION`.
- `githubRequired`: Boolean - Default: `true`.
- `repositoryPolicy`: Enum `RepositoryPolicy` (`PLATFORM_MANAGED`, `EXTERNAL_ALLOWED`) - Default: `PLATFORM_MANAGED`.
- `rulesMarkdown`: String? (Max 100,000 characters).
- `createdAt` / `updatedAt`: Timestamps.

## Lifecycle Mutability & Configuration Locking
Configuration follows the authoritative hackathon lifecycle status derived from S2-01:
- `DRAFT`: Fully editable.
- `PUBLISHED`: Core policy editable before event start (`startsAt`).
- `LIVE`: Core policies & rules markdown are locked/immutable (`409 HACKATHON_CONFIGURATION_LOCKED`).
- `COMPLETED`: Locked (Read-only).
- `ARCHIVED`: Locked (Read-only).

## API Surface
- `GET /api/v1/hackathons/:hackathonId/configuration` — Fetch complete policy configuration.
- `PUT /api/v1/hackathons/:hackathonId/configuration` — Update policy configuration (Requires `HACKATHON_UPDATE`).
- `GET /api/v1/hackathons/:hackathonId/rules` — Retrieve participant-facing rules summary & markdown.
- `PATCH /api/v1/hackathons/:hackathonId/rules` — Update human-readable markdown rules (Requires `HACKATHON_UPDATE`).

## Authorization & Isolation
Reuses S1-03 RBAC & Scope Authorization. Server-side checks verify organization membership and permissions (`HACKATHON_READ`, `HACKATHON_UPDATE`). Cross-organization mutation attempts return `403 Forbidden`.

## Audit Events
The following actions create audit log records in `AuditLog`:
- `hackathon.created` (Auto-provisions default configuration)
- `hackathon.configuration_updated`
- `hackathon.rules_updated`

## Future Integration Points
- **S2-05 (Teams)**: Consumes `participationMode`, `minTeamSize`, and `maxTeamSize`.
- **S2-06 (Repositories)**: Consumes `githubRequired` and `repositoryPolicy`.
- **S4 (Integrity Engine)**: Consumes `aiUsagePolicy`, `aiDisclosureRequired`, `preExistingCodePolicy`, and `openSourcePolicy`.
