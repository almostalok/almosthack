# ALMOSTHACK — AUDIT FEATURE MATRIX

**Audit Date:** October 13, 2026  
**Auditor:** QA Lead, Staff Full-Stack Engineer & Product Quality Auditor  
**Classification Values:** `VERIFIED_COMPLETE`, `PARTIALLY_VERIFIED`, `PARTIAL_IMPLEMENTATION`, `UI_ONLY`, `BACKEND_ONLY`, `MOCKED`, `BROKEN`, `MISSING`, `BLOCKED`

---

## 1. Identity & Organizations

| Subfeature | Status | Frontend | Backend API | Database | Tests | Audit Evidence |
|---|:---:|---|---|---|---|---|
| User Registration | `VERIFIED_COMPLETE` | `/register`, `auth-provider.tsx` | `POST /api/v1/auth/register` | `User`, `Role`, `UserRole` | `auth.service.spec.ts`, `auth.e2e-spec.ts` | Bcrypt hashing (12 rounds), auto-assigns `PARTICIPANT` role, sets HTTP-only cookie. |
| User Login & Session | `VERIFIED_COMPLETE` | `/login`, `auth-provider.tsx` | `POST /api/v1/auth/login` | `Session` (SHA-256 token hash) | `session.service.spec.ts`, `auth.e2e-spec.ts` | 7-day session lifetime, client IP and User-Agent tracking, cookie clearance on logout. |
| User Profile Management | `PARTIALLY_VERIFIED` | `/profile` | `GET/PUT /api/v1/users/me` | `User` profile fields | `users.service.spec.ts`, `users.e2e-spec.ts` | Profile updates work on backend; UI form exists but avatar upload is a placeholder. |
| Organization Creation | `VERIFIED_COMPLETE` | `/organizations/new` | `POST /api/v1/organizations` | `Organization`, `OrganizationMember` | `organizations.service.spec.ts`, `organizations.e2e-spec.ts` | Auto-assigns creator as `OWNER`, slug uniqueness enforced, audit log recorded. |
| Organization Membership & Roles | `VERIFIED_COMPLETE` | `/organizations/[id]` | `POST /organizations/:id/members` | `OrganizationMember` (`OWNER`, `ADMIN`, `MEMBER`) | `organizations.e2e-spec.ts` | Role updates, status suspension, and transfer ownership enforced. |
| Cross-Organization Isolation | `PARTIALLY_VERIFIED` | Client route guards | `AuthorizationService.canAsync()` | Foreign key checks | `authorization.service.spec.ts` | Evaluates org membership in `AuthorizationService`; some endpoints lack explicit scope check. |

---

## 2. Hackathon Lifecycle

| Subfeature | Status | Frontend | Backend API | Database | Tests | Audit Evidence |
|---|:---:|---|---|---|---|---|
| Create & Edit Hackathon | `VERIFIED_COMPLETE` | `/hackathons/new`, `/hackathons/[id]/settings` | `POST/PATCH /organizations/:id/hackathons` | `Hackathon` | `hackathons.e2e-spec.ts` | Multi-step form, slug collision handling, start/end date validation. |
| Rules & Configuration | `VERIFIED_COMPLETE` | `/hackathons/[id]/configuration`, `rules` | `PUT /hackathons/:id/rules`, `/configuration` | `HackathonConfiguration`, `HackathonRule` | `hackathons.e2e-spec.ts` | Team min/max limits, submission locking toggles, rubric weights. |
| Tracks & Challenges | `VERIFIED_COMPLETE` | `/hackathons/[id]/tracks`, `[id]/tracks/[id]` | `POST/PATCH /hackathons/:id/tracks` | `HackathonTrack`, `HackathonChallenge` | `hackathons.e2e-spec.ts` | Full CRUD, track reordering, prize description fields. |
| Status State Machine | `VERIFIED_COMPLETE` | Workspace Action Header | `POST /hackathons/:id/publish`, `/launch`, `/complete` | `HackathonStatus` enum | `hackathons.e2e-spec.ts` | State machine enforces `DRAFT -> PUBLISHED -> LIVE -> COMPLETED -> ARCHIVED`. |
| Editing Restrictions Post-Launch | `VERIFIED_COMPLETE` | Form disabled states | `HackathonsService.assertModifiable()` | Checked before update | `hackathons.e2e-spec.ts` | Service throws `ConflictException` if modifying locked dates or rules on LIVE hackathons. |

