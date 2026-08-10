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

Fixed point: `ebb4e2ee965c2caef4a5fb2229a9ca4d18d7ca53`

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
[`docs/research/market-validation-2026-07-25.md`](../research/market-validation-2026-07-25.md)
remain external facts. The repository cannot award itself those points.

Current verified result: **0 of 8 evidenced in this repository**. This means
the business remains unvalidated even if repository readiness reaches 90.

## Release score

Complete this section only from the exact reviewed release commit.

- Release commit: _pending_
- Repository readiness: _pending_
- `pnpm check`: _pending_
- Standards review: _pending_
- Specification review: _pending_
- Market validation: **0 of 8 evidenced in this repository**
