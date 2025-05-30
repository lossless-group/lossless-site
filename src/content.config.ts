import { defineCollection, z, getCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { basename, dirname, extname, join, resolve } from 'node:path';
import fs from 'fs';

// Import environment utilities
import { contentBasePath } from './utils/envUtils.js';
import { exit } from 'node:process';


// Function to resolve content paths based on environment
function resolveContentPath(relativePath: string) {
  // If the path already starts with ./src/generated-content, use it as is
  if (relativePath.startsWith('./src/generated-content')) {
    return relativePath;
  }
  
  // Otherwise, resolve against the content base path
  return join(contentBasePath, relativePath);
}

// Cards collection - respects JSON structure with cards array
const cardCollection = defineCollection({
  type: 'data',
  schema: z.object({
    cards: z.array(z.any())
  }).passthrough()
});

const visualsCollection = defineCollection({
  loader: glob({pattern: "**/*.{png,jpg,jpeg,gif,webp,svg}", base: resolveContentPath("visuals")}),  // Explicitly list image extensions
  schema: z.object({
    // Define base fields that all images should have
    id: z.string().optional(),
    title: z.string().optional(),
    alt: z.string().optional(),
    width: z.number().optional(),
    height: z.number().optional(),
    format: z.enum(['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg']).optional()
  }).passthrough().transform((data, context) => {
    // Get the filename without extension
    const filename = String(context.path).split('/').pop()?.replace(/\.[^.]+$/, '') || '';
    const extension = String(context.path).split('.').pop()?.toLowerCase() || '';
    
    // Use the filename as the display title, preserving original case
    // - Replace dashes/underscores with spaces
    // - Collapse multiple spaces
    // - DO NOT change the case of any letters (e.g., 'API' stays 'API')
    const displayTitle = filename
      .replace(/[-_]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    return {
      ...data,
      id: filename,  // Original filename as id
      title: data.title || displayTitle,  // Use provided title or computed one
      format: extension as 'png' | 'jpg' | 'jpeg' | 'gif' | 'webp' | 'svg',
      slug: filename.toLowerCase().replace(/\s+/g, '-')  // Add computed slug
    };
  })
});

const vocabularyCollection = defineCollection({
  loader: glob({pattern: "**/*.md", base: resolveContentPath("vocabulary")}),
  schema: z.object({
    aliases: z.union([
      z.string().transform(str => [str]), // Single string -> array with one string
      z.array(z.string()),                // Already an array
      z.null(),                          // Handle null values
      z.undefined()                      // Handle undefined values
    ]).transform(val => {
      if (!val) return [];              // Transform null/undefined to empty array
      return val;                       // Keep arrays and transformed strings as-is
    }).default([])                      // Default to empty array if missing
  })
});

// Concepts collection - follows same pattern as vocabulary
const conceptsCollection = defineCollection({
  loader: glob({pattern: "**/*.md", base: resolveContentPath("concepts")}),
  schema: z.object({
    aliases: z.union([
      z.string().transform(str => [str]), // Single string -> array with one string
      z.array(z.string()),                // Already an array
      z.null(),                          // Handle null values
      z.undefined()                      // Handle undefined values
    ]).transform(val => {
      if (!val) return [];              // Transform null/undefined to empty array
      return val;                       // Keep arrays and transformed strings as-is
    }).default([])                      // Default to empty array if missing
  })
});

// Concepts collection - follows same pattern as vocabulary
const essaysCollection = defineCollection({
  loader: glob({pattern: "**/*.md", base: resolveContentPath("essays")}),
  schema: z.object({
    aliases: z.union([
      z.string().transform(str => [str]), // Single string -> array with one string
      z.array(z.string()),                // Already an array
      z.null(),                          // Handle null values
      z.undefined()                      // Handle undefined values
    ]).transform(val => {
      if (!val) return [];              // Transform null/undefined to empty array
      return val;                       // Keep arrays and transformed strings as-is
    }).default([])                      // Default to empty array if missing
  }).passthrough().transform((data, context) => {
    // Get the filename without extension
    const filename = String(context.path).split('/').pop()?.replace(/\.md$/, '') || '';
    
    // Title fallback logic for essaysCollection:
    // - If frontmatter provides a title, use it as-is (preserve all casing).
    // - If missing, generate a title from the filename by replacing dashes/underscores with spaces.
    // - DO NOT change the case of any letters (e.g., 'API' stays 'API', 'AI' stays 'AI').
    // - This preserves the author's intended casing from the filename.
    const displayTitle = data.title
      ? data.title
      : filename
          .replace(/[-_]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
    
    // Merge our computed values into the data object
    return {
      ...data,  // Start with existing data
      title: displayTitle,  // Override with computed title
      slug: filename.toLowerCase().replace(/\s+/g, '-'),  // Add computed slug
    };
  })
});

const promptsCollection = defineCollection({
  loader: glob({pattern: "**/*.md", base: resolveContentPath("lost-in-public/prompts")}),
  schema: z.object({}).passthrough().transform((data) => ({
    ...data,
    // Ensure tags is always an array, even if null/undefined in frontmatter
    tags: Array.isArray(data.tags) ? data.tags
      : data.tags ? [data.tags]
      : []
  }))
});

const remindersCollection = defineCollection({
  loader: glob({pattern: "**/*.md", base: resolveContentPath("lost-in-public/reminders")}),
  schema: z.object({}).passthrough().transform((data) => ({
    ...data,
    // Ensure tags is always an array, even if null/undefined in frontmatter
    tags: Array.isArray(data.tags) ? data.tags
      : data.tags ? [data.tags]
      : []
  }))
});

const changelogContentCollection = defineCollection({
  loader: glob({pattern: "**/*.md", base: resolveContentPath("changelog--content")}),
  schema: z.object({}).passthrough().transform((data) => ({
    ...data,
    // Ensure tags is always an array, even if null/undefined in frontmatter
    tags: Array.isArray(data.tags) ? data.tags
      : data.tags ? [data.tags]
      : []
  }))
});


const changelogCodeCollection = defineCollection({
  loader: glob({pattern: "**/*.md", base: resolveContentPath("changelog--code")}),
  schema: z.object({}).passthrough().transform((data) => ({
    ...data,
    // Ensure tags is always an array, even if null/undefined in frontmatter
    tags: Array.isArray(data.tags) ? data.tags
      : data.tags ? [data.tags]
      : []
  }))
});

const reportCollection = defineCollection({
  type: 'content',
  schema: z.any() // Allow any frontmatter structure to avoid validation errors
});

// Pages collection for individual MDX files
const pagesCollection = defineCollection({
  type: 'content',
  schema: z.any() // Allow any frontmatter structure to avoid validation errors
});

// Individual markdown/mdx files with minimal validation - only ensure tags is an array
const toolCollection = defineCollection({
  loader: glob({pattern: "**/*.md", base: resolveContentPath("tooling")}),
  schema: z.object({}).passthrough().transform((data) => ({
    ...data,
    // Ensure tags is always an array, even if null/undefined in frontmatter
    tags: Array.isArray(data.tags) ? data.tags
      : data.tags ? [data.tags]
      : []
  }))
});

// ***
// Open: Specs Collection Definition
// Type: Content Collection

const specsCollection = defineCollection({
  loader: glob({pattern: "**/*.md", base: resolveContentPath("specs")}),
  schema: z.object({}).passthrough().transform((data) => ({
    ...data,
    // Ensure tags is always an array, even if null/undefined in frontmatter
    tags: Array.isArray(data.tags) ? data.tags
      : data.tags ? [data.tags]
      : []
  }))
});
// Includes:
//   - specsCollection (defineCollection)
//   - glob loader for ../content/specs
//   - Flexible schema with normalization
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// ========================================
// Affects: [specsCollection, collections export, paths export]
// Close: Specs Collection Definition
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

// ***
// Open: Issue Resolution Collection Definition (Ultra-Minimalist, following example)
// Type: Content Collection
// Purpose: For magazine-style articles detailing issue resolutions.
// Schema: Permissive, passes through all frontmatter.
// Transform: Passes data through. Astro will auto-generate id and slug.
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

const issueResolutionCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: resolveContentPath("lost-in-public/issue-resolution") }),
  schema: z.object({
    publish: z.boolean().optional(), // Allows individual entries to override collection default
  }).passthrough().transform((data) => ({
    ...data // Pass through all original frontmatter fields.
            // Astro will automatically create 'id' and 'slug' properties for the entry.
            // All frontmatter, including 'site_uuid', 'title', etc., will be under entry.data.
  }))
});

