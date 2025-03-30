import { defineCollection, z } from 'astro:content';
import { glob, file } from 'astro/loaders';


// Cards collection - respects JSON structure with cards array
const cardCollection = defineCollection({
  type: 'data',
  schema: z.object({
    cards: z.array(z.any())
  }).passthrough()
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

// authors
const authorsCollection = defineCollection({
	loader: glob({ pattern: "**/[^_]*{md,mdx}", base: "./src/content/authors" }),
	schema: ({ image }) =>
		z.object({
			name: z.string(),
			avatar: image(),
			about: z.string(),
			email: z.string(),
			authorLink: z.string(), // author page link. Could be a personal website, github, twitter, whatever you want
		}),
});

const promptCollection = defineCollection({
  loader: glob({pattern: "**/*.md", base: "../content/lost-in-public/prompts"}),
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
  'tooling': '../content/tooling'
};

// Export the collections
export const collections = {
  'cards': cardCollection,
  'changelog--content': changelogContentCollection,
  'changelog--code': changelogCodeCollection,
  'reports': reportCollection,
  'authors': authorsCollection,
  'pages': pagesCollection,
  'tooling': toolCollection,
  'prompts': promptCollection
};