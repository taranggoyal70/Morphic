# Incident-to-regression market validation

Date: 2026-08-09

## Decision

Public evidence validates the problem category, but it does not validate demand
for Morphic.

- AI agents are reaching production, quality remains a leading deployment
  barrier, and teams are buying observability and evaluation products.
- Real model-quality incidents have escaped offline evaluations at OpenAI and
  Anthropic.
- Production failures becoming regression cases is an established workflow,
  not a new category. Braintrust already documents it end to end.
- LangSmith Engine is the closest direct competitor. Its beta product detects
  recurring trace failures, proposes fixes, generates evaluators and offline
  examples, and opens pull requests.
- No public evidence establishes that a buyer wants Morphic's remaining
  evidence-bound approval and exact-source governance layer enough to adopt or
  pay for it.

The verified customer-validation score therefore remains **0 of 8 gates**.
Desk research cannot award interview, artifact, pilot, usage, accuracy,
conversion, or required-check evidence.

The strongest defensible hypothesis is narrower than "incident to regression":

> Morphic is the evidence-bound release control between an existing
> observability or evaluation platform and GitHub. It proves that an approved
> incident fix and its repository-owned behavioral regression were executed
> against the exact source under review, and invalidates approval on drift.

This positioning still needs buyer discovery. It is not a validated business.

## Method and limits

This review used first-party vendor documentation, official research and
postmortems, official pricing, vendor-published customer accounts, GitHub's
platform documentation, and one reproducible public issue in an affected
repository. Sources were reviewed on 2026-08-09.

No interviews, private customer data, pilots, revenue, or production telemetry
were available. Vendor surveys and customer stories can demonstrate category
demand, but they have selection and marketing bias. An undocumented competitor
capability cannot be treated as absent.

## Demand and buyer pain

| Evidence                                                                                                                                                                                                                                                                                                                              | What it supports                                                                                        | What it does not support                                                                                        |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| LangChain's 2026 State of Agent Engineering survey reports 1,300+ respondents, 57% with agents in production, quality as a top barrier for 32%, observability adoption at 89%, and offline-eval adoption at 52.4%. The results page was published 2026-06-12.                                                                         | There is a production-agent reliability problem and an active observability/evaluation category.        | The vendor-run sample does not establish a representative market size or demand for Morphic's governance layer. |
| Google's 2025 DORA report drew on nearly 5,000 technology professionals. It reports 90% using AI at work and a continuing negative relationship between AI adoption and delivery stability. It says automated testing, version control, and fast feedback loops are needed to prevent higher change volume from becoming instability. | AI-assisted delivery increases the need for verification and release controls.                          | It is not specific to production AI incidents or Morphic's buyer.                                               |
| OpenAI rolled back a GPT-4o update after a behavioral regression. Its 2025-05-02 analysis says offline behavior evaluations looked good, it lacked a specific deployment evaluation for sycophancy, and the missed behavior should have been launch-blocking.                                                                         | Behavioral failures can evade broad evals and require production-derived, release-blocking coverage.    | OpenAI's internal process is not evidence that external teams will buy Morphic.                                 |
| Anthropic's 2025-09-17 postmortem says three infrastructure bugs degraded Claude responses, one initially affecting about 0.8% of Sonnet 4 requests. Its benchmarks and evaluations did not capture the reported degradation, so Anthropic committed to more sensitive and continuous production evaluations.                         | Rare, behavior-level regressions are real and difficult to connect to code changes.                     | A frontier lab's infrastructure does not represent a 20-to-200-engineer software company.                       |
| A public LangChain issue opened 2025-10-15 reproduces a high-severity agent failure where invalid tool calls can silently stop an agent and describes a middleware workaround that cannot repair the core routing behavior.                                                                                                           | Agent framework failures can be behavioral, production-relevant, and hard to cover with generic checks. | A GitHub issue is not a qualified buyer interview or willingness-to-pay signal.                                 |

Primary sources:

