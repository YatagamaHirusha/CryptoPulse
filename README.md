# CryptoPulse (Web3Instant)

CryptoPulse is an AI-powered Web3 news platform that combines:

- an **ElizaOS AI journalist agent** for autonomous crypto journalism
- a **Next.js frontend/CMS** for publishing and reading articles
- **automation pipelines** for RSS ingestion, rewriting, translation, and social distribution

This repository is no longer a challenge template — it is a working product stack for running a crypto media workflow.

---

## What this project does

### 1) Autonomous AI journalist agent

The custom `@chainpulse/web3journalist` plugin:

- monitors crypto news sources (RSS + on-chain context)
- generates structured articles with LLMs
- publishes to the site through `/api/agent/publish`
- broadcasts to social channels (X/Twitter + Telegram)

Main files:
- `/src/plugins/web3journalist/*`
- `/characters/agent.character.json`

### 2) Production-style news site (Next.js 16)

The frontend (`/frontend`) includes:

- multilingual content routing (`en`, `es`, `fr`, `ar`)
- article pages, categories, top stories, podcasts, newsletter modules
- Supabase-backed article storage/admin workflows
- AI features on article pages:
  - **AI Quick Read**
  - **Ask AI about this article** (`/app/api/chat/route.ts`)

### 3) Content operations & automation

- Scheduled pipeline (`/frontend/scripts/news-bot`) to:
  - fetch RSS articles
  - rewrite in editorial style
  - generate AI imagery
  - publish and translate content
- Agent publish API supports secure ingestion + image generation + Supabase persistence.

---

## Architecture

```text
RSS + On-chain signals
        ↓
ElizaOS AI Journalist Agent
        ↓
/api/agent/publish (Next.js backend)
        ↓
Supabase (articles + media storage)
        ↓
Web3Instant frontend (multilingual readers + AI chat)
        ↓
Social distribution (X / Telegram)
```

---

## Tech stack

- **Agent runtime:** ElizaOS
- **Frontend:** Next.js 16, React 19, Tailwind
- **Database/CMS:** Supabase
- **LLM providers:** Nosana-compatible OpenAI API, optional Groq/Gemini in pipelines
- **Infra:** Docker + Docker Compose

---

## Local development

### Prerequisites

- Node.js 20+ (repo Dockerfiles currently use Node 23)
- npm
- Supabase project (URL + keys)

### Install dependencies

From repository root:

```bash
npm install
cd frontend && npm install
```

### Configure environment variables

Set required values in:

- root `.env` (agent/runtime values)
- `frontend/.env.local` (frontend + Supabase values)

Important keys used by the codebase include:

- `OPENAI_API_URL`, `OPENAI_API_KEY`, `MODEL_NAME`
- `WEB3INSTANT_API_URL`, `WEB3INSTANT_API_SECRET`
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- optional: `NOSANA_LLM_URL`, `NOSANA_LLM_KEY`, `NOSANA_LLM_MODEL`
- optional for image generation: `GEMINI_API_KEY` and/or `GROQ_API_KEY`

### Run services

Run agent + frontend together:

```bash
docker compose up --build
```

Or run parts manually:

```bash
# root
npm run proxy
npm run dev

# in frontend/
npm run dev
```

---

## Key directories

- `/src` — ElizaOS plugin and agent integration
- `/characters` — agent persona/configuration
- `/chainpulse-plugin` — packaged plugin export
- `/frontend/app` — Next.js App Router pages + APIs
- `/frontend/scripts` — news pipeline and utility scripts
- `/nos_job_def` — Nosana job definition

---

## Notes

- The previous README described the Nosana Builders Challenge template.
- This README now documents the actual implementation in this repository.
