# ALMOSTHACK — AUDIT UI / UX & FRONTEND REPORT

**Audit Date:** October 13, 2026  
**Auditor:** QA Lead, Staff Full-Stack Engineer & Product Quality Auditor  
**Scope:** Route inventory, component interaction fidelity, design tokens, visual hierarchy, responsive layout, and WCAG 2.2 AA accessibility.

---

## 1. Complete Route-by-Route Inventory

The Next.js 14 App Router application compiles **45 distinct routes**. Below is the comprehensive forensic inventory:

| Route Path | Intended Role | Page Component File | Data Source | Real Mutations | Auth Enforcement | Loading & Error States | Empty State | Responsive Status | WCAG A11y Status | Verified Classification |
|---|---|---|---|---|---|---|---|---|---|:---:|
| `/` | Public | `src/app/page.tsx` | Static / Demos | None (Book Demo modal) | Public | Prerendered | N/A | Verified 320px–1920px | AA Compliant | `VERIFIED_COMPLETE` |
| `/login` | Public | `src/app/login/page.tsx` | None | `POST /auth/login` | Redirects if auth | Spinner on submit, Alert on error | N/A | Card centered | Form labels + ARIA invalid | `VERIFIED_COMPLETE` |
| `/register` | Public | `src/app/register/page.tsx` | None | `POST /auth/register` | Redirects if auth | Spinner on submit, Alert on error | N/A | Card centered | Form labels + ARIA invalid | `VERIFIED_COMPLETE` |
| `/overview` | Organizer | `src/app/(dashboard)/overview/page.tsx` | `dashboard-mock-data.ts` | None | `DashboardLayout` guard | Hydration spinner | Partial | Grid stacks on mobile | Contrast ok, charts lack aria-table | `MOCKED` |
| `/workspace` | Hacker | `src/app/(dashboard)/workspace/page.tsx` | `hacker-mock-data.ts` | None | `DashboardLayout` guard | Hydration spinner | Partial | Stacks on mobile | Missing aria-live on countdown | `MOCKED` |
| `/judging` | Judge | `src/app/(dashboard)/judging/page.tsx` | `judge-mock-data.ts` | None | `DashboardLayout` guard | Hydration spinner | Empty card | Stacks on mobile | Accessible score cards | `MOCKED` |
| `/judges` | Organizer | `src/app/(dashboard)/judges/page.tsx` | Hardcoded mock | None | `DashboardLayout` guard | Hydration spinner | None | Table scrolls horizontally | Table headers labeled | `MOCKED` |
| `/organizations` | Organizer | `src/app/(dashboard)/organizations/page.tsx` | `apiClient.getOrganizations()` | Real API | `DashboardLayout` guard | TanStack loading | Empty state card | Grid responsive | Semantic headings | `PARTIALLY_VERIFIED` |
| `/organizations/new` | Organizer | `src/app/(dashboard)/organizations/new/page.tsx` | Form input | `POST /organizations` | `DashboardLayout` guard | Submit button spinner | N/A | Form max-w-xl | Standard inputs | `VERIFIED_COMPLETE` |
| `/organizations/[orgId]` | Organizer | `src/app/(dashboard)/organizations/[organizationId]/page.tsx` | `apiClient.getOrganization()` | Real API | `DashboardLayout` guard | TanStack loading | Member empty state | Tabs stack | Semantic tablist | `PARTIALLY_VERIFIED` |
| `/hackathons` | Organizer | `src/app/(dashboard)/hackathons/page.tsx` | `apiClient.getHackathons()` | Real API | `DashboardLayout` guard | TanStack loading | Empty state card | Grid responsive | Card headers semantic | `PARTIALLY_VERIFIED` |
| `/hackathons/new` | Organizer | `src/app/(dashboard)/hackathons/new/page.tsx` | Form input | `POST /hackathons` | `DashboardLayout` guard | Step indicator | N/A | Wizard stacks on mobile | Stepper accessible | `VERIFIED_COMPLETE` |
| `/hackathons/[id]` | Organizer | `src/app/(dashboard)/hackathons/[hackathonId]/page.tsx` | `workspace-mock-data.ts` | None | `DashboardLayout` guard | Hydration spinner | None | Responsive layout | Accessible headers | `MOCKED` |
| `/hackathons/[id]/workspace` | Hacker | `src/app/(dashboard)/hackathons/[hackathonId]/workspace/page.tsx` | `hacker-mock-data.ts` | None | `DashboardLayout` guard | Hydration spinner | Partial | Stacks on mobile | Timeline accessible | `MOCKED` |
| `/hackathons/[id]/judge` | Judge | `src/app/(dashboard)/hackathons/[hackathonId]/judge/page.tsx` | `judge-mock-data.ts` | None | `DashboardLayout` guard | Hydration spinner | None | Score cards responsive | Input labels present | `MOCKED` |
| `/hackathons/[id]/configuration` | Organizer | `src/app/(dashboard)/hackathons/[hackathonId]/configuration/page.tsx` | `apiClient.getRules()` | Real API | `DashboardLayout` guard | Loading skeleton | None | Form columns stack | Form toggles accessible | `PARTIALLY_VERIFIED` |
| `/hackathons/[id]/rules` | Organizer / Public | `src/app/(dashboard)/hackathons/[hackathonId]/rules/page.tsx` | `apiClient.getRules()` | Real API | `DashboardLayout` guard | Loading skeleton | Empty text card | Text readable | Heading hierarchy valid | `PARTIALLY_VERIFIED` |
| `/hackathons/[id]/tracks` | Organizer | `src/app/(dashboard)/hackathons/[hackathonId]/tracks/page.tsx` | `apiClient.getTracks()` | Real API | `DashboardLayout` guard | TanStack loading | Empty state button | Grid responsive | Accordions keyboard operable | `PARTIALLY_VERIFIED` |
| `/hackathons/[id]/tracks/[tId]` | Organizer | `src/app/(dashboard)/hackathons/[hackathonId]/tracks/[trackId]/page.tsx` | `apiClient.getTrack()` | Real API | `DashboardLayout` guard | TanStack loading | Challenge empty state | Stacks on mobile | Form labeled | `PARTIALLY_VERIFIED` |
| `/hackathons/[id]/registrations` | Organizer | `src/app/(dashboard)/hackathons/[hackathonId]/registrations/page.tsx` | `registrations-mock-data.ts` | Local mock | `DashboardLayout` guard | Fallback to mock | Empty filter state | Table horizontal scroll | Table search labelled | `MOCKED` |
| `/hackathons/[id]/teams` | Organizer | `src/app/(dashboard)/hackathons/[hackathonId]/teams/page.tsx` | `teams-mock-data.ts` | Local mock | `DashboardLayout` guard | Fallback to mock | Filter empty card | Grid stacks on mobile | Card buttons accessible | `MOCKED` |
| `/hackathons/[id]/submissions` | Organizer | `src/app/(dashboard)/hackathons/[hackathonId]/submissions/page.tsx` | `submissions-mock-data.ts` | Fake success mutations | `DashboardLayout` guard | Fallback to mock | Filter empty card | Drawer responsive | Drawer traps focus | `MOCKED` / `BROKEN` |
| `/hackathons/[id]/judging` | Organizer | `src/app/(dashboard)/hackathons/[hackathonId]/judging/page.tsx` | `judging-mock-data.ts` | Local mock | `DashboardLayout` guard | Fallback to mock | Empty assignment state | Table scrolls horizontally | Status badges accessible | `MOCKED` |
| `/hackathons/[id]/integrity` | Organizer | `src/app/(dashboard)/hackathons/[hackathonId]/integrity/page.tsx` | `apiClient.getIntegrity()` | Real API (Mock DB code) | `DashboardLayout` guard | TanStack loading | Empty findings state | Diff cards stack | Diff code blocks scroll | `PARTIAL_IMPLEMENTATION` |
| `/hackathons/[id]/results` | Organizer | `src/app/(dashboard)/hackathons/[hackathonId]/results/page.tsx` | `results-mock-data.ts` | Fake success mutations | `DashboardLayout` guard | Discards API data | Empty podium | Podium cards stack | Leaderboard ranks labeled | `MOCKED` |
| `/hackathons/[id]/results/[subId]` | Public / Org | `src/app/(dashboard)/hackathons/[hackathonId]/results/[submissionId]/page.tsx` | `transparent-judging-mock-data.ts` | None | `DashboardLayout` guard | Fallback to mock | Empty feedback state | Scorecards responsive | Score progress bars labeled | `MOCKED` |
| `/hackathons/[id]/leaderboard` | Public / Org | `src/app/(dashboard)/hackathons/[hackathonId]/leaderboard/page.tsx` | `results-mock-data.ts` | None | `DashboardLayout` guard | Discards API data | Empty table | Table responsive | Table pagination accessible | `MOCKED` |
| `/hackathons/[id]/certificates` | Organizer | `src/app/(dashboard)/hackathons/[hackathonId]/certificates/page.tsx` | `certificates-mock-data.ts` | Fake local mutations | `DashboardLayout` guard | Pure local state | Filter empty state | Table horizontal scroll | Modal dialog accessible | `MOCKED` / `UI_ONLY` |
| `/hackathons/[id]/announcements` | Organizer | `src/app/(dashboard)/hackathons/[hackathonId]/announcements/page.tsx` | `announcements-mock-data.ts` | Real API fallback | `DashboardLayout` guard | Fallback to mock | Empty state card | Grid responsive | Dialogs accessible | `PARTIALLY_VERIFIED` |
| `/hackathons/[id]/analytics` | Organizer | `src/app/(dashboard)/hackathons/[hackathonId]/analytics/page.tsx` | `analytics-mock-data.ts` | None | `DashboardLayout` guard | Pure local state | None | Charts collapse cleanly | Charts lack aria-table fallback | `MOCKED` / `UI_ONLY` |
| `/hackathons/[id]/audit-log` | Organizer | `src/app/(dashboard)/hackathons/[hackathonId]/audit-log/page.tsx` | `audit-log-mock-data.ts` | None | `DashboardLayout` guard | Fallback to mock | Empty log state | Code blocks scroll | Log timeline accessible | `MOCKED` |
| `/hackathons/[id]/audit-logs` | Organizer | `src/app/(dashboard)/hackathons/[hackathonId]/audit-logs/page.tsx` | Alias of `audit-log` | None | `DashboardLayout` guard | Fallback to mock | Empty log state | Duplicated route | Duplicated route | `MOCKED` (Duplicate) |
| `/hackathons/[id]/settings` | Organizer | `src/app/(dashboard)/hackathons/[hackathonId]/settings/page.tsx` | `apiClient.getHackathon()` | Real API | `DashboardLayout` guard | TanStack loading | None | Form column stacks | Form inputs labeled | `PARTIALLY_VERIFIED` |
| `/certificates` | Participant | `src/app/(dashboard)/certificates/page.tsx` | `certificates-mock-data.ts` | Fake local mutations | `DashboardLayout` guard | Pure local state | Empty certificates card | Grid responsive | Download button labeled | `MOCKED` / `UI_ONLY` |
| `/certificates/[id]` | Public | `src/app/(dashboard)/certificates/[certificateId]/page.tsx` | `certificates-mock-data.ts` | None | Public | Pure local state | Not found card | Certificate preview responsive | Verification badge labeled | `MOCKED` / `UI_ONLY` |
| `/announcements` | Participant | `src/app/(dashboard)/announcements/page.tsx` | `announcements-mock-data.ts` | None | `DashboardLayout` guard | Fallback to mock | Empty list | Feed responsive | Announcement cards labeled | `MOCKED` |
| `/notifications` | All Users | `src/app/(dashboard)/notifications/page.tsx` | `apiClient.getNotifications()` | Real API (`PATCH read`) | `DashboardLayout` guard | TanStack loading | Empty bell card | Feed responsive | Unread badge announced | `VERIFIED_COMPLETE` |
| `/registrations` | Organizer | `src/app/(dashboard)/registrations/page.tsx` | Alias to hackathon registrations | None | `DashboardLayout` guard | Hardcoded `htf-2026` | Empty card | Table responsive | Search labeled | `MOCKED` |
| `/teams` | Hacker / Org | `src/app/(dashboard)/teams/page.tsx` | `teams-mock-data.ts` | None | `DashboardLayout` guard | Hardcoded `htf-2026` | Empty card | Grid responsive | Cards accessible | `MOCKED` |
| `/submissions` | Hacker / Org | `src/app/(dashboard)/submissions/page.tsx` | `submissions-mock-data.ts` | None | `DashboardLayout` guard | Hardcoded `htf-2026` | Empty card | Drawer responsive | Drawer traps focus | `MOCKED` |
| `/repositories` | Hacker | `src/app/(dashboard)/repositories/page.tsx` | `apiClient.getRepositories()` | Real API | `DashboardLayout` guard | TanStack loading | Empty repo card | Grid responsive | Connect button labeled | `PARTIALLY_VERIFIED` |
| `/profile` | All Users | `src/app/(dashboard)/profile/page.tsx` | `apiClient.getProfile()` | Real API | `DashboardLayout` guard | TanStack loading | None | Form responsive | Form labeled | `PARTIALLY_VERIFIED` |
| `/analytics` | Organizer | `src/app/(dashboard)/analytics/page.tsx` | `analytics-mock-data.ts` | None | `DashboardLayout` guard | Pure local state | None | Charts collapse cleanly | Charts lack aria-table | `MOCKED` / `UI_ONLY` |
| `/audit-logs` | Organizer | `src/app/(dashboard)/audit-logs/page.tsx` | `audit-log-mock-data.ts` | None | `DashboardLayout` guard | Pure local state | None | Table responsive | Timeline labeled | `MOCKED` |
| `/settings` | All Users | `src/app/(dashboard)/settings/page.tsx` | `apiClient.getPreferences()` | Real API | `DashboardLayout` guard | TanStack loading | None | Form responsive | Switch toggles accessible | `PARTIALLY_VERIFIED` |

