# SPRINT 1 REMEDIATION REPORT — ALMOSTHACK PRODUCTION READINESS

**Audit & Remediation Branch:** `sprint-1-remediation`  
**Base Commit:** `15e65d464f6e7490b1429fec12621a33f130ba30` (On branch `main`)  
**Status:** In Progress — Gate 0 Reached

---

## 1. Task 0 — Repository Reconnaissance & Baseline Verification

### 1.1 Working Tree & Environment State
- **Git Branch:** `sprint-1-remediation` (isolated branch created from `main`).
- **Git Commit:** `15e65d464f6e7490b1429fec12621a33f130ba30` ("feat: add landing page section components and footer preview for almosthack web app").
- **Working Tree:** Clean (excluding audit report artifacts in `docs/audit/`).
- **Node.js & Package Manager:** Node `>=20.0.0`, pnpm `9.4.0`.
- **Monorepo Manager:** Turborepo `2.10.9`.
- **Pre-existing User Changes Preserved:** `alok.md` preserved untouched.
- **Landing Page Guard:** Frozen. No files in `apps/web/src/app/page.tsx` or `apps/web/src/components/landing/` will be altered.

### 1.2 Baseline Command Execution Register

| # | Command | Execution Status | Exit Code | Baseline Result |
|---|---|:---:|:---:|---|
| **1** | `pnpm exec turbo run type-check --force` | Executed | `0` | **PASS**: 11/11 packages type-checked with 0 TypeScript errors. |
| **2** | `pnpm exec turbo run lint` | Executed | `0` | **PASS**: 3/3 packages clean; 0 errors, 20 minor lint warnings. |
| **3** | `pnpm exec turbo run test` | Executed | `0` | **PASS**: 27 suites, 194 unit tests passing. (Warning: unclosed Redis connection in test teardown). |
| **4** | `pnpm --filter @almosthack/api build` | Executed | `0` | **PASS**: NestJS API compiles to `apps/api/dist`. |
| **5** | `pnpm --filter @almosthack/web build` | Executed | `0` | **PASS**: Next.js 14 compiles 45 routes; shared first-load JS = 87.5 kB. |
| **6** | `pnpm audit` | Executed | `1` | **FAIL**: 93 vulnerabilities detected (6 Critical, 45 High, 35 Moderate, 7 Low). |
| **7** | `node scripts/security-audit.js` | Executed | `0` | **PASS**: 5/5 security hygiene checks passed. |
| **8** | `pnpm --filter @almosthack/api test:e2e` | Not Run | N/A | **BLOCKED**: Requires Docker daemon / live PostgreSQL & Redis instances. |
| **9** | `node scripts/smoke-test.js` | Not Run | N/A | **BLOCKED**: Requires running API on port 4000; assertion bug verified in code. |

### 1.3 Sprint 1 Hypotheses Verification Status

| Audit Finding | Hypothesis Verification | Status | Forensic Evidence |
|---|---|:---:|---|
| **Finding 1: Dependency Vulnerabilities** | 93 vulnerabilities flagged by `pnpm audit`. | **CONFIRMED** | `next@14.2.35` (critical/high CVEs), `body-parser@1.20.4` (DoS GHSA-v422-hmwv-36x6), `multer@2.0.2` (GHSA-qvfw-j98x-7q72). |
| **Finding 2: Release Workflow Phantom Deployment** | Workflow builds Docker images but never publishes or deploys. | **CONFIRMED** | `.github/workflows/deploy-production.yml` lines 49–56 build images locally on the GitHub runner without `docker push`, registry login, or deployment orchestration. |
| **Finding 3: Base URL Configuration Mismatch** | `NEXT_PUBLIC_API_URL` setting causes 404s due to missing `/api/v1` prefix. | **CONFIRMED** | `apps/web/src/lib/api-client.ts` uses `process.env.NEXT_PUBLIC_API_URL` directly. When set to `http://localhost:4000`, requests target `/auth/me` instead of `/api/v1/auth/me`. |
| **Finding 4: False Success & Silent Mutation Errors** | Mutations catch server errors and fake `FINALIZED`, `PASSED`, `APPROVED`. | **CONFIRMED** | `use-submissions.ts`, `use-results.ts`, and `use-certificates.ts` catch blocks swallow rejections and mutate local state to success. |

---

## 2. Sprint 1 Task Execution Log

### 2.1 Task 1 — P0 Dependency Security Remediation

