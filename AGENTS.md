# Morphic engineering guidance

## Product invariants

- Durable product state belongs in Postgres, never browser storage or process memory.
- Repository claims must be supported by a stored GitHub snapshot.
- Workspace adaptations create immutable versions.
- Codex never runs before an explicit approval.
- Codex works in a disposable external sandbox and opens a pull request; it never merges.
- Every user-owned query must be scoped by the authenticated user ID.

## Commands

- Install: `pnpm install`
- Verify: `pnpm check`
- Generate migration: `pnpm db:generate`
- Apply migration: `pnpm db:migrate`
- Start locally: `pnpm dev`

## Change discipline

Update `CONTEXT.md` only for domain-language changes. Add an ADR only for consequential, hard-to-reverse tradeoffs. Never print or inspect secret values.
