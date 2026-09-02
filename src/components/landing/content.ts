export const evidenceSteps = [
  {
    id: "objective",
    eyebrow: "Objective",
    title: "Ship organization onboarding",
    detail: "Observable outcome · target Friday",
    tone: "paper" as const,
  },
  {
    id: "evidence",
    eyebrow: "Repository evidence",
    title: "3 paths and 2 open pull requests",
    detail: "taranggoyal70/morphic · synced 2m ago",
    tone: "evidence" as const,
  },
  {
    id: "decision",
    eyebrow: "Decision needed",
    title: "Choose session handoff",
    detail: "Blocks 1 implementation step",
    tone: "decision" as const,
  },
  {
    id: "run",
    eyebrow: "Governed execution",
    title: "Codex run ready for approval",
    detail: "Isolated sandbox · branch + draft PR",
    tone: "resolved" as const,
  },
];

export const productPrinciples = [
  {
    label: "Ground",
    title: "Start from repository facts.",
    body: "Morphic stores a bounded snapshot of files, issues, and pull requests before it proposes work.",
  },
  {
    label: "Shape",
    title: "Keep the critical path visible.",
    body: "The workspace changes around the objective, open decisions, and evidence that matters now.",
  },
  {
    label: "Supervise",
    title: "Approve work before it runs.",
    body: "Codex executes only after approval, in an isolated sandbox, and stops at a reviewable pull request.",
  },
];