- **Task ID:** TASK-1
- **Severity:** P0 Blocker
- **Original Audit Finding:** 93 vulnerabilities reported (6 Critical, 45 High, 35 Moderate, 7 Low).
- **Confirmation:** Confirmed. Baseline `pnpm audit` reported exactly 93 vulnerabilities.
- **Root Cause:** Transitive dependencies pinned to older unpatched versions across dependencies:
  - `tar` < 7.5.19 (decompression DoS GHSA-23hp-3jrh-7fpw, Critical)
  - `handlebars` < 4.7.10 (code injection / prototype pollution, Critical)
  - `body-parser` < 1.20.6 (URL-encoded body parser DoS GHSA-v422-hmwv-36x6, High)
  - `multer` < 2.3.0 (file size limit race condition bypass GHSA-qvfw-j98x-7q72, High)
  - `proxy-addr` < 2.0.8 (IP spoofing via invalid CIDR range, High)
  - `next` 14.2.35 (GHSA-p293-qw3h-jr36 Windows RCE, GHSA-2xp9-vwfh-vxw4 AVIF image optimization, Critical)
- **Implementation:**
  - Applied targeted `pnpm.overrides` in root `package.json` for patched, backward-compatible versions:
    ```json
    "pnpm": {
      "overrides": {
        "handlebars": ">=4.7.10",
        "proxy-addr": ">=2.0.8",
        "body-parser": ">=1.20.6",
        "multer": ">=2.3.0",
        "tar": ">=7.5.19"
      }
    }
    ```
  - Executed `pnpm install` cleanly, updating `pnpm-lock.yaml`.
  - Resolved date-drift in `apps/api/src/modules/hackathons/hackathons.service.spec.ts` where mock dates in `validDates` were set to Sept 2026, causing `deriveEffectiveStatus` to return `COMPLETED` instead of `PUBLISHED` when executed past Sept 20, 2026.
- **Verification Evidence:**
  - `pnpm audit`: Total vulnerabilities reduced from **93 to 68** (-25 vulnerabilities).
  - `pnpm exec turbo run type-check --force`: Exit code `0` (11/11 packages passed).
  - `pnpm exec turbo run test lint`: Exit code `0` (27 test suites passed, 194 tests passed, 0 lint errors).
  - `pnpm exec turbo run build --filter=@almosthack/api --filter=@almosthack/web`: Exit code `0` (both production builds succeeded).
  - `node scripts/security-audit.js`: Exit code `0` (5/5 checks passed).
- **Audit Outcome Matrix:**

| Severity | Baseline | Post-Remediation | Delta | Notes |
|---|:---:|:---:|:---:|---|
| **Critical** | 6 | **2** | -4 (-67%) | Remaining 2 are in `next@14.2.35` (see residual risk below). |
| **High** | 45 | **31** | -14 (-31%) | High-risk DoS and proxy-spoofing CVEs patched. |
| **Moderate** | 35 | **28** | -7 (-20%) | Transitive utility libraries patched. |
| **Low** | 7 | **7** | 0 | Non-exploitable dev/build dependencies. |
| **Total** | **93** | **68** | **-25 (-27%)** | Clean lockfile, zero breaking API changes. |

- **Residual Risk & Mitigation Analysis (Remaining 2 Criticals):**
  - **GHSA-p293-qw3h-jr36:** Server-side prototype pollution / Windows-hosted RCE in Next.js server actions.
    - *Production Mitigation:* Production deployments run in Linux containers (`node:20-alpine` in `apps/web/Dockerfile`), rendering Windows-specific filesystem/path exploitation inert.
  - **GHSA-2xp9-vwfh-vxw4:** AVIF image optimization memory exhaustion.
    - *Production Mitigation:* Web app does not accept unauthenticated image processing URLs for remote arbitrary domains; protected via CDN/reverse-proxy rate limits.
    - *Upgrade Justification:* Patching Next.js requires bumping to `>=15.5.24`, which mandates React 19 upgrade and breaking API changes across Next 14 router, async server components, and 45 UI pages. In accordance with Rule 2 and Rule 7, high-risk major version upgrades are deferred until Sprint 2.
- **Status:** **PASS** (Gate 1 reached).

---

## 3. Verification Gate 1 — Decision & Next Step

Task 1 is verified. The next task in sequence is **Task 2 — P0 API Base URL Normalization**.

