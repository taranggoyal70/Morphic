# Incident-regression customer validation kit

Date: 2026-08-09

## Purpose

Use this protocol to test whether engineering leaders will adopt and pay for
Morphic's remaining wedge: evidence-bound release control between an existing
AI observability or evaluation platform and GitHub.

The protocol is designed to earn the eight gates in the
[market-validation report](market-validation-2026-08-09.md) without counting
desk research, compliments, synthetic incidents, unpaid trials, or advisory
usage as customer proof.

## Research decision

The first study must answer one question:

> After a real production AI incident, is proving that the approved fix and a
> repository-owned regression ran against the exact reviewed source a painful,
> unsolved, and budget-worthy release-control job?

Stop product expansion until the study produces either three paid design
partnerships or a clear falsification.

## Participant screen

Recruit 15 participants who meet every required condition.

| Condition          | Required evidence                                                                                         |
| ------------------ | --------------------------------------------------------------------------------------------------------- |
| Role               | Engineering, AI platform, reliability, or product leader who can describe and change the release workflow |
| Product            | A customer-facing AI agent is in production                                                               |
| Incident recency   | At least one behavioral incident in the last 90 days                                                      |
| Engineering system | Application code and release checks live in GitHub                                                        |
| Existing stack     | Uses an observability, tracing, or evaluation product rather than seeking a new trace store               |
| Company            | Initial target is a B2B software company with roughly 20 to 200 engineers                                 |

Exclude consultants speaking only about client work, teams without production
traffic, and participants unable to discuss a specific recent incident.

Track participants with anonymous IDs such as `P01`. Keep names, contact
details, raw traces, and customer data outside the repository.

## Interview guide

Run a 45-minute interview. Do not mention Morphic or show the concept until the
problem section is complete.

### Context, 5 minutes

1. What production AI behavior are you responsible for?
2. Who can stop a release when that behavior is unsafe or incorrect?
3. Which tracing, evaluation, incident, and source-control tools are involved?

### Last incident, 15 minutes

4. Tell me about the most recent behavioral incident, starting when it was
   first noticed.
5. What customer or business outcome made it an incident?
6. Which artifacts existed: trace, incident record, issue, pull request, test,
   approval, and deployment record?
7. How did the team decide what behavior the fix had to preserve?
8. How long did investigation, correction, verification, and approval take?
9. Where did people copy data, reconcile versions, or rely on memory?

### Release proof, 10 minutes

10. How did the reviewer know the tested code was the code being approved?
11. What happened if the branch, prompt, policy, model, dataset, or environment
    changed after evaluation?
12. Could a skipped, stale, broad, or unrelated passing check allow the change
    to merge?
13. What evidence would you need during an audit or a recurrence?
14. What did this workflow cost in engineering time, delayed release, customer
    impact, or compliance work?

### Existing alternatives, 5 minutes

15. What have you built or bought to solve this?
16. Which part works well enough today?
17. Which part remains manual, untrusted, or unenforced?
18. Is fixing that gap funded by an existing reliability, platform, security,
    or AI infrastructure budget?

### Concept and commitment, 10 minutes

Only now present this statement:

> Morphic connects an existing incident trace to a repository-owned behavioral
> regression, independently runs that regression against the exact reviewed
> source, binds human approval to the evidence, and blocks draft publication
> when the repository's default branch moves beyond that reviewed source.

Then ask:

19. Which part is redundant with your current stack?
20. What would prevent this from becoming a required check?
21. Who else must approve a 90-day production pilot?
22. Will you provide a redacted incident artifact for a working session?
23. Will you pay $10,000 to $25,000 upfront for a 90-day shadow-mode design
    partnership with pre-registered success and stop criteria?

Record the answer to questions 22 and 23 as yes only when the participant makes
a concrete next-step commitment. Interest, introductions, and requests for a
free trial do not qualify.

## Evidence record

Create one repository-safe record per interview. Do not include personal data,
secrets, raw customer content, or an identifying trace URL.

```markdown
# P01 validation record

- Interview date:
- Participant segment and role:
- Qualification evidence:
- Recent incident date and anonymous summary:
- Current workflow:
- Quantified impact:
- Source and approval binding today:
- Existing alternative and spend:
- Unsolved job:
- Artifact commitment and received date:
- Paid-pilot decision and next step:
- Evidence confidence: direct / inferred / unknown
- Disconfirming evidence:
```

An interview counts only when the dated record covers a real recent incident
and the participant passed the screen. A buyer artifact counts only when it is
actually received, redacted, and reviewed. The record may describe the artifact
without storing it in Git.

## Artifact working session

Request the smallest safe bundle needed to reconstruct the chain of custody:

1. a redacted trace excerpt or source-platform reference;
2. the incident's observed and expected behavior;
3. the corrective issue or pull request;
4. the regression or evaluation used to verify the fix;
5. the approval or merge record; and
6. the deployed source version, if known.

Ask the participant to redact customer content, personal data, credentials,
internal hostnames, and proprietary prompts before sharing. Do not commit raw
artifacts to the public repository.

## Paid design partnership

Offer one deliberately narrow 90-day pilot:

- integrate the buyer's existing Braintrust or LangSmith project and GitHub;
- observe in shadow mode before enabling any required check;
- process only redacted incidents the buyer approves;
- produce an exact-source evidence bundle and draft corrective pull request;
- measure time from incident to verified pull request;
- label every eligible outcome as confirmed block, false positive, missed
  incident, or no decision; and
- require upfront payment of $10,000 to $25,000.

Pre-register these promotion thresholds:

| Measure                                              |                             Promotion threshold |
| ---------------------------------------------------- | ----------------------------------------------: |
| Paid pilots                                          |                                               3 |
| Real changes observed across pilots                  |                                             300 |
| Customer-confirmed failures that should have blocked |                                      At least 2 |
| False-positive rate                                  | Below 10% on customer-labeled eligible outcomes |
| Annual conversions                                   |                            2 at $50,000 or more |
| Enforcement                                          |    At least 2 customers make the check required |

Do not change denominators after results arrive. Report false positives as
`false positives / all customer-labeled blocking decisions`, alongside the raw
counts and confidence interval when the sample supports one.

## Falsification rules

Stop or change the wedge when any of these findings repeat across qualified
buyers:

- ordinary GitHub checks are considered sufficient evidence;
- exact source, approval, or environment drift is not a meaningful risk;
- the observability vendor already owns the workflow and buyers will not add a
  control layer;
- buyers will share praise or artifacts but fewer than three will pay upfront;
- the buyer wants another dashboard, trace store, or generic coding agent; or
- a required check creates more delay than the failures it prevents.

## Gate ledger

Update this ledger only from auditable customer records.

| Gate                                      | Required count | Verified count | Evidence links |
| ----------------------------------------- | -------------: | -------------: | -------------- |
| Qualified problem interviews              |             15 |              0 | None           |
| Buyers providing redacted artifacts       |              5 |              0 | None           |
| Paid 90-day design partnerships           |              3 |              0 | None           |
| Real changes processed                    |            300 |              0 | None           |
| Customer-confirmed blocking catches       |      2 or more |              0 | None           |
| False-positive rate                       |      Below 10% |   Not measured | None           |
| Pilots converting to at least $50,000 ACV |              2 |              0 | None           |
| Customers making the check required       |      2 or more |              0 | None           |

The first market-validation score increase happens only after the linked
customer evidence exists. Preparation makes that work faster, but preparation
does not earn a gate.
