import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Cards collection - respects JSON structure with cards array
const cardCollection = defineCollection({
  type: 'data',
  schema: z.object({
    cards: z.array(z.any())
  }).passthrough()
});

const changelogContentCollection = defineCollection({
  schema: z.array(z.any())
});

const changelogCodeCollection = defineCollection({
  schema: z.array(z.any())
});

const reportCollection = defineCollection({
  schema: z.array(z.any())
});

// Pages collection for individual MDX files
const pagesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    // Other fields are optional and flexible
    [z.string()]: z.any()
  }).passthrough() // Allow unknown keys
});

// Individual markdown/mdx files
const toolCollection = defineCollection({
  schema: z.object({}).passthrough(), // Accept any object shape
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: '../content/tooling'
  })
});

// Define where to find the content
export const paths = {
  'cards': 'cards',
  'changelog--content': '../content/changelog--content',
  'changelog--code': '../content/changelog--code',
  'reports': 'reports',
  'tooling': '../content/tooling'
};

export const collections = {
  'cards': cardCollection,
  'changelog--content': changelogContentCollection,
  'changelog--code': changelogCodeCollection,
  'reports': reportCollection,
  'pages': pagesCollection,
  'tooling': toolCollection
};