# Troubleshooting Routing Conflicts in Astro

This guide documents the resolution of dynamic routing conflicts when adding a new nested collection route in Astro, specifically when adding `/toolkit/vertical/*` routes alongside existing `/toolkit/*` routes.

## The Challenge: Adding Nested Dynamic Routes

We needed to add a new content collection `vertical-toolkits` that would be served at `/toolkit/vertical/*` URLs, while we already had a `tooling` collection served at `/toolkit/*`. The vertical-toolkits content was organized in subdirectories (e.g., `FinTech/Alviere.md`) and needed to preserve this structure in the URLs.

### Initial Setup Attempts

#### Attempt 1: Basic Collection Setup
```typescript
// src/content.config.ts
const verticalToolkitsCollection = defineCollection({
  loader: glob({pattern: "**/*.md", base: resolveContentPath("vertical-toolkits")}),
  schema: z.object({}).passthrough().transform((data) => ({
    ...data,
    tags: Array.isArray(data.tags) ? data.tags
      : data.tags ? [data.tags]
      : []
  }))
});
```
**Failed because:** The entry IDs were inconsistent - some files had `fintech/alviere` while others just had `alviere`, causing routing mismatches.

#### Attempt 2: Hardcoding Path Fixes in Page Component
```typescript
// In [...slug].astro
if (!normalizedId.startsWith('fintech/')) {
  normalizedId = `fintech/${normalizedId}`;
}
```
**Failed because:** This was too brittle and would break when other subdirectories were added.

#### Attempt 3: Using Transform to Fix IDs
```typescript
schema: z.object({}).passthrough().transform((data, context) => {
  const fullPath = String(context.path);
  // ... trying to manipulate the path
})
```
**Failed because:** The transform function doesn't affect the entry.id that Astro generates - it only transforms the data object.

## The "Aha!" Moment

The breakthrough came when researching Astro's content loader API documentation. We discovered the `generateId` option in the glob loader, which allows custom ID generation from file paths. This was the key to preserving the full directory structure in entry IDs.

Additionally, we realized the routing conflict: `/toolkit/[...slug].astro` was catching all `/toolkit/*` paths, including `/toolkit/vertical/*`, before they could reach the more specific `/toolkit/vertical/[...slug].astro` page.

## Final Solution

### 1. Use generateId in Content Collection
```typescript
// src/content.config.ts
const verticalToolkitsCollection = defineCollection({
  loader: glob({
    pattern: "**/*.md", 
    base: resolveContentPath("vertical-toolkits"),
    // Custom ID generation to preserve the full directory path
    generateId: ({ entry }) => {
      // entry is the relative path from base, e.g., "FinTech/Alviere.md"
      // Remove the .md extension and convert to lowercase for consistency
      return entry.replace(/\.md$/, '').toLowerCase();
    }
  }),
  schema: z.object({}).passthrough().transform((data, context) => {
    const filename = String(context.path).split('/').pop()?.replace(/\.md$/, '') || '';
    const displayTitle = data.title || filename.replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
    
    return {
      ...data,
      title: displayTitle,
      tags: Array.isArray(data.tags) ? data.tags
        : data.tags ? [data.tags]
        : []
    };
  })
});
```

### 2. Fix Route Conflicts
```typescript
// src/pages/toolkit/[...slug].astro
export async function getStaticPaths() {
  const toolingEntries = await getCollection('tooling');
  
  return toolingEntries.map(entry => {
    const generatedSlug = getReferenceSlug(entry.id);
    return {
      params: { slug: generatedSlug },
      props: { entry, contentType: 'tooling' }
    };
  }).filter(path => {
    // Exclude any paths that would conflict with /toolkit/vertical/*
    // This ensures /toolkit/vertical/* routes go to the vertical-specific page
    return !path.params.slug.startsWith('vertical/');
  });
}
```

### 3. Add Route Mapping
```typescript
// src/utils/routing/routeManager.ts
const defaultRouteMappings: RouteMapping[] = [
  // ... existing mappings
  {
    contentPath: 'vertical-toolkits',
    routePath: 'toolkit/vertical'
  },
];
```

### 4. Create Vertical Toolkit Page
```typescript
// src/pages/toolkit/vertical/[...slug].astro
---
import { getCollection } from 'astro:content';
import Layout from '@layouts/Layout.astro';
import OneArticle from '@layouts/OneArticle.astro';
import OneArticleOnPage from '@components/articles/OneArticleOnPage.astro';
import { getReferenceSlug } from '@utils/slugify';

export const prerender = true;

export async function getStaticPaths() {
  const verticalToolkitsEntries = await getCollection('vertical-toolkits');
  
  return verticalToolkitsEntries.map(entry => {
    const generatedSlug = getReferenceSlug(entry.id);
    return {
      params: { slug: generatedSlug },
      props: { entry, contentType: 'vertical-toolkits' }
    };
  });
}

const { entry, contentType } = Astro.props;

const contentData = {
  path: Astro.url.pathname,
  id: entry.id.replace(/\\/g, '/').split('/').pop()?.replace(/\.md$/, ''),
  contentType: contentType,
  title: entry.data.title,
};
---

<Layout title={entry.data.title} frontmatter={entry.data}>
  <OneArticle
    Component={OneArticleOnPage}
    content={entry.body}
    markdownFile={entry.id}
    data={contentData}
  />
</Layout>
```

## Key Learnings

1. **Use generateId for Path Preservation**: The `generateId` option in Astro's glob loader is essential for preserving directory structure in content collection entry IDs.

2. **Route Specificity Matters**: More specific routes need protection from catch-all routes. Filter out conflicting paths in the parent route's `getStaticPaths`.

3. **Entry IDs are Immutable**: The transform function in content collections only affects the data object, not the entry.id. Use generateId to control ID generation.

4. **Debug with Console Logs**: Adding console.log statements in getStaticPaths helped identify the inconsistent entry IDs.

5. **Test URLs Incrementally**: Start the dev server and test specific URLs to see exactly what paths are being generated.

## Best Practices for Next Time

1. When adding nested dynamic routes, always check for conflicts with existing catch-all routes
2. Use the `generateId` option when you need consistent ID generation across subdirectories
3. Add route mappings to the routeManager for proper backlink resolution
4. Test both direct URL access and backlink resolution after implementation
5. Consider the directory structure of your content when designing URL patterns

## Related Files

- `/src/content.config.ts` - Content collection definitions
- `/src/pages/toolkit/[...slug].astro` - Parent route that needed filtering
- `/src/pages/toolkit/vertical/[...slug].astro` - New nested route
- `/src/utils/routing/routeManager.ts` - Route mapping configuration
- `/src/utils/markdown/remark-backlinks.ts` - Backlink processing