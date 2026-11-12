// Shared helpers for the Market Categories collection (concepts/Market-Categories).
import type { CollectionEntry } from 'astro:content';
import { slugify } from './slugify';

type MarketCategoryEntry = CollectionEntry<'market-categories'>;

function baseFilename(entry: MarketCategoryEntry): string {
  const file = entry.filePath ?? entry.id;
  return file.split('/').pop()!.replace(/\.(md|mdx)$/, '');
}

// Match routeManager: frontmatter slug wins, otherwise the slugified filename,
// so [[Wikilinks]] and these pages agree on one URL.
export function marketCategorySlug(entry: MarketCategoryEntry): string {
  const data = entry.data as any;
  return slugify(data?.slug || baseFilename(entry));
}

export function marketCategoryTitle(entry: MarketCategoryEntry): string {
  return (entry.data as any)?.title || baseFilename(entry);
}

// Category profiles open with an italic one-line definition under "# Snapshot"; use it as the lede.
export function marketCategoryLede(entry: MarketCategoryEntry): string {
  const data = entry.data as any;
  if (data?.lede) return data.lede;
  const match = entry.body?.match(/^_(.+)_\s*$/m);
  return match ? match[1].replace(/[“”]/g, '"').trim() : '';
}

export function isPublishedMarketCategory(entry: MarketCategoryEntry): boolean {
  return (entry.data as any)?.publish !== false;
}
