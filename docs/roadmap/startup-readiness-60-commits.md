# Morphic startup-readiness sequence

This branch is intentionally organized as sixty small commits. Each commit
should explain one product or engineering decision, remain independently
reviewable, and keep the branch buildable whenever practical.

The first milestone turns Morphic from a broad AI workspace demo into an
evidence-bound change system: an approved run must execute against the exact
repository snapshot the user reviewed, inherit the accepted workspace plan,
verify its work, and publish only complete evidence.

## Evidence-bound execution

1. Record the market validation and product wedge.
2. Publish this sixty-commit implementation sequence.
3. Record the evidence-bound execution architecture decision.
4. Define the immutable execution-context contract.
5. Reject malformed repository snapshot SHAs.
6. Render a bounded execution-context prompt.
7. Prove prompt rendering with contract tests.
8. Load the current Workspace Version with each Codex Run.
9. Load the matching Repository Snapshot with each Codex Run.
10. Provision sandboxes from the reviewed snapshot SHA.
11. Verify the sandbox HEAD matches the reviewed snapshot.
12. Persist the Workspace Version used by the run.
13. Persist the Repository Snapshot used by the run.
14. Emit immutable execution-evidence events.
15. Include workspace constraints in the approved run context.
16. Include the generated Outcome in the run context.
17. Include Critical Path items in the run context.
18. Include repository-impact evidence in the run context.
19. Include Open Decisions and Risks in the run context.
20. Remove live repository refetching from the execution path.

## Repository scoping and agent safety

21. Define a deterministic stored-tree scope contract.
22. Score stored repository paths against approved work.
23. Test deterministic scope selection.
24. Feed stored-tree scope hints into the coding agent.
25. Replace the misleading Codex identity with accurate agent language.
26. Require the agent to inspect its final diff.
27. Block shell commands that mutate Git history.
28. Block shell commands that expose common secret sources.
29. Report tool-command failures as structured evidence.
30. Preserve whether each agent tool changed the working tree.

## Independent verification and publication gates

31. Define the verification-plan contract.
32. Detect the repository package manager deterministically.
33. Select bounded verification commands from project scripts.
34. Test verification-plan selection.
35. Execute verification after the agent finishes.
36. Capture verification output as run evidence.
37. Fail publication when verification fails.
38. Fail publication when the agent exhausts its turn budget.
39. Require a non-empty final diff before publishing.
40. Validate that changed paths remain inside the repository.
41. Create pull requests as drafts.
42. Bind pull-request base and evidence to the reviewed SHA.
43. Remove credentials from the Git remote after pushing.
44. Add a concise evidence table to generated pull requests.
45. Record verification commands and results on the run.

## Product experience and operational trust

46. Show the reviewed snapshot in the approval panel.
47. Show the Workspace Version in the approval panel.
48. Explain what approval authorizes in plain language.
49. Show verification status in the run timeline.
50. Show why publication was blocked.
51. Replace generic AI visual language with an evidence-console hierarchy.
52. Give the workspace a focused startup-grade visual system.
53. Improve empty, loading, and failure states.
54. Add accessible status labels and focus treatment.
55. Add a product demo fixture for the incident-to-pull-request story.
56. Document the five-minute startup demo.

## Release hardening

57. Document required production controls and environment ownership.
58. Add a launch-readiness checklist with measurable gates.
59. Apply findings from the independent standards and specification reviews.
60. Publish the verified branch and commit-by-commit pull-request guide.

## Definition of done

- An approved Codex Run cannot drift from the Repository Snapshot the user saw.
- The coding agent receives the accepted Outcome, Constraints, evidence, and
  unresolved decisions instead of only a loose instruction.
- Independent verification runs after generation and before publication.
- Incomplete or failed work never creates a pull request.
- The run timeline and generated draft pull request show auditable evidence.
- The primary workspace communicates trust and action, not generic AI novelty.
