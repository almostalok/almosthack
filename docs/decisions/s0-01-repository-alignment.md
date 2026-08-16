# Decision Record — S0-01 Repository Alignment

**Date**: 2026-08-16  
**Status**: Approved / Implemented  

## Context

The AlmostHack repository needed structural alignment with the approved Technical Architecture Specification v1 without introducing fake functionality, microservices, or product feature implementations.

## Decisions Made

1. **Modular Monolith Backend Boundaries**:
   - Re-organized `apps/api/src/modules/` into 14 explicit domain modules representing clean boundaries (`auth`, `users`, `organizations`, `hackathons`, `rounds`, `teams`, `repositories`, `submissions`, `judging`, `integrity`, `appeals`, `notifications`, `audit`, `health`).
   - Created `apps/api/src/database/` containing `PrismaService` and `DatabaseModule`, keeping global ORM connections decoupled.
   - Refrained from creating empty fake controllers/services/entities inside un-implemented domain modules.

2. **Frontend Feature Architecture**:
   - Standardized `apps/web/src/` toward `app/`, `features/`, `components/`, `hooks/`, `lib/`, `providers/`.
   - Preserved existing Next.js App Router route groups and high-quality UI components in `packages/ui`.

3. **Demo / Preview Telemetry Labeling**:
   - Updated sample data display in `apps/web/src/app/(dashboard)/overview/page.tsx` to clearly use neutral "Demo Mode" / "Preview" labels.
   - Removed misleading text implying active live cryptographic signatures.

4. **Linting and Type-Check Compliance**:
   - Fixed `ButtonProps` interface in `packages/ui` to properly type `children?: React.ReactNode` compatible with Framer Motion `HTMLMotionProps`.
   - Configured ESLint in `apps/api` and `apps/web` so `pnpm lint` and `pnpm type-check` succeed 100% across the monorepo.
