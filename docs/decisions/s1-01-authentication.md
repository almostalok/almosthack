# Architecture Decision Record (ADR): S1-01 Authentication & Identity

**Status**: Accepted  
**Date**: 2026-08-16  
**Domain**: Core Platform Infrastructure / Security

---

## Context

AlmostHack requires a production-oriented end-to-end authentication and identity solution. As the foundation for a transparent, auditable hackathon operating system, security, session revocation capability, and protection against token theft are paramount.

---

## Key Decisions

### 1. Server-Side Session Authentication vs. Client-Side JWT in LocalStorage

- **Choice**: Server-side opaque session IDs in secure `HttpOnly` cookies.
- **Rationale**:
  - `localStorage` token storage is inherently vulnerable to Cross-Site Scripting (XSS) exfiltration.
  - Server-side session storage in PostgreSQL allows immediate, authoritative session revocation (instant logout / force-invalidation), whereas long-lived stateless JWTs cannot be revoked without complex blacklists.
  - Unused JWT dependencies (`@nestjs/jwt`, `passport-jwt`) are preserved in `package.json` for potential future scope, but are not used for primary web authentication.

### 2. Cryptographic Token Hashing & Session Storage

- **Raw Token**: Cryptographically secure 32-byte (64-character hex) random token generated via `crypto.randomBytes(32).toString('hex')`.
- **Database Storage**: Raw tokens are **never** stored in PostgreSQL. Only the SHA-256 hash (`tokenHash`) is stored. If database backups are exposed, active session credentials cannot be recovered or reused.
- **Browser Cookie**: The raw token is delivered exclusively via the `almosthack_session` HttpOnly cookie.

### 3. Session Cookie Configuration

- **Name**: `almosthack_session`
- **HttpOnly**: `true` (Inaccessible to client-side JavaScript)
- **Secure**: `true` in production environment (`process.env.NODE_ENV === 'production'`)
- **SameSite**: `lax`
- **Path**: `/`
- **Max-Age**: 7 days (604,800 seconds)

### 4. Session Rotation & Revocation Policy

- **Session Rotation**: On successful login, all previous active sessions for the user are revoked to prevent session fixation attacks.
- **Server-Side Authoritative Checks**: `SessionAuthGuard` validates that `revokedAt IS NULL` and `expiresAt > NOW()` on every request.

### 5. Password Security & Policy

- **Hashing**: `bcrypt` with cost factor 10.
- **Policy**: Minimum 8 characters, maximum 128 characters.
- **Zero Leakage**: Plaintext passwords and `passwordHash` values are strictly excluded from all API responses, logging, and error payloads.

### 6. Role Assignment Foundation

- **Default Role**: Self-registration automatically assigns `RoleName.PARTICIPANT`.
- **Privilege Separation**: Registration DTOs strictly forbid clients from submitting role or permission arrays.

### 7. Rate Limiting & Infrastructure Protection

- **Auth Endpoint Protection**: `AuthRateLimitGuard` enforces sliding-window rate limits on `POST /auth/login` and `POST /auth/register` to prevent credential brute-forcing.
- **Infrastructure Test Protection**: `POST /api/v1/infrastructure-test/enqueue` is protected behind `SessionAuthGuard`.

---

## Consequences

- All client requests must include cookie credentials (`credentials: 'include'`).
- The frontend relies on session hydration (`GET /api/v1/auth/me`) rather than reading tokens from storage.
