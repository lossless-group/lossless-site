/**
 * Route Manager for content paths
 * This module provides a centralized way to map content paths to web routes.
 * It allows for custom route mappings to be defined for different content types.
 */

// Define the interface for route mappings
interface RouteMapping {
  contentPath: string;  // The path prefix in the content directory
  routePath: string;    // The corresponding web route
}

// Define the default route mappings
const defaultRouteMappings: RouteMapping[] = [
  {
    contentPath: 'vocabulary',
    routePath: 'more-about'
  },
  {
    contentPath: 'concepts',
    routePath: 'more-about'
  },
  {
    contentPath: 'lost-in-public',
    routePath: 'vibe-with'
  },
  {
    contentPath: 'specs',
    routePath: 'vibe-with/specs'
  },
  {
    contentPath: 'tooling',
    routePath: 'toolkit'
  },
  {
    contentPath: 'essays',
    routePath: 'read/essays'
  },
  {
    contentPath: 'client-content',
    routePath: 'client'
  },
  // {
  //   contentPath: 'content/visuals',
  //   routePath: 'content/visuals'
  // },
  // {
  //   contentPath: 'assets',
  //   routePath: 'assets'
  // }
  // Add more mappings as needed
];

// Store custom route mappings that can be added at runtime
let customRouteMappings: RouteMapping[] = [];

/**
 * Transform a content path to its corresponding web route
 * 
 * @param path - The content path to transform (e.g., "vocabulary/Software Development")
 * @returns The transformed web route (e.g., "/more-about/software-development")
 */

import { existsSync, readdirSync, statSync } from 'fs';
import path from 'path';
import { contentBasePath, DEBUG_BACKLINKS } from '../envUtils.ts';
import { getReferenceSlug, slugify } from '../slugify.ts';

function isValidContentFile(contentPath: string): boolean {
  // Check for both .md and .mdx extensions
  const mdPath = path.resolve(contentBasePath, `${contentPath}.md`);
  const mdxPath = path.resolve(contentBasePath, `${contentPath}.mdx`);
  
  if (DEBUG_BACKLINKS) {
    console.log('[routeManager] Checking content file:', { contentPath, mdPath, mdxPath });
  }
  
  return existsSync(mdPath) || existsSync(mdxPath);
}

function resolveWithMappings(normalizedPath: string): string {
  if (!normalizedPath || typeof normalizedPath !== 'string') {
    if (DEBUG_BACKLINKS) {
      console.warn('[routeManager] Invalid path in resolveWithMappings:', normalizedPath);
    }
    return '/not-found';
  }

  if (DEBUG_BACKLINKS) {
    console.log('[routeManager] Resolving path:', normalizedPath);
  }

  // Split path into segments and filter out empty segments
  const segments = normalizedPath.split('/').filter(Boolean);
  if (segments.length === 0) {
    if (DEBUG_BACKLINKS) {
      console.warn('[routeManager] Empty path segments after normalization');
    }
    return '/not-found';
  }

  const contentType = segments[0];
  const allMappings = [...customRouteMappings, ...defaultRouteMappings];
  
  if (DEBUG_BACKLINKS) {
    console.log('[routeManager] All available mappings:', allMappings);
  }

  // Try to find a matching mapping
  const mapping = allMappings.find(m => {
    const isExactMatch = contentType === m.contentPath;
    const isPrefixMatch = normalizedPath.startsWith(`${m.contentPath}/`);
    
    if (DEBUG_BACKLINKS && (isExactMatch || isPrefixMatch)) {
      console.log('[routeManager] Found matching mapping:', { 
        contentPath: m.contentPath, 
        routePath: m.routePath,
        isExactMatch,
        isPrefixMatch
      });
    }
    
    return isExactMatch || isPrefixMatch;
  });

  if (mapping) {
    let relativePath = normalizedPath;
    
    // Only strip the content path if it's not the entire path
    if (normalizedPath !== mapping.contentPath) {
      relativePath = normalizedPath.substring(mapping.contentPath.length).replace(/^\/+/, '');
    } else {
      relativePath = '';
    }
    
    const resultPath = `/${mapping.routePath}${relativePath ? `/${relativePath}` : ''}`;
    
    if (DEBUG_BACKLINKS) {
      console.log('[routeManager] Mapped path:', {
        original: normalizedPath,
        routePath: mapping.routePath,
        relativePath,
        resultPath
      });
    }
    
    return resultPath;
  }

  if (DEBUG_BACKLINKS) {
    console.warn('[routeManager] No mapping found for path:', normalizedPath);
  }
  
  return `/not-found?path=${encodeURIComponent(normalizedPath)}`;
}

