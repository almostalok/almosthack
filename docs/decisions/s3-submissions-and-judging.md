# Architecture Decision Record: S3 Submissions & Judging

## Context & Motivation
Sprint S3 establishes the production vertical slice transforming an eligible AlmostHack Team's connected GitHub repository into a formal Hackathon Submission and provides an isolated, rubric-based judging workflow.

## Decision & Technical Design

### 1. Server-Authoritative State Machines
- **Submission Status**: `DRAFT` → `SUBMITTED` → `UNDER_REVIEW` → `FINALIZED` (or `WITHDRAWN`).
- **Judge Assignment Status**: `ASSIGNED` → `IN_PROGRESS` → `COMPLETED` (or `REVOKED`).
- **Evaluation Status**: `DRAFT` → `SUBMITTED`.
- **Invariant**: Payload fields controlling status or state transitions (such as `status`, `submittedAt`, `finalizedAt`, `totalScore`) are strictly ignored or forbidden in DTO validation. State updates are performed exclusively by server-controlled domain endpoints.

### 2. One Submission Invariant
- A Team may submit at most **one submission per Hackathon** (`@@unique([hackathonId, teamId])`).
- Subsequent submission creation/draft update requests upsert the single active submission.

### 3. Submission Eligibility & Deadline Enforcement
- Submissions require:
  - Active Team status (non-dissolved).
  - Server time within hackathon submission window (`startsAt <= server_now <= endsAt`).
  - Active connected GitHub repository (`TeamRepository`).
- Deadline enforcement relies strictly on server UTC timestamp (`new Date()`). Client timestamps are untrusted.

### 4. Verified GitHub Repository Commit Snapshot
- Finalization triggers a server-side call via `GitHubProviderService` (S2-06) to fetch the repository's default branch and latest HEAD commit SHA.
- The verified commit SHA and snapshot timestamp (`commitSha`, `snapshotBranch`, `snapshotCapturedAt`) are stored permanently with the submission. Unverified client SHAs are rejected.

### 5. Conflict of Interest (COI) Protection
- A Judge is strictly prohibited from evaluating any submission for a Team in which the Judge is an active member.
- Enforced at assignment time with `403 Forbidden` (`CONFLICT_OF_INTEREST`).

### 6. Judge Isolation & Privacy
- Judges can only access submissions explicitly assigned to them via `JudgeAssignment`.
- Unsubmitted draft evaluations, private judge comments, and raw scores are kept private between judges.
- Scores remain invisible to participants until published by organizers.

### 7. Server-Calculated Scoring & Floating Point Safety
- Total evaluation scores are calculated strictly on the server:
  $$score = \operatorname{round}\left(\frac{\sum (score_i \times weight_i)}{\sum (maxScore_i \times weight_i)} \times 100, 2\right)$$
- Client-supplied aggregate `totalScore` values are ignored/rejected.

### 8. Strict Sprint Boundary (Out of Scope)
- S3 strictly excludes plagiarism detection, AI code analysis, sandboxed code execution, CI/CD Actions grading, commit scoring, leaderboards, public ranking, appeals, and prize payout (reserved for S4).
