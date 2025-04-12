import { defineCollection, z, getCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';

// Cards collection - respects JSON structure with cards array
const cardCollection = defineCollection({
  type: 'data',
  schema: z.object({
    cards: z.array(z.any())
  }).passthrough()
});

const vocabularyCollection = defineCollection({
  loader: glob({pattern: "**/*.md", base: "../content/vocabulary"}),
  schema: z.object({
    aliases: z.union([
      z.string().transform(str => [str]), // Single string -> array with one string
      z.array(z.string())                 // Already an array
    ]).optional().default([])             // Default to empty array if missing
  }).passthrough().transform((data, context) => {
    // Get the filename without extension
    const filename = String(context.path).split('/').pop()?.replace(/\.md$/, '') || '';
    
    // Convert filename to title case for display
    const titleCase = filename
      .split(/[\s-]+/)  // Split on spaces or dashes
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    // Merge our computed values into the data object
    return {
      ...data,  // Start with existing data
      title: titleCase,  // Override with computed title
      slug: filename.toLowerCase().replace(/\s+/g, '-'),  // Add computed slug
      aliases: data.aliases || []  // Ensure aliases exists
    };
  })
});

// Concepts collection - follows same pattern as vocabulary
const conceptsCollection = defineCollection({
  loader: glob({pattern: "**/*.md", base: "../content/concepts"}),
  schema: z.object({
    aliases: z.union([
      z.string().transform(str => [str]), // Single string -> array with one string
      z.array(z.string())                 // Already an array
    ]).optional().default([])             // Default to empty array if missing
  }).passthrough().transform((data, context) => {
    // Get the filename without extension
    const filename = String(context.path).split('/').pop()?.replace(/\.md$/, '') || '';
    
    // Convert filename to title case for display
    const titleCase = filename
      .split(/[\s-]+/)  // Split on spaces or dashes
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    // Merge our computed values into the data object
    return {
      ...data,  // Start with existing data
      title: titleCase,  // Override with computed title
      slug: filename.toLowerCase().replace(/\s+/g, '-'),  // Add computed slug
      aliases: data.aliases || []  // Ensure aliases exists
    };
  })
});

const changelogContentCollection = defineCollection({
  loader: glob({pattern: "**/*.md", base: "../content/changelog--content"}),
  schema: z.object({}).passthrough().transform((data) => ({
    ...data,
    // Ensure tags is always an array, even if null/undefined in frontmatter
    tags: Array.isArray(data.tags) ? data.tags
      : data.tags ? [data.tags]
      : []
  }))
});

const changelogCodeCollection = defineCollection({
  loader: glob({pattern: "**/*.md", base: "../content/changelog--code"}),
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

// Pages collection for individual MDX files
const markdownFileContent = defineCollection({
  type: 'data',
  schema: z.any() // Allow any frontmatter structure to avoid validation errors
});

// Individual markdown/mdx files with minimal validation - only ensure tags is an array
const toolCollection = defineCollection({
  loader: glob({pattern: "**/*.md", base: "../content/tooling"}),
  schema: z.object({}).passthrough().transform((data) => ({
    ...data,
    // Ensure tags is always an array, even if null/undefined in frontmatter
    tags: Array.isArray(data.tags) ? data.tags
      : data.tags ? [data.tags]
      : []
  }))
});

// Define where to find the content - using relative paths from src/content
export const paths = {
  'cards': 'cards',
  'changelog--content': '../content/changelog--content',
  'changelog--code': '../content/changelog--code',
  'concepts': '../content/concepts',
  'reports': '../content/reports',
  'tooling': '../content/tooling',
  'vocabulary': '../content/vocabulary'
};

// Export the collections
export const collections = {
  'cards': cardCollection,
  'concepts': conceptsCollection,
  'vocabulary': vocabularyCollection,
  'changelog--content': changelogContentCollection,
  'changelog--code': changelogCodeCollection,
  'reports': reportCollection,
  'pages': pagesCollection,
  'tooling': toolCollection
};