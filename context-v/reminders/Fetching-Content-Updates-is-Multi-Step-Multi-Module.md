---
title: "Fetching Content Updates is Multi-Step, Multi-Module"
lede: "New content reaches lossless.group only after it moves through three repo levels and three branches. Skip a step and the site serves stale content."
publish: true
date_created: 2026-10-06
date_modified: 2026-10-06
date_authored_initial_draft: 2026-10-06
date_authored_current_draft: 2026-10-06
authors:
  - Michael Staton
augmented_with:
  - Claude Code on Claude Opus 5.5
at_semantic_version: 0.0.0.3
status: Active
site_uuid: 84163924-018b-4ae8-b5d9-047a827e73c8
hex_code: o62vdd
tags:
  - Submodules
  - Content-Pipeline
  - Deployment
  - Vercel
summary: >-
  Runbook for getting content edits from the authoring copy
  (lossless-monorepo/content and its submodules) into the site's pinned copy
  (site/src/generated-content) and onto production. Written 2026-10-06 after a
  session where content landed on `development` and rendered only on a Vercel
  preview, because production builds from `master`. Applies whenever content,
  content-areas, or any other content submodule changes and the website should
  reflect it.
---
# Fetching Content Updates is Multi-Step, Multi-Module

Content is authored in one place and rendered from another, and each hop is a separate git repo:

```
lossless-monorepo/content/                 lossless-content repo (authoring copy)
├── content-areas/                         submodule → content-areas repo
└── projects/Water-Template-CE/            submodule → water-foundation-ce repo

lossless-monorepo/site/                    lossless-site repo
└── src/generated-content/                 submodule → lossless-content repo (the SAME repo as content/)
    ├── content-areas/                     nested submodule → content-areas repo
    └── projects/Water-Template-CE/        nested submodule (not initialized in the site copy)
```

A commit only reaches the website once every level above it has recorded the new pointer and `master` has it.

## Shortcut: `scripts/content-sync.sh`

The mechanical steps are scripted. Commits stay manual, because the script never runs `git commit`.

```bash
cd lossless-monorepo/site
scripts/content-sync.sh                    # status: every repo in the chain (branch, dirty, ahead/behind, dev==main==master)
scripts/content-sync.sh pull               # step 4: fast-forward src/generated-content + content-areas
scripts/content-sync.sh promote <path>     # step 3: FF origin/main + origin/master to origin/development, refuses otherwise
```

`promote` takes a **filesystem path**, not a repo name. From `site/`, the whole chain is:

```bash
scripts/content-sync.sh                                   # status
# 1–2. commit + push by hand: content/content-areas, then content/
scripts/content-sync.sh promote ../content/content-areas  # 3.
scripts/content-sync.sh promote ../content                # 3.
scripts/content-sync.sh pull                              # 4.
git add src/generated-content && git commit && git push origin development   # 5.
# wait for the Vercel preview of that commit to pass, then:
scripts/content-sync.sh promote .                         # 5. → production
```

Start and finish with `status`. Every line should read `clean` and `in parity`.

## The flow

### 1. Commit and push each content submodule

```bash
cd lossless-monorepo/content
# for each path listed in .gitmodules:
cd content-areas                 # then projects/Water-Template-CE, etc.
git switch development           # make sure you're on a branch, not a detached HEAD
git add -A && git commit && git push origin development
```

**Visit each submodule by hand. Don't use `git submodule foreach --recursive` or `git submodule update --recursive`.** `update` checks out the pinned SHA as a detached HEAD, so the next commit lands on no branch and the push goes nowhere useful.

### 2. Commit and push the content repo

```bash
cd lossless-monorepo/content
git add -A          # includes the bumped submodule pointers
git commit && git push origin development
```

### 3. Bring development / main / master to parity, in every repo touched

Do this in each content submodule, in `content`, and later in `site`:

```bash
git fetch origin
git merge-base --is-ancestor origin/main origin/development && \
git merge-base --is-ancestor origin/master origin/development && \
git push origin development:main development:master
```

Fast-forward only. If either check fails, `main` or `master` has commits that `development` doesn't. **Stop and reconcile by hand; never force-push.** The pushes are by refspec, so stale local `main`/`master` branches don't matter.

### 4. Pull into the site's copy of the content

```bash
cd lossless-monorepo/site/src/generated-content
git switch development && git pull --ff-only origin development

# then each nested submodule the site renders:
cd content-areas
git switch development && git pull --ff-only origin development
cd ..
git status        # should be clean: the gitlink matches what content/ recorded
```

If a nested submodule folder is empty, it was never initialized. Run `git submodule update --init <path>` once, then `git switch development` inside it before pulling.

### 5. Commit and push the site, then promote

```bash
cd lossless-monorepo/site
git add src/generated-content
git commit -m "chore(submodule): bump generated-content to <sha>"
git push origin development
# then step 3 again in site/, to reach main and master
```

## Why each step matters

- **Production builds from `master`.** A push to `development` produces a Vercel **preview** only. lossless.group doesn't change until `site/master` moves.
- **Vercel clones the site's submodules from their remotes.** Anything unpushed at any level can't be fetched at build time. The `prebuild` script also runs a non-fatal `submodule update --init content-areas` inside `generated-content`. If that fails, `/content-areas` builds empty rather than failing.
- **`site/src/generated-content` is a separate clone of `lossless-content`.** Pushing from `content/` does nothing to it until it's pulled.
- **`projects/Water-Template-CE` is not initialized in the site's copy.** The `projects` collection globs `projects/**`, so initializing it would start rendering that repo's markdown. Make that a deliberate decision, not a side effect of this flow.

## Checks before calling it done

```bash
# every repo in the chain: clean tree, and development == main == master on origin
git status --short
git rev-parse origin/development origin/main origin/master
```

Then confirm on production (e.g. `curl -sI https://www.lossless.group/content-areas`), not just on the preview URL.
