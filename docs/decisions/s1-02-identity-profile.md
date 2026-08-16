# Architecture Decision Record: S1-02 Identity & Profile

## Context & Objectives

Sprint 1 — Task 02 (`S1-02`) establishes the authenticated user profile slice in AlmostHack. The goal is to allow participants to view, edit, validate, and persist their identity and extended participant metadata (`college`, `branch`, `graduationYear`, `skills`, `githubUsername`, `linkedinUrl`, `portfolioUrl`, `avatarUrl`, `bio`) end-to-end across NestJS, `@almosthack/api-client`, Next.js, and PostgreSQL.

## Architectural Decisions

### 1. User vs UserProfile Data Model
- **Decision**: Profile attributes are stored directly on the existing `User` model rather than creating a separate `UserProfile` table.
- **Rationale**:
  - The existing `User` model already housed core profile attributes (`name`, `avatarUrl`, `bio`, `githubUsername`).
  - Adding 6 additional attributes (`college`, `branch`, `graduationYear`, `skills`, `linkedinUrl`, `portfolioUrl`) directly to `User` maintains single-table query performance (0 JOIN overhead), avoids orphaned profile rows, and avoids unnecessary model fragmentation.
  - Authentication credential fields (`email`, `passwordHash`, `isVerified`) remain conceptually separate from profile attributes.

### 2. API Contracts & Server-Side Authorization
- **Endpoints**:
  - `GET /api/v1/users/me` — Retrieves current authenticated user's safe profile.
  - `PATCH /api/v1/users/me` — Partially updates user profile metadata.
- **Ownership**: Server-controlled via `@CurrentUser()` derived from `SessionAuthGuard`. Request body parameters like `userId` are strictly forbidden and rejected.
- **Field Whitelist & Security**: Omitted fields (`email`, `passwordHash`, `roles`, `isVerified`, `createdAt`, `updatedAt`, `sessions`) are forbidden from updates. NestJS `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })` rejects any update attempt containing sensitive/un-editable fields with `400 Bad Request`.

### 3. Normalization & Validation Rules
- **Name**: Trimmed, length 2-100 characters.
- **Bio**: Trimmed, maximum 500 characters.
- **College & Branch**: Trimmed, bounded lengths (150 & 100 characters).
- **Graduation Year**: Integer within 1950-2100.
- **Skills**: Stored as scalar list `String[]`. Trimmed, case-insensitively deduplicated, maximum 30 items, maximum 50 characters per skill.
- **URLs (`avatarUrl`, `linkedinUrl`, `portfolioUrl`)**: Must start with `http://` or `https://`. `javascript:` URLs are strictly prohibited to eliminate XSS risks.
- **GitHub Handle (`githubUsername`)**: Stored as text metadata only. Does NOT establish OAuth connections, repository creation, or GitHub API calls.

### 4. Avatar Strategy
- Stored purely as an HTTPS string URL (`avatarUrl`). No file upload infrastructure (S3, Cloudinary, Multer) is introduced in this sprint.

### 5. Frontend & Navigation Integration
- Created `/profile` page using AlmostHack's Vercel/Linear-inspired dark brutalist design system.
- Includes view mode, edit mode, loading skeleton state, saving spinner, inline validation feedback, error banners, and success notifications.
- Added `/profile` entry to `SidebarNav` and `CommandPalette`.

## Verification Results
- **Unit Tests**: `users.service.spec.ts` (7/7 test suites passing, 22/22 tests passing).
- **E2E Tests**: `users.e2e-spec.ts` (3/3 test suites passing, 24/24 tests passing).
- **Type Check & Lint & Build**: `pnpm type-check`, `pnpm lint`, and `pnpm build` passed with zero errors across all 12 monorepo packages.