function collectAllMappingPaths(): RouteMapping[] {
  const all: RouteMapping[] = [];
  const processedDirs = new Set<string>();

  for (const mapping of [...customRouteMappings, ...defaultRouteMappings]) {
    const root = path.resolve(contentBasePath, mapping.contentPath);
    
    // Skip if we've already processed this directory
    const dirKey = path.normalize(root);
    if (processedDirs.has(dirKey)) continue;
    processedDirs.add(dirKey);

    if (!existsSync(root)) {
      if (DEBUG_BACKLINKS) {
        console.warn(`[routeManager] Directory does not exist: ${root}`);
      }
      continue;
    }

    function walk(currentPath: string, relativePath = '') {
      try {
        const entries = readdirSync(currentPath);
        let hasContentFiles = false;

        // Check for content files in this directory
        const hasMarkdown = entries.some(entry => 
          entry.endsWith('.md') || entry.endsWith('.mdx')
        );

        // If this directory has markdown files, add it to the mappings
        if (hasMarkdown && relativePath) {
          const contentPath = path.join(mapping.contentPath, relativePath).replace(/\\/g, '/');
          if (!all.some(m => m.contentPath === contentPath)) {
            all.push({
              contentPath,
              routePath: mapping.routePath
            });
          }
          hasContentFiles = true;
        }

        // Process subdirectories
        for (const entry of entries) {
          const fullPath = path.join(currentPath, entry);
          const relative = path.join(relativePath, entry);

          if (statSync(fullPath).isDirectory()) {
            const subDirHasContent = walk(fullPath, relative);
            hasContentFiles = hasContentFiles || subDirHasContent;
          }
        }

        return hasContentFiles;
      } catch (error) {
        if (DEBUG_BACKLINKS) {
          console.error(`[routeManager] Error walking directory ${currentPath}:`, error);
        }
        return false;
      }
    }

    try {
      walk(root);
    } catch (error) {
      if (DEBUG_BACKLINKS) {
        console.error(`[routeManager] Error processing root directory ${root}:`, error);
      }
    }
  }

  if (DEBUG_BACKLINKS) {
    console.log('[routeManager] Collected mappings:', all);
  }

  return all;
}

export function transformContentPathToRoute(input: string): string {
  if (!input || typeof input !== 'string') {
    if (DEBUG_BACKLINKS) {
      console.warn('[routeManager] Invalid input:', input);
    }
    return '/not-found';
  }

  // Normalize input - trim and replace backslashes with forward slashes
  const normalizedInput = input.trim().replace(/\\/g, '/');
  
  // Use getReferenceSlug to properly handle the entire path
  // This will ensure consistent slug generation with the rest of the application
  const processedPath = getReferenceSlug(normalizedInput);
  
  if (DEBUG_BACKLINKS) {
    console.log('[routeManager] Processing input with getReferenceSlug:', { 
      raw: input,
      normalized: normalizedInput,
      processed: processedPath
    });
  }

  // Split path into segments, removing any empty segments
  const pathSegments = processedPath.split('/').filter(Boolean);

  // Case 1: Full path (contains multiple segments)
  if (pathSegments.length > 1) {
    return resolveWithMappings(processedPath);
  }

  // Case 2: Single segment - try to find matching content
  const allMappings = collectAllMappingPaths();
  
  if (DEBUG_BACKLINKS) {
    console.log('[routeManager] Single segment path, searching in mappings...');
  }

  for (const mapping of allMappings) {
    const candidate = `${mapping.contentPath}/${processedPath}`;
    
    if (DEBUG_BACKLINKS) {
      console.log('[routeManager] Trying candidate:', candidate);
    }

    if (isValidContentFile(candidate)) {
      if (DEBUG_BACKLINKS) {
        console.log('[routeManager] Found valid file:', candidate);
      }
      return transformContentPathToRoute(candidate); // Recurse with full path
    }
  }

  // If no exact match found, try with the original input
  if (normalizedInput !== processedPath) {
    const fallbackResult = transformContentPathToRoute(normalizedInput);
    if (fallbackResult !== '/not-found') {
      return fallbackResult;
    }
  }

  if (DEBUG_BACKLINKS) {
    console.warn('[routeManager] No valid path found for input:', input);
  }
  
  return `/not-found?path=${encodeURIComponent(input)}`;
}

/**
 * Add a custom route mapping
 * 
 * @param contentPath - The content path prefix (e.g., "vocabulary")
 * @param routePath - The corresponding web route (e.g., "more-about")
 */
export function addRouteMapping(contentPath: string, routePath: string): void {
  // Check if a mapping for this content path already exists
  const existingIndex = customRouteMappings.findIndex(m => m.contentPath === contentPath);
  
  if (existingIndex >= 0) {
    // Update existing mapping
    customRouteMappings[existingIndex].routePath = routePath;
  } else {
    // Add new mapping
    customRouteMappings.push({ contentPath, routePath });
  }
}

/**
 * Remove a custom route mapping
 * 
 * @param contentPath - The content path prefix to remove
 */
export function removeRouteMapping(contentPath: string): void {
  customRouteMappings = customRouteMappings.filter(m => m.contentPath !== contentPath);
}

/**
 * Get all current route mappings (both default and custom)
 * 
 * @returns Array of all route mappings
 */
export function getAllRouteMappings(): RouteMapping[] {
  return [...customRouteMappings, ...defaultRouteMappings];
}
