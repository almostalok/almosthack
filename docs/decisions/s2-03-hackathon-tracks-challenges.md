# S2-03 — Hackathon Tracks & Challenges Architecture Decision Record

## Status
ACCEPTED

## Context
Following the completion of S2-01 (Hackathon Core & Lifecycle) and S2-02 (Configuration & Rules), S2-03 introduces the structural domain hierarchy that defines WHAT participants can build in a hackathon:
`Organization -> Hackathon -> Tracks -> Challenges`

A Hackathon contains multiple Tracks.
A Track contains multiple Challenges.

This ADR documents the data model, constraints, slug strategies, ordering, lifecycle locking, validation, security, audit logging, and future integration points.

## Domain Models & Database Schema

### 1. `HackathonTrack` (`hackathon_tracks` table)
- `id`: UUID (Primary key).
- `hackathonId`: Foreign key to `Hackathon` (`onDelete: Cascade`).
- `name`: Track name (2–150 chars).
- `slug`: Scoped unique slug per hackathon (`@@unique([hackathonId, slug])`).
- `shortDescription`: Summary string (max 300 chars).
- `description`: Detailed description (max 10,000 chars).
- `displayOrder`: Integer (default next available integer, indexed).
- `isActive`: Boolean (default `true`).
- `createdAt` / `updatedAt`: Timestamps.

### 2. `HackathonChallenge` (`hackathon_challenges` table)
- `id`: UUID (Primary key).
- `trackId`: Foreign key to `HackathonTrack` (`onDelete: Cascade`).
- `name`: Challenge name (2–150 chars).
- `slug`: Scoped unique slug per track (`@@unique([trackId, slug])`).
- `description`: Summary description (max 10,000 chars).
- `problemStatement`: Core problem statement (required, 5–20,000 chars).
- `requirements`: Functional/technical requirements (max 10,000 chars).
- `constraints`: Performance/architectural constraints (max 10,000 chars).
- `expectedOutcome`: Deliverable expectation (max 10,000 chars).
- `resources`: JSON array of `{ title: string, url: string }` (max 20 items, validated safe protocols `http:` and `https:`).
- `displayOrder`: Integer (default next available integer, indexed).
- `status`: Enum `ChallengeStatus` (`DRAFT`, `PUBLISHED`, `ARCHIVED`) - Default: `DRAFT`.
- `createdAt` / `updatedAt`: Timestamps.

## Lifecycle Mutability & LIVE Locking
Tracks and Challenges inherit Hackathon effective lifecycle status:
- **DRAFT**: Tracks & Challenges are fully editable by organization organizers.
- **PUBLISHED**: Editable prior to event start (`startsAt`).
- **LIVE**: Structural changes (creation, deletion, updates, reordering) are locked to maintain competition integrity (`409 HACKATHON_CONFIGURATION_LOCKED`).
- **COMPLETED**: Read-only.
- **ARCHIVED**: Read-only.

## API Surface
### Tracks
- `GET /api/v1/hackathons/:hackathonId/tracks`
- `POST /api/v1/hackathons/:hackathonId/tracks`
- `PATCH /api/v1/hackathons/:hackathonId/tracks/reorder`
- `GET /api/v1/hackathons/:hackathonId/tracks/:trackId`
- `PATCH /api/v1/hackathons/:hackathonId/tracks/:trackId`
- `DELETE /api/v1/hackathons/:hackathonId/tracks/:trackId`

### Challenges
- `GET /api/v1/tracks/:trackId/challenges`
- `POST /api/v1/tracks/:trackId/challenges`
- `PATCH /api/v1/tracks/:trackId/challenges/reorder`
- `GET /api/v1/tracks/:trackId/challenges/:challengeId`
- `PATCH /api/v1/tracks/:trackId/challenges/:challengeId`
- `DELETE /api/v1/tracks/:trackId/challenges/:challengeId`

## Security & Isolation
1. **Multi-tenant RBAC**: Scoped via `OrganizationMember` role permissions (`HACKATHON_READ`, `HACKATHON_UPDATE`). Cross-organization mutations return `403 Forbidden`.
2. **Nested Parent Verification**: Endpoints verify that tracks belong to the requested hackathon and challenges belong to the requested track, rejecting mismatched nested IDs with `404 Not Found`.
3. **Public Visibility**: When a hackathon is `PUBLIC` and not `DRAFT`, participant-facing track and challenge queries return only active tracks and `PUBLISHED` challenges. `DRAFT` challenges and internal metadata are not leaked to public viewers.
4. **XSS & Protocol Protection**: Challenge resources are strictly checked for safe protocols (`http:`, `https:`). Dangerous URL schemes (`javascript:`, `data:`, `file:`, `vbscript:`) are rejected. Frontend rendering uses React text node interpolation with `whitespace-pre-wrap` (no `dangerouslySetInnerHTML`).

## Audit Logging
The following audit events are recorded in `AuditLog`:
- `hackathon.track_created`
- `hackathon.track_updated`
- `hackathon.track_deleted`
- `hackathon.tracks_reordered`
- `hackathon.challenge_created`
- `hackathon.challenge_updated`
- `hackathon.challenge_deleted`
- `hackathon.challenges_reordered`

## Future Consumers
- **S2-05 (Teams)**: Teams can register interest in specific Tracks.
- **S3 (Submissions)**: Submissions reference the chosen Track and Challenge.
- **S3 (Judging & Rubrics)**: Scoring rubrics evaluate projects against specific Challenge requirements and constraints.
