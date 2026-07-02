# Morphic

Morphic turns a software objective into a persistent adaptive workspace grounded in live GitHub evidence. Users can refine that workspace, resolve decisions, and approve isolated Codex runs that end in reviewable pull requests.

## What is real

- Clerk authentication and server-side GitHub OAuth token retrieval
- Repository synchronization through the GitHub API
- Immutable repository snapshots and workspace versions in Neon Postgres
- OpenAI structured-output workspace compilation
- Distributed Upstash rate limiting
- Durable Vercel Workflow orchestration
- Isolated Codex execution in Vercel Sandbox
- Explicit run approval, branch creation, push, and pull-request creation
- No `localStorage`, `sessionStorage`, seeded product records, or mock API responses

## Architecture

```text
Browser
  │ Clerk session cookie
  ▼
Next.js App Router
  ├── GitHub API (OAuth token retrieved from Clerk)
  ├── OpenAI Responses API (structured workspace plan)
  ├── Neon Postgres (all durable product state)
  ├── Upstash Redis (distributed rate limiting)
  └── Vercel Workflow
        └── Vercel Sandbox
              └── Codex CLI → branch → GitHub pull request
```

## Local setup

The Vercel project is linked to managed Clerk, Neon, and Upstash resources. Pull the development environment and add an OpenAI key:

```bash
vercel env pull .env.local
pnpm install
pnpm db:migrate
pnpm dev
```

Required variables are documented in `.env.example`. Never commit `.env.local`.

In the Clerk development instance, enable GitHub under **SSO connections → For all users**. Morphic requests `repo` and `read:org`; a user must approve both before private and organization repository sync can succeed.

## Go-live requirements

Before accepting production traffic:

1. Activate the Clerk production instance and replace the `pk_test_` / `sk_test_` variables with production keys.
2. Create a GitHub OAuth app, enable the GitHub connection in Clerk production, and grant `repo` plus `read:org`.
3. Set the production application domain in Clerk and `NEXT_PUBLIC_APP_URL`.
4. Confirm Neon backups, Upstash limits, OpenAI project spend limits, and Vercel Sandbox/Workflow quotas.
5. Run the verification suite against preview, then complete one approved Codex run on a disposable repository before enabling it for customers.

## Verification

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

The architecture test fails if browser storage is introduced as product state.

## Domain language

See `CONTEXT.md`. The production-provider decision is recorded in `docs/adr/0001-production-foundation.md`.
