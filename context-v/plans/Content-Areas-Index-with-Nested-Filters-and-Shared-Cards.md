---
title: "Content Areas Index: Nested Filters, Word Counts, and Shared Cards"
lede: "Rebuild /content-areas from parts the site already has, generalizing them along the way: two-level folder tabs, live word totals, and the reference and tool cards."
publish: true
date_created: 2026-10-06
date_modified: 2026-10-06
date_authored_initial_draft: 2026-10-06
date_authored_current_draft: 2026-10-06
authors:
  - Michael Staton
augmented_with:
  - Claude Code on Claude Opus 5.5
at_semantic_version: 0.0.0.1
status: Draft
site_uuid: 7c6d8da4-0b46-4a53-8300-c60d82c5dfbe
hex_code: jmpmzd
tags:
  - Content-Areas
  - Components
  - Filtering
  - Word-Count
summary: >-
  Plan for upgrading src/pages/content-areas/index.astro (shipped 2026-10-04 as
  a copy of organizations/index.astro) into a page with second-level folder
  filters, a word total that follows the active filters, and the same cards
  /more-about and the toolkit use. Built from a component inventory taken
  2026-10-06. The intent is to extract shared pieces (FolderTabs, a generic
  preview card, a title/path util) that organizations, sources, and
  more-about/organizations can adopt later, not a fourth hand-rolled copy.
  Mind the rebuild ledger: anything extracted here should be shaped so it can
  survive into site-next.
---
# Content Areas Index: Nested Filters, Word Counts, and Shared Cards

## Why Care?

`/content-areas` now carries 187 pages, and the AI-Factories-Datacenters area alone has 86 organizations. With only area-level tabs, Concepts drown in Organizations. Readers of `/more-about` already get word counts and version badges. Content areas should feel like the same library, not a bolt-on.

## Goals

1. **Two-level filters.** The first row picks an area. A second row appears for the area's sub-folders (Organizations, Concepts, Issues, Vocabulary, Sources, Topics, Private-Markets…), each with an entry count. Organizations and Concepts sort first; the rest follow alphabetically. Any folder that exists gets a tab. No hard-coded list.
2. **Live word total.** "N pages · X words" for whatever is currently filtered, updating as tabs change.
3. **Reference cards.** Show word count (above the existing 90-word threshold) and `at_semantic_version`, like Vocabulary and Concept cards.
4. **ToolCard for organizations with an `og_image`.** 58 of 187 entries have a usable `og_image` URL. Entries without one fall back to the bare card. Image cards list first within a filter, matching `CardGrid`.
5. **No frontmatter validation.** Stubs with only dates still render (reminder: no hard validation).

## Components to reuse (don't improvise)

| Need | Reuse | Path | Change needed |
|---|---|---|---|
| Word count per card | `countWordsInMarkdown` | `src/utils/fileWordCount.ts` | None |
| Word count display | `WordCountDisplay` | `src/components/basics/WordCountDisplay.astro` | None |
| Card with word count + version | `VocabularyPreviewCard` / `ConceptPreviewCard` | `src/components/reference/` | Generalize; see below |
| Card with image | `ToolCard` | `src/components/tool-components/ToolCard.astro` | Make CTA href a prop; map `og_favicon` |
| Card without image | `BareToolCard` | `src/components/tool-components/BareToolCard.astro` | Same href fix |
| Image vs. bare choice | `CardGrid` selection logic | `src/components/basics/CardGrid.astro` l.21–22 | Lift the predicate into a util; don't reuse the tooling-bound grid |
| Combined filtering | `Timeline`'s single `applyFilter()` | `src/components/timeline/Timeline.astro` l.248–286 | Pattern to copy into FolderTabs |
| Search box (optional) | `SearchInput` | `src/components/reference/SearchInput.astro` | Must route through `applyFilter`, or it un-hides tab-hidden cards |

## New shared pieces (extract once, adopt later)

