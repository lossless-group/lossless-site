/* import { defineCollection, z } from 'astro:content';

const cardCollection = defineCollection({
  type: 'data',
  schema: z.object({
    title: z.string().catch('Untitled Entry'),
    content: z.string().catch(''),
    imageUrl: z.string().optional(),
    order: z.number().optional(),
    tags: z.array(z.string()).optional()
  })
});

const changelogContentCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().catch('Untitled Entry'),
    lede: z.string().optional(),
    date: z.coerce.date().catch(() => new Date()),
    date_last_updated: z.coerce.date().optional(),
    at_semantic_version: z.string().optional(),
    category: z.string().optional(),
    tags: z.array(z.string()).optional()
  })
});

const changelogCodeCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().catch('Untitled Entry'),
    lede: z.string().optional(),
    date: z.coerce.date().catch(() => new Date()),
    date_last_updated: z.coerce.date().optional(),
    at_semantic_version: z.string().optional(),
    category: z.enum(['Feature', 'Fix', 'Refactor', 'Documentation', 'Other']).optional(),
    tags: z.array(z.string()).optional()
  })
});

const reportCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().catch('Untitled Report'),
    date: z.coerce.date().catch(() => new Date()),
    datetime: z.coerce.date().optional(),
    authors: z.array(z.string()).optional(),
    augmented_with: z.string().optional(),
    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
    description: z.string().optional(),
  })
});

const toolCollection = defineCollection({
  type: 'content',
  schema: z.object({
    url: z.string().catch(''),
    site_name: z.string().optional(),
    title: z.string().optional(),
    zinger: z.string().optional(),
    image: z.string().optional(),
    favicon: z.string().optional(),
    description: z.string().optional(),
    description_site_cp: z.string().optional(),
    tags: z.array(z.string()).optional(),
    og_screenshot_url: z.string().optional(),
    og_last_fetch: z.string().optional(),
  })
});

// Define collection configuration
export const collections = {
  'cards': cardCollection,
  'changelog--code': changelogCodeCollection,
  'changelog--content': changelogContentCollection,
  'reports': reportCollection,
  'tooling': toolCollection,
} as const; */