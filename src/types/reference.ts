import type { CollectionEntry } from 'astro:content';

export interface ReferenceItem {
  id: string;
  slug: string;
  originalFilename: string;
  collection: 'vocabulary' | 'concepts';
  body?: string;
  data: {
    title: string;
    aliases?: string[];
    description?: string;
    // Support both at_semantic_version and version fields
    at_semantic_version?: string;
    version?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown; // Allow any other properties
}

export interface ReferenceSection {
  title: string;
  items: ReferenceItem[];
  totalWords: number;
}
