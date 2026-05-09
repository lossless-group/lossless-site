---
title: "Changelog Locations Index — lossless-monorepo"
lede: "Every directory named `changelog` or `changelogs` discovered across the lossless-monorepo tree, paired with its source repo's git remote URL — feedstock for the forthcoming Lossless Changelog umbrella aggregator."
date_created: 2026-05-04
date_modified: 2026-05-04
publish: false
authors:
  - Michael Staton
augmented_with:
  - Pi on Claude Sonnet 4.5
generated_at: 2026-05-04T05:59:52Z
monorepo_root: /Users/mpstaton/code/lossless-monorepo
total_locations: 23
total_entries: 222
filters_applied:
  excluded_paths:
    - node_modules
    - .git
    - dist
    - build
    - .next
    - .cache
    - .svelte-kit
    - .astro
    - .venv
    - .vercel
    - site_archive
    - toolkit-screenshots
    - src/pages    # Astro routing, not entry source
    - src/layouts  # Astro layouts
    - src/components # Astro components
    - public       # static assets
changelog_locations:
  - relative_path: ai-labs/context-v/changelog
    remote: https://github.com/lossless-group/lossless-ai-labs.git
    entry_count: 1
    has_releases_subfolder: false
    convention: legacy-nested  # changelog/ inside context-v/ rather than at root

  - relative_path: ai-labs/investment-memo-orchestrator/changelog
    remote: https://github.com/lossless-group/investment-memo-orchestrator.git
    entry_count: 61
    has_releases_subfolder: true
    convention: canonical
    note: "Most active changelog in the tree."

  - relative_path: ai-labs/memopop-ai/apps/memopop-native/changelog
    remote: https://github.com/lossless-group/memopop-ai.git
    entry_count: 5
    has_releases_subfolder: false
    convention: canonical-nested  # nested inside a true monorepo's app

  - relative_path: ai-labs/memopop-ai/apps/memopop-orchestrator/changelog
    remote: https://github.com/lossless-group/investment-memo-orchestrator.git
    entry_count: 60
    has_releases_subfolder: true
    convention: canonical-nested
    note: "Submodule — same upstream as ai-labs/investment-memo-orchestrator/changelog (counts diverge by 1, suggesting one is one commit behind)."

  - relative_path: ai-labs/memopop-ai/apps/memopop-site/changelog
    remote: https://github.com/lossless-group/memopop-ai.git
    entry_count: 1
    has_releases_subfolder: false
    convention: canonical-nested

  - relative_path: ai-labs/memopop-ai/changelog
    remote: https://github.com/lossless-group/memopop-ai.git
    entry_count: 1
    has_releases_subfolder: false
    convention: canonical

  - relative_path: ai-labs/studies/memory-layers-for-agents/mem0/docs/changelog
    remote: https://github.com/mem0ai/mem0.git
    entry_count: 0
    has_releases_subfolder: false
    convention: external
    note: "Vendored study — mem0 is upstream third-party code. Not subject to Lossless conventions; aggregator should likely skip."

  - relative_path: astro-knots/changelog
    remote: https://github.com/lossless-group/astro-knots.git
    entry_count: 4
    has_releases_subfolder: false
    convention: canonical

  - relative_path: astro-knots/packages/lfm/changelog
    remote: https://github.com/lossless-group/astro-knots.git
    entry_count: 2
    has_releases_subfolder: false
    convention: canonical-nested
    note: "LFM is a published JSR package — likely deserves its releases/ subfolder once it ships releases."

  - relative_path: astro-knots/sites/arthouse-site/changelog
    remote: https://github.com/lossless-group/arthouse-site.git
    entry_count: 1
    has_releases_subfolder: false
    convention: canonical

  - relative_path: astro-knots/sites/banner-site/changelog
    remote: https://github.com/lossless-group/emblem-site.git
    entry_count: 11
    has_releases_subfolder: false
    convention: canonical
    drift_note: "Local dirname (banner-site) does not match upstream repo name (emblem-site). Renamed locally or upstream renamed — investigate before normalizing."

  - relative_path: astro-knots/sites/banner-site/src/content/changelog
    remote: https://github.com/lossless-group/emblem-site.git
    entry_count: 0
    has_releases_subfolder: false
    convention: astro-content-collection
    note: "Empty Astro content collection — the entries actually live at astro-knots/sites/banner-site/changelog. Either the collection is unused or content is sourced from the parallel changelog/ via build-time copy."

  - relative_path: astro-knots/sites/calmstorm-decks/context-v/changelogs
    remote: https://github.com/lossless-group/calmstorm-decks.git
    entry_count: 8
    has_releases_subfolder: false
    convention: legacy-nested
    drift_note: "Plural 'changelogs' (vs. canonical singular). Legacy nesting under context-v/."

  - relative_path: astro-knots/sites/cilantro-site/src/content/changelogs
    remote: https://github.com/lossless-group/cilantro-site.git
    entry_count: 0
    has_releases_subfolder: false
    convention: astro-content-collection
    drift_note: "Plural 'changelogs'. Empty collection."

  - relative_path: astro-knots/sites/dark-matter/changelog
    remote: https://github.com/lossless-group/changelog_matter-site.git
    entry_count: 24
    has_releases_subfolder: true
    convention: canonical
    drift_note: "Remote URL contains 'changelog_matter-site.git' — looks like a git remote misconfiguration or rename. The matching collection at src/content/changelog points to the cleaner 'matter-site.git'. Investigate."

  - relative_path: astro-knots/sites/dark-matter/src/content/changelog
    remote: https://github.com/lossless-group/matter-site.git
    entry_count: 0
    has_releases_subfolder: false
    convention: astro-content-collection
    note: "Empty collection; entries live at the parallel changelog/. Note the remote here differs from the dark-matter/changelog remote — see drift_note on that entry."

  - relative_path: astro-knots/sites/fullstack-vc/changelog
    remote: https://github.com/lossless-group/fullstack-vc.git
    entry_count: 16
    has_releases_subfolder: false
    convention: canonical

  - relative_path: astro-knots/sites/hypernova-site/changelog
    remote: https://github.com/lossless-group/hypernova-site.git
    entry_count: 5
    has_releases_subfolder: true
    convention: canonical

  - relative_path: astro-knots/sites/mpstaton-site/src/content/changelog
    remote: https://github.com/lossless-group/mpstaton-site.git
    entry_count: 5
    has_releases_subfolder: false
    convention: astro-content-collection
    note: "Astro content collection actually populated — entries live here, not at a parallel changelog/."

  - relative_path: astro-knots/sites/twf_site/changelog
    remote: https://github.com/lossless-group/the-water-foundation-site.git
    entry_count: 3
    has_releases_subfolder: false
    convention: canonical
    drift_note: "Local dirname uses underscore (twf_site) where the rest of the tree uses hyphens. Upstream repo is 'the-water-foundation-site'."

  - relative_path: cite-wide/context-v/changelogs
    remote: https://github.com/lossless-group/cite-wide.git
    entry_count: 7
    has_releases_subfolder: false
    convention: legacy-nested
    drift_note: "Plural 'changelogs'. Legacy nesting under context-v/."

  - relative_path: image-gin/context-v/changelogs
    remote: https://github.com/lossless-group/image-gin.git
    entry_count: 4
    has_releases_subfolder: false
    convention: legacy-nested
    drift_note: "Plural 'changelogs'. Legacy nesting under context-v/."

  - relative_path: perplexed/changelog
    remote: https://github.com/lossless-group/perplexed-plugin.git
    entry_count: 3
    has_releases_subfolder: false
    convention: canonical
    drift_note: "Local dirname (perplexed) differs from upstream (perplexed-plugin)."

