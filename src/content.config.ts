import { defineCollection, z, getCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';

// Cards collection - respects JSON structure with cards array
const cardCollection = defineCollection({
  type: 'data',
  schema: z.object({
    cards: z.array(z.any())
  }).passthrough()
});

const visualsCollection = defineCollection({
  loader: glob({pattern: "**/*.{png,jpg,jpeg,gif,webp,svg}", base: "./src/generated-content/visuals"}),  // Explicitly list image extensions
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
    
    // Convert filename to title case for display
    const titleCase = filename
      .split(/[\s-]+/)  // Split on spaces or dashes
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    return {
      ...data,
      id: filename,  // Original filename as id
      title: data.title || titleCase,  // Use provided title or computed one
      format: extension as 'png' | 'jpg' | 'jpeg' | 'gif' | 'webp' | 'svg',
      slug: filename.toLowerCase().replace(/\s+/g, '-')  // Add computed slug
    };
  })
});

const vocabularyCollection = defineCollection({
  loader: glob({pattern: "**/*.md", base: "./src/generated-content/vocabulary"}),
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
  loader: glob({pattern: "**/*.md", base: "./src/generated-content/concepts"}),
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
const essaysCollection = defineCollection({
  loader: glob({pattern: "**/*.md", base: "./src/generated-content/essays"}),
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
    };
  })
});

const promptsCollection = defineCollection({
  loader: glob({pattern: "**/*.md", base: "./src/generated-content/lost-in-public/prompts"}),
  schema: z.object({}).passthrough().transform((data) => ({
    ...data,
    // Ensure tags is always an array, even if null/undefined in frontmatter
    tags: Array.isArray(data.tags) ? data.tags
      : data.tags ? [data.tags]
      : []
  }))
});

const remindersCollection = defineCollection({
  loader: glob({pattern: "**/*.md", base: "./src/generated-content/lost-in-public/reminders"}),
  schema: z.object({}).passthrough().transform((data) => ({
    ...data,
    // Ensure tags is always an array, even if null/undefined in frontmatter
    tags: Array.isArray(data.tags) ? data.tags
      : data.tags ? [data.tags]
      : []
  }))
});

const changelogContentCollection = defineCollection({
  loader: glob({pattern: "**/*.md", base: "./src/generated-content/changelog--content"}),
  schema: z.object({}).passthrough().transform((data) => ({
    ...data,
    // Ensure tags is always an array, even if null/undefined in frontmatter
    tags: Array.isArray(data.tags) ? data.tags
      : data.tags ? [data.tags]
      : []
  }))
});


const changelogCodeCollection = defineCollection({
  loader: glob({pattern: "**/*.md", base: "./src/generated-content/changelog--code"}),
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
  loader: glob({pattern: "**/*.md", base: "./src/generated-content/tooling"}),
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
// Includes:
//   - specsCollection (defineCollection)
//   - glob loader for ../content/specs
//   - Flexible schema with normalization
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

const specsCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/generated-content/specs" }),
  schema: z.object({}).passthrough().transform((data) => ({
    ...data,
    tags: Array.isArray(data.tags) ? data.tags : data.tags ? [data.tags] : []
  }))
});

// ========================================
// Affects: [specsCollection, collections export, paths export]
// Close: Specs Collection Definition
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

// Define where to find the content - using relative paths from src/content
export const paths = {
  'cards': 'cards',
  'changelog--content': './src/generated-content/changelog--content',
  'changelog--code': './src/generated-content/changelog--code',
  'essays': './src/generated-content/essays',
  'concepts': './src/generated-content/concepts',
  'reports': './src/generated-content/reports',
  'tooling': './src/generated-content/tooling',
  'vocabulary': './src/generated-content/vocabulary',
  'prompts': './src/generated-content/lost-in-public/prompts',
  'reminders': './src/generated-content/lost-in-public/reminders',
  'specs': './src/generated-content/specs',
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
};