---

## 2. Interaction & State Defects

### 2.1 Fake Success Mutations with Silent Error Swallowing
Across several core hooks, mutations catch API network and authorization errors, swallow the error without notifying the user, and mutate local state to show simulated success:
1. `use-submissions.ts` (Lines 281–305):
   ```typescript
   try { await apiClient.finalizeSubmission(submissionId); } catch { /* Fallback local update */ }
   setLocalSubmissions(prev => prev.map(s => s.id === submissionId ? { ...s, status: 'FINALIZED' } : s));
   ```
2. `use-results.ts` (Lines 136–184):
   - `calculateMutation` catches error and sets `lifecycleStatus: 'READY_FOR_APPROVAL'`.
   - `approveMutation` catches error and sets `lifecycleStatus: 'APPROVED'`.
   - `publishMutation` catches error and sets `lifecycleStatus: 'PUBLISHED'`.
3. `use-certificates.ts` (Lines 95–172):
   - `bulkIssueCertificates` generates fake `0x${Math.random()}` hashes and marks all pending certificates as `ISSUED`.
   - `revokeCertificate` and `regenerateCertificate` mutate only local React state.

### 2.2 Unused Server Queries
In `use-results.ts` (Lines 67–77), the hook queries `apiClient.getResults(hackathonId)` on mount. However, the resulting `resultsData` is **never assigned to the displayed rankings**; line 80 directly filters `localRankings` (initialized to static `MOCK_RANKINGS`). Real server-side calculated rankings are completely ignored by the UI.

