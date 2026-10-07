---
title: "Client Content Privacy and Site Decomposition, Deferred"
lede: "The site has no privacy gate for client work, and it's too big to fix piecemeal. Recording the known exposures and the decision to wait."
publish: false
date_created: 2026-10-06
date_modified: 2026-10-06
date_authored_initial_draft: 2026-10-06
date_authored_current_draft: 2026-10-06
authors:
  - Michael Staton
augmented_with:
  - Claude Code on Claude Opus 5.5
at_semantic_version: 0.0.0.1
status: Open
site_uuid: a555fea1-bf58-4463-8648-eccbbd76b582
hex_code: ypxt1u
tags:
  - Client-Content
  - Privacy
  - Decomposition
  - Rebuild
summary: >-
  Issue logged 2026-10-06 while preparing a Cathode.co (formerly Edviro)
  market map and client landing page. It records three things deliberately NOT
  being fixed now: (1) client landing pages are keyed to client folder names,
  not to a canonical identifier; (2) lossless-site has no secrets or privacy
  gate for client-facing content; (3) the changelog and toolkit have already
  been rebuilt as separate astro-knots sites, but this site still serves its
  own copies. All three point at the same root cause: this site is a monolith,
  while the rest of the tree is decomposed into small sites. Read alongside
  the Rebuild Keep/Drop Ledger and the Rethink on Client-Focused Landing Pages
  exploration before starting any of this work.
---
# Client Content Privacy and Site Decomposition, Deferred

## Why Care?

Client strategy is being written into the same content repo that publishes lossless.group, and the site has no way to keep it private other than `publish: false` and folder conventions. Each new client adds exposure. This issue records what we know so the fix can be designed once, not patched per client.

## Context: the case that surfaced this

A market scan, *Data Center Operations Intelligence: Market Scan and Entry Options for Cathode.co*, exists twice with the same text today:

- `content/lost-in-public/market-maps/Datacenter Operations Systems.md`: meant to become a **general market map**. Set to `publish: false` for now, `for_clients: [Cathode-co]`.
- `content/client-content/Edviro/Positioning in the Datacenter Multiverse.md`: the **client recommendations** version.

They will diverge. The market map moves toward a general audience; the client copy stays candid recommendations, including statements a client wouldn't want public (team size, how buyers will discount their traction).

The company is renaming from Edviro to Cathode.co. The market map now says Cathode.co. The client folder and the content-areas organization file (`content-areas/AI-Factories-Datacenters/Organizations/Edviro.md`) still say Edviro.

## Issue 1: client landing pages are keyed to the client's folder name

`/client/[client]` builds one page per directory in `client-content/`, lowercased (`client-content/Edviro/` → `/client/edviro`). Every existing client works this way.

**Decision (2026-10-06): keep it.** Rethinking client identity across `for_clients`, MOCs, and `client-content/` is out of scope; see [[Rethink-on-Client-Focused-Landing-Pages]]. A Cathode.co landing page will follow the same convention as every other client.

Consequence to watch: `for_clients` values don't have to match folder names (the market map uses `Cathode-co`; the folder is `Edviro`). Nothing enforces that they agree.

## Issue 2: no secrets or privacy gate for client content

What's true today (observed 2026-10-06 on production):

- `/client/edviro` is publicly reachable as "Client Portal: Edviro". No middleware, passcode, or auth runs in front of `/client/*`. The page itself names the client relationship.
- Only files under a client's `Recommendations/` or `Portfolio/` subfolders get routes. `Positioning in the Datacenter Multiverse.md` sits at the client folder root, so it has no URL (both guessed paths return 404). It's private by accident of placement, not by design.
- The market-map index (`src/pages/market-map/it.astro`) filters on `publish`. **Not verified:** whether `src/pages/market-map/for/[...slug].astro` still builds a page for `publish: false` entries. Check before relying on `publish: false` for anything sensitive.
- Everything in `client-content/` ships in the public `lossless-content` GitHub repo regardless of how the site renders it. A site-level gate wouldn't change that.

**Decision (2026-10-06): defer.** Gating belongs in a decomposed client surface, not bolted onto this site.

## Issue 3: this site is a monolith; its replacements already exist

The rest of the tree builds small, separately deployed sites. lossless-site doesn't: one Astro app renders ~30 collections from a 4,800-file content submodule. Two of its sections have already been rebuilt as standalone astro-knots sites:

| Section | Rebuilt as | Repo |
|---|---|---|
| Changelog | `astro-knots/sites/lossless-changelog` | `lossless-group/lossless-changelog` |
| Toolkit | `astro-knots/sites/lossless-toolkit-site` | `lossless-group/lossless-toolkit-site` |

This site still renders its own changelog and toolkit routes and doesn't point to the new sites.

**Decision (2026-10-06): don't repoint now.**

## When this gets picked up

In rough order:

1. Verify issue 2's open question (`publish: false` on `/market-map/for/*`).
2. Decide where client work lives: a gated, separately deployed client site (in keeping with the decomposed pattern) versus gating inside this site or `site-next/`.
3. Decide whether client content should leave the public `lossless-content` repo.
4. Repoint changelog and toolkit routes here (redirects or links) to the rebuilt sites, and drop the duplicated code per [[2026-08-03_Rebuild-Keep-Drop-Ledger]].
5. Finish the Edviro → Cathode.co rename in `client-content/` and `content-areas/`, keeping a redirect from `/client/edviro`.

## Related

- [[Rethink-on-Client-Focused-Landing-Pages]]: the three overlapping client mechanisms and the option space
- [[2026-08-03_Rebuild-Keep-Drop-Ledger]]: what survives into `site-next/`
- [[2026-08-04_Rebuild-Kickoff-Handoff]]
- [[Fetching-Content-Updates-is-Multi-Step-Multi-Module]]: how content reaches this site
