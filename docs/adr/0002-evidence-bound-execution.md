# ADR 0002: Bind approved runs to reviewed evidence

- Status: Accepted
- Date: 2026-07-25

## Context

An Adaptive Workspace is generated from a specific Repository Snapshot, but the
original Codex Run path cloned the repository's moving default branch and
refetched repository context from a separate public service. The user therefore
approved one body of evidence while execution could happen against another.

That drift breaks Morphic's core trust claim. It also makes a generated pull
request difficult to reproduce because neither the accepted Workspace Version
nor its Repository Snapshot was an enforced execution input.

## Decision

Every approved Codex Run is bound to the current immutable Workspace Version
and its Repository Snapshot before sandbox provisioning.

The sandbox clone is pinned to the snapshot's full commit SHA. Provisioning
must verify that `HEAD` equals that SHA before agent work begins. The agent
receives a bounded execution context containing the accepted Outcome,
Constraints, Critical Path, repository impact, Open Decisions, Risks, and path
hints derived from the stored snapshot.

Execution must not refetch a moving repository tree to decide scope. Independent
verification runs after the agent finishes and before any branch is published.
An incomplete run or failed verification does not create a pull request.

Generated pull requests are drafts and include the evidence identifiers and
verification result used to authorize publication.

## Consequences

- Approval has a precise, reproducible meaning.
- Repository changes made after workspace generation require a new Repository
  Snapshot and Workspace Version before they can influence execution.
- Stored snapshot data becomes the source for scope hints; optional external
  analysis may enrich future versions but cannot silently replace approved
  evidence during a run.
- Publication takes longer because verification is mandatory.
- Runs created before this change must fail safely if their workspace no longer
  has a valid current version and snapshot.
