/**
 * Route Manager for content paths
 * 
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
    routePath: 'prompts'
  },
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
export function transformContentPathToRoute(path: string): string {
  // Normalize the path: lowercase and replace spaces with hyphens
  const normalizedPath = path.toLowerCase().replace(/ /g, '-');
  
  // Check if the path has a directory structure
  const segments = normalizedPath.split('/');
  
  // If there's no directory structure, just return the normalized path
  if (segments.length === 1) {
    return `/${normalizedPath}`;
  }
  
  // Get the content type (first segment of the path)
  const contentType = segments[0];
  
  // Check if there's a mapping for this content type
  const allMappings = [...customRouteMappings, ...defaultRouteMappings];
  const mapping = allMappings.find(m => {
    // Handle both exact matches and prefix matches
    return contentType === m.contentPath || 
           normalizedPath.startsWith(`${m.contentPath}/`);
  });
  
  if (mapping) {
    // If the content path is exactly the mapping path, use the route path directly
    if (contentType === mapping.contentPath) {
      // Return the route with the rest of the path
      return `/${mapping.routePath}/${segments.slice(1).join('/')}`;
    }
    
    // If the content path starts with the mapping path, replace the prefix
    const relativePath = normalizedPath.substring(mapping.contentPath.length + 1); // +1 for the slash
    return `/${mapping.routePath}/${relativePath}`;
  }
  
  // Default fallback: use /content/ prefix if no mapping is found
  return `/content/${normalizedPath}`;
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
