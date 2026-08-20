# ==============================================================================
# ALMOSTHACK WORKER — PRODUCTION MULTI-STAGE DOCKERFILE
# ==============================================================================

# Stage 1: Base image with pnpm
FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9.4.0 --activate
RUN apk add --no-cache libc6-compat openssl

# Stage 2: Dependencies & Build
FROM base AS builder
WORKDIR /app

# Copy dependency manifests
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages/ ./packages/
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json
COPY apps/worker/package.json ./apps/worker/package.json

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy Worker & API schemas
COPY apps/api/prisma/ ./apps/api/prisma/
COPY apps/worker/ ./apps/worker/

# Generate Prisma Client & Build Monorepo packages and Worker
RUN pnpm --filter @almosthack/api exec prisma generate
RUN pnpm --filter @almosthack/worker build

# Prune dev dependencies for runtime
RUN pnpm --filter @almosthack/worker --prod deploy /prod/worker

# Stage 3: Production Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN apk add --no-cache openssl

# Create non-root user
USER node

# Copy built application and production dependencies
COPY --chown=node:node --from=builder /prod/worker/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/apps/worker/dist ./dist
COPY --chown=node:node --from=builder /app/apps/worker/package.json ./package.json

# Start production worker
CMD ["node", "dist/main"]
