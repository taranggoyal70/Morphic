# Morphic visual system

## Product job

Morphic turns repository evidence into a supervised, reviewable path from an objective to a pull request. The interface must make evidence, decisions, approval, and delivery easier to understand than the underlying automation.

## Design direction

The current system adapts the discipline of the [VoltAgent HP design reference](https://github.com/VoltAgent/awesome-design-md/tree/main/design-md/hp) to Morphic. It uses bright editorial space, near-black typography, restrained electric blue, compact geometry, and a small number of soft raised surfaces. It does not reproduce HP branding or proprietary typography.

The previous dark navy, cyan, orange, moss, and cream palette is retired. New UI must not reintroduce those values.

## Palette

The implementation tokens and exact color values are owned by [`DESIGN.md`](../../DESIGN.md). Electric blue is the only expressive brand accent. Status colors always appear with text, icons, or shape.

## Typography

- **Headlines:** tight tracking, high contrast, short line lengths, and no decorative gradients.
- **Controls:** sentence case by default; primary calls to action may use tracked uppercase.

## Geometry and surfaces

- Implementation-level type, radius, target-size, and elevation values are owned by [`DESIGN.md`](../../DESIGN.md).
- Most grouping comes from spacing, rules, and alternating white/cloud bands.
- Avoid nested cards, glass effects, neon glows, gradients, and pill-shaped controls unless the shape communicates status.

## Signature element

The **execution brief** is a bounded operating document with a policy margin, objective, repository trace, and explicit control rules. Within it, the evidence route connects objective, repository facts, decisions, and governed execution. It appears in the landing proof, authentication entry, workspace, loading states, and empty states.

## Responsive behavior

- Desktop gives the outcome the full document width and places the live repository trace directly beneath it.
- Mobile presents the promise and primary action first, followed immediately by the evidence route.
- Dense grids collapse into labeled stacks before 720px.
- Primary actions become full-width when horizontal space is limited.

## Accessibility floor

- Body text is at least 14px; important labels are at least 12px.
- Interactive targets are at least 40px tall, with 44px preferred.
- Focus uses a high-contrast electric-blue ring with adequate offset.
- Status is never communicated by color alone.
- Reduced motion disables route drawing and entrance transforms.
- Layout must remain readable at 200% zoom without horizontal scrolling.

## Guardrails

Do use:

- white space as hierarchy;
- one clear primary action per section;
- flat bands and hairline rules;
- real repository language and evidence;
- soft elevation only where a surface must float.

Do not use:

- any retired Morphic palette value;
- purple-to-blue AI gradients;
- dark dashboard chrome as the default canvas;
- decorative terminal styling;
- color-only state labels;
- excessive rounded containers or floating pills.
