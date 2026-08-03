---
title: "Rebuild Keep/Drop Ledger — site → site-next (Astro 7 + astro-knots + LFM)"
lede: "The Phase-0 ground truth for the ground-up rebuild: what the current site is made of, what survives into site-next/, what we retire — and the discipline that every retired thing gets its intention captured in context-v before its code is dropped."
date_created: 2026-08-03
date_modified: 2026-08-03
authors:
  - Michael Staton
augmented_with:
  - Claude Code on Claude Opus 4.8 (1M context)
semantic_version: 0.0.0.1
tags:
  - Decision
  - Rebuild
  - Astro-Knots
  - Deadweight
  - Knowledge-Graph
  - LFM
status: Open
---

# Rebuild Keep/Drop Ledger — `site` → `site-next/`

## Why this document exists

We are not refactoring the current site — we are **rebuilding it** as `site-next/`
(a fresh Astro 7 scaffold inside this repo) on astro-knots conventions and the
`@lossless-group/lfm` package, shedding accumulated deadweight, and doing it with
test coverage, a real design system, and a component library. Execution runs as a
**green-per-phase loop with a gate at each phase boundary** (autonomous within a
phase, checkpoint between). Parity is **keep-list-driven, core-first** — deadweight
never gets rebuilt.

> **The ledger's governing principle (per MS):** *What is not in the keep-list was
> likely an intention. Anything we do not carry forward gets its intention documented
> in a `context-v/` file before its code is dropped.* Retiring code is retiring an
> idea; the idea is the durable artifact. See the `Abandoned-Intentions-*` notes in
> [`../explorations/`](../explorations/).

## The three foundational decisions (locked 2026-08-03)

| Decision | Choice | Consequence |
|---|---|---|
| Location / strategy | **`site-next/` inside this repo**; current `site` stays running as the parity reference | Clean slate; nothing carries over unless it earns its place. Swap at parity. |
| Loop autonomy | **Green-per-phase, gate at phase boundary** | Loop runs a phase to green (build + tests + verify), commits locally, then stops for review. |
| Parity scope | **Keep-list decides; core-first** | Rebuild verified-live surface first; port the long tail only where confirmed in use. |

## Method — how "deadweight" was established (reproducible)

Deadweight is **graph signal ∩ grep confirmation**, never graph alone.

1. **Graph** (graphify 0.9.32, code-only AST over `src/`): 2281 nodes, 2334 edges,
   no import cycles. Output in `graphify-out/` (`graph.json`, `GRAPH_REPORT.md`,
   `graph.html`). Rebuild after code changes with `graphify update .` (zero API cost).
2. **Orphan candidates**: source files under `src/components|layouts|utils` with
   **zero cross-file inbound edges**, excluding entry points (`src/pages/**`,
   `*.config.ts`, `*.d.ts`, `middleware`). → **89 candidates**.
3. **Grep confirmation**: each candidate's stem searched across all of `src/`
   (imports, dynamic imports, string refs), excluding its own file. Zero hits →
   confirmed dead. Any hit → graph false-negative, **keep**.
   → **59 confirmed dead · 30 graph-missed (kept)**.

> **Caveat carried forward:** graphify under-captures `.astro`→`.astro` imports (the
> 30 false-negatives prove it). The graph is a *lead generator*, not an oracle. No
> file is dropped on graph evidence alone; grep (or a build failure in `site-next/`)
> is the confirming rung.

## DROP — 59 confirmed-dead files, grouped by retired intention

Each group links to (or will link to) an `Abandoned-Intentions-*` capture note.
`✍️` = intention worth reviving later (gets a full note). `🧹` = pure scaffolding
(gets a one-line mention in the group note, no revival value).

### ✍️ Tube visual — `[[Abandoned-Intentions-Tube-Visual]]`
- `src/components/basics/tube-attempts/TubeCSS.astro`
- `src/components/basics/tube-attempts/TubeContainer.astro`
- `src/components/basics/tube-attempts/TubeContainerSVG.astro`
- `src/components/basics/tube-attempts/TubeContainerWebkit.astro`

### ✍️ Web-studio hero direction — `[[Abandoned-Intentions-WebStudio-Heroes]]`
- `src/components/basics/HeroWebStudio.astro`
- `src/components/basics/webstudio/Hero1.astro`
- `src/components/basics/webstudio/Hero2.astro`
- `src/components/basics/webstudio/Hero3.astro`

### ✍️ Article preview / card system — `[[Abandoned-Intentions-Article-Preview-System]]`
- `src/components/articles/EntryListItemPreview--Narrow.astro`
- `src/components/articles/EntryListItemPreview--Thumbs.astro`
- `src/components/articles/EntryListItemPreview--Wide.astro`
- `src/components/articles/EntryListItemReader.astro`
- `src/components/articles/FeaturedArticle.astro`
- `src/components/articles/PeekOnHover.astro`
- `src/components/articles/PostCardBox.astro`
- `src/components/articles/PostCardFeatureBox.astro`
- `src/components/CompareCardRow.astro`
- `src/components/basics/cards/Card--Mini.astro`

### ✍️ Dedicated changelog reading experience — `[[Abandoned-Intentions-Changelog-UI]]`
- `src/components/changelog/ChangelogEntryPage.astro`
- `src/components/changelog/ChangelogStats.astro`
- `src/components/changelog/LeftSidebar.astro`

