---
title: "Upgrade All Dependencies for Faster Builds"
lede: "Astro 6.1 → 7.3 and everything around it, in risk order. Speed is the motive, so measure it, because this site's Markdown setup may limit the gain."
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
site_uuid: 724a73c9-2109-493b-95e8-6a7632123d48
hex_code: va0fbz
tags:
  - Dependencies
  - Astro-7
  - Build-Performance
  - Vercel
summary: >-
  Sequenced plan to bring lossless-site's dependencies current, from a
  read-only audit on 2026-10-06 (pnpm outdated + the Astro 7 upgrade guide).
  Gated on one decision: the 2026-08-03 Rebuild Keep/Drop Ledger says the
  current site stays "untouched" as the parity reference for site-next. Tier 1
  (patch/minor) is low-risk either way; tiers 2–3 need that decision amended.
  Sets a measured build-time baseline so the speed claim can be checked rather
  than assumed.
---
# Upgrade All Dependencies for Faster Builds

## Why Care?

A content push already means a multi-repo chain ([[Fetching-Content-Updates-is-Multi-Step-Multi-Module]]), and then a Vercel build of ~4,875 markdown files on top. Astro 7 (released 2026-06-22) advertises 15–61% faster builds from a Rust compiler, the Sätteri markdown processor, and queued rendering. The site is on Astro 6.1.2, a full major behind.

## Gate: this conflicts with a locked decision

[[2026-08-03_Rebuild-Keep-Drop-Ledger]] and [[2026-08-04_Rebuild-Kickoff-Handoff]] say the current `site` stays **untouched** as the parity reference while `site-next/` is built on Astro 7. `site-next/` doesn't exist yet; the rebuild is still in Phase 0.

Before tier 2 or tier 3, write a `context-v/decisions/` entry that either:

- **Amends "untouched"** to allow a scoped dependency refresh, accepting that the parity baseline shifts (compressHTML and markdown changes can alter rendered output); or
- **Holds the line**, doing tier 1 only and taking the speed win in `site-next/`.

Tier 1 is safe under either choice.

## Temper the speed expectation

Astro's own numbers attribute most of the gain to **Sätteri**, the new default markdown processor. The Rust compiler alone was about 6% on docs.astro.build ("the compiler is rarely the bottleneck"). This site:

- configures remark/rehype plugins in `astro.config.mjs` (`rehype-raw`, `rehype-autolink-headings`, `remarkRehype.allowDangerousHtml`), which keeps it on the unified pipeline unless those are ported; and
- renders much of its content through its own remark pipeline in layouts (~10 files import remark or unified directly), which bypasses Astro's processor entirely.

So expect a modest gain from the upgrade itself. Queued rendering (~2.4×) may help static page generation. The large gain needs Sätteri, which is its own experiment (tier 4). **Measure; don't assume.**

**Baseline to beat:** a local `astro build` on 2026-10-04 took ~140 s for the server-build step. Record a proper baseline with `time pnpm build` before starting.

## Current state (2026-10-06)

- **pnpm 12.8.1.** `.npmrc` hoists `cookie` and `smol-toml` for the Vercel adapter.
- **Node:** v26.10.0 locally. Astro 7 needs ≥ 22.12 (even majors). CI (`.github/workflows/audit.yml`) pins 22. **Check the Vercel project's Node version in the dashboard**; it isn't recorded in the repo.

| Package | Current → Latest | Tier | Note |
|---|---|---|---|
| astro | 6.1.2 → 7.3.5 | 3 | Vite 8, Rust compiler, compressHTML default change |
| @astrojs/mdx | 5.0.3 → 8.0.2 | 3 | Needs astro ^7.2.10 |
| @astrojs/vercel | 10.0.3 → 11.0.11 | 3 | v11 drops `edgeMiddleware`, changes `isr` (neither used) |
| @astrojs/svelte | 8.0.4 → 9.0.1 | 3 | May need `legacy: { componentApi: true }` |
| @astrojs/node | 10.0.4 → 11.1.6 | 3 | Not used by the config (adapter is Vercel). **Remove** instead |
| typescript | 5.9.3 → 7.0.2 | hold | `@astrojs/check` and `@astrojs/svelte` 9 accept TS ≤ 6. Stay on 5.9 (or 6.x) |
| @vercel/og | 0.8.6 → 1.0.3 | 2 | OG image routes |
| sharp 0.34→0.35, js-yaml 4→5, undici 7→8, uuid 13→14, dotenv 17→18 | | 2 | One at a time, grep call sites first |
| cookie | 1.1.1 → 2.0.1 | 3 | Let the Vercel adapter dictate |
| @astrojs/check, prism, sitemap, svelte 5.57, tailwind 4.3, shiki, astro-icon, tabler, etc. | patch/minor | 1 | Safe |
| tw-animate-css | `"latest"` | 1 | Pin it; a floating spec makes builds non-reproducible |

