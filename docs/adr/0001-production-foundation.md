# ADR 0001: Production foundation for Morphic

- Status: Accepted
- Date: 2026-07-02

## Context

Morphic must generate interfaces from live GitHub evidence, persist every durable product object outside the browser, and execute coding agents without trusting application servers or user machines as durable storage.

## Decision

Use Next.js App Router for the product surface, Clerk for managed identity, Neon Postgres with Drizzle for durable product state, Upstash Redis for distributed rate limits, OpenAI structured outputs for workspace generation, Vercel Workflow for crash-safe orchestration, and Vercel Sandbox for disposable Codex execution environments.

All user-owned queries are scoped by the authenticated Clerk user identifier. Repository access tokens are obtained server-side from Clerk and are not persisted by Morphic. Browser storage is not a source of truth.

## Consequences

- The product can resume after page reloads, process restarts, and workflow retries.
- Local development and deployment require provisioned Clerk, Neon, OpenAI, and Vercel credentials.
- Codex runs incur sandbox and model costs and require explicit approval.
- The initial implementation is Vercel-oriented; replacing orchestration or sandbox providers will require adapter work.
