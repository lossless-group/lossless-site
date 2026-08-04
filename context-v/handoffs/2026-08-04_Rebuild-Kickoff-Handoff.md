---
title: "Handoff — site → site-next rebuild kickoff (Phase 0 in progress)"
lede: "Everything the next agent-session needs to resume the ground-up rebuild cold: the locked decisions, what was installed, what Phase-0 artifacts exist, what remains, and the exact next actions — including the gotchas (graphify under-captures .astro imports; the MCP query server becomes available in the NEXT session)."
date_created: 2026-08-04
date_modified: 2026-08-04
authors:
  - Michael Staton
augmented_with:
  - Claude Code on Claude Opus 4.8 (1M context)
semantic_version: 0.0.0.1
tags:
  - Handoff
  - Rebuild
  - Astro-Knots
  - LFM
  - Knowledge-Graph
status: Active
---

# Handoff — `site` → `site-next/` rebuild kickoff

**From:** session on 2026-08-03/04 · **Branch:** `development` · **cwd:** `/Users/mpstaton/code/lossless-monorepo/site`
**Last commit:** `da230a9` — `init(rebuild, rebuild-docs): init rebuild docs using context-v methodology`

## 1. What this program is

A **ground-up rebuild** (not a refactor) of this site as a new **`site-next/`** directory
inside this repo, on **Astro 7** (7.1.6 current), **astro-knots** conventions, and the
**`@lossless-group/lfm`** package (installed via JSR: `pnpm dlx jsr add @lossless-group/lfm @lossless-group/lfm-astro` — NOT on npm). Goals: shed deadweight, add real test
coverage, build a design system + component library. Executed as an autonomous **loop**.

## 2. Three decisions — LOCKED (do not relitigate)

| Decision | Choice |
|---|---|
| Location | **`site-next/` inside this repo**; current `site` stays running untouched as the parity reference. Swap at parity. |
| Loop autonomy | **Green-per-phase, gate at phase boundary** — run a whole phase to green (build + tests + verify), commit locally, then STOP for review. Autonomous within a phase; checkpoint between. |
| Parity scope | **Keep-list decides, core-first** — rebuild verified-live surface first; port the long tail only where confirmed in use. Deadweight never gets rebuilt. |

## 3. Governing principle (from MS)

**Dropped code = documented intention.** Anything not kept "was likely an intention";
document it in a `context-v/` capture note BEFORE dropping the code. Read the actual
source first so the capture is truthful. Group by intention (one abandoned direction =
one note), not per-file. Saved as memory `feedback-drop-code-as-documented-intention`.

## 4. What was installed / set up (environment)

- **graphify 0.9.32** (`uv tool install graphifyy`) — CLI at `~/.local/bin/graphify`
  (add `export PATH="$HOME/.local/bin:$PATH"` in a fresh shell). Registered the
  `/graphify` skill globally (`~/.claude/skills/graphify/`) and created `~/.claude/CLAUDE.md`
  (benign, graphify trigger only).
- **⚠️ MCP query server (`graphify-mcp`) becomes available in the NEXT session**, not the
  one that installed it. So THIS handoff's successor session should be able to call
  graphify query tools natively. If not, use the CLI (`graphify query "…" --budget 8000`,
  `graphify path A B`, `graphify explain X`) or read `graphify-out/graph.json` directly.
- `.graphifyignore` scopes the graph to `src/` (drops `generated-content` submodule +
  `node_modules`). `.gitignore` has entries for graphify's local-only outputs.

## 5. The knowledge graph (Phase-0 tooling)

- Built **code-only** (local AST, $0, no API): **2281 nodes, 2334 edges, 1147 communities,
  NO import cycles**. Communities are LLM-named (via `graphify label . --backend claude-cli`).
- Outputs in `graphify-out/`: `graph.html` (interactive), `GRAPH_REPORT.md` (readable),
  `graph.json` (full). **Currently UNTRACKED in git** (regenerable; ~3.7MB). Open decision:
  commit the map for team-share vs. `.gitignore graphify-out/`. Ask MS.
- **Refresh after any code change:** `graphify update .` (zero API cost).
- **⚠️ Gotcha:** graphify under-captures `.astro`→`.astro` imports. The graph is a
  LEAD GENERATOR, not an oracle. Never drop a file on graph evidence alone — confirm with
  grep (or a build failure in `site-next/`).

