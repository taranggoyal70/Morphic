# Incident-to-regression v1

## Product promise

Morphic turns a redacted production incident into a draft pull request whose
behavioral regression evidence is bound to the exact repository snapshot and
Workspace Version a human approved.

The initial user is the engineer responsible for a customer-facing AI system
who already has a production trace or incident record and needs to prove the
same behavior cannot recur.

## Required behavior

1. A user can create either a generic workspace or an incident-driven
   workspace. Existing generic workspace behavior remains supported.
2. Incident intake records a source, external identifier, title, observed
   behavior, expected behavior, occurrence time, optional trace URL, and one to
   eight measurable acceptance criteria.
3. Morphic rejects incident intake until the user confirms that the supplied
   evidence is redacted. Incident evidence is immutable after workspace
   creation.
4. Workspace planning receives the incident and prioritizes the supplied
   acceptance criteria without treating incident text as trusted instructions.
5. Every Codex Run receives the same incident evidence and is explicitly
   instructed to add or connect a repository-owned behavioral regression.
6. The approval panel identifies the incident and displays its observed
   behavior, expected behavior, and acceptance criteria beside the run-scoped
   Repository Snapshot and Workspace Version.
7. An incident-driven Codex Run cannot publish unless a changed repository test
   names the incident identifier and independent verification executes that
   test path directly. Runner output must name the incident and report at least
   one passing test; skipped, excluded, or silent tests do not qualify.
8. The draft pull request records the incident identifier, acceptance criteria,
   run-scoped source binding, and verification commands.
9. Missing behavioral evidence produces a specific blocking explanation and no
   publication-success record.

## Non-goals

- Morphic does not ingest or store raw provider traces in v1.
- Morphic does not replace Braintrust, LangSmith, or another observability
  provider.
- A trace URL is evidence provenance, not proof that the incident was fixed.
- This release does not claim product-market fit or paid-pilot validation.

## Release acceptance

- The repository-readiness score in
  [`docs/reviews/repository-readiness-scorecard.md`](../reviews/repository-readiness-scorecard.md)
  is at least 90 using linked evidence.
- `pnpm check` passes at the exact release commit.
- Independent standards and specification reviews have no unresolved high-risk
  findings.
- The user-owned `launch/` directory is absent from the release diff.
