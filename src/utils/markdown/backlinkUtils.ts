/**
 * Utility functions for handling backlinks
 * Shared between remark-backlinks plugin and backlink redirect page
 */

// Match [[...]] but skip if it's a visual path
export const backlinkRegex = /\[\[((?!.*?visuals).*?)(?:\|(.*?))?\]\]/gi;

/**
 * Extract the path from a backlink string
 * @param backlink - The backlink string (e.g., "[[Page Name]]" or "[[path/to/page|Display Text]]")
 * @returns The extracted path, or null if not a valid backlink
 */
export function extractBacklinkPath(backlink: string): string | null {
  const match = backlink.match(/\[\[((?!.*?visuals).*?)(?:\|(.*?))?\]\]/i);
  return match ? match[1] : null;
}

/**
 * Extract both path and display text from a backlink string
 * @param backlink - The backlink string
 * @returns Object with path and displayText, or null if not a valid backlink
 */
export function extractBacklinkComponents(backlink: string): { path: string; displayText?: string } | null {
  const match = backlink.match(/\[\[((?!.*?visuals).*?)(?:\|(.*?))?\]\]/i);
  if (!match) return null;
  
  return {
    path: match[1],
    displayText: match[2] || undefined
  };
}

/**
 * Check if a string is a valid backlink
 * @param text - The text to check
 * @returns True if the text matches backlink format
 */
export function isBacklink(text: string): boolean {
  // Use a non-global regex for testing to avoid state issues
  return /\[\[((?!.*?visuals).*?)(?:\|(.*?))?\]\]/i.test(text);
}

/**
 * Get all backlinks from a text string
 * @param text - The text to search for backlinks
 * @returns Array of backlink matches
 */
export function getAllBacklinks(text: string): RegExpMatchArray[] {
  return Array.from(text.matchAll(backlinkRegex));
}
