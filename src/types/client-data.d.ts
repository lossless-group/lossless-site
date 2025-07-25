import type { CollectionEntry } from 'astro:content';

export interface OpenGraphData {
  // Basic OpenGraph fields
  title: string;
  description: string;
  image?: string;
  
  // Hero section fields
  heroTitle?: string;
  heroSubtitle?: string;
  heroDescription?: string;
  heroImage?: string;
  ctaText?: string;
  ctaUrl?: string;
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
