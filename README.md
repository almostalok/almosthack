# almosthack — The Transparent Hackathon Operating System

> **Tagline:** The Transparent Hackathon Operating System.  
> **Mission:** Build the world's most transparent and trusted hackathon platform where every stage—from registration to judging—is verifiable, auditable, and explainable.

---

## 🎨 Design Philosophy & Visual Language

- **Developer-First Aesthetic:** Inspired by Vercel, Linear, GitHub, and Raycast.
- **Monochrome & High Contrast:** Pure Black (`#000000`), Deep Zinc (`#09090B`), High Contrast Text (`#FAFAFA`), single configurable accent token (`--almosthack-accent`, default Emerald `#10B981`).
- **Subtle Brutalist Typography:** Headings in Geist / Space Grotesk, body in Geist / Inter, code in JetBrains Mono.
- **Raycast Command Palette:** Fast keyboard-first navigation via `Cmd+K` / `Ctrl+K`.

---

## 🏗️ Technology Justification

| Layer | Choice | Rationale |
| :--- | :--- | :--- |
| **Monorepo Engine** | **Turborepo + pnpm** | Ultra-fast caching, zero-overhead workspace package references (`@almosthack/*`). |
| **Frontend Framework** | **Next.js 14 (App Router)** | Server Components, automatic code splitting, optimized rendering for high-density SaaS. |
| **Backend API Engine** | **NestJS (TypeScript)** | Enterprise dependency injection, modular architecture, native Swagger/OpenAPI support. |
| **Database & ORM** | **PostgreSQL + Prisma** | Type-safe queries, migration history, relational integrity for audit logs and RBAC. |
| **State & Hooks** | **Zustand** | Light, unopinionated client state for theme management and command palette controls. |
| **UI Components** | **Radix UI + Framer Motion** | WCAG 2.2 AA accessible primitives with subtle (150-250ms) micro-animations. |

---

## 🧩 Monorepo Structure

```
almosthack/
├── apps/
│   ├── web/                     # Next.js App Router (Frontend Shell & Dashboards)
│   └── api/                     # NestJS Core API Engine & Health Check Endpoints
├── packages/
│   ├── design-system/           # CSS Variables, Design Tokens, Typography, Colors
│   ├── ui/                      # Primitive & Composite Technical Component Library
│   ├── types/                   # Shared TypeScript Definitions (RBAC, Audit, User, Auth)
│   ├── utils/                   # Shared Utilities (clsx, formatters, crypto checksums)
│   ├── hooks/                   # Custom Hooks (useTheme, useKeyboardShortcuts, useCommandPalette)
│   └── config/                  # Shared TSConfig, ESLint, Tailwind presets
├── docker-compose.yml           # PostgreSQL + Redis local dev infrastructure
├── pnpm-workspace.yaml
├── turbo.json
└── package.json
```

---

## 🔮 Future Extension Points (Stage 2+)

1. **Hackathon Lifecycle Engine (`apps/api/src/modules/hackathon`):** Plugs directly into `schema.prisma` `Organization` and `UserRole` for workspace-isolated hackathons.
2. **Repository Intelligence & Commit Auditing (`apps/api/src/modules/repo-audit`):** Integrates GitHub OAuth tokens to pull live commit trees and verify SHA-256 signatures against submission timestamps.
3. **Double-Blind Judge Calibration (`apps/api/src/modules/judging`):** Evaluates scores against normalized z-score models to eliminate judge bias before finalizing rankings.
4. **Integrity Engine & AI Analyzer (`packages/utils` + BullMQ microservices):** Runs asynchronous background code similarity checks without blocking main API loops.