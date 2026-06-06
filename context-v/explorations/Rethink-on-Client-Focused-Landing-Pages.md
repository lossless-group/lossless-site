---
title: "Rethink on Client-Focused Landing Pages"
lede: "Three overlapping mechanisms — `for_clients` frontmatter, MOC files, and the `client-content/` tree — are trying to do the same job and stepping on each other. This is a thinking-out-loud document, not a spec."
date_created: 2026-06-01
date_modified: 2026-06-01
authors:
  - Michael Staton
augmented_with:
  - Pi on Claude Opus 4.7
semantic_version: 0.0.0.1
tags:
  - Exploration
  - Client-Experience
  - Content-Architecture
  - Personalization
  - Auth
status: Open
---

# Rethink on Client-Focused Landing Pages

We have started "tagging" clients across content collections with a `for_clients` array, in addition to per-client **Maps of Content** (`moc/`) and a parallel **`client-content/`** tree. Three mechanisms, overlapping concerns, no clear contract between them. This document is an honest survey of where we are, what we want, and what we don't yet know how to do.

This is *not* a spec. We don't have answers. We have a direction, two non-negotiable UX goals, and a stack of open questions.

## The two non-negotiable UX goals

1. **Dead-simple, fast authoring for content creators in Obsidian.** Creators should be able to create, adapt, customize, and recommend content *on the fly* — without context-switching out of their editor and without learning a new ceremony for each client. The whole system should feel like normal Obsidian writing with one or two extra frontmatter touches.
2. **Dead-simple client access with a real sense of personalization.** Clients should feel that the experience is theirs — at the **organization**, **team**, and **individual** level — without paperwork. Personalization should feel like a gift, not a portal.

Every option below is graded against these two goals first. Architectural elegance is secondary.

## What we have today (three mechanisms, three name-spaces)

### 1. `moc/` — Map of Content, one file per client

Files live at `src/generated-content/moc/<ClientName>.md` and define the *priority content* for that client via a `:::reader` block of `[[wikilinks]]`. Filenames are properly-cased and may include spaces (e.g. `Hypernova.md`, `Obsidian Plugin Community.md`). This is what `getClientContentPaths` reads to drive the `/client/[client]/read/...` route.

**Strength:** human-curated, ordered, narrative-friendly. **Weakness:** name-space drift (filename casing/spacing vs URL slug vs `for_clients` value) and the file is a single authoritative blob — every reorder is a manual edit.

### 2. `for_clients:` frontmatter — distributed tagging across collections

A property now appearing across content collections (essays, organizations, vocabulary, tooling, etc.):

```yaml
for_clients:
  - The-Water-Foundation
```

**Strength:** content is tagged at its source, so a new essay declares "this is relevant to client X" without anyone editing a separate file. This is the closest thing we have to the *on-the-fly* authoring goal.

**Weakness:** the slug may or may not match the MOC filename (`The-Water-Foundation` vs `Water Foundation.md` vs `/client/water-foundation/`). There is no canonical client identifier, so the join across mechanisms is fuzzy at best.

### 3. `client-content/` — a parallel tree at `/Users/mpstaton/content-md/lossless/client-content/`

Per-client folders (`Avalanche/`, `Hypernova/`, `Water-Foundation/`, etc.) holding client-specific files. Used when content is genuinely *different* for a client and doesn't belong in a shared collection.

**Strength:** clear ownership of one-off content. **Weakness:** filename collisions with the shared collections, duplicate content drift (two copies of "the same" essay slowly diverging), and unclear merge rules when a file exists in both places.

### Where they collide

- `moc/Hypernova.md` ↔ `for_clients: [Hypernova]` ↔ `client-content/Hypernova/` — three name-spaces, no canonical mapping.
- A piece of content tagged `for_clients: [Avalanche]` may or may not appear in `moc/Avalanche.md`. Today the route's `filterContentByMOC` does fuzzy 60%-word-overlap matching, which is a sign the contract isn't formal anywhere.
- `client-content/` files often **duplicate** an essay that already exists in the shared collection, with small customizations. We have no diffing or override mechanism — just two files.

## What we want but don't have

### Auth / secret-protection for client pages

Right now `/client/[client]/...` is public. Clients see "their" pages because we share URLs, not because the system gates them. We need *some* form of gating, but full SSO is overkill for the scale and tone. Open questions:

- **Magic link** vs **per-client passphrase** vs **obscure-but-shareable URL slug** vs **third-party auth (Clerk, Auth0, Stytch)**?
- Where does the gate live? Astro middleware on a serverless adapter? An edge function? A separate auth-aware proxy?
- How do we keep the *feel* of "this was made for you" rather than "log in to a portal"?

### Organization / Team / Individual layering

A single client (e.g. Hypernova) is really a tree of audiences:

- **Organization-level:** the executive summary, the brand, the shared narrative.
- **Team-level:** the engineering team sees different operational content than the marketing team.
- **Individual-level:** a named contact (CTO, Head of Content) gets pages with their name on them.

Today we collapse all three into one MOC. That fails the personalization UX goal — *teams* and *operational leaders* don't feel personally addressed.

### A single canonical client identifier

Every mechanism needs to agree on *one* slug per client. Without it, every join is fuzzy and every Vercel deploy risks a casing bug (we just hit one — see `[...slug].astro` line 138 / `getClientContentPaths`). A canonical identifier needs:

