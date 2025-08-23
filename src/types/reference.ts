import type { CollectionEntry } from 'astro:content';

export interface ReferenceItem extends CollectionEntry<'vocabulary' | 'concepts'> {
  slug: string;
  originalFilename: string;
  data: {
    title: string;
    aliases?: string[];
    [key: string]: any;
  };
}

export interface ReferenceSection {
  title: string;
  items: ReferenceItem[];
  totalWords: number;
}
