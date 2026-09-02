# ADR 0002: Use GitHub Models for the private alpha

- Status: Accepted
- Date: 2026-09-01

## Context

Morphic's private alpha must operate without a project-funded model account. Every user already connects GitHub so Morphic can gather Repository Evidence and open pull requests, and GitHub Models exposes a bounded free allowance through that same authorization.

ADR 0001 originally selected project-funded OpenAI access for workspace generation. The implementation now routes both workspace compilation and Codex Run model calls through GitHub Models, so that provider decision must be superseded.

## Decision

Use GitHub Models for workspace compilation and Codex Run model calls during the private alpha. Authenticate model requests with the signed-in user's server-side GitHub access token. Do not require or read a project-level `OPENAI_API_KEY`.

Keep bounded prompts, completion limits, distributed application rate limits, and explicit Approval before every Codex Run. Treat GitHub Models quota exhaustion as a retryable per-user condition rather than falling back to a paid shared provider.

## Consequences

- The private alpha does not incur project-level model charges.
- Model availability and throughput depend on each user's GitHub Models allowance.
- Users must grant the GitHub scopes required by Morphic before workspace generation can succeed.
- Development and support must handle GitHub Models rate limits and provider errors explicitly.
- A future paid model provider requires a new ADR, explicit budget controls, and updated deployment configuration.