## 6. Current-site scale (the job size)

135 routes · 34 content collections · 216 components · 30 layouts · 40 utils · 73 prod deps ·
`src/` 525M (937 images). **No React** (astro-knots-clean already). Load-bearing spine:
`src/utils/slugify.ts` — `getReferenceSlug()` (54 edges), `slugify()` (39, reaches 228 nodes
at BFS depth 2), `processEntries()` (33), `toProperCase()` (26), `transformContentPathToRoute()` (18).
Other broken bits to note: `package.json` has a self-referential `"astro": "astro"` pin;
`_timeline.astro.backup`, `_index.astro.disabled`, `src/actions/archive/**` are dead by inspection.

## 7. Phase 0 status — IN PROGRESS

**Done:**
- Master ledger: `context-v/decisions/2026-08-03_Rebuild-Keep-Drop-Ledger.md` — the decisions,
  the reproducible deadweight method, all 59 confirmed-dead files grouped into 8 retired-intention
  clusters, the keep-list core, and the Phase 0→N plan. **This is the primary source of truth.**
- Deadweight method validated: 89 orphan candidates → **59 confirmed dead** (0 grep refs) ·
  **30 graph false-negatives correctly kept**.
- One exemplar intention note: `context-v/explorations/Abandoned-Intentions-Tube-Visual.md`
  (shape: What it reached for → How attempted → Why retired → How to revive → Provenance;
  frontmatter `status: Retired`). **MS approved leaving the note-writing here for now.**

**Remaining in Phase 0 (before Phase 1 spec):**
- [ ] 7 more intention notes, one per cluster in the ledger: WebStudio-Heroes, Article-Preview-System,
      Changelog-UI, PreLFM-Markdown, Frontmatter-Utils, Trademark-Ribbons, Retired-Scaffolding
      (this last = 24 pure-scaffolding files; MS floated folding them into ONE note — confirm).
      Read source before writing each.
- [ ] Classify all **135 routes** → live / dead / client-gated. WHILE THERE: audit the astro-knots
      rule *"auth-gated routes must not be prerendered"* (grep `export const prerender = true`
      vs middleware public allowlist — any gated+prerendered route is a silent prod bypass).
- [ ] Classify the **34 collections** → live content + live consumer, else drop-with-intention.
- [ ] Trim the **73 prod deps** to what `site-next/` needs (LFM subsumes several markdown-pipeline deps).
- [ ] Decide asset strategy for the 525M / 937 images (ImageKit/CDN vs in-repo) per astro-knots.

## 8. Next-session bootstrap (do this first)

1. Read `context-v/decisions/2026-08-03_Rebuild-Keep-Drop-Ledger.md` (full state).
2. Load skills: `astro-knots`, `lossless-flavored-markdown`, `context-vigilance`, `pseudomonorepos`.
3. Confirm the graphify MCP is available this session (see §4); else use the CLI.
4. If any code changed since `da230a9`, run `graphify update .` before trusting the graph.
5. Resume Phase 0 remainder (§7), gate at ledger sign-off, THEN start Phase 1 (spec).

## 9. Phase 1 preview (after Phase 0 gate)

Author the rebuild **spec in `context-v/specs/`** per the astro-knots "spec-initiated" mandate
+ the `context-vigilance` developing-a-spec rhythm (discuss→write→discuss, sign-off gate).
The spec must absorb — not reinvent — the existing prior art:
`content/lost-in-public/explorations/Multi-Site-Astro-Starter-Kit-Architecture.md`
(status: Implementation) which already sketches the design-system half: `@knots/tokens`,
`@knots/astro`, `@knots/svelte`, `@knots/brand-config`, variant-via-Vite-alias, Storybook,
Changesets, visual-regression testing. The spec also defines the loop's own phase/gate structure.

## 10. Persistent memory written this session

- `project-rebuild-site-next` (project) — program overview + the 3 decisions.
- `feedback-drop-code-as-documented-intention` (feedback) — the governing principle.
- Both indexed in `MEMORY.md`. Existing: `feedback-use-path-aliases` (use `@layouts`/`@components`,
  not `../../..`).

## 11. Open questions for MS

- Commit `graphify-out/` (team-share the map) or gitignore it?
- Fold the 24 pure-scaffolding drops into ONE note, or keep per-cluster granularity?
