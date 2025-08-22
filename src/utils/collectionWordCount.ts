import { getCollection, type CollectionEntry } from 'astro:content';
import { countWordsInMarkdown } from './countWords';

type CollectionName = 'vocabulary' | 'concepts';
type CollectionEntryType = CollectionEntry<CollectionName>;

/**
 * Gets the total word count for a collection
 * @param collectionName Name of the collection (e.g., 'vocabulary', 'concepts')
 * @returns Promise that resolves to the total word count
 */
export async function getCollectionWordCount(collectionName: CollectionName): Promise<number> {
  try {
    const entries = await getCollection(collectionName);
    let totalWords = 0;
    
    for (const entry of entries) {
      // Count words in the main content (entry.body is the markdown content)
      const body = 'body' in entry ? String(entry.body) : '';
      totalWords += countWordsInMarkdown(body);
      
      // Count words in frontmatter fields that might contain text
      const frontmatterText = Object.entries(entry.data)
        .filter(([_, value]) => typeof value === 'string')
        .map(([_, value]) => String(value))
        .join(' ');
      
      totalWords += frontmatterText.split(/\s+/).filter(word => word.length > 0).length;
    }
    
    return totalWords;
  } catch (error) {
    console.error(`Error getting word count for collection ${collectionName}:`, error);
    return 0;
  }
}

/**
 * Gets word counts for multiple collections
 * @param collectionNames Array of collection names
 * @returns Object mapping collection names to word counts
 */
export async function getWordCounts(collectionNames: CollectionName[]): Promise<Record<CollectionName, number>> {
  const counts = {} as Record<CollectionName, number>;
  
  await Promise.all(
    collectionNames.map(async (name) => {
      counts[name] = await getCollectionWordCount(name);
    })
  );
  
  return counts;
}
