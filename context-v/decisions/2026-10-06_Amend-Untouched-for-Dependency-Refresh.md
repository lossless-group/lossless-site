---
title: "Amend \"Untouched\": Allow a Scoped Dependency Refresh of the Current Site"
lede: "The rebuild is paused and the build time hurts every content push. The current site can take dependency upgrades, provided its rendering stays the same."
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
status: Decided
site_uuid: 5d1bc98f-c25f-4fc7-8728-059b306a822f
hex_code: cofa5c
tags:
  - Decisions
  - Dependencies
  - Rebuild
  - Build-Performance
summary: >-
  Amends one line of the 2026-08-04 rebuild handoff ("current site stays
  running untouched as the parity reference"). Dependency upgrades, including
  Astro 6 → 7, are now allowed on the current site under a "rendering-neutral"
  constraint. The ground-up rebuild into site-next/ is not cancelled, only
  not scheduled. Governs the work in the Upgrade-All-Dependencies-for-Faster-Builds plan.
---
# Amend "Untouched": Allow a Scoped Dependency Refresh of the Current Site

## Decision

The current `site` may take dependency upgrades, including the Astro 6 → 7 major, **as long as rendered output stays the same**. Everything else in the rebuild decisions stands.

This amends one line of [[2026-08-04_Rebuild-Kickoff-Handoff]] (§2, "Location"):

> current `site` stays running untouched as the parity reference.

It now reads: the current `site` stays the parity reference, and **may be upgraded in place when the upgrade doesn't change what it renders.**

## Why

- The rebuild into `site-next/` is still in Phase 0, and there's no time to run it soon. The parity baseline that "untouched" protects has nothing to be compared against yet.
- Build time is paid on every content push, and pushes are frequent (see [[Fetching-Content-Updates-is-Multi-Step-Multi-Module]]). It's the most felt cost of the site today.
- Astro 7 can be configured to keep current rendering (`markdown.processor: unified()`, `compressHTML: true`). So the baseline barely moves, and staying on Astro 6 buys little.

## Constraints ("rendering-neutral")

1. Keep the unified/remark markdown pipeline. Switching to Sätteri is a separate, measured experiment, kept only if output is unchanged.
2. Keep v6 whitespace behavior (`compressHTML: true`).
3. Compare page count and spot-check rendered pages before promoting to `master`.
4. No frontmatter validation added in response to deprecation warnings.
5. Measure build time before and after each tier, and record the numbers in the plan.

## Alternatives passed over

- **Hold "untouched", take the speed win in `site-next/`.** Rejected for now: no date for the rebuild, and the cost is paid today.
- **Patch/minor only.** It's the first step anyway, but on its own it doesn't touch the main source of build time.

## Related

- [[2026-08-03_Rebuild-Keep-Drop-Ledger]]
- [[Upgrade-All-Dependencies-for-Faster-Builds]]