- **`FolderTabs.astro`** (`src/components/reference/`). Props are `levels` (an array of tab rows, each `{id, label, count}`) and a target grid id. A single client script keeps the active area, the active sub-folder, and an optional search term, and applies them in one `applyFilter()`. It shows or hides cards by `data-area` and `data-type`, sums `data-words` over visible cards into the word total, and toggles the empty state. Styling is the existing accent-cyan `.tab-btn`, moved out of the four pages that each copy it.
- **`CollectionPreviewCard.astro`** (`src/components/reference/`). Props: `href`, `title`, `meta` (e.g. "AI Factories Datacenters · Concepts"), `wordCount?`, `version?`. It keeps the 90-word threshold and the version badge. `VocabularyPreviewCard` and `ConceptPreviewCard` become thin wrappers over it, or are replaced, in a later pass. While here, drop their per-card `console.log(entry.data)` build noise.
- **`src/utils/collectionEntryDisplay.ts`.** It holds `originalSegments(entry)`, which recovers the on-disk casing from `filePath`, and `getDisplayTitle(entry)`, which falls back from `title` to `og_title` to the filename, with README rendering as "<Area> Overview". Today both are inlined in `content-areas/index.astro` and `[...slug].astro`, and a similar version lives in `more-about/timeline.astro`.

## ToolCard changes (the "improve the cards" opportunity)

- Add a `detailHref` prop. The "Our Thoughts" CTA (l.163–173) defaults to `/toolkit/<slug>` but accepts `/content-areas/<slug>`.
- Map `og_favicon` → `favicon` at the call site. Separately, ToolCard reads `favicon` (l.90) but never renders it. Render it next to the title, which also helps the toolkit.
- Optionally accept `wordCount` and `version` so image cards carry the same badges as reference cards. Then every card in the grid shows the same metadata.
- Keep its id requirement (it throws if `id` is missing). Content-areas ids always exist.

## Page shape

```
Content Areas
187 pages · 412k words                     ← follows filters
[All 187] [AI Factories Datacenters 97] [Blue Economy 39] …      ← level 1
[Organizations 86] [Concepts 9] [Issues …] [Vocabulary …] …      ← level 2, only for the active area
grid: ToolCards (with og_image) first, then CollectionPreviewCards
```

- Entries that sit directly in an area folder (Blue-Economy 7, Health 4, general 3, Finance 2, AI-Factories 2) get a level-2 tab labeled "Overview & Other". The area README sorts first within it.
- Top-level files (`Cusp AI.md`, `Luminance.md`) stay under "Uncategorized".
- Each card gets `data-area`, `data-type`, and `data-words` attributes. Word counts are computed once per entry at build. No `getWordCounts` re-scan (the `/more-about` layout computes all collections twice; don't repeat that).
- Level 1 and level 2 selections are mirrored to the URL (`?area=…&type=…`) so filtered views are linkable.

## Steps

1. Extract `collectionEntryDisplay.ts`; switch both content-areas pages to it. No visual change.
2. Build `CollectionPreviewCard` and render content-areas cards with word count and version.
3. Build `FolderTabs` with two levels, the live word total, and URL state. Replace the hand-rolled tabs on `/content-areas`.
4. Add `detailHref` and favicon rendering to `ToolCard` and `BareToolCard`. Render image-bearing entries as ToolCards, sorted first.
5. Verify, then stop. Adopting FolderTabs on `/organizations`, `/sources`, and `/more-about/organizations` is a follow-up, not part of this plan.

## Verification

- `pnpm exec astro check` passes, and a full `astro build` passes against `src/generated-content` (`CONTENT_BASE_PATH=src/generated-content`).
- Browser drive on the preview (Playwright MCP, accessibility snapshots):
  1. Open `/content-areas`.
  2. Click "AI Factories Datacenters". Expect the level-2 row to appear, the count to read 97, and the word total to change.
  3. Click "Concepts". Expect only concept cards, a matching count, and a smaller total.
  4. Click "All". Expect the level-2 row to hide and the totals to reset.
  5. Load `?area=blue-economy&type=organizations` directly. Expect the same filtered state.
  6. Open one ToolCard and one bare card. Both must land on `/content-areas/...`, not `/toolkit/...`.
- Stub check: `/content-areas/general/topics/venture-capital-and-government` (dates only, empty body) renders.
- Toolkit regression: `/toolkit` cards still link to `/toolkit/<slug>`.

## Out of scope

- Privacy and gating ([[Client-Content-Privacy-and-Decomposition-Deferred]]).
- Retrofitting other index pages.
- Dependency upgrades ([[Upgrade-All-Dependencies-for-Faster-Builds]]). Do those first or after, not interleaved.
