import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Accept any content, no validation
const cardCollection = defineCollection({
  type: 'data',
  schema: z.any()
});

const changelogContentCollection = defineCollection({
  schema: z.any()
});

const changelogCodeCollection = defineCollection({
  schema: z.any()
});

const reportCollection = defineCollection({
  schema: z.any()
});

// Accept any content, but ensure tags are always an array
const toolCollection = defineCollection({
  schema: z.object({
    // But ensure tags is always an array of strings
    tags: z.union([
      z.array(z.string()),
      z.string().transform(tag => [tag]),
      z.undefined().transform(() => [])
    ]).default([])
  }).passthrough(), // Allow any other fields with passthrough
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
  'tooling': toolCollection
};