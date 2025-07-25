import type { CollectionEntry } from 'astro:content';

export interface OpenGraphData {
  title: string;
  description: string;
  image?: string;
}

export interface ReferenceItem {
  id: string;
  slug: string;
  collection: 'vocabulary' | 'concepts';
  data: {
    title: string;
    aliases: string[];
    description: string;
    tags: string[];
  };
  originalFilename: string;
}

export interface ClientPortalProps {
  client: string;
  currentEssay: CollectionEntry<'client-content'>;
  essays: CollectionEntry<'client-content'>[];
  clientVocab: CollectionEntry<'vocabulary'>[];
  clientConcepts: CollectionEntry<'concepts'>[];
}

export interface ReferenceTerms {
  vocabulary: string[];
  concepts: string[];
}
