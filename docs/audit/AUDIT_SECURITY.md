# ALMOSTHACK — AUDIT SECURITY REPORT

**Audit Date:** October 13, 2026  
**Auditor:** Principal Security Auditor & Staff Infrastructure Security Engineer  
**Classification Standards:** OWASP Top 10 (2021), ASVS 4.0, CWE, CVSS v3.1

---

## 1. Executive Security Assessment

The platform demonstrates commendable architectural intentionality in several critical security areas:
- Password hashing uses `bcrypt` with 12 salt rounds (`auth.service.ts`).
- User sessions are stored server-side as SHA-256 token hashes with explicit expiration, revocation timestamps, and client IP/User-Agent tracking (`session.service.ts`).
- Session cookies use `HttpOnly: true`, `SameSite: 'lax'`, and dynamic `Secure: true` in production (`auth.constants.ts`).
- Public leaderboards strictly project only approved and published results, preventing information leaks of draft judge evaluations (`results.service.ts`).
- A dedicated security script (`scripts/security-audit.js`) validates migration locks and checks Dockerfiles for hardcoded secrets.

However, a forensic security audit reveals **multiple high-severity vulnerabilities and systemic architectural weaknesses** that pose immediate risks of data exposure, cross-tenant leaks, token compromise, and denial-of-service.

---

## 2. Vulnerability Findings Register

### Finding 1: 93 Dependency Vulnerabilities Across Monorepo Tree
- **Finding ID:** `SEC-P0-01`
- **Severity:** **P0 — Critical** | **Confidence:** **High** (Verified via `pnpm audit`)
- **CVSS Score:** 9.8 (CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H)
- **Affected Component:** Monorepo package tree (`apps/web`, `apps/api`, `node_modules`)
- **Evidence:** Executing `pnpm audit` produces:
  ```
  93 vulnerabilities found
  Severity: 7 low | 35 moderate | 45 high | 6 critical
  ```
  Key vulnerable packages:
  - `next@14.2.35` (Multiple high/critical CVEs including SSR request forgery and cache pollution; patched in `>=15.5.16` or `>=14.2.36+`)
  - `body-parser@1.20.4` (<1.20.6: vulnerable to DoS when invalid limit value silently disables size enforcement; GHSA-v422-hmwv-36x6)
  - `multer@2.0.2` (<2.3.0: vulnerable to file size limit bypass via async fileFilter race condition; GHSA-qvfw-j98x-7q72)
- **Impact:** Remote code execution or SSR denial of service in production web instances.
- **Remediation:** Update `next` to the latest secure 14.x patch release (`14.2.36+` or evaluate Next 15), upgrade `body-parser` and `multer` via pnpm resolutions in root `package.json`.
- **Verification Requirement:** Run `pnpm audit` in CI and assert zero high/critical vulnerabilities.

---

### Finding 2: Fallback to Hardcoded Secret in Token Encryption
- **Finding ID:** `SEC-P1-01`
- **Severity:** **P1 — High** | **Confidence:** **High** (Code inspection)
- **CWE:** CWE-798: Use of Hard-coded Credentials
- **Affected Component:** `apps/api/src/modules/repositories/github-credential.service.ts` (Lines 10–17)
- **Evidence:**
  ```typescript
  const rawKey =
    process.env.ENCRYPTION_KEY ||
    process.env.SESSION_SECRET ||
    process.env.JWT_SECRET ||
    'almosthack-dev-default-encryption-secret-key-32bytes';

  this.encryptionKey = crypto.createHash('sha256').update(rawKey).digest();
  ```
- **Impact:** If `ENCRYPTION_KEY`, `SESSION_SECRET`, and `JWT_SECRET` are not set (or fail to inject during deployment), all GitHub OAuth tokens are encrypted using a publicly accessible static string. Anyone with database read access can decrypt all users' GitHub personal access tokens.
- **Remediation:** Fail fast on startup in `env.validation.ts` by requiring `ENCRYPTION_KEY` to be a non-empty, cryptographically secure 64-character hex string (32 bytes). Remove all hardcoded fallback strings.
- **Verification Requirement:** Startup unit test asserting that application bootstrap throws when `ENCRYPTION_KEY` is missing in production.

---

### Finding 3: Broken Object-Level Authorization (BOLA) in Audit Logs
- **Finding ID:** `SEC-P1-02`
- **Severity:** **P1 — High** | **Confidence:** **High** (Code inspection)
- **CWE:** CWE-639: Authorization Bypass Through User-Controlled Key / Cross-Tenant Exposure
- **Affected Component:** `apps/api/src/modules/audit/audit.controller.ts` (Lines 17–25)
- **Evidence:**
  ```typescript
  @Get()
  @RequirePermissions(Permission.AUDIT_READ)
  async getAuditLogs(@Query() query: QueryAuditLogsDto) {
    return this.auditService.queryAuditLogs(query);
  }
  ```
  `AuditService.queryAuditLogs` accepts an optional `organizationId?: string` parameter on line 9, but `AuditController` **never passes the user's organizationId**.
- **Impact:** Any user with `AUDIT_READ` permission (e.g. an organizer of Organization A) can query and view all immutable audit log entries for Organization B, Organization C, and platform administrative actions.
- **Remediation:** Inject `@CurrentUser()` and enforce that `queryAuditLogs` is called with the actor's resolved organization ID, unless the user has global `PLATFORM_ADMIN` privileges.
- **Verification Requirement:** E2E test verifying that an organizer from Org A receives 403 or filtered results when attempting to read Org B audit logs.

---

