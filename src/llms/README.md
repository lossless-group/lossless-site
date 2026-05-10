# Source of truth: human-editable prose for the llms.txt endpoints

These markdown files are read at build time by the endpoints in
`site/src/pages/llms.txt.ts` and `site/src/pages/llms-full.txt.ts`. The
endpoints are deliberately dumb — they do token substitution and append the
dynamic per-collection content. **All voice, framing, and structural prose
lives here, not in TypeScript.**

If you want to tweak the wording on `/llms.txt` or `/llms-full.txt`, edit
the corresponding `.md` file in this directory and rebuild. No code changes.

## Files

- `llms.md` — template for `/llms.txt` (the link index).
- `llms-full.md` — template for `/llms-full.txt` (the concatenated markdown bodies of substantive collections).

## Tokens (substituted at build time)

| Token | Replaced with |
|---|---|
| `{{SITE_NAME}}` | `AppConfig.author` from `src/utils/appConfig.ts` (currently "The Lossless Group") |
| `{{SITE_DESCRIPTION}}` | `AppConfig.description` from `src/utils/appConfig.ts` |
| `{{ENTRY_COUNT}}` | Total number of published entries across all substantive collections |
| `{{PROJECTS_COUNT}}` | Number of published entries in the `projects` collection |
| `{{TOOLING_COUNT}}` | Number of published entries in the `tooling` collection |
| `{{ESSAYS_COUNT}}` | Number of published entries in the `essays` collection |
| `{{CONCEPTS_COUNT}}` | Number of published entries in the `concepts` collection |
| `{{VOCABULARY_COUNT}}` | Number of published entries in the `vocabulary` collection |
| `{{BLUEPRINTS_COUNT}}` | Number of published entries in the `blueprints` collection |
| `{{PROMPTS_COUNT}}` | Number of published entries in the `prompts` collection |
| `{{SPECS_COUNT}}` | Number of published entries in the `specs` collection |
| `{{REMINDERS_COUNT}}` | Number of published entries in the `reminders` collection |
| `{{EXPLORATIONS_COUNT}}` | Number of published entries in the `explorations` collection |
| `{{LLMS_FULL_URL}}` | Absolute URL to `/llms-full.txt` |
| `{{LLMS_INDEX_URL}}` | Absolute URL to `/llms.txt` |
| `{{PROJECTS_COUNT}}` | Count of published entries in `projects` |
| `{{PROJECTS_INDEX}}` | Bulleted link list for the `projects` collection |
| `{{TOOLING_COUNT}}` | Combined count for `tooling` + `vertical-toolkits` |
| `{{TOOLING_INDEX}}` | Bulleted link list grouped by section for `tooling` and `vertical-toolkits` |
| `{{WRITING_COUNT}}` | Combined count for `essays` + `concepts` + `vocabulary` + `explorations` |
| `{{WRITING_INDEX}}` | Bulleted link list grouped by collection for the writing/research-flavored collections |
| `{{PRINCIPLES_COUNT}}` | Combined count for `blueprints` + `prompts` + `specs` + `reminders` + `issue-resolution` |
| `{{PRINCIPLES_INDEX}}` | Bulleted link list grouped by collection for the org's working principles |
| `{{GUIDES_COUNT}}` | Combined count for `talks` + `up-and-running` + `to-hero` + `market-maps` |
| `{{GUIDES_INDEX}}` | Bulleted link list grouped by collection for talks, guides, and market maps |
| `{{CHANGELOG_COUNT}}` | Combined count for `changelog--content` + `changelog--code` |
| `{{CHANGELOG_INDEX}}` | Bulleted link list grouped by collection for the changelog |
| `{{CORPUS_BODIES}}` | Generated concatenation of raw markdown bodies for substantive collections — used in `llms-full.md` |

Tokens are simple `{{NAME}}` placeholders — no Mustache, no Handlebars, no
templating engine. If a token is missing in the markdown, the endpoint emits
the file without it. If you add a new dynamic value, register it in the
endpoint's substitution map and document it here.

## Substantive vs. thin collections

The site has many content collections; not all belong in `/llms.txt` or
especially `/llms-full.txt`. The endpoints include:

- **In both `/llms.txt` and `/llms-full.txt`:** `projects`, `tooling`,
  `vertical-toolkits`, `essays`, `concepts`, `vocabulary`, `blueprints`,
  `prompts`, `specs`, `reminders`, `explorations`, `talks`,
  `issue-resolution`, `up-and-running`, `to-hero`, `market-maps`,
  `changelog--content`, `changelog--code`.
- **Excluded from `/llms-full.txt` but listed in `/llms.txt`:** `slides`
  (presentation-flavored markdown rarely useful as ingest), `sources` and
  `organizations` (mostly metadata, not bodies of prose),
  `changelog--laerdal` (client-specific).
- **Excluded entirely:** `client-content`, `client-recommendations`,
  `client-portfolios`, `client-pages`, `portfolio` (client-private),
  `cards`, `pages`, `reports`, `moc`, `tag-mocs` (structural / non-prose).

Any collection touched here must use the same publish/private gate as the
corresponding `[...slug].astro` page template — otherwise drafts leak.

## Why a separate directory and not `src/lib/` or `src/content/`?

`src/utils/` and `src/lib/` are for code (TypeScript). `src/content/` is for
Astro content collections, which expect specific schemas and Astro-managed
loaders. These files are neither — they're prose templates that the build
step reads as raw strings via Vite's `?raw` import. Giving them their own
directory keeps the purpose obvious and makes the source-of-truth boundary
easy to find.