---

## 3. Registrations & Teams

| Subfeature | Status | Frontend | Backend API | Database | Tests | Audit Evidence |
|---|:---:|---|---|---|---|---|
| Participant Registration | `PARTIALLY_VERIFIED` | `/hackathons/[id]/registrations`, `use-registrations.ts` | `POST /hackathons/:id/register` | `ParticipantRegistration` | `registrations.e2e-spec.ts` | Backend enforces capacity and uniqueness; frontend hook defaults to `MOCK_PARTICIPANTS` on error. |
| Team Creation & Captaincy | `PARTIALLY_VERIFIED` | `/hackathons/[id]/teams`, `use-teams.ts` | `POST /hackathons/:id/teams` | `Team`, `TeamMember` | `teams.e2e-spec.ts` | Backend creates team and captain role; frontend falls back to `MOCK_TEAMS` on API failures. |
| Invitations & Team Limits | `PARTIALLY_VERIFIED` | Team Drawer modal | `POST /teams/:id/invitations` | `TeamInvitation` | `teams.e2e-spec.ts` | Backend checks min/max size limits; frontend mock data masks server responses. |
| Unassigned Participant Workflows | `UI_ONLY` | Matching tab in registrations | None | None | None | UI provides matching cards and filter tabs, but backend has no matchmaking engine. |
| Team Locking & Disbanding | `PARTIAL_IMPLEMENTATION` | Team drawer buttons | `DELETE /teams/:id` | Status flags | `teams.e2e-spec.ts` | Backend permits disbanding prior to submission; locking logic only tied to submission state. |

---

## 4. GitHub & Repositories

| Subfeature | Status | Frontend | Backend API | Database | Tests | Audit Evidence |
|---|:---:|---|---|---|---|---|
| GitHub OAuth Authorization | `VERIFIED_COMPLETE` | `/repositories` Connect Button | `GET /api/v1/github/connect`, `/callback` | `GitHubAccount`, `OAuthState` | `github.e2e-spec.ts` | State parameter validated, token encrypted in DB, accounts linked to user. |
| Token Encryption & Storage | `BROKEN` | None | `GitHubCredentialService` | AES-256-GCM authenticated ciphertext | `github-credential.service.spec.ts` | Critical flaw: falls back to hardcoded default key if `ENCRYPTION_KEY` is not set in env. |
| Repository Linking / Provisioning | `VERIFIED_COMPLETE` | Modal Connect / Provision | `POST /teams/:id/repository/connect`, `/provision` | `Repository` | `github.e2e-spec.ts` | Verifies push permissions on GitHub; auto-creates repo via GitHub API if requested. |
| Webhook & Signature Verification | `MISSING` | None | None | None | None | Zero webhook endpoints exist; no HMAC signature verification; no live push notifications. |
| Post-Submission Change Tracking | `MISSING` | None | None | None | None | No commit polling, webhook event listening, or Git diff inspection after submission. |

---

## 5. Submissions

| Subfeature | Status | Frontend | Backend API | Database | Tests | Audit Evidence |
|---|:---:|---|---|---|---|---|
| Draft Creation & Editing | `VERIFIED_COMPLETE` | Workspace / Submission View | `POST /teams/:id/submissions` | `Submission` (`DRAFT`) | `submissions.e2e-spec.ts` | Zod validation, team association, demo/video/documentation URLs stored. |
| Deadline Window Enforcement | `VERIFIED_COMPLETE` | Disabled UI buttons | `SubmissionsService.finalizeSubmission` | `Hackathon.endsAt` comparison | `submissions.e2e-spec.ts` | Throws `SUBMISSION_DEADLINE_EXCEEDED` if `now > hackathon.endsAt`. |
| Commit SHA Snapshot Capture | `PARTIALLY_VERIFIED` | Snapshot badge | Queries GitHub default branch HEAD | `commitSha`, `snapshotCapturedAt` | `submissions.e2e-spec.ts` | Resolves HEAD SHA via GitHub API; if API fails, submission still finalizes with `commitSha: null`. |
| Submission Finalization | `PARTIAL_IMPLEMENTATION` | Finalize modal | `POST /submissions/:id/finalize` | `SubmissionStatus.FINALIZED` | `submissions.e2e-spec.ts` | Frontend `use-submissions.ts` catches API errors and marks status `FINALIZED` locally (fake success). |
| Withdrawal Workflow | `PARTIAL_IMPLEMENTATION` | Withdraw modal | `POST /submissions/:id/withdraw` | `SubmissionStatus.WITHDRAWN` | `submissions.e2e-spec.ts` | Backend sets `WITHDRAWN`; frontend catches errors and sets local state to `WITHDRAWN` anyway. |

