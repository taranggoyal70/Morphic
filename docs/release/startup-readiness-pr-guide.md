# Startup-readiness pull-request guide

Branch: `agent/startup-ready-p0`

This branch is intentionally reviewable as sixty numbered decisions. Review it
in the phases below rather than as one undifferentiated application diff. Every
behavioral phase leaves the repository buildable and carries tests at its public
boundary.

The unnumbered commit `a0e27b8` between commits 40 and 41 polishes the landing
experience. It is retained as an independent product change and is not counted
as one of the sixty startup-readiness decisions.

## Phase 1 - Evidence-bound execution

| Commit  | Why it exists                                                                    |
| ------- | -------------------------------------------------------------------------------- |
| `01/60` | Records the market evidence and narrows the product wedge before implementation. |
| `02/60` | Makes the complete review sequence explicit.                                     |
| `03/60` | Records why approval must bind to immutable evidence.                            |
| `04/60` | Defines the execution context that an approval authorizes.                       |
| `05/60` | Rejects malformed snapshot identities at the boundary.                           |
| `06/60` | Renders bounded evidence for the coding agent.                                   |
| `07/60` | Proves prompt boundaries through contract tests.                                 |
| `08/60` | Loads the accepted Workspace Version for every run.                              |
| `09/60` | Loads the matching stored Repository Snapshot.                                   |
| `10/60` | Provisions the sandbox from the reviewed commit.                                 |
| `11/60` | Stops execution when sandbox HEAD differs from the reviewed SHA.                 |
| `12/60` | Persists the run-to-Workspace-Version relationship.                              |
| `13/60` | Persists the run-to-Repository-Snapshot relationship.                            |
| `14/60` | Emits durable evidence of the execution binding.                                 |
| `15/60` | Carries accepted constraints into agent execution.                               |
| `16/60` | Carries the accepted Outcome into agent execution.                               |
| `17/60` | Preserves Critical Path context.                                                 |
| `18/60` | Preserves repository-impact evidence.                                            |
| `19/60` | Preserves unresolved decisions and risks.                                        |
| `20/60` | Removes mutable GitHub refetching from the approved path.                        |

## Phase 2 - Repository scope and agent safety

| Commit  | Why it exists                                                     |
| ------- | ----------------------------------------------------------------- |
| `21/60` | Defines a deterministic scope contract over the stored tree.      |
| `22/60` | Scores repository paths against the approved work.                |
| `23/60` | Proves deterministic scope selection.                             |
| `24/60` | Gives the agent scope hints without restricting exploration.      |
| `25/60` | Uses accurate product language for the agent runtime.             |
| `26/60` | Requires the agent to inspect its final diff.                     |
| `27/60` | Prevents the agent from mutating Git history.                     |
| `28/60` | Prevents common credential-enumeration commands.                  |
| `29/60` | Records command failures as structured evidence.                  |
| `30/60` | Distinguishes commands that changed the tree from read-only work. |

## Phase 3 - Independent verification and publication gates

| Commit  | Why it exists                                                             |
| ------- | ------------------------------------------------------------------------- |
| `31/60` | Defines the independent verification contract.                            |
| `32/60` | Detects the repository package manager from tracked files.                |
| `33/60` | Selects bounded repository-owned checks.                                  |
| `34/60` | Hardens verification planning with contract tests.                        |
| `35/60` | Runs checks after the coding agent finishes.                              |
| `36/60` | Captures command output as durable run evidence.                          |
| `37/60` | Blocks publication when verification fails.                               |
| `38/60` | Blocks publication when the agent does not finish.                        |
| `39/60` | Blocks empty-diff pull requests.                                          |
| `40/60` | Rejects invalid and out-of-repository changed paths.                      |
| `41/60` | Makes every generated pull request a draft.                               |
| `42/60` | Checks the live and created pull-request base against the reviewed SHA.   |
| `43/60` | Removes credentials from the sandbox remote after every push attempt.     |
| `44/60` | Adds snapshot, Workspace Version, and verification evidence to the draft. |
| `45/60` | Persists the complete verification result on the run.                     |

## Phase 4 - Review experience and product demonstration

| Commit  | Why it exists                                                           |
| ------- | ----------------------------------------------------------------------- |
| `46/60` | Shows the run's reviewed snapshot before approval.                      |
| `47/60` | Shows the run's accepted Workspace Version before approval.             |
| `48/60` | Explains exactly what approval authorizes.                              |
| `49/60` | Shows independent verification in Activity.                             |
| `50/60` | Shows the reason publication was blocked.                               |
| `51/60` | Replaces generic AI language with evidence-console hierarchy.           |
| `52/60` | Defines the focused control-room visual system.                         |
| `53/60` | Makes empty and provider-failure states actionable.                     |
| `54/60` | Adds accessible state labels, focus, and reduced-motion treatment.      |
| `55/60` | Adds a public synthetic incident-to-pull-request fixture.               |
| `56/60` | Scripts a truthful five-minute demo around that fixture and a live run. |

## Phase 5 - Release hardening

| Commit  | Why it exists                                                      |
| ------- | ------------------------------------------------------------------ |
| `57/60` | Assigns accountable owners to production controls and credentials. |
| `58/60` | Defines binary private-alpha launch gates and required evidence.   |
| `59/60` | Applies independent standards and specification review findings.   |
| `60/60` | Publishes this review map and the final verified branch.           |

## Highest-risk review points

Review these paths first:

1. `src/workflows/codex-run.ts` - exact-SHA execution, verification order,
   post-creation base validation, and failure cleanup.
2. `src/lib/publication-policy.ts` and `src/lib/publication-remote.ts` - path,
   SHA, draft, evidence, and credential boundaries.
3. `src/lib/codex-runs.ts` and `src/db/schema.ts` - immutable run bindings and
   persisted verification.
4. `src/components/codex-panel.tsx` and `src/components/run-timeline.tsx` - the
   evidence a user sees before approval and after execution.

## Verification before publication

Run on the exact branch head:

```bash
pnpm check
git diff --check main...HEAD
git status --short --branch
```

Expected evidence:

- ESLint reports zero warnings.
- Next.js type generation and `tsc --noEmit` pass.
- All Vitest suites pass.
- The production build includes `/demo` and all authenticated product routes.
- The only untracked path remains the user-owned `launch/` directory, which is
  excluded from every numbered commit.

The independent review and resolutions are recorded in
[`docs/reviews/startup-readiness-41-58.md`](../reviews/startup-readiness-41-58.md).
