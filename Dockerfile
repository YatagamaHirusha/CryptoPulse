# syntax=docker/dockerfile:1
# ──────────────────────────────────────────────
# ElizaOS Agent (Don Roneth – Web3Instant)
# ──────────────────────────────────────────────
FROM node:23-slim AS base

RUN apt-get update && apt-get install -y \
  python3 make g++ git \
  && rm -rf /var/lib/apt/lists/*

ENV ELIZAOS_TELEMETRY_DISABLED=true \
    DO_NOT_TRACK=1

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev && npm cache clean --force

COPY src/ src/
COPY scripts/ scripts/
COPY characters/ characters/
COPY chainpulse-plugin/ chainpulse-plugin/
COPY tsconfig.json ./

RUN npx esbuild src/index.ts \
      --bundle --platform=node --format=esm \
      --outfile=dist/index.js \
      --external:@elizaos/core --external:rss-parser

RUN mkdir -p /app/data

EXPOSE 3000

ENV NODE_ENV=production \
    SERVER_PORT=3000

CMD ["sh", "-c", "node scripts/llm-proxy.mjs & sleep 2 && npx elizaos start --character ./characters/agent.character.json"]