---

## 6. Judging & Rubrics

| Subfeature | Status | Frontend | Backend API | Database | Tests | Audit Evidence |
|---|:---:|---|---|---|---|---|
| Rubric & Criteria Management | `VERIFIED_COMPLETE` | Configuration tab | `POST/DELETE /hackathons/:id/judging-criteria` | `JudgingCriterion` | `judging.service.spec.ts`, `judging.e2e-spec.ts` | Weighted scores, min/max limits, custom descriptions. |
| Judge Assignment & Allocation | `VERIFIED_COMPLETE` | `/judges`, Assign Dialog | `POST /submissions/:id/judges` | `JudgeAssignment` | `judging.e2e-spec.ts` | Assignments persisted with status `ASSIGNED`; organizers manage assignments. |
| Conflict-of-Interest (COI) Guard | `VERIFIED_COMPLETE` | None | `JudgingService.assignJudge`, `submitEvaluation` | Team membership checks | `judging.e2e-spec.ts` | Throws `CONFLICT_OF_INTEREST` if judge is an active member of the evaluated team. |
| Score & Feedback Submission | `PARTIALLY_VERIFIED` | Judge Workspace UI | `POST /judge-assignments/:id/evaluation/submit` | `JudgeEvaluation`, `EvaluationScore` | `judging.e2e-spec.ts` | Backend enforces immutable submission; frontend `use-judge-workspace.ts` relies on `judge-mock-data.ts`. |
| Judge Calibration & Normalization | `BACKEND_ONLY` | None | `ResultsService.calculateResults()` | Normalized scores | `results.service.spec.ts` | Backend z-score / weighted normalization runs during calculation; no separate calibration UI. |

---

## 7. Transparent Judging & Integrity

| Subfeature | Status | Frontend | Backend API | Database | Tests | Audit Evidence |
|---|:---:|---|---|---|---|---|
| Plagiarism / Similarity Algorithm | `BROKEN` | `/hackathons/[id]/integrity` | `IntegrityService.startAnalysis` | `IntegrityAnalysis`, `IntegrityFinding`, `IntegrityEvidence` | `integrity-engine.service.spec.ts` | **Critical Defect:** Backend `fetchSubmissionFiles` generates synthetic dummy files; real Git code is never analyzed. |
| Synchronous Execution Bottleneck | `BROKEN` | Analyze button | `IntegrityController.startAnalysis` | Pairwise comparison in HTTP handler | `integrity.e2e-spec.ts` | Analysis runs synchronously across all submissions in HTTP request thread; will timeout under real load. |
| Integrity Review & Dismissal | `VERIFIED_COMPLETE` | Finding Drawer Dialogs | `POST /integrity/findings/:id/confirm`, `/dismiss` | `IntegrityReview`, `AuditLog` | `integrity.e2e-spec.ts` | Non-destructive review workflow; does not disqualify submission without organizer confirmation. |
| Transparent Judging Visibility | `PARTIAL_IMPLEMENTATION` | `/hackathons/[id]/results/[id]` | `ResultsService.getLeaderboard` | Public score breakdown | `results.e2e-spec.ts` | Backend respects publication state; frontend view uses `transparent-judging-mock-data.ts`. |

---

## 8. Results & Leaderboard

