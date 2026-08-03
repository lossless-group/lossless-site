---
title: "Abandoned Intention — The Tube Visual (four-layer branded container)"
lede: "A retired attempt at a signature 'tube box' framing device — four concentric layered borders wrapping content — explored across three rendering strategies (CSS clip-path, raw SVG, Webkit) and never adopted. Captured here so the design intent survives the code being dropped in the site-next rebuild."
date_created: 2026-08-03
date_modified: 2026-08-03
authors:
  - Michael Staton
augmented_with:
  - Claude Code on Claude Opus 4.8 (1M context)
semantic_version: 0.0.0.1
tags:
  - Exploration
  - Abandoned-Intention
  - Rebuild
  - Design-System
  - Brand
status: Retired
---

# Abandoned Intention — The Tube Visual

> One of the retired intentions from the [[2026-08-03_Rebuild-Keep-Drop-Ledger]].
> The code is dropped in `site-next/`; **this note is the surviving artifact.**

## What it was reaching for

A signature branded **container** — a "tube box" — that wraps arbitrary content in
**four concentric, layered borders** with an organic, hand-drawn contour (via
`clip-path` polygons), rendered on top of the primary background gradient. The
intent read as a distinctive Lossless framing device for hero/feature content:
content sits inside a visually layered "tube," not a plain card.

## How it was attempted (three strategies, none shipped)

| File | Strategy | Note |
|---|---|---|
| `TubeContainer.astro` (166 lines) | Pure CSS — 4 `.tube-layer` divs, each a `clip-path: polygon(...)` contour, `6px` borders in `--clr-lossless-primary-dark` over `--grd__primary-bg` | The most developed attempt; the polygon math is the hard, brittle part |
| `TubeCSS.astro` | CSS variant | Alternate take on the same idea |
| `TubeContainerSVG.astro` (5 lines) | Raw SVG — inlines `@assets/Brand/tube-box--four-layers.svg?raw` via `<Fragment set:html>` | Cleanest; delegates the contour to a designed SVG asset |
| `TubeContainerWebkit.astro` | Webkit-specific | Vendor-prefixed experiment |

## Why it was retired

- **Zero consumers** — graph-confirmed orphan, grep-confirmed no references in `src/`.
- Four competing implementations of one idea = a decision never made.
- The hand-tuned `clip-path` polygon coordinates are fragile and un-themeable.

## How to revive it (if wanted) in `site-next/`

The **SVG-asset route is the one to keep** if this comes back: the brand asset
`src/assets/Brand/tube-box--four-layers.svg` still exists and survives the rebuild
as an asset. A single themeable `<TubeFrame>` component in the design system
(`@knots/astro`) wrapping that SVG with a `<slot />`, tokenized stroke color and
layer count — not four hand-rolled clip-path variants — is the right shape. Decide
it deliberately in the design-system phase, don't port the polygons.

## Provenance
- Source (pre-rebuild): `src/components/basics/tube-attempts/` in the `site` repo.
- Brand asset retained: `src/assets/Brand/tube-box--four-layers.svg`.
