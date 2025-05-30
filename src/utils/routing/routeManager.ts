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
    contentPath: 'lost-in-public/prompts',
    routePath: 'thread/prompts'
  },
  {
    contentPath: 'content/visuals',
    routePath: 'content/visuals'
  },
  {
    contentPath: 'assets',
    routePath: 'assets'
  }
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

import { existsSync } from 'fs';
import path from 'path';
import { contentBasePath, DEBUG_BACKLINKS } from '@utils/envUtils';

function isValidContentFile(contentPath: string): boolean {
  const fullPath = path.resolve(contentBasePath, `${contentPath}.md`);
  return existsSync(fullPath);
}

function resolveWithMappings(normalizedPath: string): string {
  if (DEBUG_BACKLINKS) {
    console.log("Detected full path. Using", normalizedPath)
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

export function transformContentPathToRoute(input: string): string {
  const normalizedInput = input.toLowerCase().replace(/ /g, '-');
  const segments = normalizedInput.split('/');

  // Case 1: Full path (contains slash)
  if (segments.length > 1) {
    return resolveWithMappings(normalizedInput);
  }

  // Case 2: Try fallback resolution from known mappings
  const allMappings = [...customRouteMappings, ...defaultRouteMappings];
  
  if (DEBUG_BACKLINKS) {
    console.log("Not path provided! Searching...")
  }

  for (const mapping of allMappings) {
    const candidate = `${mapping.contentPath}/${input}`;
    
    if (DEBUG_BACKLINKS) {
      console.log("Trying", candidate)
    }

    if (isValidContentFile(candidate)) {

      if (DEBUG_BACKLINKS) {
        console.log("Found!", candidate)
      }

      return transformContentPathToRoute(candidate); // Recurse as if it's a full path
    }
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
