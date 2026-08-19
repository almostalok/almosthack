# Architecture Decision Record: S2-06 GitHub Integration & Repository Orchestration

## Context & Motivation
Sprint S2-06 establishes the server-authoritative integration connecting an AlmostHack Team to GitHub. This foundation is mandatory for downstream submission (S3), judging, and repository integrity verification workflows.

## Decision & Technical Design

### 1. Provider Choice & OAuth Flow
- **Integration**: Official GitHub OAuth App flow (`https://github.com/login/oauth/authorize`, `https://github.com/login/oauth/access_token`).
- **Permissions / Scope**: Minimum required scope requested (`user:email`, `public_repo`).
- **CSRF State Protection**: Each OAuth initiation generates a short-lived (15 min), single-use, session-bound `OAuthState` record with cryptographically random 32-byte hex `state`. State validation ensures one-time consumption (`consumedAt`) and rejects reused, expired, or cross-session attempts.

### 2. Token Security Boundary (P0 Invariant)
- **Credential Storage**: Raw GitHub access tokens are encrypted at rest using authenticated **AES-256-GCM** encryption (`GitHubCredentialService`).
- **Ciphertext Structure**: Formatted as `${ivHex}:${encryptedHex}:${tagHex}`.
- **Zero Token Leakage**: Decryption is isolated exclusively to the server-side `GitHubCredentialService`. Tokens are strictly prohibited from appearing in API responses, DTOs, controllers, audit logs, frontend state, or browser storage.

### 3. Identity Linking
- **Identity Key**: Stable numeric GitHub User ID (`githubUserId`) from `GET https://api.github.com/user`.
- **Constraint**: Exactly one GitHub identity link per AlmostHack user (`@@unique([userId])` and `@@unique([githubUserId])`). Duplicate linking of the same GitHub account to multiple AlmostHack users is rejected with `409 Conflict`.

### 4. Repository Model & Provisioning Idempotency
- **Entity**: `TeamRepository` model linked to `Team`.
- **Association**: Exactly **one active repository per Team** (`@@unique([teamId, provider])`).
- **Naming**: Deterministic canonical naming (`almosthack-{hackathon-slug}-{team-slug}`).
- **Idempotency**: Repeated provisioning calls return the existing active `TeamRepository` without creating redundant repositories on GitHub.

### 5. Failure Recovery & Non-Transactional Provider Boundaries
- GitHub REST API calls and PostgreSQL database transactions are non-atomic.
- Provisioning logic handles external creation vs local persistence failures by reconciling existing GitHub repositories on retry.
- Server maps all raw GitHub HTTP errors (401, 403, 404, 409, 422, 429, 5xx) to safe NestJS HTTP Exceptions without leaking provider internals.

### 6. Scope Boundary
- S2-06 strictly implements OAuth, identity linking, credential security, permission verification, and repository orchestration.
- Submissions (S3), judging, leaderboards, plagiarism checks, commit scoring, CI/CD grading, and arbitrary GitHub API proxies are explicitly excluded.
