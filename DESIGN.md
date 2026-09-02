# Morphic design contract

This file is the implementation-facing source of truth for Morphic's visual language. For product rationale and accessibility guidance, see [`docs/design/visual-system.md`](./docs/design/visual-system.md).

## Reference

The system adapts the HP reference in [VoltAgent's awesome-design-md](https://github.com/VoltAgent/awesome-design-md/tree/main/design-md/hp): bright editorial space, near-black typography, compact controls, restrained blue, and soft 16px cards. Morphic keeps its own brand, product concepts, content, and evidence-route signature.

## Tokens

```css
--canvas: #ffffff;
--cloud: #f7f7f7;
--fog: #e8e8e8;
--steel: #c2c2c2;
--graphite: #636363;
--charcoal: #3d3d3d;
--ink: #1a1a1a;
--primary: #024ad8;
--primary-bright: #296ef9;
--primary-soft: #c9e0fc;
--status-neutral: #356373;
--status-decision: #b3262b;
--status-danger: #5a1313;
```

No value from the retired navy/cyan/orange Morphic palette may be reintroduced.

## Type

- Manrope for display and body copy.
- Geist Mono only for paths, identifiers, timestamps, and status metadata.
- Display headings use tight tracking and short line lengths.

## Components

- Buttons: 44px minimum height, 4px radius, high-contrast label.
- Inputs: white fill, steel/fog boundary, 4px radius.
- Cards: 16px radius; default lift is `0 2px 8px rgba(26, 26, 26, 0.08)`.
- Sections: prefer white/cloud bands and spacing over nested containers.
- Status: pair color with explicit text and an icon or distinct shape.
- Focus: electric-blue ring with visible offset.

## Composition

Public pages place the outcome and live evidence proof together. Product screens preserve a stable navigation rail and a broad evidence canvas. The objective → evidence → decision → execution route is the recurring structural motif.

## Avoid

Gradients, glassmorphism, neon glows, default dark canvases, generic AI-purple, decorative terminal chrome, deep card nesting, and pills that do not communicate status.
