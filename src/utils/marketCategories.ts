// Shared helpers for the Market Categories collection (concepts/Market-Categories).
import { getCollection, type CollectionEntry } from 'astro:content';
import { ROUTE_PATHS } from './routing/routeManager';
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

// Card data for every published category, most recently modified first.
// Shared by /market-categories and the Market Categories tab on /market-map/it.
export async function marketCategoryArticles() {
  const entries = (await getCollection('market-categories')).filter(isPublishedMarketCategory);

  return entries.map((entry) => {
    const data = entry.data as any;
    const toArray = (singularKey: string, pluralKey: string): string[] =>
      [data?.[singularKey], data?.[pluralKey]].filter(Boolean).flat();

    let date = data?.date_modified;
    if (date instanceof Date) date = date.toISOString().split('T')[0];

    const title = marketCategoryTitle(entry);

    return {
      id: entry.id,
      title,
      slug: `${ROUTE_PATHS.MARKET_CATEGORY.BASE}/${marketCategorySlug(entry)}`,
      banner_image: data?.banner_image,
      portrait_image: data?.portrait_image,
      imageAlt: `Image for ${title}`,
      date,
      lede: marketCategoryLede(entry),
      tags: toArray('tag', 'tags'),
      authors: toArray('author', 'authors'),
      categories: toArray('category', 'categories'),
    };
  }).sort((a, b) => {
    if (!a.date && !b.date) return 0;
    if (!a.date) return 1;
    if (!b.date) return -1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}
