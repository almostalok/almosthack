# ADR: S6 Event Operations, Communications & Notifications

## Status
Accepted

## Context
AlmostHack previously implemented competitive hackathon lifecycle management across S0 (Foundations), S1 (Identity & Auth), S2 (Event Structure & Registration), S3 (Submissions & Judging), S4 (Integrity & Forensics), and S5 (Results & Ranking). 

Running live hackathons requires an operational layer for communications, broadcasts, milestone reminders, and participant notifications.

Crucially, **S6 is an operations layer**. It must react to authoritative lifecycle events without redefining or mutating upstream domain states (e.g. hackathon status, submission deadlines, judging records, integrity scores, or results).

## Decision Drivers
1. **Server Authoritative Unread Counters**: Never trust client-side unread counters. Unread state must be computed strictly via server-side database counts.
2. **Idempotent Delivery**: Duplicate publication requests or reminder runs must never flood participants with duplicate notifications. Every generated notification carries a deterministic `idempotencyKey`.
3. **Tenant & Recipient Isolation**: Multi-tenant isolation is strictly enforced. Organizers of Org A cannot broadcast in Hackathon B. User A cannot view or mark read User B's notifications. Participants cannot see unpublished announcements.
4. **Preference-Driven Suppression**: In-app notifications respect user granular opt-ins (`inAppAnnouncements`, `inAppReminders`, `inAppTeamUpdates`, `inAppResults`).
5. **No Domain Mutation**: S6 schedulers and announcement workflows do not directly mutate hackathon lifecycle statuses or submission deadlines.

## Architecture & Data Model

### 1. Database Schema
- **`notifications`**:
  - `id` (UUID PK), `userId` (FK User), `organizationId` (FK Org optional), `hackathonId` (FK Hackathon optional)
  - `type` (NotificationType enum: ANNOUNCEMENT, REGISTRATION_CLOSING, SUBMISSION_DEADLINE, JUDGING_STARTED, JUDGING_COMPLETED, RESULTS_PUBLISHED, TEAM_UPDATE, SYSTEM)
  - `title`, `body`, `metadata` (JSONB)
  - `readAt` (DateTime optional)
  - `deliveryStatus` (NotificationDeliveryStatus enum: PENDING, DELIVERED, FAILED)
  - `idempotencyKey` (String unique optional)
  - Indexes on `(userId, readAt)`, `(userId, createdAt)`, `(hackathonId, type)`
- **`announcements`**:
  - `id` (UUID PK), `hackathonId` (FK Hackathon), `organizationId` (FK Org), `authorId` (FK User)
  - `title`, `body`, `metadata` (JSONB)
  - `status` (AnnouncementStatus enum: DRAFT, SCHEDULED, PUBLISHED, CANCELLED)
  - `recipientScope` (AnnouncementRecipientScope enum: ALL_PARTICIPANTS, ALL_TEAMS, ALL_JUDGES, ALL_ORGANIZERS, TRACK)
  - `targetTrackId` (FK HackathonTrack optional)
  - `scheduledAt`, `publishedAt`, `cancelledAt`
  - `version` (Int optimistic concurrency)
- **`notification_preferences`**:
  - `id` (UUID PK), `userId` (FK User unique)
  - `inAppAnnouncements` (Boolean, default true)
  - `inAppReminders` (Boolean, default true)
  - `inAppTeamUpdates` (Boolean, default true)
  - `inAppResults` (Boolean, default true)

### 2. Recipient Resolution
- `ALL_PARTICIPANTS`: Distinct active registrants (`ParticipantRegistration`) and active team members (`TeamMember`).
- `ALL_TEAMS`: Distinct active team members (`TeamMember`).
- `ALL_ORGANIZERS`: Organization members (`OrganizationMember`) with `OWNER` or `ADMIN` roles.
- `ALL_JUDGES`: Distinct judges assigned to the event (`JudgeAssignment`).
- `TRACK`: Registrants and team members enrolled in `targetTrackId`.

### 3. S6 API Surface
- `GET /api/v1/notifications` (Paginated user notifications)
- `GET /api/v1/notifications/unread-count` (Server-calculated unread count)
- `POST /api/v1/notifications/:id/read` (Mark single notification read)
- `POST /api/v1/notifications/read-all` (Mark all user unread notifications read)
- `GET /api/v1/notifications/preferences` (User notification preferences)
- `PATCH /api/v1/notifications/preferences` (Update preferences)
- `POST /api/v1/hackathons/:hackathonId/announcements` (Draft announcement)
- `GET /api/v1/hackathons/:hackathonId/announcements` (List announcements - published for participants, all for organizers)
- `GET /api/v1/hackathons/:hackathonId/announcements/:id` (Detail view)
- `PATCH /api/v1/hackathons/:hackathonId/announcements/:id` (Update draft)
- `POST /api/v1/hackathons/:hackathonId/announcements/:id/schedule` (Schedule announcement)
- `POST /api/v1/hackathons/:hackathonId/announcements/:id/publish` (Publish announcement immediately with fanout)
- `POST /api/v1/hackathons/:hackathonId/announcements/:id/cancel` (Cancel scheduled announcement)

## Consequences
- Full operational capability for organizer broadcast communications and milestone notifications.
- Zero regression across S0 through S5 domains.
- 100% compliance with strict multi-tenant boundaries and immutability invariants.
