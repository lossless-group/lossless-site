/**
 * wordCount.ts
 * Utility to count words in MDAST content and calculate reading time
 */

import type { Root, Node } from 'mdast';

/**
 * Recursively extract text from MDAST nodes
 */
function extractText(node: any): string {
  if (!node) return '';

  // Handle text nodes
  if (node.type === 'text') {
    return node.value || '';
  }

  // Handle inline code
  if (node.type === 'inlineCode') {
    return node.value || '';
  }

  // Handle code blocks - count them but don't inflate word count too much
  if (node.type === 'code') {
    // Count lines instead of words for code blocks
    const lines = (node.value || '').split('\n').length;
    return ' '.repeat(lines * 5); // ~5 words per line of code
  }

  // Skip certain node types that shouldn't count toward reading
  if (['tableOfContents', 'yaml', 'toml', 'import', 'export'].includes(node.type)) {
    return '';
  }

  // Recursively process children
  let text = '';
  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      text += extractText(child) + ' ';
    }
  }

  return text;
}

/**
 * Count words in text
 */
function countWords(text: string): number {
  if (!text || typeof text !== 'string') return 0;

  // Remove extra whitespace and split by word boundaries
  const words = text
    .trim()
    .replace(/\s+/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 0);

  return words.length;
}

/**
 * Calculate word count from MDAST content
 */
export function getWordCount(content: Root | Node): number {
  const text = extractText(content);
  return countWords(text);
}

/**
 * Calculate reading time in minutes
 * @param wordCount - Number of words
 * @param wordsPerMinute - Average reading speed (default: 260)
 */
export function getReadingTime(wordCount: number, wordsPerMinute: number = 260): number {
  if (wordCount === 0) return 0;
  return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * Format reading time as a human-readable string
 */
export function formatReadingTime(minutes: number): string {
  if (minutes === 0) return 'Less than a minute';
  if (minutes === 1) return '1 minute';
  return `${minutes} minutes`;
}

/**
 * Get complete reading stats from MDAST content
 */
export function getReadingStats(content: Root | Node) {
  const wordCount = getWordCount(content);
  const readingMinutes = getReadingTime(wordCount);
  const readingTimeFormatted = formatReadingTime(readingMinutes);

  return {
    wordCount,
    readingMinutes,
    readingTime: readingTimeFormatted
  };
}
