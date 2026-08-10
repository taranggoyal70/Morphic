# Morphic

Morphic turns a redacted production AI incident into behavioral regression
evidence bound to the exact GitHub snapshot and Workspace Version a human
approved. Incident-driven Codex Runs cannot publish until a changed test names
the incident and passes when Morphic executes that test path directly.
Successful runs end in a draft pull request with the incident, acceptance
criteria, source binding, linked test, and command results attached.

General objective workspaces remain available, but the startup wedge is the
incident-to-regression workflow.

## What is real

- Clerk authentication and server-side GitHub OAuth token retrieval
- Repository synchronization through the GitHub API
- Immutable repository snapshots and workspace versions in Neon Postgres
- Redacted incident intake with immutable behavioral acceptance criteria
- OpenAI structured-output workspace compilation
- Distributed Upstash rate limiting
- Durable Vercel Workflow orchestration
- Isolated Codex Run execution in Vercel Sandbox
- Explicit run approval, branch creation, push, and pull-request creation
- Publication blocking when an incident run lacks passing behavioral verification
- Audit logging on all critical operations (workspace creation, Codex approval, user deletion)
- Clerk webhook for user deletion (GDPR compliance)
- Workspace archival and deletion endpoints
- No `localStorage`, `sessionStorage`, seeded durable product records, or mock API responses

## Product demo

The public `/demo` route tells a clearly labeled, synthetic
incident-to-pull-request story without requiring provider credentials. Use the
[five-minute demo guide](docs/demo/five-minute-incident-to-pr.md) to pair that
fixture with a live run on a disposable repository.

## Production AI incident research

Morphic is recruiting 15 engineering, AI platform, reliability, and product
leaders for non-leading interviews about recent production AI incidents. The
study starts with the participant's existing trace-to-release workflow before
showing or pitching Morphic.

Read the [public research call](docs/research/production-ai-incident-research-call.md)
or use the
[GitHub research form](https://github.com/taranggoyal70/Morphic/issues/new?template=production-ai-incident-research.yml).
Do not submit customer data, traces, secrets, private links, or proprietary
incident content. Applications and expressions of interest are recruiting
leads, not customer-validation points.

## Architecture

```text
Browser
  | Clerk session cookie
  v
Next.js App Router
  |-- GitHub API (OAuth token retrieved from Clerk)
  |-- OpenAI Responses API (structured workspace plan)
  |-- Neon Postgres (all durable product state)
  |-- Upstash Redis (distributed rate limiting)
  +-- Vercel Workflow
        +-- Vercel Sandbox
              +-- GitHub Models tool loop -> branch -> draft pull request
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

These limits keep OpenAI input within context bounds. Repositories exceeding these limits will have older or less-relevant evidence omitted.

## Local setup

The Vercel project is linked to managed Clerk, Neon, and Upstash resources. Pull the development environment and add an OpenAI key:

```bash
vercel link
vercel env pull .env.local
pnpm install
pnpm db:migrate
pnpm dev
```

Required variables are documented in `.env.example`. Never commit `.env.local`.

In the Clerk development instance, enable GitHub under **SSO connections -> For all users**. Morphic requests `repo` and `read:org`; a user must approve both before private and organization repository sync can succeed.

## Go-live requirements

Accountability, credential custody, deployment, rollback, and incident
procedures are defined in
[production controls and environment ownership](docs/operations/production-controls.md).
The measurable release decision is recorded in the
[private-alpha launch checklist](docs/operations/launch-readiness.md).

Before accepting production traffic:

1. Apply the reviewed Drizzle migrations to the intended Neon environment.
2. Activate the Clerk production instance and replace the `pk_test_` / `sk_test_` variables with production keys (`pk_live_` / `sk_live_`).
3. Create a GitHub OAuth app, enable the GitHub connection in Clerk production, and grant `repo` plus `read:org`.
4. Set the production application domain in Clerk and `NEXT_PUBLIC_APP_URL`.
5. Add Vercel Sandbox credentials: `VERCEL_TOKEN`, `VERCEL_TEAM_ID`, and `VERCEL_PROJECT_ID` as environment variables.
6. Configure the Clerk webhook endpoint at `/api/webhooks/clerk` subscribed to the `user.deleted` event.
7. Confirm Neon backups, Upstash limits, OpenAI project spend limits, and Vercel Sandbox/Workflow quotas. Codex sandbox uses 2 vCPUs with a 20-minute timeout per run.
8. Run the verification suite against preview, then complete one approved incident run on a disposable repository before enabling it for customers.

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

See `CONTEXT.md`. The production-provider decision is recorded in `docs/adr/0001-production-foundation.md`.
