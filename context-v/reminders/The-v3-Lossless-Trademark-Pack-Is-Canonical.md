---
title: The v3 Lossless Trademark Pack Is Canonical
lede: Which of the many Lossless mark files is the real one, so nobody picks an older version by alphabetical accident.
site_uuid: ffb36ee5-6883-43a7-bfc1-41158e98f87f
hex_code: 7dfa5f
date_created: 2026-11-22
date_modified: 2026-11-22
date_authored_initial_draft: 2026-11-22
date_authored_current_draft: 2026-11-22
at_semantic_version: 0.0.0.1
authors:
  - Michael Staton
augmented_with:
  - Claude Code (Opus 5.5)
tags:
  - Reminder
  - Brand
  - Trademark-Pack
publish: false
status: Current
type: Reminders
---

# The v3 Lossless trademark pack is canonical

Decided 2026-11-22. When you need a Lossless mark, here or in any other repo, use these files:

| Piece | Canonical file | Already used by |
|---|---|---|
| appIcon | `public/visuals/appIcon__Lossless_Record--Rounded-Rectangle--v3-heavy-fewer-dashes.svg` | (byte-identical to the favicon below) |
| favicon | `public/favicon__Lossless--v3.svg` | `<link rel="icon">` in `src/layouts/Layout.astro`; the Lossless rows on changelog.lossless.group and the context-v-corpus splash |
| wordmark | `public/visuals/wordmark__The-Lossless-Group.svg` | `src/pages/about.astro` |
| trademark | `public/visuals/trademark__Lossless--v3-icon.svg` | `src/components/basics/Header.astro` |

All four are outlined paths, so they render identically inside an `<img>`.

## Superseded, kept on purpose

- `appIcon__Lossless_Record--Rounded-Rectangle.svg`: two different files with this name, one in `public/` and one in `public/visuals/`
- `appIcon__Lossless_Record--Rounded-Rectangle--v1` and `--v2`, plus `--v4` through `--v7`: explorations
- `trademark__Lossless.svg`: the pre-v3 lockup

These stay because other repos carry copies by these names (hypernova-site, twf_site, mpstaton-site, lossless-slides-site and memopop-web-app all have one). Don't delete them. Don't copy them into anything new either.

Context: `lossless-monorepo/context-v/plans/Audit-and-Complete-Trademark-Packs-Across-Tracked-Projects.md`.
