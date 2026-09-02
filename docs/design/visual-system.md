# Morphic visual system

## Product job

Morphic turns repository evidence into a supervised, reviewable path from an objective to a pull request. The interface must make evidence, decisions, approval, and delivery easier to understand than the underlying automation.

## Design direction

The current system adapts the discipline of the [VoltAgent HP design reference](https://github.com/VoltAgent/awesome-design-md/tree/main/design-md/hp) to Morphic. It uses bright editorial space, near-black typography, restrained electric blue, compact geometry, and a small number of soft raised surfaces. It does not reproduce HP branding or proprietary typography.

The previous dark navy, cyan, orange, moss, and cream palette is retired. New UI must not reintroduce those values.

## Palette

- **Canvas** `#FFFFFF` — page background and primary surfaces
- **Cloud** `#F7F7F7` — quiet section bands and secondary surfaces
- **Fog** `#E8E8E8` — dividers and hover fills
- **Steel** `#C2C2C2` — strong boundaries and disabled structure
- **Graphite** `#636363` — secondary copy and metadata
- **Charcoal** `#3D3D3D` — supporting copy on light surfaces
- **Ink** `#1A1A1A` — primary type and closing slabs
- **Electric blue** `#024AD8` — primary actions, evidence, and focus
- **Bright blue** `#296EF9` — hover and emphasis
- **Soft blue** `#C9E0FC` — selection and low-emphasis evidence states
- **Storm** `#356373` — resolved and neutral status
- **Bloom** `#B3262B` — decisions and recoverable warnings
- **Wine** `#5A1313` — destructive errors

Electric blue is the only expressive brand accent. Status colors always appear with text, icons, or shape.

## Typography

- **Display and body:** Manrope, the open-source substitute recommended by the reference system.
- **Evidence:** Geist Mono for repository paths, identifiers, timestamps, and compact state metadata.
- **Headlines:** tight tracking, high contrast, short line lengths, and no decorative gradients.
- **Controls:** sentence case by default; primary calls to action may use tracked uppercase.

## Geometry and surfaces

- Primary buttons use a 4px radius and a 44px minimum height.
- Product cards use a 16px radius and `0 2px 8px rgba(26, 26, 26, 0.08)` lift.
- Most grouping comes from spacing, rules, and alternating white/cloud bands.
- Avoid nested cards, glass effects, neon glows, gradients, and pill-shaped controls unless the shape communicates status.

## Signature element

The **evidence route** connects objective, repository facts, decisions, and governed execution. It appears in the landing proof, authenticated workspace, loading states, and empty states. Its line and numbered steps explain provenance; they are not decoration.

## Responsive behavior

- Desktop pairs the outcome statement with live product proof in the first viewport.
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
