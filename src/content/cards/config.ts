import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';

export const cardCollection = defineCollection({
  type: 'data',
  schema: z.object({
    cards: z.array(z.object({
      title: z.string(),
      content: z.string(),
      order: z.number().optional(),
      tags: z.array(z.string()).optional()
    }))
  })
});

export const collections = {
  'cards': cardCollection,
};
