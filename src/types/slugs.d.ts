/**
 * Type definitions for slug utilities
 */

declare module '@utils/slugify' {
  /**
   * Converts a string to a URL-friendly slug
   * @param input - The string to convert to a slug
   * @returns The slugified string
   * @example
   * slugify('Hello World!') // 'hello-world'
   */
  export function slugify(input: string): string;

  /**
   * Generates a reference slug from a filename or path
   * @param filename - The filename or path to generate a slug from
   * @returns A normalized slug
   */
  export function getReferenceSlug(filename: string): string;

  /**
   * Processes an array of content entries to ensure they have proper titles and slugs
   * @param entries - Array of content entries to process
   * @returns The processed entries with titles and slugs
   */
  export function processEntries<T extends { filePath: string; data: { title?: string }; slug?: string }>(
    entries: T[]
  ): T[];

  /**
   * Converts a string to title case (first letter of each word capitalized)
   * @param str - The string to convert
   * @returns The string in title case
   */
  export function toProperCase(str: string): string;

  /**
   * Extracts all text content from a node and its children
   * @param children - The node or array of nodes to extract text from
   * @returns The concatenated text content
   */
  export function extractAllText(children: any): string;
}

// Augment the global namespace for direct usage
declare global {
  /**
   * Converts a string to a URL-friendly slug
   */
  function slugify(input: string): string;
}