// ========================================
// Close: Issue Resolution Collection Definition
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

// ---- NEW: Configuration for Publishing Defaults ----
export const collectionPublishingDefaults = {
  'issue-resolution': {
    publishByDefault: true, // true = publish all EXCEPT items with publish: false
                            // false = publish none EXCEPT items with publish: true
  },
  // Add other collections here as needed
};
// ---- END NEW ----

// Define where to find the content - using environment-aware paths
export const paths = {
  'cards': 'cards',
  'changelog--content': resolveContentPath('changelog--content'),
  'changelog--code': resolveContentPath('changelog--code'),
  'essays': resolveContentPath('essays'),
  'concepts': resolveContentPath('concepts'),
  'reports': resolveContentPath('reports'),
  'tooling': resolveContentPath('tooling'),
  'vocabulary': resolveContentPath('vocabulary'),
  'prompts': resolveContentPath('lost-in-public/prompts'),
  'reminders': resolveContentPath('lost-in-public/reminders'),
  'specs': resolveContentPath('specs'),
  'issue-resolution': resolveContentPath('lost-in-public/issue-resolution'),
};

// Export the collections
export const collections = {
  'cards': cardCollection,
  'concepts': conceptsCollection,
  'essays': essaysCollection,
  'vocabulary': vocabularyCollection,
  'changelog--content': changelogContentCollection,
  'changelog--code': changelogCodeCollection,
  'reports': reportCollection,
  'pages': pagesCollection,
  'tooling': toolCollection,
  'prompts': promptsCollection,
  'reminders': remindersCollection,
  'specs': specsCollection,
  'issue-resolution': issueResolutionCollection,
};