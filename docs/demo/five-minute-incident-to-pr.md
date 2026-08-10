# Five-minute incident-to-pull-request demo

## Purpose

Show one narrow Morphic job: turn an observed AI-agent failure into a reviewed,
source-bound correction with independent replay evidence and a draft pull
request. Do not present the synthetic fixture as a customer result.

## Before the call

- Open `/demo` in one tab. This route is public and needs no credentials.
- Open a signed-in Morphic workspace connected to a disposable GitHub
  repository in a second tab.
- Confirm the repository default branch has not advanced since synchronization.
- Prepare one bounded instruction that changes a testable behavior.
- Keep the generated draft pull request closed from any previous run.

If a live provider is unavailable, stay on `/demo` and explain the control
boundaries. Do not substitute screenshots or claim that the fixture ran live.

## The five-minute story

### 0:00-0:45 - Start with the failure

On `/demo`, introduce `INC-284`: a retried support webhook issued the same
customer credit twice. State the corrective objective, not a broad AI-workspace
pitch: prevent duplicate refunds on retried support actions.

### 0:45-1:30 - Follow the chain of custody

Read the five evidence nodes from left to right:

1. the production incident;
2. the exact repository snapshot;
3. the approved Workspace Version and decision;
4. the independently replayed regression;
5. the draft pull request.

Emphasize that changing the reviewed base commit blocks publication.

### 1:30-2:30 - Review before execution

In the live workspace, create a bounded change proposal. Before approving it,
point out the Repository Snapshot, Workspace Version, and plain-language
authorization statement. Approval authorizes one isolated run against that
evidence. It does not authorize merge.

### 2:30-4:00 - Observe verification

Approve the run and open Activity. Show the sandbox base commit, agent actions,
independent verification commands, and their results. If verification fails,
use the blocked state as the demo: no pull request is created, and the reason is
visible.

### 4:00-5:00 - Inspect the draft

Open the generated draft pull request. Confirm its evidence table names the
reviewed snapshot, Workspace Version, and verification commands. End on the
human review requirement, not on agent autonomy.

## Claims to make

- Approved execution is pinned to stored GitHub evidence.
- Independent repository-owned checks run after the coding agent finishes.
- Failed checks, incomplete runs, empty diffs, invalid paths, or base drift
  block publication.
- Successful runs open draft pull requests with a concise evidence table.

## Claims not to make

- The demo fixture represents production customer usage.
- Morphic detects every behavioral regression.
- A passing check makes a change safe to merge.
- The current product has validated product-market fit.
