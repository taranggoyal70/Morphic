# Morphic design contract

This file is the implementation-facing source of truth for Morphic's visual language. For product rationale and accessibility guidance, see [`docs/design/visual-system.md`](./docs/design/visual-system.md).

## Reference

The system adapts the HP reference in [VoltAgent's awesome-design-md](https://github.com/VoltAgent/awesome-design-md/tree/main/design-md/hp): bright editorial space, near-black typography, compact controls, restrained blue, and soft 16px cards. Morphic keeps its own brand, product concepts, content, and evidence-route signature.

## Implementation Tokens

```css
--ink: #ffffff;
--surface: #f7f7f7;
--surface-raised: #ffffff;
--surface-hover: #e8e8e8;
--line: #e8e8e8;
--line-strong: #c2c2c2;
--muted: #636363;
--muted-light: #3d3d3d;
--paper: #1a1a1a;
--violet: #024ad8;
--violet-light: #296ef9;
--mint: #356373;
--amber: #b3262b;
--danger: #5a1313;
```

The older token names are kept for Tailwind compatibility, but their values now map to the bright Morphic system. `--ink` is the white canvas, `--paper` is near-black text, `--violet` is the primary evidence blue, `--mint` is resolved/neutral status, `--amber` is decision status, and `--danger` is destructive status. No value from the retired navy/cyan/orange Morphic palette may be reintroduced.

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

Public pages are composed as a bounded **execution brief**, not a split marketing hero. A narrow policy margin identifies the governing rules, the objective owns the full page width, and the repository trace runs edge-to-edge beneath it. Product screens preserve a stable navigation rail and a broad evidence canvas. The objective → evidence → decision → execution route is the recurring structural motif.

Avoid the headline-left/dashboard-right composition used by generic developer SaaS pages. Product proof belongs inside the document structure rather than in a floating preview card.

## Avoid

Gradients, glassmorphism, neon glows, default dark canvases, generic AI-purple, decorative terminal chrome, deep card nesting, and pills that do not communicate status.