### 2.3 Hardcoded Hackathon ID Fallback (`htf-2026`)
Over 60 instances of `'htf-2026'` exist across `apps/web/src`. When accessing routes without an explicit hackathon context (such as `/submissions`, `/teams`, `/registrations`, or `/audit-logs`), the app silently defaults to `hackathonId: 'htf-2026'`. If an organizer navigates from their own hackathon to the top-level `/submissions` route, they are immediately presented with mock submissions for `htf-2026`.

### 2.4 Duplicate Route Alias
Both `/hackathons/[hackathonId]/audit-log` and `/hackathons/[hackathonId]/audit-logs` exist and compile into distinct static pages, rendering the identical `AuditLogManagementView` component under slightly different URLs.

---

## 3. Design System & Visual Quality Audit

### 3.1 Design Token Clash (Dark Mode Root vs. Paper White UI)
There is a fundamental visual conflict between the application root and the `@almosthack/ui` component library:
1. `apps/web/src/app/layout.tsx` hardcodes the dark mode theme:
   ```tsx
   <html lang="en" className="dark ...">
   <body className="bg-[#0B0D0C] text-[#F5F7F4] ...">
   ```
2. `@almosthack/ui/src/components/Card.tsx` and `Input.tsx` hardcode cream/paper background tokens:
   ```tsx
   default: 'bg-[#FFFDF8] border border-[#DCDDD3] shadow-xs text-[#171914]'
   ```