### Finding 4: Missing CSRF Protection on Session-Based Endpoints
- **Finding ID:** `SEC-P2-01`
- **Severity:** **P2 — Medium** | **Confidence:** **High** (Code inspection)
- **CWE:** CWE-352: Cross-Site Request Forgery (CSRF)
- **Affected Component:** `apps/api/src/main.ts`, `apps/api/src/modules/auth/auth.constants.ts`
- **Evidence:**
  Session authentication relies on cookies (`almosthack_session`) with `SameSite: 'lax'`.
  There is no CSRF token validation middleware (e.g. `csurf` or double-submit cookie) on state-changing API endpoints (`POST`, `PUT`, `DELETE`).
- **Impact:** While `SameSite: 'lax'` mitigates standard cross-site POST forms in modern browsers, top-level navigations or legacy browsers may allow CSRF requests if third-party endpoints or subdomains are compromised.
- **Remediation:** Implement custom request header enforcement (`X-Requested-With: AlmostHack` or an anti-CSRF token cookie) for all mutating API requests.
- **Verification Requirement:** Integration test proving that a cross-origin simulated fetch without CSRF headers is rejected.

---

### Finding 5: Missing Role & Permission Guards on Integrity Controller
- **Finding ID:** `SEC-P2-02`
- **Severity:** **P2 — Medium** | **Confidence:** **High** (Code inspection)
- **CWE:** CWE-285: Improper Authorization
- **Affected Component:** `apps/api/src/modules/integrity/integrity.controller.ts` (Lines 23–25)
- **Evidence:**
  ```typescript
  @Controller({ version: '1' })
  @UseGuards(SessionAuthGuard)
  export class IntegrityController { ... }
  ```
  Notice that while `SessionAuthGuard` is present, `PermissionsGuard` and `@RequirePermissions(...)` decorators are missing at the controller level. Authorization checks are deferred entirely to manual service-level `findFirst` checks.
- **Impact:** Defense-in-depth failure. If any service method omits the manual organizer check, unauthenticated participants can invoke analysis or inspect internal findings.
- **Remediation:** Apply `@UseGuards(SessionAuthGuard, PermissionsGuard)` and `@RequirePermissions(Permission.INTEGRITY_READ)` / `Permission.INTEGRITY_MANAGE` on all routes.
- **Verification Requirement:** Test asserting that participant session calling `GET /submissions/:id/integrity` is rejected with 403 Forbidden at the guard layer.

---

### Finding 6: Silent Mutation Failures Masking Server-Side Authorization Rejections
- **Finding ID:** `SEC-P2-03`
- **Severity:** **P2 — Medium** | **Confidence:** **High** (Code inspection)
- **CWE:** CWE-390: Detection of Error Condition Without Action
- **Affected Component:** `apps/web/src/components/submissions/use-submissions.ts`, `use-results.ts`, `use-certificates.ts`
- **Evidence:**
  ```typescript
  const finalizeMutation = useMutation({
    mutationFn: async (submissionId: string) => {
      try {
        await apiClient.finalizeSubmission(submissionId);
      } catch {
        // Fallback local update
      }
      setLocalSubmissions((prev) => ... status: 'FINALIZED' ...);
    }
  });
  ```
- **Impact:** If an unauthorized user or late participant triggers submission finalization, the backend rejects it with 403 or 409, but the frontend intercepts the error, swallows it, and displays "Submission Finalized Successfully". The user believes their project is submitted when it is not in the database.
- **Remediation:** Remove all local mock mutation fallbacks in production hooks. Ensure mutations rethrow `ApiClientError` to display real toast error notifications.
- **Verification Requirement:** Component unit tests asserting that mutation errors display error banners and leave state untouched.

---

### Finding 7: Request Body Limit Not Explicitly Enforced in NestJS Bootstrap
- **Finding ID:** `SEC-P3-01`
- **Severity:** **P3 — Low** | **Confidence:** **High** (Code inspection)
- **CWE:** CWE-770: Allocation of Resources Without Limits or Throttling
- **Affected Component:** `apps/api/src/main.ts`
- **Evidence:**
  `main.ts` relies on default express body parsers without specifying explicit byte limits:
  `app.use(cookieParser())`, but no `app.use(express.json({ limit: '1mb' }))`.
  Combined with `body-parser` advisory GHSA-v422-hmwv-36x6, an attacker can transmit massive JSON payloads to exhaust heap memory.
- **Remediation:** Configure explicit JSON body size limits:
  ```typescript
  import { json, urlencoded } from 'express';
  app.use(json({ limit: '512kb' }));
  app.use(urlencoded({ extended: true, limit: '512kb' }));
  ```
- **Verification Requirement:** Test asserting that payloads >512KB return 413 Payload Too Large.

---

## 3. Threat Modeling Summary (STRIDE Matrix)

| Threat Category | Risk Area | Existing Control | Assessment / Gap |
|---|---|---|---|
| **Spoofing** | Session Impersonation | SHA-256 session tokens, HTTP-only cookies | **Strong.** Sessions securely hashed in DB. |
| **Tampering** | Result & Ranking Modification | Input fingerprint hashes on ResultSets | **Strong on backend.** Client UI ignores DB results. |
| **Repudiation** | Actions without Attribution | Immutable AuditLog with actor ID, email & IP | **Strong.** Comprehensive audit logs recorded. |
| **Information Disclosure** | Leak of Private Judge Scores | Results unpublished filter in `getLeaderboard` | **Vulnerable in Audit Logs:** BOLA flaw in `GET /api/v1/audit-logs`. |
| **Denial of Service** | Synchronous File Comparisons | In-memory similarity engine | **Vulnerable.** Pairwise loops run in HTTP thread. |
| **Elevation of Privilege** | Cross-tenant Organization Admin | `AuthorizationService.evaluateOrganizationPermission` | **Functional.** Needs universal application across all controllers. |