- [State of Agent Engineering, LangChain, 2026-06-12](https://www.langchain.com/state-of-agent-engineering)
- [Announcing the 2025 DORA Report, Google Cloud, 2025-09-23](https://cloud.google.com/blog/products/ai-machine-learning/announcing-the-2025-dora-report)
- [Expanding on what we missed with sycophancy, OpenAI, 2025-05-02](https://openai.com/index/expanding-on-sycophancy/)
- [A postmortem of three recent issues, Anthropic, 2025-09-17](https://www.anthropic.com/engineering/a-postmortem-of-three-recent-issues)
- [LangChain issue 33504, opened 2025-10-15](https://github.com/langchain-ai/langchain/issues/33504)

## Existing behavior and budget

Teams already spend money and engineering effort on adjacent workflows:

- Braintrust lists a $249 monthly Pro plan, usage charges, and custom Enterprise
  pricing. LangSmith lists a $39 per-seat monthly Plus plan, usage charges, and
  custom Enterprise pricing. These pages show paid offerings in the category;
  they do not disclose purchases or show that Morphic can charge $25,000 to
  $100,000 in annual contract value.
- In a Braintrust-published account, Dropbox reports a 150-test pre-merge smoke
  suite, more than 10,000 post-merge tests, production regression detection,
  and production traces feeding new tests. This demonstrates significant
  internal investment in the workflow. It also shows that a sophisticated team
  can implement much of the process with an evaluation platform rather than a
  separate evidence-control product.
- Braintrust's Box account describes versioned, schema-validated datasets and a
  roughly 330-question golden dataset that gates general availability. This is
  evidence that release gating matters to enterprise AI teams, but it remains a
  vendor-selected customer story.
- LangChain's Lyft account reports automated evaluation on 100% of production
  agents and a Git-backed CI validation pipeline under development. This again
  validates spend and internal effort in reliability, not Morphic-specific
  demand.

Sources:

- [Braintrust pricing, accessed 2026-08-09](https://www.braintrust.dev/pricing)
- [LangSmith pricing, accessed 2026-08-09](https://www.langchain.com/pricing)
- [How Dropbox built an evaluation pipeline for AI search, accessed 2026-08-09](https://www.braintrust.dev/customers/dropbox)
- [How Box defines launch readiness with evals, accessed 2026-08-09](https://www.braintrust.dev/customers/box)
- [How Lyft built a self-serve AI agent platform, 2026-05-27](https://www.langchain.com/blog/lyft-built-a-self-serve-ai-agent-platform-for-customer-support-with-langgraph-and-langsmith)

## Competitive reality

| Capability                                                                     | Braintrust                                   | LangSmith Engine                             | Sentry Seer                                               | GitHub                                                               | Morphic hypothesis                                        |
| ------------------------------------------------------------------------------ | -------------------------------------------- | -------------------------------------------- | --------------------------------------------------------- | -------------------------------------------------------------------- | --------------------------------------------------------- |
| Production trace to regression data                                            | Shipped                                      | Shipped                                      | Issue telemetry is the input                              | Not native                                                           | Integrate, do not rebuild                                 |
| Detect or group production failures                                            | Shipped through logs, scores, and topics     | Shipped for recurring trace issues           | Shipped for application issues                            | Not native                                                           | Defer to source platform                                  |
| Generate evaluator or test evidence                                            | Shipped                                      | Shipped                                      | Official docs reviewed do not make this the core contract | Runs repository checks                                               | Require a repository-owned behavioral regression          |
| Propose a code fix and open a PR                                               | Not the documented core workflow reviewed    | Shipped in beta                              | Shipped                                                   | Coding agents and PRs are native                                     | Use a disposable coding sandbox and draft PR              |
| Version evaluation inputs and results                                          | Shipped                                      | Datasets and evaluations shipped             | Not the documented core workflow reviewed                 | Commits and checks are versioned                                     | Bind incident, workspace version, and repository snapshot |
| CI or merge gate                                                               | GitHub Action and CI support shipped         | GitHub workflow thresholds shipped           | PR integrates with GitHub                                 | Required status checks shipped                                       | Publish independently verified behavioral evidence        |
| Approval invalidated on source, policy, or environment drift                   | No claim found in the reviewed official docs | No claim found in the reviewed official docs | No claim found in the reviewed official docs              | Latest-SHA checks are required, but approval semantics are external  | Core proposed differentiation                             |
| Direct proof that an incident-linked repository test executed and did not skip | No claim found in the reviewed official docs | No claim found in the reviewed official docs | No claim found in the reviewed official docs              | GitHub documents that a conditionally skipped job can report success | Core proposed differentiation                             |

"No claim found" is a documentation observation, not proof that the vendor
lacks the capability.

The competitive discovery changes the earlier conclusion. "Turn a production
failure into a regression and a PR" is already directly occupied by LangSmith
Engine and substantially occupied by Braintrust. Morphic can only remain
differentiated if buyers value independently verifiable approval and drift
controls across their existing tools.

Sources:

- [LangSmith Engine documentation, beta, accessed 2026-08-09](https://docs.langchain.com/langsmith/engine)
- [Braintrust evaluation workflow, accessed 2026-08-09](https://www.braintrust.dev/docs/evaluate)
- [Braintrust CI evaluation, accessed 2026-08-09](https://www.braintrust.dev/docs/evaluate/run-evaluations)
- [Braintrust production-failure regression workflow, 2026-05-29](https://www.braintrust.dev/articles/turn-llm-production-failures-into-regression-tests)
- [LangSmith evaluation, accessed 2026-08-09](https://www.langchain.com/langsmith/evaluation)
- [Sentry Seer issue-fix API, accessed 2026-08-09](https://docs.sentry.io/api/seer/start-seer-issue-fix/)
- [GitHub status-check documentation, accessed 2026-08-09](https://docs.github.com/en/enterprise-cloud@latest/pull-requests/reference/status-checks)
- [GitHub required-check troubleshooting, accessed 2026-08-09](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/collaborating-on-repositories-with-code-quality-features/troubleshooting-required-status-checks)

## Verified market-validation score

The score uses the eight gates established in the 2026-07-25 research. Each
gate requires Morphic-specific primary evidence. Category evidence and
competitor customer stories do not count.

| Gate                     | Required evidence                                                      | Verified result                           |   Score |
| ------------------------ | ---------------------------------------------------------------------- | ----------------------------------------- | ------: |
| Problem interviews       | 15 qualified buyers interviewed about a recent incident before a pitch | No interview records                      |       0 |
| Real artifacts           | 5 qualified buyers provide redacted incident artifacts                 | No buyer artifacts                        |       0 |
| Paid design partnerships | 3 buyers pay $10,000 to $25,000 upfront for a 90-day pilot             | No contracts or payments                  |       0 |
| Production usage         | 300 real changes pass through Morphic                                  | No production usage ledger                |       0 |
| Blocking value           | Morphic catches multiple failures customers agree should have blocked  | No production outcomes                    |       0 |
| Precision                | False positives remain below 10%                                       | No labeled production sample              |       0 |
| Conversion               | 2 pilots convert to at least $50,000 annual contract value             | No pilots or conversions                  |       0 |
| Required control         | Customers make the Morphic check required rather than advisory         | No customer repository configuration      |       0 |
| **Total**                |                                                                        | **No Morphic-specific customer evidence** | **0/8** |

Public evidence increases confidence that the problem is real. It cannot
increase this customer-validation score.

## Public recruiting map

The following are research leads, not qualified prospects. Their appearance in
a vendor story does not imply interest, consent to contact, or fit with the
20-to-200-engineer initial segment. Each must be screened for a recent
behavioral incident, decision authority, current stack, and team size.

| Interview cohort          | Public leads                                        | Why include them                                                                                                                                                                                                          |
| ------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Mature eval users         | Dropbox, Box, Graphite, Lyft, Clay                  | Test whether teams with strong incumbent workflows still experience stale-source, approval, or skipped-check gaps. This is the strongest falsification cohort.                                                            |
| Agent-product operators   | Modern Treasury, Unify, Wordsmith, Madrigal, Podium | Test whether smaller or domain-focused agent teams experience the control problem frequently enough to fund another integration.                                                                                          |
| Enterprise control owners | Cisco, ServiceNow, PagerDuty, Monday.com, Rippling  | Test whether governance buyers require evidence beyond their existing eval, CI, and change-management systems. These accounts are likely outside the initial segment but can reveal procurement and control requirements. |

Public lead sources are the
[LangChain customer index](https://www.langchain.com/customers), the
[Braintrust customer index](https://www.braintrust.dev/customers), and the
individual customer accounts cited above. No outreach was performed during
this research.

Use the same non-leading sequence in every interview:

1. Ask for the last production agent incident and its impact before mentioning
   Morphic.
2. Reconstruct the path from trace or complaint to diagnosis, code change,
   regression coverage, approval, merge, and production verification.
3. Ask which artifacts are durable and request a redacted example only after
   the workflow is understood.
4. Ask how the reviewer knows the evaluated code is the code being approved,
   and what happens after the source, policy, environment, or test selection
   changes.
5. Ask whether a stale, broad, excluded, or skipped check could appear green.
6. Identify who owns the merge block, who owns the incident outcome, and which
   budget funds the current tools.
7. End with a concrete paid shadow-mode pilot. Record a refusal and its reason
   as evidence rather than converting interest into a positive signal.

## Fastest honest path to a higher score

The next investment should be discovery and a thin integration pilot, not more
horizontal product surface.

1. Recruit 15 engineering or AI-platform leaders at companies with a
   customer-facing agent in production. Record role, company size, most recent
   behavioral incident, current trace-to-release workflow, time lost, and who
   can block a release.
2. Ask for five redacted artifacts only after the incident interview: source
   trace link or export, incident record, corrective pull request, regression
   evidence, and the approval or merge record.
3. Test the remaining differentiation without leading the witness: ask how the
   buyer proves the evaluated code equals the approved code, what invalidates
   approval, and whether a skipped or stale check could merge.
4. Offer a paid 90-day shadow-mode design partnership that integrates the
   buyer's existing Braintrust or LangSmith project and GitHub. Do not replace
   their trace store or eval runner.
5. Pre-register pilot metrics: real changes observed, eligible incidents,
   confirmed blocks, false positives, time from incident to verified PR,
   advisory-to-required conversion, and expansion or cancellation reason.
6. Stop if fewer than three buyers will pay, if exact binding is owned by an
   incumbent roadmap, or if customers accept ordinary CI evidence as
   sufficient. Those outcomes falsify the proposed control-layer wedge.

The first score increase is earned only when the underlying interview or
customer artifact exists and can be audited. A stronger report is not a market
event.

Use the
[customer-validation kit](incident-regression-customer-validation-kit.md) to
run those interviews, handle redacted artifacts, pre-register pilot metrics,
and update the gate ledger without changing the standard after results arrive.
