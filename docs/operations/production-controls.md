# Production controls and environment ownership

This document names the minimum operational controls required before Morphic
handles a real repository. It records accountable roles, not secret values.

## Ownership model

| Surface                               | Accountable role  | Required evidence                                                                          | Release blocker                                               |
| ------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------- |
| Vercel project, Workflow, and Sandbox | Deployment owner  | Production project ID, spend alerts, sandbox quota, and a successful isolated run          | Missing quota, unrestricted token, or failed sandbox teardown |
| Clerk tenant and GitHub connection    | Identity owner    | Production instance, allowed origins, GitHub scopes, and user-deletion webhook delivery    | Test keys, broad callback URLs, or missing deletion webhook   |
| Neon Postgres                         | Data owner        | Production branch, migration record, backups, restore drill, and retention decision        | Unapplied migration or no verified restore path               |
| Upstash Redis                         | Reliability owner | Production database, rate-limit metrics, and alert threshold                               | Shared development database or disabled limits                |
| OpenAI project and GitHub Models      | Model owner       | Approved models, project budget, request logs, and data-retention review                   | Unbounded spend or unreviewed model change                    |
| GitHub publication                    | Repository owner  | Least-privilege OAuth scopes, disposable-repository smoke run, and draft-only pull request | Base drift, failed verification, or direct merge capability   |
| Application operations                | On-call owner     | Health check, error alert, incident contact, and rollback procedure                        | No named responder or rollback path                           |

One person may hold several roles during private alpha, but every row must still
have a named owner in the private launch record.

## Environment variable custody

| Variables                                                                | Owning system      | Production custodian | Handling rule                                                                                          |
| ------------------------------------------------------------------------ | ------------------ | -------------------- | ------------------------------------------------------------------------------------------------------ |
| `DATABASE_URL`                                                           | Neon               | Data owner           | Store only in Vercel encrypted environment variables; rotate after personnel or project-access changes |
| `OPENAI_API_KEY`                                                         | OpenAI             | Model owner          | Use a project-scoped key with budget alerts; never expose to the browser                               |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`                  | Clerk              | Identity owner       | Keep the secret key server-only and pair keys from the same production instance                        |
| `KV_REST_API_URL`, `KV_REST_API_TOKEN`                                   | Upstash            | Reliability owner    | Use a production database and rotate the token after any suspected disclosure                          |
| `VERCEL_TOKEN`, `VERCEL_TEAM_ID`, `VERCEL_PROJECT_ID`                    | Vercel             | Deployment owner     | Scope the token to the Morphic project and sandbox workflow; review quarterly                          |
| `NEXT_PUBLIC_APP_URL`                                                    | Morphic deployment | Deployment owner     | Pin to the canonical HTTPS origin used by Clerk and GitHub callbacks                                   |
| `MORPHIC_PLANNER_MODEL`, `MORPHIC_CODEX_MODEL`, `MORPHIC_PROMPT_VERSION` | Morphic release    | Product owner        | Change through reviewable commits and replay the release smoke scenario                                |

Never copy production values into issue trackers, pull requests, screenshots,
or local shell history. `.env.example` documents names only.

## Required operating procedures

### Deploy

1. Review the migration diff and apply it once to the production database.
2. Deploy the exact reviewed commit.
3. Confirm `/api/health` and authenticated workspace loading.
4. Run an approved change against a disposable private repository.
5. Confirm the sandbox stops, the remote is credential-free, verification is
   recorded, and the GitHub pull request is a draft.

### Roll back

1. Stop new approvals by disabling the production deployment or approval route.
2. Roll the application back to the last verified deployment.
3. Do not reverse an applied database migration until its data impact is
   understood; prefer a forward corrective migration.
4. Revoke Vercel or GitHub credentials if a sandbox or publication boundary may
   have been crossed.

### Respond to an incident

1. Preserve the run, event, snapshot, Workspace Version, and pull-request IDs.
2. Revoke affected credentials without printing them.
3. Stop queued or active workflows when continued execution could cause harm.
4. Record the impact, corrective control, owner, and evidence required to
   reopen approvals.

## Review cadence

- Before every production release: migration, environment, model, and smoke-run
  evidence.
- Monthly during private alpha: access list, spend, rate-limit, workflow, and
  sandbox review.
- Quarterly: credential rotation decision, restore drill, dependency review,
  and incident-response exercise.
