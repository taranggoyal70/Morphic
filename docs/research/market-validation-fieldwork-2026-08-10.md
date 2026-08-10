# Market-validation fieldwork

Date: 2026-08-10

## Current result

Morphic has eight market gates, not seven. The verified result remains **0/8**.
This document converts each zero into the next observable customer event. It
does not award points for public research, recruiting assets, outreach, or
product readiness.

Public recruiting began with
[research call #4](https://github.com/taranggoyal70/Morphic/issues/4) on
2026-08-10. At creation it had no participant response, completed interview, or
other score-bearing evidence. The targeted lead queue below remained
uncontacted.

| Gate                     | Why it is zero                                   | First evidence that can change it                                                  |
| ------------------------ | ------------------------------------------------ | ---------------------------------------------------------------------------------- |
| Problem interviews       | No completed qualified interview records         | 15 dated records from screened buyers, each reconstructing a recent incident       |
| Real artifacts           | No received and reviewed buyer artifacts         | 5 safe records confirming a redacted artifact was received and reviewed            |
| Paid design partnerships | No signed scope or cleared payment               | 3 time-bounded pilot agreements with $10K-$25K received upfront                    |
| Production usage         | No customer change ledger                        | 300 eligible real changes observed through paid pilots                             |
| Blocking value           | No customer-confirmed prevented failures         | Multiple Morphic blocks that customers confirm should have prevented release       |
| Precision                | No labeled sample of Morphic decisions           | Customer-reviewed decisions with a measured false-positive rate below 10%          |
| Conversion               | No completed paid pilot                          | 2 pilots convert to contracts worth at least $50K annually                         |
| Required control         | No customer repository requires the Morphic gate | At least 2 customers make the check required in customer-owned repository settings |

The research workflow is staged, but the gates are scored independently. Any
gate is earned as soon as its Morphic-specific threshold is met. In practice,
product usage and outcome evidence is expected to come from paid pilots. The
immediate operating objective is 15 qualified problem interviews because they
create the safest path to artifact sessions and pilot decisions.

## First-wave public lead queue

These people are named in public, first-party customer accounts because they
operate production AI evaluation or agent workflows. They are research leads,
not qualified prospects. A public story does not establish current employment,
company size, a recent incident, decision authority, consent to contact, or
interest in Morphic. Screen all of those before counting an interview.

| Priority | Public lead and role                                                                                    | Public evidence of relevant workflow                                                                                                                                     | Cohort and test                                                                     | Status        |
| -------: | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- | ------------- |
|        1 | Calvin Yee, Senior Software Engineer, Graphite                                                          | [Systematic evaluation for AI code review](https://www.braintrust.dev/customers/graphite)                                                                                | Screen segment fit first; then test source binding in a code-review product         | Not contacted |
|        2 | Nicolas Bustamante, CEO and co-founder, Fintool                                                         | [Production-log evaluation for financial insights](https://www.braintrust.dev/customers/fintool)                                                                         | Screen segment fit first; then test budget and high-trust release evidence          | Not contacted |
|        3 | [Connor Heggie, CTO and co-founder, Unify](https://www.unifygtm.com/explore/best-b2b-prospecting-tools) | [Production research-agent architecture](https://www.unifygtm.com/blog/announcing-openais-computer-use-agent-in-unify)                                                   | Screen segment fit first; then test whether existing LangSmith workflows are enough | Not contacted |
|        4 | Paul Klein IV, founder and CEO, Browserbase                                                             | [Reliability workflow for browser agents](https://www.braintrust.dev/customers/browserbase)                                                                              | Screen segment fit first; then test long-running incident and approval needs        | Not contacted |
|        5 | Allen Kleiner, AI Engineering Lead, Retool                                                              | [Production logs driving AI roadmap decisions](https://www.braintrust.dev/customers/retool)                                                                              | Test whether trace-to-roadmap work exposes a release-proof gap                      | Not contacted |
|        6 | Sarav Bhatia, Senior Director of Engineering, Navan                                                     | [Production voice-agent evaluation](https://www.braintrust.dev/customers/navan)                                                                                          | Strong falsification lead with mature evals; screen company-size exception          | Not contacted |
|        7 | Sarah Sachs, AI Modeling Lead, Notion                                                                   | [Agent evaluation across 70 engineers](https://www.braintrust.dev/customers/notion)                                                                                      | Mature-eval falsification; test whether ordinary CI evidence is already sufficient  | Not contacted |
|        8 | Luis Héctor Chávez, CTO, Replit                                                                         | [Production issue discovery across AI sessions](https://www.braintrust.dev/customers/replit)                                                                             | Mature observability; test handoff from grouped failure to reviewed source          | Not contacted |
|        9 | Matt Granmoe, Senior Software Engineer, Loom                                                            | [Code and model scoring for AI features](https://www.braintrust.dev/customers/loom)                                                                                      | Test whether deterministic scorers already provide trusted release evidence         | Not contacted |
|       10 | Josh Clemm, VP of Engineering, Dropbox                                                                  | [Pre-merge and production regression pipeline](https://www.braintrust.dev/customers/dropbox)                                                                             | Strongest falsification of the wedge; mature pipeline may make Morphic redundant    | Not contacted |
|       11 | Matt Terrell, Director of Product, Box AI                                                               | [Dataset-based AI launch readiness](https://www.braintrust.dev/customers/box)                                                                                            | Test buyer ownership and evidence required for release decisions                    | Not contacted |
|       12 | Sidharth Srinivasan, Product Manager, Box AI                                                            | [Dataset-based AI launch readiness](https://www.braintrust.dev/customers/box)                                                                                            | Same system, different operator view; do not count duplicate company demand twice   | Not contacted |
|       13 | Akshay Sharma, Machine Learning Engineer, Lyft                                                          | [Production customer-support agent platform](https://www.langchain.com/blog/lyft-built-a-self-serve-ai-agent-platform-for-customer-support-with-langgraph-and-langsmith) | Enterprise control cohort; test decentralized change approval                       | Not contacted |
|       14 | Vitor Balocco, Staff Applied AI Engineer, Zapier                                                        | [Production-log search and evaluation](https://www.braintrust.dev/blog/brainstore)                                                                                       | Mature platform cohort; test whether exact-source proof remains manual              | Not contacted |
|       15 | Malte Ubl, CTO, Vercel                                                                                  | [Evaluation integrated into engineering workflows](https://www.braintrust.dev/blog/vercel-marketplace)                                                                   | Enterprise control cohort; test whether existing GitHub controls close the gap      | Not contacted |

Two people from one company may reveal different workflows, but they do not
create two company-level demand signals. The field record must preserve that
distinction.

## Non-leading outreach pattern

Personalize only the first sentence with the public workflow above:

> I am researching how teams recover from production AI behavior incidents.
> Your public account describes [specific existing evaluation or incident
> workflow]. I am looking for a 45-minute conversation about the most recent
> incident your team can discuss in redacted form, from first report through
> release verification. I will not show or pitch a product until the workflow
> interview is complete. Would you be open to participating, or pointing me to
> the person who owns that process?

Do not claim a mutual connection, do not imply that the public account proves a
pain point, and do not send a product demo in the first message. Record sent,
declined, referred, scheduled, completed, and disqualified states separately.

## Honest score update rule

Update the 0/8 score only from dated evidence records produced by the existing
protocol. A completed but disqualified interview remains useful evidence and
must not be counted. A refusal is a market result and should be preserved with
its reason, but it does not earn a gate.
