# AlmostHack Development Guide

## Prerequisites

Ensure you have the following installed on your local development machine:

- **Node.js**: `>= 20.0.0`
- **pnpm**: `>= 9.0.0`
- **Docker & Docker Compose** (for local PostgreSQL & Redis)

---

## Getting Started

### 1. Install Dependencies

Install all monorepo dependencies across `apps/` and `packages/`:

```bash
pnpm install
```

### 2. Infrastructure Services

Start the local PostgreSQL database and Redis server using Docker Compose:

```bash
docker-compose up -d
```

### 3. Database Migration

Generate Prisma client and apply database migrations:

```bash
cd apps/api
pnpm prisma:generate
pnpm prisma:migrate
cd ../..
```

### 4. Local Development Server

Run the Next.js frontend (`apps/web`), NestJS backend API (`apps/api`), and background worker (`apps/worker`) concurrently:

```bash
pnpm dev
```

- **Frontend Application**: `http://localhost:3000`
- **Backend API Engine**: `http://localhost:4000`
- **Background Worker**: Standalone NestJS application context processing queue jobs from Redis.
- **OpenAPI / Swagger Specs**: `http://localhost:4000/docs`

### 5. Infrastructure Queue Testing

To verify the `API → Redis → BullMQ → Worker` pipeline:

```bash
curl -X POST http://localhost:4000/api/v1/infrastructure-test/enqueue \
  -H "Content-Type: application/json" \
  -H "Cookie: almosthack_session=<session_token>" \
  -H "X-Request-ID: req_dev_test_123" \
  -d '{"message": "Hello Worker", "jobId": "test_job_1"}'
```

Check the worker terminal logs to see structured execution output including correlation ID propagation (`req_dev_test_123`), job attempt count, and processing duration.

### 6. User Profile API Testing

To inspect or update current user profile via curl:

```bash
# Get profile
curl -X GET http://localhost:4000/api/v1/users/me \
  -H "Cookie: almosthack_session=<session_token>"

# Update profile
curl -X PATCH http://localhost:4000/api/v1/users/me \
  -H "Content-Type: application/json" \
  -H "Cookie: almosthack_session=<session_token>" \
  -d '{
    "bio": "Full-stack engineer",
    "college": "Stanford University",
    "branch": "Computer Science",
    "graduationYear": 2026,
    "skills": ["React", "NestJS", "PostgreSQL"],
    "githubUsername": "octocat"
  }'
```

### 7. Organization Domain API Testing

```bash
# Create organization (assigns caller as OWNER)
curl -X POST http://localhost:4000/api/v1/organizations \
  -H "Content-Type: application/json" \
  -H "Cookie: almosthack_session=<session_token>" \
  -d '{"name": "AlmostHack Core", "slug": "almosthack-core"}'

# Get my active organizations
curl -X GET http://localhost:4000/api/v1/organizations/me \
  -H "Cookie: almosthack_session=<session_token>"

# Add member (OWNER / ADMIN)
curl -X POST http://localhost:4000/api/v1/organizations/<org_id>/members \
  -H "Content-Type: application/json" \
  -H "Cookie: almosthack_session=<session_token>" \
  -d '{"userId": "<target_user_id>", "role": "MEMBER"}'

# Transfer ownership (OWNER only)
curl -X POST http://localhost:4000/api/v1/organizations/<org_id>/transfer-ownership \
  -H "Content-Type: application/json" \
  -H "Cookie: almosthack_session=<session_token>" \
  -d '{"newOwnerId": "<target_user_id>"}'

# Delete organization (OWNER only, requires slug confirmation)
curl -X DELETE http://localhost:4000/api/v1/organizations/<org_id> \
  -H "Content-Type: application/json" \
  -H "Cookie: almosthack_session=<session_token>" \
  -d '{"confirmation": "almosthack-core"}'
```

### 8. Hackathon Domain & Lifecycle API Testing

```bash
# Create hackathon under organization
curl -X POST http://localhost:4000/api/v1/organizations/<org_id>/hackathons \
  -H "Content-Type: application/json" \
  -H "Cookie: almosthack_session=<session_token>" \
  -d '{
    "name": "Global AI Sprint 2026",
    "timezone": "Asia/Kolkata",
    "registrationStartsAt": "2026-09-01T00:00:00.000Z",
    "registrationEndsAt": "2026-09-10T00:00:00.000Z",
    "startsAt": "2026-09-15T00:00:00.000Z",
    "endsAt": "2026-09-20T00:00:00.000Z"
  }'

# List organization hackathons
curl -X GET http://localhost:4000/api/v1/organizations/<org_id>/hackathons \
  -H "Cookie: almosthack_session=<session_token>"

# Get hackathon effective lifecycle & registration status
curl -X GET http://localhost:4000/api/v1/hackathons/<hackathon_id>/lifecycle \
  -H "Cookie: almosthack_session=<session_token>"

# Publish DRAFT hackathon
curl -X POST http://localhost:4000/api/v1/hackathons/<hackathon_id>/publish \
  -H "Cookie: almosthack_session=<session_token>"

# Archive COMPLETED hackathon
curl -X POST http://localhost:4000/api/v1/hackathons/<hackathon_id>/archive \
  -H "Cookie: almosthack_session=<session_token>"
```

