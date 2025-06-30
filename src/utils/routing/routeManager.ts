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
import { contentBasePath, DEBUG_BACKLINKS } from '@utils/envUtils';
import { getReferenceSlug, slugify } from '@utils/slugify';

function isValidContentFile(contentPath: string): boolean {
  const fullPath = path.resolve(contentBasePath, `${contentPath}.md`);
  return existsSync(fullPath);
}

function resolveWithMappings(normalizedPath: string): string {
  if (DEBUG_BACKLINKS) {
    console.log("[routeManager] Found path", normalizedPath)
  }

  const segments = normalizedPath.split('/');
  const contentType = segments[0];

  const allMappings = [...customRouteMappings, ...defaultRouteMappings];
  const mapping = allMappings.find(m =>
    contentType === m.contentPath ||
    normalizedPath.startsWith(`${m.contentPath}/`)
  );

  if (mapping) {
    const relativePath = normalizedPath.substring(mapping.contentPath.length + 1);
    return `/${mapping.routePath}/${relativePath}`;
  }

  return `/not-found?path=${encodeURIComponent(normalizedPath)}`;
}

function collectAllMappingPaths(): RouteMapping[] {
  const all: RouteMapping[] = [];

  for (const mapping of [...customRouteMappings, ...defaultRouteMappings]) {
    const root = path.resolve(contentBasePath, mapping.contentPath);

    function walk(currentPath: string, relativePath = '') {
      const entries = readdirSync(currentPath);

      let foundMarkdown = false;

      for (const entry of entries) {
        const fullPath = path.join(currentPath, entry);
        const relative = path.join(relativePath, entry);

        if (statSync(fullPath).isDirectory()) {
          walk(fullPath, relative); // go deeper
        } else if (fullPath.endsWith('.md')) {
          foundMarkdown = true;
        }
      }

      if (foundMarkdown) {
        const contentPath = path.join(mapping.contentPath, relativePath).replace(/\\/g, '/');
        all.push({
          contentPath,
          routePath: mapping.routePath
        });
      }
    }

    walk(root);
  }

  return all;
}

export function transformContentPathToRoute(input: string): string {
  const segments = input.split('/');
  const normalizedInput = getReferenceSlug(input);

  // Case 1: Full path (contains slash)
  if (segments.length > 1) {
    return resolveWithMappings(normalizedInput);
  }

  // Case 2: Try fallback resolution from known mappings
  const allMappings = collectAllMappingPaths();
  
  if (DEBUG_BACKLINKS) {
    console.log("[routeManager] No path provided! Searching...")
  }

  for (const mapping of allMappings) {
    const candidate = `${mapping.contentPath}/${input}`;
    
    if (DEBUG_BACKLINKS) {
      console.log("[routeManager] Trying", candidate)
    }

    if (isValidContentFile(candidate)) {
      return transformContentPathToRoute(candidate); // Recurse as if it's a full path
    }
  }

  if (DEBUG_BACKLINKS) {
    console.log("No path found for path", input, "\n\n")
  }
  // Fallback
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
