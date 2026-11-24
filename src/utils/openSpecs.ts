import { getCollection } from 'astro:content';
import { processEntries } from './slugify';

/**
 * Card data for the Open Specs list: published specs link to their page,
 * unpublished ones (from the `spec-ideas` collection) carry no URL and render
 * as teaser cards.
 */
export interface SpecCardData {
  id: string;
  title: string;
  lede?: string;
  status: string;
  image?: string;
  tags: string[];
  href?: string;
  published: boolean;
}

const fileTitle = (filePath: string | undefined, id: string) =>
  (filePath?.split('/').pop() ?? id).replace(/\.md$/, '').replace(/-/g, ' ');

const toTags = (tags: unknown): string[] =>
  Array.isArray(tags) ? tags.map(String) : typeof tags === 'string' && tags ? [tags] : [];

export async function getOpenSpecs(): Promise<SpecCardData[]> {
  const published = processEntries((await getCollection('specs')) as any).map((entry: any) => {
    const slug = entry.slug.split('/').pop();
    return {
      id: entry.id,
      title: entry.data.title,
      lede: entry.data.lede,
      status: entry.data.status || 'Idea',
      image: entry.data.portrait_image || entry.data.banner_image,
      tags: toTags(entry.data.tags),
      href: `/vibe-with/specs/${slug}`,
      published: true,
    } satisfies SpecCardData;
  });

  const ideas = (await getCollection('spec-ideas')).map((entry) => ({
    id: entry.id,
    title: entry.data.title || fileTitle(entry.filePath, entry.id),
    lede: entry.data.lede,
    status: entry.data.status || 'Idea',
    image: entry.data.portrait_image || entry.data.banner_image,
    tags: toTags(entry.data.tags),
    published: false,
  } satisfies SpecCardData));

  const byTitle = (a: SpecCardData, b: SpecCardData) => a.title.localeCompare(b.title);
  return [...published.sort(byTitle), ...ideas.sort(byTitle)];
}
