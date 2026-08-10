# Repository-readiness scorecard

This score measures whether the repository credibly implements and verifies
Morphic's incident-to-regression promise. It does not measure product-market
fit. Points are awarded only when the named evidence exists at the scored
commit.

## Rubric

| Dimension                       | Points | Binary evidence                                                                                                                        |
| ------------------------------- | -----: | -------------------------------------------------------------------------------------------------------------------------------------- |
| Wedge expression                |     15 | 5: the narrow job is documented; 5: first-class product intake matches it; 5: the primary workflow is not generic-only                 |
| Incident workflow               |     25 | 5 each: validated intake, durable evidence, grounded planning, bound execution, approval and pull-request evidence                     |
| Evidence and publication safety |     25 | 5 each: exact snapshot, run-scoped approval evidence, immutable incident binding, drift rejection, independent behavioral verification |
| Technical health                |     20 | 4 each: lint, typecheck, tests, production build, independent review with no unresolved high-risk finding                              |
| Operability                     |     15 | 3 each: health contract, failure guidance, release checklist, rollback and ownership controls, exercised production evidence           |

Scores are integers. Partial credit is not awarded within a listed binary item.
The maximum score without exercised production evidence is 97.

## Baseline

Fixed point: `ebb4e2ee5bd96ec89f3bf16e6b855520a0bf9964`

| Dimension                       |      Score | Evidence and gap                                                                                                           |
| ------------------------------- | ---------: | -------------------------------------------------------------------------------------------------------------------------- |
| Wedge expression                |      10/15 | The research and synthetic demo name the narrow job, but workspace intake is generic.                                      |
| Incident workflow               |       5/25 | The synthetic demo tells the story; real workspaces do not preserve an incident contract.                                  |
| Evidence and publication safety |      20/25 | Exact snapshots, run-scoped approval, drift rejection, and independent verification exist; incident evidence is not bound. |
| Technical health                |      20/20 | Lint, typecheck, tests, build, and independent review passed at the fixed point.                                           |
| Operability                     |      12/15 | Health, failure guidance, release controls, and ownership documentation exist; production exercises are not recorded.      |
| **Repository readiness**        | **67/100** | Below release threshold.                                                                                                   |

## Market validation, scored separately

The eight market gates in
[`docs/research/market-validation-2026-08-09.md`](../research/market-validation-2026-08-09.md)
remain external facts. Current public evidence validates the problem category
and adjacent spending, but direct competitors occupy much of the workflow and
the repository cannot award itself customer evidence.

Current verified result: **0 of 8 evidenced in this repository**. This means
the business remains unvalidated even if repository readiness reaches 90.

## Current startup-readiness score

Scored implementation commit: `5bc0dd8c2958165eeca34e484847ddaaf25ac660`

| Dimension                       |      Score | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ------------------------------- | ---------: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Wedge expression                |      15/15 | The narrow job is defined in the [product specification](../specs/incident-regression-v1.md), [incident intake](../../src/components/create-workspace-form.tsx) is first-class, and the [paid design-partner path](../../src/app/design-partners/page.tsx) recruits against that exact job without claiming validation.                                                                                                           |
| Incident workflow               |      25/25 | Evidence is [validated](../../src/lib/domain/incident.ts), persisted through the [migration](../../drizzle/0004_lush_songbird.sql), [bound structurally](../../src/lib/incident-plan.ts) into planning and [execution](../../src/lib/execution-prompt.ts), displayed at [approval](../../src/components/approval-evidence.tsx), and recorded in the [draft pull request](../../src/lib/publication-policy.ts).                    |
| Evidence and publication safety |      25/25 | [Run-scoped bindings](../../src/lib/codex-runs.ts), [base-drift rejection](../../src/lib/publication-policy.ts), and [workflow verification](../../src/workflows/codex-run.ts) require a changed test naming the incident plus direct runner output naming the incident and a pass. [Behavioral gate tests](../../src/lib/verification-plan.test.ts) cover skipped, mixed, regex-significant, wrapper, TAP, and passing outcomes. |
| Technical health                |      20/20 | Lint, typecheck, 22 test files with 117 tests, and the production build passed through the [`pnpm check` contract](../../package.json) at the scored commit. The [independent specification and standards reviews](incident-regression-v1-review.md) report no unresolved actionable finding at that fixed point.                                                                                                                 |
| Operability                     |      12/15 | The [launch checklist](../operations/launch-readiness.md) and [production controls](../operations/production-controls.md) define health, failure guidance, rollback, and ownership. Exercised production evidence remains unearned.                                                                                                                                                                                               |
| **Repository readiness**        | **97/100** | Meets the 90-point repository-readiness threshold without awarding the unexercised production-evidence item.                                                                                                                                                                                                                                                                                                                      |

### Verification record

- `pnpm check`: passed at
  `5bc0dd8c2958165eeca34e484847ddaaf25ac660` with lint, typecheck, 22 test
  files containing 117 passing tests, and the production build.
- Standards and specification reviews: the
  [final review record](incident-regression-v1-review.md) links every material
  finding to its resolution and records clean final reviews at the scored
  implementation commit.
- User-owned `launch/`: absent from every commit and excluded from this score.
- Market validation: **0 of 8**, with category evidence, competitive limits,
  recruiting leads, and the next honest validation steps recorded in the
  [current market report](../research/market-validation-2026-08-09.md) and
  [customer-validation kit](../research/incident-regression-customer-validation-kit.md).
