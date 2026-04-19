# syntax=docker/dockerfile:1
# ──────────────────────────────────────────────
# Web3Instant Next.js Frontend
# ──────────────────────────────────────────────
FROM node:23-slim AS base

RUN apt-get update && apt-get install -y \
  python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# ── Install ─────────────────────────────────
FROM base AS deps
COPY package.json ./
RUN npm install && npm cache clean --force

# ── Build ───────────────────────────────────
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY

ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL} \
    NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY} \
    NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ── Run ─────────────────────────────────────
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3001 \
    HOSTNAME=0.0.0.0

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3001

CMD ["node", "server.js"]
