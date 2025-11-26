/**
 * Route Manager for content paths
 * This module provides a centralized way to map content paths to web routes.
 * It allows for custom route mappings to be defined for different content types.
 */

// Define the interface for route mappings
interface RouteMapping {
  contentPath: string;  // The path prefix in the content directory
  routePath: string;    // The corresponding web route
  baseDir?: string;     // Optional base directory for content resolution
  collectionName?: string; // Optional explicit collection name
}

// Define the default route mappings
// Export route constants for use throughout the app
export const ROUTE_PATHS = {
  LEARN_WITH: {
    BASE: '/learn-with',
    ISSUE_RESOLUTION: '/learn-with/issue-resolution',
    UP_AND_RUNNING: '/learn-with/up-and-running',
  },
  MARKET_MAP: {
    BASE: '/market-map',
    FOR: '/market-map/for',
  },
  UP_AND_RUNNING: {
    BASE: '/learn-with/up-and-running',
    WITH: '/learn-with/up-and-running/with',
  },
  DEFAULTS: {
    LEARN: '/learn-with/issue-resolution',
    IMAGE_FALLBACK: 'visuals/bannerImage__The-Lossless-Group.png',
  },
} as const;

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
    contentPath: 'market-maps',
    routePath: 'market-map/for',
    baseDir: 'lost-in-public',
    collectionName: 'market-maps'
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
    contentPath: 'tooling/Portfolio',
    routePath: 'portfolio'
  },
  {
    contentPath: 'vertical-toolkits',
    routePath: 'toolkit/vertical'
  },
  {
    contentPath: 'essays',
    routePath: 'read/essays'
  },
  {
    contentPath: 'client-content',
    routePath: 'client'
  },
  {
    contentPath: 'slides',
    routePath: 'slides'
  },
  {
    contentPath: 'projects',
    routePath: 'projects'
  },
  {
    contentPath: 'sources',
    routePath: 'sources'
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
import { contentBasePath, DEBUG_BACKLINKS } from '../envUtils';
import { getReferenceSlug, slugify } from '../slugify';

// Simple in-memory caches to avoid repeated filesystem scans during dev
const routeCache = new Map<string, string>();
let collectedMappingPaths: RouteMapping[] | null = null;

// Prioritize likely content locations for bare entity names (e.g., firms/tools)
const PRIORITY_CONTENT_PATHS = [
  'tooling/Portfolio',
  'tooling',
  'vocabulary',
  'concepts',
];

function isValidContentFile(contentPath: string): boolean {
  // Check if the path already has a .md extension
  const hasMdExtension = contentPath.endsWith('.md');
  const fullPath = path.resolve(
    contentBasePath, 
    hasMdExtension ? contentPath : `${contentPath}.md`
  );
  
  if (DEBUG_BACKLINKS) {
    console.log('[routeManager] Checking if file exists:', fullPath);
  }
  
  const exists = existsSync(fullPath);
  
  if (DEBUG_BACKLINKS) {
    console.log('[routeManager] File exists:', exists);
  }
  
  return exists;
}

function resolveWithMappings(normalizedPath: string): string {
  if (DEBUG_BACKLINKS) {
    console.log("[routeManager] Found path", normalizedPath)
  }

  const segments = normalizedPath.split('/');
  const contentType = segments[0];

  const allMappings = [...customRouteMappings, ...defaultRouteMappings];
  
  // First try to find a mapping that matches the full path with baseDir
  const mappingWithBaseDir = allMappings.find(m => 
    m.baseDir && normalizedPath === `${m.baseDir}/${m.contentPath}` ||
    m.baseDir && normalizedPath.startsWith(`${m.baseDir}/${m.contentPath}/`)
  );

  // If no match with baseDir, try without baseDir
  const mapping = mappingWithBaseDir || allMappings.find(m =>
    contentType === m.contentPath ||
    normalizedPath.startsWith(`${m.contentPath}/`)
  );

  if (mapping) {
    let relativePath: string;
    
    if (mapping.baseDir) {
      // For mappings with baseDir, strip both baseDir and contentPath
      const prefixToRemove = `${mapping.baseDir}/${mapping.contentPath}`;
      relativePath = normalizedPath.startsWith(prefixToRemove + '/') 
        ? normalizedPath.substring(prefixToRemove.length + 1)
        : '';
    } else {
      // For regular mappings, just strip contentPath
      relativePath = normalizedPath.startsWith(mapping.contentPath + '/')
        ? normalizedPath.substring(mapping.contentPath.length + 1)
        : '';
    }
    
    return `/${mapping.routePath}${relativePath ? `/${relativePath}` : ''}`;
  }

  // Return 404 page with the attempted path
  return `/404`;
}

function collectAllMappingPaths(): RouteMapping[] {
  // Return cached result if already collected
  if (collectedMappingPaths) {
    return collectedMappingPaths;
  }

  const all: RouteMapping[] = [];

  for (const mapping of [...customRouteMappings, ...defaultRouteMappings]) {
    // Consider baseDir when resolving the root path
    const root = mapping.baseDir 
      ? path.resolve(contentBasePath, mapping.baseDir, mapping.contentPath)
      : path.resolve(contentBasePath, mapping.contentPath);

    // Skip if the directory doesn't exist
    if (!existsSync(root)) {
      continue;
    }

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

  collectedMappingPaths = all;
  return collectedMappingPaths;
}

export function transformContentPathToRoute(input: string, currentFilePath?: string): string {
  if (!input) {
    if (DEBUG_BACKLINKS) {
      console.log("[routeManager] transformContentPathToRoute called with empty input");
    }
    return '/404';
  }

  const normalizedInput = getReferenceSlug(input);
  const clientContext = deriveClientFromFilePath(currentFilePath);
  const cacheKey = `${normalizedInput}::${input}::${clientContext || ''}`;

  // Fast path: return cached resolution if available
  if (routeCache.has(cacheKey)) {
    const cached = routeCache.get(cacheKey)!;
    if (DEBUG_BACKLINKS) {
      console.log('[routeManager] Using cached route for', input, '→', cached);
    }
    return cached;
  }
  const segments = normalizedInput.split('/');

  // Case 1: Full path (contains slash)
  if (segments.length > 1) {
    if (DEBUG_BACKLINKS) {
      console.log("[routeManager] Full path detected:", normalizedInput);
    }
    const result = resolveWithMappings(normalizedInput);
    routeCache.set(cacheKey, result);
    return result;
  }

  // Case 2: Try fallback resolution from known mappings
  const allMappings = collectAllMappingPaths();
  
  if (DEBUG_BACKLINKS) {
    console.log("[routeManager] No full path provided, searching mappings for:", input);
  }

  // Build dynamic priority roots (prefer current client's Portfolio when available)
  const dynamicPriorityRoots = buildDynamicPriorityRoots(clientContext);

  // 2a. Try priority locations first (raw and slug forms)
  for (const root of dynamicPriorityRoots) {
    const candidateRaw = `${root}/${input}`;
    if (DEBUG_BACKLINKS) {
      console.log('[routeManager] Priority check (raw):', candidateRaw);
    }
    if (isValidContentFile(candidateRaw)) {
      const result = resolveWithMappings(candidateRaw);
      routeCache.set(cacheKey, result);
      return result;
    }

    const candidateSlug = `${root}/${normalizedInput}`;
    if (DEBUG_BACKLINKS) {
      console.log('[routeManager] Priority check (slug):', candidateSlug);
    }
    if (isValidContentFile(candidateSlug)) {
      const result = resolveWithMappings(candidateSlug);
      routeCache.set(cacheKey, result);
      return result;
    }
  }

  // First try with baseDir mappings
  for (const mapping of allMappings) {
    if (mapping.baseDir) {
      const candidate = `${mapping.baseDir}/${mapping.contentPath}/${input}`;
      
      if (DEBUG_BACKLINKS) {
        console.log("[routeManager] Trying with baseDir:", candidate);
      }

      if (isValidContentFile(candidate)) {
        const result = resolveWithMappings(candidate);
        if (DEBUG_BACKLINKS) {
          console.log("[routeManager] Found with baseDir, resolved to:", result);
        }
        routeCache.set(cacheKey, result);
        return result;
      }
    }
  }

  // Then try without baseDir
  for (const mapping of allMappings) {
    const candidate = `${mapping.contentPath}/${input}`;
    
    if (DEBUG_BACKLINKS) {
      console.log("[routeManager] Trying without baseDir:", candidate);
    }

    if (isValidContentFile(candidate)) {
      const result = resolveWithMappings(candidate);
      if (DEBUG_BACKLINKS) {
        console.log("[routeManager] Found without baseDir, resolved to:", result);
      }
      routeCache.set(cacheKey, result);
      return result;
    }
  }

  if (DEBUG_BACKLINKS) {
    console.log("[routeManager] No path found for:", input, "\n");
  }
  const notFound = '/404';
  routeCache.set(cacheKey, notFound);
  return notFound;
}

/**
 * Extract the client name from the current file path if within client-content.
 * Examples:
 *   /.../content/client-content/Hypernova/Portfolio/... => Hypernova
 *   /.../generated-content/client-content/hypernova/... => hypernova (normalized)
 */
function deriveClientFromFilePath(filePath?: string): string | null {
  if (!filePath) return null;
  const normalized = filePath.replace(/\\/g, '/');
  const match = normalized.match(/client-content\/([^/]+)/i);
  if (match && match[1]) {
    return match[1];
  }
  return null;
}

/**
 * Build a list of priority roots for resolution.
 * If a client context is present, prioritize that client's Portfolio folder first.
 */
function buildDynamicPriorityRoots(client: string | null): string[] {
  const roots: string[] = [];
  if (client) {
    // Prefer the current client's Portfolio folder for bare names
    roots.push(`client-content/${client}/Portfolio`);
  }
  // Then add the global priority paths
  roots.push(...PRIORITY_CONTENT_PATHS);
  return roots;
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