## Tiers

### Tier 1: patch/minor (safe under either gate decision)

```bash
pnpm update            # respects existing ranges: patch/minor only
pnpm add tw-animate-css@<current>   # pin the floating spec
time pnpm build && pnpm exec astro check
```

### Tier 2: small majors, one per commit

For each of sharp, js-yaml, undici, uuid, dotenv, @vercel/og: grep usages, `pnpm add <pkg>@latest`, build, check, commit.

### Tier 3: the Astro 7 set, together

```bash
pnpm add astro@latest @astrojs/mdx@latest @astrojs/vercel@latest \
  @astrojs/svelte@latest @astrojs/sitemap@latest @astrojs/check@latest \
  @astrojs/markdown-remark
pnpm remove @astrojs/node   # after confirming nothing imports it
```

Then, in `astro.config.mjs` and the source:

1. `markdown: { processor: unified() }` keeps the existing rehype plugins working.
2. `compressHTML: true` keeps v6 whitespace behavior. The new `'jsx'` default strips whitespace between inline elements, which is risky for prose and card text.
3. Fix `vite.rollupOptions.external: ['astro:content/loaders']`. It's misplaced (belongs under `build`), and Vite 8 may want `rolldownOptions`.
4. Modernize `entry.render()` → `render(entry)` in `src/layouts/Information.astro:19` and `src/pages/slides/[collection]/[...slug].astro:46`.
5. Fix stricter-HTML failures from the Rust compiler (unclosed non-void elements, invalid nesting) as the build reports them.
6. Watch for zod deprecation warnings on `.passthrough()` in `src/content.config.ts`. **Don't** respond by adding validation (reminder: no hard frontmatter validation).

No changes needed for `content.config.ts` loaders, `prerender` exports, `getStaticPaths`, or `.slug` usage.

### Tier 4 (optional): Sätteri experiment, on a branch

Port the rehype plugins (or confirm Sätteri equivalents), switch the processor, and time the build against the tier-3 number. Keep it only if the gain is real and rendered output is unchanged.

## Verification at each tier

- `time pnpm build`: compare the server-build step to the baseline, and record the number in this plan.
- `pnpm exec astro check`.
- Compare the `dist/` page count before and after (no silently dropped routes).
- Spot-check rendered pages for prose whitespace, wikilinks, callouts, heading anchors, citations, and OG images, including `/content-areas`, one `/toolkit` page, one `/more-about` page, and one changelog entry.
- Push to `development` and check the Vercel **preview** before promoting to `master` (production).
- Changelog entry in `content/changelog--code/` per changelog-conventions.

## Measurements

All builds run locally with `CONTENT_BASE_PATH=src/generated-content ./node_modules/.bin/astro build --remote` (the `build` script without `prebuild`), warm content cache, Node 26.10, M-series Mac.

| Run | Date | Total | Vite bundles | Prerender | Server built | HTML pages | `astro check` errors |
|---|---|---|---|---|---|---|---|
| Baseline (Astro 6.1.2) | 2026-10-06 | 114 s | 30.7 s | 64.2 s | 112.2 s | 7,528 | 331 |
| Tier 1 (patch/minor) | 2026-10-06 | 109 s | 28.0 s | 62.2 s | 107.0 s | 7,528 | 1,162 |

**Prerendering is the bottleneck** (~57% of build time). That's the phase Astro 7's queued rendering targets. Content sync is 3 s warm but ~30 s cold, and Vercel may build cold.

**The `astro check` jump in tier 1 is a checker change, not a regression.** 990 of the 1,162 errors are parse errors (`ts(1382)`, `ts(1003)`) in `src/assets/visuals-as-components/` (23 inline-SVG trademark components, 6 of which embed `<?xml ?>` / `<!DOCTYPE>`). The newer `@astrojs/check` rejects them. Their only importer, `src/components/basics/ContrastingTrademarkRibbons.astro`, is already on the ledger's DROP list ([[Abandoned-Intentions-Trademark-Ribbons]]). The build doesn't reach them, so output is unchanged. **Before tier 3:** delete that component and the 23 SVG files (the Rust compiler is also stricter). Confirm the abandoned intention is captured first, per the ledger's rule.

## pnpm 12 note

Local pnpm 12.8.1 refuses `pnpm build` (`ERR_PNPM_VERIFY_DEPS_BEFORE_RUN`) because it no longer reads the `"pnpm"` field in `package.json`. Fix (tier 1): the `overrides` are copied into `pnpm-workspace.yaml`, and the `package.json` field is **kept** so an older pnpm on Vercel still applies them. Remove the `package.json` copy once Vercel's pnpm version is confirmed ≥ 10.

## Order relative to other work

Do tier 1 before [[Content-Areas-Index-with-Nested-Filters-and-Shared-Cards]], so the new components are built on current deps. Tier 3 waits for the gate decision.
