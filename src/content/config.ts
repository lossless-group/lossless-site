// src/content/config.ts
import { defineCollection, z } from 'astro:content';

// Define the mdx-pages collection
const mdxPages = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    // Add any other frontmatter fields you need for your MDX pages
  }),
});

export const collections = {
  'mdx-pages': mdxPages,
};
