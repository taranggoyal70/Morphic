# Independent review of startup-readiness commits 41-58

- Fixed point: `a0e27b8df7e51cbe764b2874cf7baa6672456650`
- Reviewed range: `a0e27b8...8e9b4a3`
- Specification: `docs/roadmap/startup-readiness-60-commits.md`
- Standards: `AGENTS.md`, `CONTEXT.md`, and inherited repository guidance

The standards and specification reviews were performed independently before
the release commit. Findings remain separated by axis below.

## Standards

### Findings

1. **Hard violation:** the Workspace view's added Repository Snapshot query did
   not include authenticated-user scope in that query, contrary to the product
   invariant that every user-owned query is scoped by user ID.
2. **Judgment call:** the synthetic demo names a repository and commit without a
   stored GitHub snapshot. The route labels the entire fixture as synthetic and
   makes no claim about a real repository, so the stored-evidence invariant does
   not apply to it.
3. **Data Clump:** repository name, snapshot SHA, and Workspace Version were
   threaded independently through the approval UI.
4. **Primitive Obsession:** publication compared security-critical commit SHAs
   as unchecked strings.
5. **Duplicated Code:** the database schema repeated the `VerificationResult`
   structure.

### Resolution

- Removed the Workspace-level snapshot lookup. Approval evidence now comes from
  the run-scoped query, which is explicitly filtered by `codexRuns.userId` and
  `codexRuns.workspaceId`.
- Bundled each run's snapshot SHA and Workspace Version into one nullable
  `approvalContext`.
- Parse both reviewed and current base SHAs through
  `repositoryCommitShaSchema` before comparison.
- Reused the canonical `VerificationResult` type in the Drizzle schema.
- Retained the demo fixture with explicit synthetic labeling and a no-customer-
  evidence claim in both the page and demo guide.

## Specification

### Findings

1. **High:** every awaiting proposal displayed the Workspace's latest snapshot
   and version rather than the immutable evidence captured by that run.
2. **High:** checking the default branch before pull-request creation left a
   time-of-check/time-of-use gap because GitHub accepts a mutable branch name as
   the pull-request base.
3. **Medium:** the timeline discarded the persisted
   `execution.context.bound` event, so it did not expose the same evidence chain
   as the generated pull request.

### Resolution

- `listCodexRuns` now joins each run to its recorded Workspace Version and
  Repository Snapshot. The approval panel renders those per-run values.
- Publication validates the base SHA returned by GitHub after creating the
  draft. On mismatch, Morphic closes the draft, attempts to delete the pushed
  work branch, and fails the run instead of recording publication success.
- The Activity timeline now renders the bound Workspace Version, snapshot SHA,
  and reviewed branch before sandbox activity and verification results.

## Verification

Behavioral coverage includes separate run evidence in the approval panel,
rendered context binding in the timeline, validated commit identifiers,
verification status, publication-blocking reasons, and credential cleanup.
The final release check is recorded in commit 60.