3. In `apps/web/src/components`, custom dashboard cards use dark tokens:
   ```tsx
   'bg-[#111412] border border-white/10 text-[#F5F7F4]'
   ```
*Visual Impact:* Users encounter jarring contrasts where a pitch-black page background hosts bright paper-white cards interspersed with dark slate cards. `@almosthack/ui` lacks Tailwind `dark:` prefix variants to seamlessly transition between themes.

---

## 4. Accessibility Audit (Target: WCAG 2.2 AA)

| Accessibility Criterion | Compliance Status | Findings & Evidence |
|---|:---:|---|
| **1.1.1 Non-text Content** | **Partial** | Next.js image warnings flagged on `/organizations`, `/organizations/[id]`, and `/profile` where raw `<img>` tags lack `alt` descriptions. |
| **1.3.1 Info and Relationships** | **Pass** | Form fields utilize programmatic `<label htmlFor={inputId}>` and `aria-describedby` associations in `Input.tsx`. |
| **1.4.3 Contrast (Minimum)** | **Fail (in mixed themes)** | Muted text `#6D7068` on dark background `#0B0D0C` produces a contrast ratio of **3.4:1**, failing the WCAG AA minimum requirement of **4.5:1** for regular text. |
| **2.1.1 Keyboard** | **Pass** | Modal dialogs and drawers properly trap focus (`Drawer.tsx`, `Modal.tsx`) and dismiss on `Escape`. |
| **2.4.3 Focus Order** | **Pass** | Tab order through wizards and dashboard sidebars follows logical reading order. |
| **4.1.2 Name, Role, Value** | **Partial** | Dynamic filters and tab switches do not utilize `aria-live="polite"` regions, leaving screen-reader users uninformed when table rows update. |