| Subfeature | Status | Frontend | Backend API | Database | Tests | Audit Evidence |
|---|:---:|---|---|---|---|---|
| Authoritative Ranking Calculation | `VERIFIED_COMPLETE` | Calculate button | `POST /hackathons/:id/results/calculate` | `ResultSet`, `ResultEntry` | `results.service.spec.ts`, `results.e2e-spec.ts` | Deterministic weighted scoring, tie resolution, input fingerprint hash. |
| Approval & Staleness Check | `VERIFIED_COMPLETE` | Approve Dialog | `POST /hackathons/:id/results/approve` | `ResultSetStatus.APPROVED` | `results.e2e-spec.ts` | Rejects approval if input fingerprint changed since calculation (`STALE_RESULTS`). |
| Public Leaderboard Projection | `PARTIALLY_VERIFIED` | `/hackathons/[id]/leaderboard` | `GET /hackathons/:id/leaderboard` | Reads PUBLISHED set only | `results.e2e-spec.ts` | Backend leaks zero unapproved data; frontend hook ignores API response and renders `MOCK_RANKINGS`. |
| Custom Awards Assignment | `MOCKED` | Assign Winner Modal | **None** | **None** | None | Award assignment is pure client-side state in `use-results.ts`; no DB model or API endpoint exists. |

---

## 9. Certificates

| Subfeature | Status | Frontend | Backend API | Database | Tests | Audit Evidence |
|---|:---:|---|---|---|---|---|
| Certificate Issuance | `MOCKED` | `/certificates`, Bulk Issue Dialog | **None** | **None** | None | Pure frontend state simulation in `use-certificates.ts`; generates fake `0x${Math.random()}` signatures. |
| Certificate Download / PDF | `UI_ONLY` | Download button | **None** | **None** | None | Renders SVG template on client; no server-side signed PDF generation or verification. |
| Public Verification Route | `UI_ONLY` | `/certificates/[id]` | **None** | **None** | None | Client-only component checking `MOCK_CERTIFICATES`; zero database verification. |
| Revocation & Regeneration | `MOCKED` | Revoke / Regenerate Modals | **None** | **None** | None | Mutations update client React state only; refreshed page loses all state. |

---

## 10. Announcements & Notifications

| Subfeature | Status | Frontend | Backend API | Database | Tests | Audit Evidence |
|---|:---:|---|---|---|---|---|
| Announcement Creation & Delivery | `VERIFIED_COMPLETE` | `/announcements`, Create Dialog | `POST /hackathons/:id/announcements` | `Announcement`, `Notification` | `announcements.e2e-spec.ts` | Resolves recipients by scope (`ALL_PARTICIPANTS`, `TRACK`, `JUDGES`) and inserts in-app notifications. |
| Scheduled Announcements | `BROKEN` | Schedule Dialog | `POST /announcements/:id/schedule` | `scheduledAt`, `SCHEDULED` status | Unit tests only | Service method `processDueScheduledAnnouncements()` is never called because NestJS cron scheduler is absent. |
| In-App Notification Center | `VERIFIED_COMPLETE` | `/notifications`, Bell Icon | `GET/PATCH /api/v1/notifications` | `Notification`, `NotificationPreference` | `notifications.e2e-spec.ts` | Pagination, unread counts, mark-all-as-read, user notification preference filtering. |
| Email / External Delivery | `MISSING` | None | None | None | None | No email provider (SES/SendGrid/Resend) configured; delivery status set to `DELIVERED` on DB insert. |

---

## 11. Analytics & Audit Logs

| Subfeature | Status | Frontend | Backend API | Database | Tests | Audit Evidence |
|---|:---:|---|---|---|---|---|
| Operational Telemetry | `VERIFIED_COMPLETE` | None | `GET /metrics`, `/metrics/prometheus` | None | `metrics.service.spec.ts` | Prometheus metrics text format and JSON metrics summary exposed with process uptime. |
| Hackathon Operational Analytics | `MOCKED` | `/analytics`, `use-analytics.ts` | **None** | **None** | None | Frontend charts and funnel numbers are 100% hardcoded in `analytics-mock-data.ts`. |
| Audit Log Persistence | `VERIFIED_COMPLETE` | Mutation side-effects | `PrismaService.auditLog.create()` | `AuditLog` | Multiple specs | Actor ID, email, action, target entity, timestamp, and JSON metadata recorded across all domains. |
| Audit Log Query & Tenancy | `BROKEN` | `/audit-logs`, `AuditLogView` | `GET /api/v1/audit-logs` | `AuditLog` | `audit.service.spec.ts` | **BOLA Flaw:** `AuditController.getAuditLogs` queries logs globally without filtering by `organizationId`. |