aggregation_hints:
  unique_remotes_count: 18
  unique_remotes:
    - https://github.com/lossless-group/lossless-ai-labs.git
    - https://github.com/lossless-group/investment-memo-orchestrator.git
    - https://github.com/lossless-group/memopop-ai.git
    - https://github.com/lossless-group/astro-knots.git
    - https://github.com/lossless-group/arthouse-site.git
    - https://github.com/lossless-group/emblem-site.git
    - https://github.com/lossless-group/calmstorm-decks.git
    - https://github.com/lossless-group/cilantro-site.git
    - https://github.com/lossless-group/changelog_matter-site.git
    - https://github.com/lossless-group/matter-site.git
    - https://github.com/lossless-group/fullstack-vc.git
    - https://github.com/lossless-group/hypernova-site.git
    - https://github.com/lossless-group/mpstaton-site.git
    - https://github.com/lossless-group/the-water-foundation-site.git
    - https://github.com/lossless-group/cite-wide.git
    - https://github.com/lossless-group/image-gin.git
    - https://github.com/lossless-group/perplexed-plugin.git
    - https://github.com/mem0ai/mem0.git  # external — likely skip
  drift_observations:
    - "Six locations use plural 'changelogs/' instead of singular 'changelog/'."
    - "Five locations use the legacy `context-v/changelog(s)` nested pattern instead of root-level `changelog/`."
    - "Several local dirnames diverge from their upstream repo names (banner-site→emblem-site, twf_site→the-water-foundation-site, perplexed→perplexed-plugin)."
    - "One remote URL appears misconfigured: `changelog_matter-site.git` — likely a renamed remote or mistake."
    - "Astro `src/content/changelog(s)` collections are inconsistently populated — some empty, one populated. Aggregator should prefer root-level `changelog/` when both exist."
tags:
  - Changelog
  - Index
  - Lossless-Monorepo
  - Aggregator-Feedstock
  - Drift-Observation
---

