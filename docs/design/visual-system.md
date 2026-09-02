# Morphic visual system

## Subject, audience, and page job

Morphic is an evidence-backed software execution workspace for engineering leads and hands-on builders. The public experience has one job: make the path from an objective to a reviewable pull request feel concrete, trustworthy, and worth connecting to GitHub.

## Design thesis

The interface should look like a live evidence map rather than a generic AI dashboard. Every strong visual cue must help explain where a claim came from, what decision blocks progress, or what action requires approval.

## Palette

- **Night map** `#07111D` — primary canvas
- **Deep route** `#0B1B2B` — raised navigation and workspace chrome
- **Review paper** `#F3F0E8` — readable review and decision surfaces
- **Evidence blue** `#78DCE8` — repository facts, links, and focus
- **Decision orange** `#FF9466` — open choices and attention
- **Resolved moss** `#A9D18E` — ready and completed states
- **Quiet steel** `#8293A5` — secondary information

## Type roles

- **Display:** Bricolage Grotesque, used for page-level ideas and section headings.
- **Body:** Geist Sans, used for instructions, controls, and long-form reading.
- **Evidence:** Geist Mono, used for paths, repository identifiers, timestamps, and status metadata.

## Layout concept

The landing page is an evidence route: a concise outcome statement on the left and a vertical chain of real product states on the right. Workspace screens use a stable rail for context and a broad evidence canvas for the current objective.

```text
┌────────────────────────────────────────────────────────────┐
│ Morphic                    How it works   Sign in   Connect │
├───────────────────────┬────────────────────────────────────┤
│ Outcome and promise   │ Objective                         │
│                       │   ↓                                │
│ One primary action    │ Repository evidence               │
│ One trust action      │   ↓                                │
│                       │ Decision → Approved run → PR       │
└───────────────────────┴────────────────────────────────────┘
```

## Signature element

The **evidence route** is a continuous, labeled path connecting objective, stored repository facts, decisions, and governed execution. It appears in the public proof, authenticated workspace canvas, loading states, and empty states. It is structural, not decorative.

## Motion

Use one orchestrated route reveal when the public proof enters the viewport. Hover and focus motion stays short and local. Respect `prefers-reduced-motion`; no product understanding may depend on animation.

## Self-critique

An early direction leaned too heavily on neon terminal styling. That would make Morphic look like an agent console and undercut its review-and-governance promise. The revised system keeps the dark engineering canvas but uses paper-like review surfaces, warm decision states, and blue evidence links so the product feels supervised rather than autonomous.

## Accessibility floor

- Body text never falls below 14px; important labels never fall below 12px.
- Status is always expressed with text and shape, not color alone.
- Focus is a high-contrast evidence-blue ring with adequate offset.
- Interactive targets are at least 40px tall, with 44px preferred for primary actions.
- Dense grids collapse into labeled stacks before 720px.
- Reduced motion disables route drawing and entrance transforms.
