# Morphic

This context defines the language for an adaptive workspace that turns a builder's outcome into a governed interface backed by live repository evidence.

## Language

**Objective**:
A user-authored outcome that Morphic should organize work around, such as “Ship onboarding by Friday.” An **Objective** is narrower than a project and includes an observable completion condition.
_Avoid_: Prompt, task list, project name

**Outcome**:
The workspace plan's interpretation of an **Objective**, including a reformulated statement, a definition of done, and a success signal. The user writes an **Objective**; Morphic generates an **Outcome**.
_Avoid_: Objective (that is the user's input, not the plan's interpretation)

**Adaptive Workspace**:
The persistent, generated interface for one **Objective**. It arranges evidence, a critical path, repository impact, open decisions, risks, and agent proposals according to the current state of the work.
_Avoid_: Dashboard, disposable generated page, chat transcript

**Repository Evidence**:
GitHub data that supports or constrains an **Adaptive Workspace**, including issues, pull requests, branches, commits, and repository paths.
_Avoid_: AI guess, invented task, mock project data

**Workspace Version**:
An immutable generated interpretation of an **Objective** and a specific **Repository Snapshot**. A later user command creates a new **Workspace Version** rather than silently rewriting history.
_Avoid_: Autosave, mutable dashboard state

**Repository Snapshot**:
A persisted observation of one repository branch at one commit, including the issue, pull-request, and file-tree evidence used to produce a **Workspace Version**.
_Avoid_: Live repository, cache blob

**Critical Path Item**:
A dependency-aware unit of work that must be completed, verified, or resolved for the **Objective** to succeed. It may reference a GitHub issue or pull request but is not required to be one.
_Avoid_: Generic to-do, card

**Open Decision**:
A consequential unresolved choice that blocks or changes the **Critical Path**. Morphic may recommend an option, but the user owns the decision.
_Avoid_: Question, agent assumption

**Risk**:
A supported reason the **Objective** may miss its intended outcome, deadline, or quality threshold.
_Avoid_: Warning decoration, speculative concern

**Codex Run**:
An isolated, auditable execution in which Codex works against a temporary clone of a connected repository. Durable run state lives in Morphic’s database; the clone is disposable execution material.
_Avoid_: Chat response, local editor session

**Approval**:
An explicit user decision that authorizes a proposed **Codex Run** or a consequential continuation. Approval is never inferred from opening or viewing a proposal.
_Avoid_: Click-through, optimistic execution

**Workspace Command**:
A user instruction that asks Morphic to adapt an existing **Adaptive Workspace** while preserving its **Objective** and version history.
_Avoid_: Chat message, prompt history