### ✍️ Pre-LFM callout / MDX pipeline (SUPERSEDED by LFM) — `[[Abandoned-Intentions-PreLFM-Markdown]]`
- `src/components/markdown/MDXComponents.js`
- `src/components/markdown/MDXProvider.astro`
- `src/components/markdown/EmbedAstroSlides.astro`
- `src/components/markdown/callouts/AsideCallout.astro`
- `src/components/markdown/callouts/DetailsCallout.astro`
- `src/components/markdown/callouts/styled/LLMResponse.astro`
- `src/components/codeblocks/MermaidChartInline.astro`
- `src/components/codeblocks/SimpleCodeBlock.astro`

### ✍️ Home-grown frontmatter repair (LFM territory now) — `[[Abandoned-Intentions-Frontmatter-Utils]]`
- `src/utils/yamlFrontmatter.ts`
- `src/utils/frontmatterCorruptionPatterns.cjs`
- `src/utils/frontmatterIrregularityFilterReturnsValidFrontmatterOnly.ts`

### ✍️ Trademark / logo-wall treatment — `[[Abandoned-Intentions-Trademark-Ribbons]]`
- `src/components/basics/ContrastingTrademarkRibbons.astro`
- `src/components/basics/SimplifiedTrademarkRibbon.astro`
- `src/components/basics/TrademarkGrid.astro`

### 🧹 Retired scaffolding (no revival value) — `[[Abandoned-Intentions-Retired-Scaffolding]]`
- `src/components/basics/Button--Gradient.astro`
- `src/components/basics/CardCarousel.astro`
- `src/components/basics/CardRowSlider.astro`
- `src/components/basics/ParticipantHandle.astro`
- `src/components/content/ProjectGrid.astro`
- `src/components/examples/AvatarExample.astro`
- `src/components/projects/ProjectGallery.svelte`
- `src/components/projects/WorkflowSteps.astro`
- `src/components/projects/WorkflowSteps.svelte`
- `src/components/projects/project-section-layouts/StorySidebarTreeNode.astro`
- `src/components/tool-components/BareToolCardIsland.astro`
- `src/components/tool-components/ToolCardAdmin.astro`
- `src/components/tool-components/ToolCardIsland.astro`
- `src/components/toolkit/TagFilterIsland.astro`
- `src/layouts/CollectionStructure--OneColumn--Scroll.astro`
- `src/layouts/ThreeColumnFrame.astro`
- `src/utils/convertPageBacklinksToRelativePathHref.ts`
- `src/utils/debug/markdown-debugger.ts`
- `src/utils/markdown/debug/markdown-debugger.ts`
- `src/utils/embedSiteWithOpenGraph.ts`
- `src/utils/imageUtils.ts`
- `src/utils/markdown/normalizeShellLangs.ts`
- `src/utils/markdown/remarkNormalizeShellLangs.ts`
- `src/utils/routePaths.ts`

### Known-dead by inspection (not from graph)
- `src/pages/toolkit/_timeline.astro.backup`
- `src/pages/client/[client]/projects/_index.astro.disabled`
- `src/actions/archive/**` (self-named archive)

## KEEP — surface confirmed live (to be rebuilt, not ported verbatim)

Rebuilt against the spec, LFM, and the design system — *reimplemented*, not copied.

- **Load-bearing core (highest inbound degree — treat as design pillars):**
  `src/utils/slugify.ts` (`getReferenceSlug` 54, `slugify` 39, `processEntries` 33,
  `toProperCase` 26, `transformContentPathToRoute` 18), `content.config.ts`,
  `envUtils.js`, `shikiHighlighter.ts`, `routeManager.ts`, `[...path].astro`.
- **Structural anchors (community hubs):** `OneArticle.astro`, `Layout.astro`,
  `AstroMarkdown.astro`, `json-canvas.ts`, `TagFilterIsland.astro`.
- **30 graph-missed files** (grep found refs) — provisional keep pending the
  route-level keep-list pass.

## OPEN — still to inventory before the spec (Phase 0 remainder)

- [ ] **Routes:** classify all **135** `src/pages` routes → live / dead / client-gated.
      Cross-check against `output` mode + middleware for the astro-knots
      *"auth-gated routes must not be prerendered"* rule while we're in there.
- [ ] **Collections:** which of the **34** `defineCollection`s have live content + a
      live consumer. Drop-with-intention any that don't.
- [ ] **Dependencies:** trim the **73** prod deps to what `site-next/` actually needs
      (LFM subsumes several markdown-pipeline deps).
- [ ] **Assets:** `src/` is 525M (937 images). Decide ImageKit/CDN vs in-repo per
      the astro-knots opengraph/asset guidance.

## Phase plan (this ledger is the Phase-0 artifact)

| Phase | Output | Gate |
|---|---|---|
| **0 — Keep-list** | this ledger + `Abandoned-Intentions-*` notes + route/collection/dep classification | ledger sign-off |
| **1 — Spec** | rebuild spec in `context-v/specs/` (arch, `@knots/*` design system, LFM, test strategy, loop definition) | spec sign-off |
| **2 — Scaffold** | `site-next/` Astro 7 + LFM + tokens + vitest + browser-drive rung | green scaffold |
| **3…N — Loop** | feature-slice rebuild: implement → test → browser-drive → changelog → commit | green per phase |

## Related

- Prior art to absorb (design system half): `content/lost-in-public/explorations/Multi-Site-Astro-Starter-Kit-Architecture.md` — `@knots/tokens|astro|svelte|brand-config`, Storybook, Changesets, visual-regression testing.
- Graph outputs: `graphify-out/GRAPH_REPORT.md`, `graph.html`.
