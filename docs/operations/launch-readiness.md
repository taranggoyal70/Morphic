# Private-alpha launch readiness

Launch means enabling Morphic for named design partners on real, non-critical
repositories. It does not mean general availability. Every gate below is
binary, has an owner, and requires linked evidence from the release commit.

## Release identity

- Release commit: _record the exact 40-character SHA_
- Preview deployment: _record the immutable deployment URL_
- Production deployment owner: _name one person_
- Release decision owner: _name one person_
- Rollback commit: _record the last verified SHA_

Do not approve launch with blank release identity fields.

## Product and market gates

- [ ] At least 15 qualified buyers have been interviewed without pitching the
      solution first.
- [ ] At least five buyers supplied a real, redacted incident artifact.
- [ ] At least three design partners paid for a time-bounded pilot.
- [ ] The pilot job is explicitly incident-to-behavioral-regression, not a
      generic coding-agent workspace.
- [ ] Each partner names the person authorized to approve changes and the
      disposable or non-critical repositories allowed during alpha.

The validation thresholds come from
[market validation](../research/market-validation-2026-08-09.md). Missing a
market gate blocks commercial claims, even if the software gates pass.

## Verified software gates

| Gate                     | Passing evidence                                                                                                                  | Owner            |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| Repository checks        | `pnpm check` passes on the exact release commit with no ignored failures                                                          | Engineering      |
| Database migration       | Migrations through `drizzle/0005_flimsy_nova.sql` are reviewed, applied once, and present in the production migration record      | Data owner       |
| Recruiting intake        | `/design-partners` requires an attributable account and persists one redacted application per user without awarding a market gate | Product owner    |
| Exact snapshot           | A real run provisions the stored 40-character SHA and blocks when the default branch advances                                     | Engineering      |
| Approval boundary        | The approval panel shows repository + short SHA, Workspace Version, and draft-only authorization copy                             | Product          |
| Independent verification | At least one repository-owned check is recorded on the run and in the draft pull request                                          | Engineering      |
| Negative verification    | A deliberately failing check produces no branch publication or pull request                                                       | Engineering      |
| Empty diff               | A no-change agent run produces no pull request                                                                                    | Engineering      |
| Turn exhaustion          | A run that never calls finish produces no pull request                                                                            | Engineering      |
| Path safety              | An invalid or out-of-repository changed path blocks publication                                                                   | Security         |
| Credential cleanup       | The sandbox origin is credential-free after both successful and failed pushes                                                     | Security         |
| Draft publication        | A passing run opens a draft pull request with reviewed snapshot, Workspace Version, and command results                           | Repository owner |
| Incident regression      | A changed test names the incident and direct execution reports the incident plus at least one passing test                        | Product owner    |
| Teardown                 | Successful and failed runs both stop their Vercel Sandbox                                                                         | Operations       |

## Security and data gates

- [ ] Clerk uses production keys, exact HTTPS origins, and the intended GitHub
      OAuth scopes.
- [ ] Every user-owned read and write remains scoped by authenticated user ID.
- [ ] GitHub access tokens are retrieved server-side and never persisted by
      Morphic.
- [ ] Vercel, Neon, Upstash, OpenAI, and GitHub access is limited to named
      owners documented in
      [production controls](production-controls.md).
- [ ] Secret scanning and dependency review report no unresolved critical or
      high-severity findings in release scope.
- [ ] User deletion webhook delivery is verified in the production Clerk
      instance.
- [ ] Neon backup restoration has been exercised against a non-production
      branch.

## Reliability and operating gates

- [ ] `/api/health` succeeds from the production region.
- [ ] Error monitoring alerts a named responder for workflow and publication
      failures.
- [ ] Spend alerts exist for OpenAI, Vercel Sandbox, Neon, and Upstash.
- [ ] Rate limits are enabled against the production Upstash database.
- [ ] The deploy, rollback, and incident procedures have each been exercised by
      the named owner.
- [ ] Support response expectation and escalation contact are shared with every
      design partner.

## Experience gates

- [ ] The five-minute demo is completed from incident to draft pull request on
      desktop and mobile widths.
- [ ] Keyboard-only navigation reaches every approval, rejection, cancel,
      activity, and pull-request control with a visible focus indicator.
- [ ] Loading, empty, provider failure, verification failure, base drift, and
      publication success states give a specific next action.
- [ ] Reduced-motion preference removes non-essential animation.
- [ ] The synthetic `/demo` fixture is visibly labeled and never described as
      customer evidence.

## Launch decision

Launch only when all software, security, reliability, and experience gates are
checked with evidence. Market gates may remain open for a free technical alpha,
but paid-pilot or product-market-fit claims remain blocked until they pass.

Record the decision, date, unresolved exceptions, exception owner, and expiry
in the release pull request. An exception without an expiry is a failed gate.