### 9. Hackathon Configuration & Rules API Testing

```bash
# Get hackathon policy configuration
curl -X GET http://localhost:4000/api/v1/hackathons/<hackathon_id>/configuration \
  -H "Cookie: almosthack_session=<session_token>"

# Update hackathon policy configuration
curl -X PUT http://localhost:4000/api/v1/hackathons/<hackathon_id>/configuration \
  -H "Content-Type: application/json" \
  -H "Cookie: almosthack_session=<session_token>" \
  -d '{
    "participationMode": "TEAM",
    "minTeamSize": 2,
    "maxTeamSize": 4,
    "eligibilityType": "STUDENTS_ONLY",
    "allowedBranches": ["CSE", "ECE"],
    "allowedColleges": ["MIT", "Stanford"],
    "graduationYearFrom": 2024,
    "graduationYearTo": 2028,
    "aiUsagePolicy": "RESTRICTED",
    "aiDisclosureRequired": true,
    "preExistingCodePolicy": "PROHIBITED",
    "openSourcePolicy": "ALLOWED_WITH_ATTRIBUTION",
    "githubRequired": true,
    "repositoryPolicy": "PLATFORM_MANAGED"
  }'

# Get participant-facing rules
curl -X GET http://localhost:4000/api/v1/hackathons/<hackathon_id>/rules \
  -H "Cookie: almosthack_session=<session_token>"

# Update markdown rules document
curl -X PATCH http://localhost:4000/api/v1/hackathons/<hackathon_id>/rules \
  -H "Content-Type: application/json" \
  -H "Cookie: almosthack_session=<session_token>" \
  -d '{
    "rulesMarkdown": "# Official Hackathon Rules\n\n1. All work must be completed during the event window.\n2. AI tool usage requires mandatory prompt log disclosure."
  }'
```

### 10. Hackathon Tracks & Challenges API Testing

```bash
# Create track
curl -X POST http://localhost:4000/api/v1/hackathons/<hackathon_id>/tracks \
  -H "Content-Type: application/json" \
  -H "Cookie: almosthack_session=<session_token>" \
  -d '{
    "name": "AI & Autonomous Agents",
    "shortDescription": "Develop LLM agents and multi-agent workflows",
    "description": "Comprehensive track for building autonomous agentic applications."
  }'

# Create challenge within track
curl -X POST http://localhost:4000/api/v1/tracks/<track_id>/challenges \
  -H "Content-Type: application/json" \
  -H "Cookie: almosthack_session=<session_token>" \
  -d '{
    "name": "Autonomous Code Reviewer",
    "problemStatement": "Build an AI agent that automatically analyzes PR diffs and outputs structured review comments.",
    "requirements": "Must support GitHub Action or CLI integration.",
    "constraints": "Review cycle latency under 10 seconds.",
    "expectedOutcome": "Deployable container image.",
    "resources": [
      { "title": "Evaluation Dataset", "url": "https://example.com/dataset.json" }
    ],
    "status": "PUBLISHED"
  }'

# Reorder tracks
curl -X PATCH http://localhost:4000/api/v1/hackathons/<hackathon_id>/tracks/reorder \
  -H "Content-Type: application/json" \
  -H "Cookie: almosthack_session=<session_token>" \
  -d '{
    "items": [
      { "id": "<track_id_2>", "displayOrder": 1 },
      { "id": "<track_id_1>", "displayOrder": 2 }
    ]
  }'
```

---

## Command Reference

| Command | Action |
| :--- | :--- |
| `pnpm dev` | Run all applications (`web`, `api`, `worker`) concurrently |
| `pnpm build` | Build production bundles for all apps and packages |
| `pnpm lint` | Run ESLint across all apps and packages |
| `pnpm type-check` | Execute TypeScript compiler checks across all workspaces |
| `pnpm test` | Execute unit and integration tests across all workspaces |
| `pnpm --filter @almosthack/api test:e2e` | Run API E2E tests |
| `pnpm clean` | Clean build artifacts (`dist/`, `.next/`, `.turbo/`) |


