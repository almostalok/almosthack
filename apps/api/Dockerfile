# ==============================================================================
# ALMOSTHACK API — PRODUCTION MULTI-STAGE DOCKERFILE
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

# Copy API source and schema
COPY apps/api/ ./apps/api/

# Generate Prisma Client & Build Monorepo packages and API
RUN pnpm --filter @almosthack/api exec prisma generate
RUN pnpm --filter @almosthack/api build

# Prune dev dependencies for runtime
RUN pnpm --filter @almosthack/api --prod deploy /prod/api

# Stage 3: Production Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

RUN apk add --no-cache openssl curl

# Create non-root user
USER node

# Copy built application and production dependencies
COPY --chown=node:node --from=builder /prod/api/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/apps/api/dist ./dist
COPY --chown=node:node --from=builder /app/apps/api/prisma ./prisma
COPY --chown=node:node --from=builder /app/apps/api/package.json ./package.json

# Expose API port
EXPOSE 4000

# Container Healthcheck (Liveness Probe)
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:4000/health/live || exit 1

# Start production server
CMD ["node", "dist/main"]