- One spelling (Train-Case slug seems natural: `Water-Foundation`).
- A defined display name (separate field, free-form: "The Water Foundation").
- A defined URL slug (lowercase: `water-foundation`).
- A defined MOC filename (deterministic from the canonical slug).
- A defined `client-content/` folder name (deterministic from the canonical slug).

## Option space (not a decision)

### Option A — Canonicalize, keep all three mechanisms, define the contract

Introduce a single `clients/` registry (one file per client) that owns the identity (slug, display name, MOC path, content folder path, auth method). Every other mechanism *joins* on the canonical slug. `for_clients` values validate against the registry; MOC files are named from the canonical slug; `client-content/` folders mirror it.

**Pros:** smallest change, preserves all three workflows we already use. **Cons:** still three places to update for one client; doesn't address layering (org/team/individual) or auth.

### Option B — Make `for_clients` the source of truth, collapse MOC

Replace `moc/` files with a per-client *view* assembled at build time from all content tagged `for_clients: [X]`, plus an optional `priority_for_clients` field that gives ordering. MOC files become a derived artifact (or disappear). `client-content/` survives only for genuinely client-private content.

**Pros:** authoring stays in-place (the on-the-fly UX goal). **Cons:** ordering and narrative ("read these in this order, here's the throughline") are harder to express in distributed tags; we lose the curated MOC voice.

### Option C — Promote `client-content/` to a first-class content collection with override semantics

Treat a file in `client-content/Hypernova/X.md` as an *override* of `essays/X.md` for Hypernova specifically. The build resolves "client X sees Y" by overlaying. Tags and MOC still exist but become advisory.

**Pros:** maps cleanly to how we already use the folder. **Cons:** override resolution is subtle (which file wins, how do partial overrides work, how do we surface drift). Filename collision becomes a feature instead of a bug, but tooling needs to enforce it.

### Option D — A new "audience graph"

Model audiences as a small graph: **Organization → Team → Individual**, each a node with its own MOC and inheritance from its parent. Content is tagged with the *deepest* node it applies to. Pages are assembled by walking up the tree.

**Pros:** the only option that addresses the layering goal directly. **Cons:** biggest design lift; risks over-engineering for a small set of clients; needs UX for "who am I right now" navigation.

These are not mutually exclusive. The most likely real answer is something like *A (canonical registry) + B (lean on `for_clients`) + a lighter version of D (organization/team/individual as a property, not a graph)*.

## Open questions

- **Canonical identifier:** Train-Case slug, lowercase URL slug, or both with a deterministic transform? Where does the registry live (`src/content/clients/`? `context-v/clients/`? a TS module?)?
- **MOC future:** keep as authoritative narrative, derive from tags, or some hybrid (header narrative authored, body list derived)?
- **Override semantics:** if a `client-content/` file collides with a collection file, who wins? Always client? Only when frontmatter says so? Diff-based merge?
- **Auth model:** magic link vs passphrase vs obscure URL vs third-party. What matches the *gift, not portal* feel?
- **Org / Team / Individual:** flat properties (`for_orgs:`, `for_teams:`, `for_individuals:`) or a single `for_audiences:` with structured entries? How does an individual page acknowledge the person without feeling creepy?
- **Authoring ergonomics:** can a creator in Obsidian tag a file `for_clients: [Hypernova]` and have it show up correctly on the client's page within one save, without touching MOC or `client-content/`?
- **Drift detection:** how do we surface "this file in `client-content/Hypernova/` has drifted from the shared essay it overrides"?

## Findings (so far)

- The Vercel build is currently logging an ENOENT case-sensitivity issue around `moc/Hypernova.md` — see the related fix in `src/pages/client/[client]/read/[collection]/[...slug].astro`. That bug is the most concrete symptom of the broader naming-drift problem this exploration is trying to address.
- `filterContentByMOC` uses a 60%-word-overlap fuzzy match between MOC entries and content entries. The fact that fuzzy matching is *load-bearing* is a tell — there's no canonical identifier connecting them.
- The `organizations/` collection already carries `for_clients:` values like `The-Water-Foundation`, suggesting the convention is settling on a `The-` prefix in some cases. That convention is not yet documented anywhere.

## Tentative direction (still open)

Lean toward **Option A as a foundation** (canonical registry) and **Option B as the authoring UX** (let `for_clients:` drive content membership; let MOCs be a curated header/intro, not the membership list). Defer Option D's full audience graph until we feel the pain of not having it on at least one real client engagement.

Auth: probably start with **obscure-but-shareable URL slugs + an optional passphrase** before reaching for a third-party auth provider. The "gift, not portal" feel matters more than the security ceiling at our current stage.

But again — open. The point of this document is to make the question legible, not to answer it.

## Outcome

(Will be filled in when this exploration concludes — either with a link to the spec it produces, or a decision not to consolidate.)

## Related

- [[src/pages/client/[client]/read/[collection]/[...slug].astro]] — the route currently consuming MOCs (and the site of the recent case-sensitivity fix)
- [[src/generated-content/moc/Hypernova.md]] — representative MOC
- [[src/generated-content/organizations]] — where `for_clients:` first appeared
- `/Users/mpstaton/content-md/lossless/client-content/` — the parallel tree
