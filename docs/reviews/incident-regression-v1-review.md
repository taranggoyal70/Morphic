# Independent review of incident-regression v1

- Core implementation fixed point:
  `52d9894dfa6383851a289c89c4b6713eeaa82d8d`
- Design-partner acquisition fixed point:
  `5bc0dd8c2958165eeca34e484847ddaaf25ac660`
- Reviewed acquisition range:
  `9e4b485237d637d05e4d56fb57458512f6cb1904...5bc0dd8`
- Specification: [`incident-regression-v1.md`](../specs/incident-regression-v1.md)
- Standards: `AGENTS.md`, `CONTEXT.md`, and inherited repository guidance
- Release check: `pnpm check` passed at the acquisition fixed point with 22
  test files and 117 tests

Two review agents independently reviewed the specification and repository
standards. This is an independent code-review pass, not external customer or
human security validation.

## Specification findings and resolutions

1. **High: passing a broad repository script did not prove a changed incident
   regression existed or ran.** Morphic now finds changed test-like paths that
   contain the incident ID, passes each exact path to the repository-owned test
   runner, and awards behavioral proof only from the direct result.
2. **High: a skipped incident case could qualify when an unrelated case
   passed.** The [proof parser](../../src/lib/verification-plan.ts) now requires
   a non-skipped incident-bearing result line with a passing marker and a
   positive runner summary. The
   [behavioral tests](../../src/lib/verification-plan.test.ts) cover skipped,
   mixed, passing, TAP, and Node spec output.
3. **High: regex metacharacters in an incident ID could broaden the runner
   filter.** The [incident domain](../../src/lib/domain/incident.ts) rejects
   unsafe identifiers, and runner filters escape regex-significant characters
   before passing them as process arguments.
4. **Medium: only Vitest, Jest, and Mocha could run linked evidence.** Known
   runners receive their supported path and name-filter arguments. Node, AVA,
   Playwright, Cypress, and repository-owned wrappers receive the exact linked
   path, with output proof still failing closed when the incident result is
   silent, skipped, or unsuccessful.
5. **High: approval and publication evidence could drift from the reviewed
   source.** Run-scoped Workspace Version and Repository Snapshot evidence,
   post-creation pull-request base validation, cleanup on drift, and the bound
   execution timeline preserve the reviewed chain of custody.

The final specification re-review reported no remaining actionable incident-
proof or release findings at the implementation fixed point.

## Standards findings and resolutions

1. Canonical domain language now defines and consistently uses Production
   Incident, Incident Evidence, Incident-Driven Workspace, and Behavioral
   Regression.
2. Verification capabilities use the domain type rather than unstructured
   script-name inference for publication decisions.
3. Native Node test output originally could never qualify because it reports
   `pass 1` rather than `1 passed`. The proof parser and realistic TAP/spec
   fixtures now support both shapes while retaining the incident-line and
   successful-exit requirements.
4. Runner arguments remain process argument arrays rather than shell-
   interpolated incident or path input.

The final standards re-review reported no remaining actionable standards,
security, design, or behavioral findings at the implementation fixed point.

## Market-claim review

The [market report](../research/market-validation-2026-08-09.md) was reviewed
separately for source support. Unsupported survey field dates were removed,
and vendor pricing is described as evidence of paid offerings rather than
proof of purchases. The report continues to score Morphic-specific customer
validation at 0/8.

## Paid design-partner acquisition review

The acquisition work adds an authenticated, durable application path without
awarding itself market evidence. Review findings were resolved as follows:

1. The homepage evidence card is labeled as illustrative synthetic evidence,
   so it cannot be mistaken for stored repository or customer evidence.
2. Public copy describes the shipped source-drift publication block. It does
   not claim that approval expires or that policy and environment drift are
   already enforced.
3. Intake copy and research documentation state that uniqueness is per
   authenticated account. Operators must reconcile duplicate people,
   companies, and aliases before counting demand.
4. Both public pages say Morphic is seeking three paid design partners; neither
   implies that contracts or payments already exist.
5. Incident windows, application choices, labels, and persisted TypeScript
   types share one domain contract rather than drifting across validation and
   UI code.

The final independent standards and specification re-reviews reported no
actionable finding at the acquisition fixed point. The standards review found
no hard violation or actionable smell. The specification review found no
missing requirement, incorrect behavior, or scope creep.

## Release decision

The independent-review rubric item is earned. The acquisition fixed point has
no unresolved high-risk review finding and passes the full repository check.
Exercised production evidence remains unearned, so repository readiness is
capped below 100 and customer validation remains a separate gate.
