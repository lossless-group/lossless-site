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
    // No required frontmatter, but we'll pass through any that exists
    aliases: z.union([
      z.string().transform(str => [str]), // Single string -> array with one string
      z.array(z.string())                 // Already an array
    ]).optional().default([])             // Default to empty array if missing
  }).passthrough().transform((data, context) => {
    // Get the filename without extension
    const filename = String(context.path).split('/').pop()?.replace(/\.md$/, '') || '';
    
    return {
      // Extract title from filename
      title: filename,
      // Convert filename to slug
      slug: filename.toLowerCase().replace(/\s+/g, '-'),
      // Pass through any frontmatter
      ...data
    };
  })
});

const changelogContentCollection = defineCollection({
  loader: glob({pattern: "**/*.md", base: "../content/changelog--content"}),
  schema: z.object({}).passthrough().transform((data) => ({
    ...data,
    // Ensure tags is always an array, even if null/undefined in frontmatter
    tags: Array.isArray(data.tags) ? data.tags : [] as string[],
    authors: Array.isArray(data.authors) ? data.authors : [] as string[],
    // Map snake_case context_setter to camelCase contextSetter, ensuring string type
    contextSetter: (data.context_setter ?? "") as string
  }))
});

const changelogCodeCollection = defineCollection({
  loader: glob({pattern: "**/*.md", base: "../content/changelog--code"}),
  schema: z.object({}).passthrough().transform((data) => ({
    ...data,
    // Ensure tags is always an array, even if null/undefined in frontmatter
    tags: Array.isArray(data.tags) ? data.tags : [] as string[],
    authors: Array.isArray(data.authors) ? data.authors : [] as string[]
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
    tags: Array.isArray(data.tags) ? data.tags : [] as string[],
    authors: Array.isArray(data.authors) ? data.authors : [] as string[]
  }))
});

// Define where to find the content - using relative paths from src/content
export const paths = {
  'cards': 'cards',
  'changelog--content': '../content/changelog--content',
  'changelog--code': '../content/changelog--code',
  'reports': 'reports',
  'tooling': '../content/tooling',
  'vocabulary': '../content/vocabulary'
};

// Export the collections
export const collections = {
  'cards': cardCollection,
  'vocabulary': vocabularyCollection,
  'changelog--content': changelogContentCollection,
  'changelog--code': changelogCodeCollection,
  'reports': reportCollection,
  'pages': pagesCollection,
  'tooling': toolCollection
};