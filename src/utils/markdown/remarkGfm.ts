// remarkGfm.ts
// Wrapper for remark-gfm plugin to enable GitHub-flavored Markdown (GFM) features
// Features enabled: tables, strikethrough, autolinks, task lists, etc.
// See: https://github.com/remarkjs/remark-gfm

/*
  This file follows project conventions for remark plugin wrappers:
  - Location: site/src/utils/markdown/
  - Naming: camelCase, matches other wrappers (e.g., remarkCitations.ts)
  - Import path: use `@utils/markdown/remarkGfm` in astro.config.mjs
  - Commented for clarity and maintainability
*/

import remarkGfm from 'remark-gfm';

export default remarkGfm;
