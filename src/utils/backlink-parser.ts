/**
 * Backlink parsing utilities
 * Reusable functions for parsing wiki-style backlinks [[Page]] and [[Path|Display]]
 * Follows the same patterns as remark-backlinks.ts
 */

import { transformContentPathToRoute } from './routing/routeManager';

// Match [[...]] but skip if it's a visual path - same regex as remark-backlinks
const backlinkRegex = /\[\[((?!.*?visuals).*?)(?:\|(.*?))?\]\]/gi;

export interface ParsedBacklink {
  fullMatch: string;
  path: string;
  displayText: string;
  transformedRoute: string;
}

/**
 * Parse a single backlink string and extract path and display text
 * @param backlinkText - The backlink text like "[[Vocabulary/Agile|Agile]]"
 * @returns ParsedBacklink object or null if not a valid backlink
 */
export function parseBacklink(backlinkText: string): ParsedBacklink | null {
  const match = backlinkRegex.exec(backlinkText);
  backlinkRegex.lastIndex = 0; // Reset regex state
  
  if (!match) return null;
  
  const [fullMatch, path, displayText] = match;
  
  // Use the route manager to transform the path (same as remark-backlinks)
  const transformedRoute = transformContentPathToRoute(path);
  
  // Get display text, falling back to the last segment of the path
  const finalDisplayText = displayText || path.split('/').pop()?.replace(/\.md$/, '').replace(/-/g, ' ') || '';
  
  return {
    fullMatch,
    path,
    displayText: finalDisplayText,
    transformedRoute
  };
}

/**
 * Extract all backlinks from a text string
 * @param text - The text containing backlinks
 * @returns Array of ParsedBacklink objects
 */
export function extractBacklinks(text: string): ParsedBacklink[] {
  const matches = Array.from(text.matchAll(backlinkRegex));
  
  return matches.map(match => {
    const [fullMatch, path, displayText] = match;
    const transformedRoute = transformContentPathToRoute(path);
    const finalDisplayText = displayText || path.split('/').pop()?.replace(/\.md$/, '').replace(/-/g, ' ') || '';
    
    return {
      fullMatch,
      path,
      displayText: finalDisplayText,
      transformedRoute
    };
  });
}

/**
 * Extract backlink paths from MOC-style content blocks
 * Handles both [[Path|Display]] and [[Path]] formats
 * @param content - The content block containing backlinks
 * @returns Array of path strings (without display text)
 */
export function extractBacklinkPaths(content: string): string[] {
  const lines = content.split(/\r?\n/);
  const paths: string[] = [];
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Skip empty lines and non-list items
    if (!trimmedLine || (!trimmedLine.startsWith('-') && !trimmedLine.startsWith('*'))) {
      continue;
    }
    
    // Look for backlinks in list items
    const backlinkMatch = trimmedLine.match(/^[-*]\s*\[\[((?!.*?visuals).*?)(?:\|.*?)?\]\]/);
    if (backlinkMatch) {
      const path = backlinkMatch[1].trim();
      if (path) {
        paths.push(path);
      }
    }
  }
  
  return paths;
}

/**
 * Extract display text from backlink paths for use in lookups
 * Handles both [[Path|Display]] and [[Path]] formats
 * @param content - The content block containing backlinks  
 * @returns Array of display text strings for matching against collections
 */
export function extractBacklinkDisplayTexts(content: string): string[] {
  const lines = content.split(/\r?\n/);
  const displayTexts: string[] = [];
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Skip empty lines and non-list items
    if (!trimmedLine || (!trimmedLine.startsWith('-') && !trimmedLine.startsWith('*'))) {
      continue;
    }
    
    // Look for backlinks in list items - capture both path and display text
    const backlinkMatch = trimmedLine.match(/^[-*]\s*\[\[((?!.*?visuals).*?)(?:\|(.*?))?\]\]/);
    if (backlinkMatch) {
      const path = backlinkMatch[1].trim();
      const displayText = backlinkMatch[2]?.trim();
      
      if (path) {
        // Use display text if provided, otherwise fall back to last segment of path
        const finalDisplayText = displayText || path.split('/').pop()?.replace(/\.md$/, '').replace(/-/g, ' ') || '';
        displayTexts.push(finalDisplayText);
      }
    }
  }
  
  return displayTexts;
}