# Changelog Locations Index — lossless-monorepo

## Why Care?

The Lossless Group has a long-running goal to aggregate every changelog across every Lossless repo via the GitHub API into a unified "Lossless Changelog" umbrella feed. This file is the feedstock for that aggregator: an authoritative, machine-readable index of where changelog content actually lives, paired with the upstream git remote so the aggregator can fetch from the source rather than a working copy.

It's also useful as-is for humans: it shows at a glance which projects are shipping (high `entry_count`), which conventions have drifted, and where the team's actual changelog activity is concentrated.

## What's New?

- **23 changelog directories** found across the lossless-monorepo tree.
- **222 total entries** (Markdown files) across them.
- **18 unique upstream remotes** — one of them external (mem0, vendored for study).
- **Drift surfaced and noted** rather than fixed (per the `~/.pi/agent/AGENTS.md` policy): plural-vs-singular naming, legacy `context-v/changelog` nesting, dirname-vs-remote-name mismatches, and one suspicious remote URL.

## Top of the Leaderboard

| Project | Entries | Notes |
|---|---|---|
| `ai-labs/investment-memo-orchestrator/changelog` | 61 | Most active in the tree |
| `ai-labs/memopop-ai/apps/memopop-orchestrator/changelog` | 60 | Same upstream as above (submodule); diverges by 1 |
| `astro-knots/sites/dark-matter/changelog` | 24 | Has `releases/` subfolder; remote URL looks misconfigured |
| `astro-knots/sites/fullstack-vc/changelog` | 16 | |
| `astro-knots/sites/banner-site/changelog` | 11 | Local dirname ≠ upstream repo name |

## How To Use This File

For the aggregator (future):

1. Read `changelog_locations` from frontmatter.
2. For each entry, fetch the changelog directory from `remote` via the GitHub API.
3. Pair with `relative_path` for context (where this lives in the lossless-monorepo working tree).
4. Skip entries with `convention: external` unless explicitly opted in.
5. Use `convention` field to know whether to read from `changelog/`, `changelogs/`, `context-v/changelog/`, or `src/content/changelog/`.

For humans:

- Want to see what just shipped across the family? Sort `changelog_locations` by `entry_count` descending and look at recent commits in the top remotes.
- Want to find drift to fix later? Search for `drift_note` in this file's frontmatter.

## Drift, Surfaced Not Fixed

Per the [Lossless drift policy](https://github.com/lossless-group/lossless-skills) (`~/.pi/agent/AGENTS.md`): observe inconsistencies, note them, surface them — but don't auto-fix as a side effect of unrelated work. This index is the surfacing. Cleanup is a separate explicitly-authorized task.

Top items if/when a cleanup pass is authorized:

1. **Plural → singular `changelogs/` → `changelog/`** in calmstorm-decks, cilantro-site, cite-wide, image-gin
2. **Legacy `context-v/changelog(s)/` → root-level `changelog/`** in ai-labs, calmstorm-decks, cite-wide, image-gin
3. **Investigate the `dark-matter` remote URL** (`changelog_matter-site.git` looks wrong)
4. **Decide on Astro content collections vs. root `changelog/`** — currently inconsistent
5. **Local dirname ↔ upstream repo name** — pick a side per project (rename local or rename upstream)

## Regeneration

This file is generated, not handwritten. To regenerate:

```bash
ROOT="/Users/mpstaton/code/lossless-monorepo"
find "$ROOT" -type d \( -name changelog -o -name changelogs \) \
  -not -path '*/node_modules/*' \
  -not -path '*/.git/*' \
  -not -path '*/dist/*' \
  -not -path '*/build/*' \
  -not -path '*/.next/*' \
  -not -path '*/.cache/*' \
  -not -path '*/.svelte-kit/*' \
  -not -path '*/.astro/*' \
  -not -path '*/.venv/*' \
  -not -path '*/.vercel/*' \
  -not -path '*/site_archive/*' \
  -not -path '*/toolkit-screenshots/*' \
  -not -path '*/src/pages/*' \
  -not -path '*/src/layouts/*' \
  -not -path '*/src/components/*' \
  -not -path '*/public/*' \
  2>/dev/null | sort | while read -r dir; do
    rel="${dir#$ROOT/}"
    remote=$(git -C "$dir" remote get-url origin 2>/dev/null || echo "")
    count=$(find "$dir" -maxdepth 1 -name '*.md' -type f 2>/dev/null | wc -l | tr -d ' ')
    has_releases="false"
    [ -d "$dir/releases" ] && has_releases="true"
    printf "  - relative_path: %s\n    remote: %s\n    entry_count: %s\n    has_releases_subfolder: %s\n\n" \
      "$rel" "$remote" "$count" "$has_releases"
done
```

A future skill (likely `lossless-loop` or a dedicated `changelog-aggregator` skill) should encode this as a one-command refresh.
