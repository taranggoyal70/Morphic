# Morphic

Morphic turns a software objective into a persistent adaptive workspace grounded in live GitHub evidence. Users can refine that workspace, resolve decisions, and approve isolated Codex runs that end in reviewable pull requests.

## What is real

- Clerk authentication and server-side GitHub OAuth token retrieval
- Repository synchronization through the GitHub API
- Immutable repository snapshots and workspace versions in Neon Postgres
- GitHub Models structured-output workspace compilation using the signed-in user's GitHub authorization
- Distributed Upstash rate limiting
- Durable Vercel Workflow orchestration
- Isolated Codex execution in Vercel Sandbox
- Explicit run approval, branch creation, push, and pull-request creation
- Audit logging on all critical operations (workspace creation, Codex approval, user deletion)
- Clerk webhook for user deletion (GDPR compliance)
- Workspace archival and deletion endpoints
- No `localStorage`, `sessionStorage`, seeded product records, or mock API responses

## Architecture

```text
Browser
  | Clerk session cookie
  v
Next.js App Router
  |-- GitHub API (OAuth token retrieved from Clerk)
  |-- GitHub Models API (structured workspace plan)
  |-- Neon Postgres (all durable product state)
  |-- Upstash Redis (distributed rate limiting)
  +-- Vercel Workflow
        +-- Vercel Sandbox
              +-- Codex CLI -> branch -> GitHub pull request
```

## Rate limits

| Action               | Limit         |
| -------------------- | ------------- |
| Workspace creation   | 6 per hour    |
| Workspace adaptation | 20 per hour   |
| Decision resolution  | 30 per hour   |
| Codex run creation   | 10 per hour   |
| Codex run approval   | 20 per hour   |
| Repository sync      | 10 per minute |

## Evidence truncation

Large repositories are bounded before workspace generation:

- Issues: up to 150 (from 200 fetched)
- Pull requests: up to 80 (from 100 fetched)
- File tree entries: up to 6,000 (from 8,000 fetched)

These limits keep GitHub Models input within its free-tier context bounds. Repositories exceeding these limits will have older or less-relevant evidence omitted.

## Local setup

The Vercel project is linked to managed Clerk, Neon, and Upstash resources. Pull the development environment:

```bash
vercel link
vercel env pull .env.local
pnpm install
pnpm db:migrate
pnpm dev
```

Required variables are documented in `.env.example`. Never commit `.env.local`.

In the Clerk development instance, enable GitHub under **SSO connections -> For all users**. Morphic requests `repo` and `read:org`; a user must approve both before private and organization repository sync can succeed.

## Zero-cost private alpha

The current `*.vercel.app` deployment can be used as a private, non-commercial alpha without an OpenAI API key. Workspace planning and Codex runs use each signed-in user's GitHub Models allowance. The Clerk development instance has its allowlist enabled, so every new tester must be added explicitly before signup. Keep the instance below its 100-user limit and expect testers to create new accounts when Morphic later moves to a Clerk production instance.

Before inviting testers:

1. Add each invited tester's email address to Clerk's development allowlist before sharing the signup link.
2. Keep `/api/webhooks/clerk` subscribed only to `user.deleted`, with its signing secret stored as `CLERK_WEBHOOK_SIGNING_SECRET` in Vercel.
3. Keep the deployment private and non-commercial while it remains on Vercel Hobby.
4. Monitor the existing rate limits and GitHub Models free-tier responses; Morphic reports a retryable error when a user's allowance is exhausted.

## Go-live requirements

Before accepting production traffic:

1. Activate the Clerk production instance and replace the `pk_test_` / `sk_test_` variables with production keys (`pk_live_` / `sk_live_`).
2. Create a GitHub OAuth app, enable the GitHub connection in Clerk production, and grant `repo` plus `read:org`.
3. Set the production application domain in Clerk and `NEXT_PUBLIC_APP_URL`.
4. Add Vercel Sandbox credentials: `VERCEL_TOKEN`, `VERCEL_TEAM_ID`, and `VERCEL_PROJECT_ID` as environment variables.
5. Configure the Clerk webhook endpoint at `/api/webhooks/clerk` subscribed to the `user.deleted` event and set its signing secret.
6. Confirm Neon backups, Upstash limits, GitHub Models limits, and Vercel Sandbox/Workflow quotas. Codex sandbox uses 2 vCPUs with a 20-minute timeout per run.
7. Run the verification suite against preview, then complete one approved Codex run on a disposable repository before enabling it for customers.

## Verification

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

The architecture test fails if browser storage is introduced as product state.

## Domain language

See `CONTEXT.md`. The foundation and current model-provider decisions are recorded in `docs/adr/0001-production-foundation.md` and `docs/adr/0002-zero-cost-model-provider.md`.
