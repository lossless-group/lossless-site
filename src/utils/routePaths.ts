/**
 * Centralized configuration for application routes
 * 
 * Defines all route paths in one place for easy maintenance and to prevent typos
 */

export const ROUTE_PATHS = {
  // Main collections
  LEARN_WITH: {
    BASE: '/learn-with',
    ISSUE_RESOLUTION: '/learn-with/issue-resolution',
    OUR_TALKS: '/learn-with/our-talks',
    // Add other learn-with subpaths here
  },
  
  MARKET_MAP: {
    BASE: '/market-map',
    FOR: '/market-map/for',
  },
  
  CLIENT: {
    BASE: '/client',
    PORTFOLIO: '/client/[client]/portfolio',
    RECOMMENDATIONS: '/client/[client]/recommendations',
  },
  
  VIBE_WITH: {
    BASE: '/vibe-with',
  },
  
  TOOLKIT: {
    BASE: '/toolkit',
    VERTICAL: '/toolkit/vertical',
  },

  PROJECTS: {
    BASE: '/projects',
  },
  
  // Default fallback paths
  DEFAULTS: {
    LEARN: '/learn-with/issue-resolution',
    IMAGE_FALLBACK: 'visuals/bannerImage__The-Lossless-Group.png',
  },
} as const;

// Helper function to get the base path for a collection
export function getCollectionBasePath(collectionName: string): string {
  switch (collectionName) {
    case 'market-maps':
      return ROUTE_PATHS.MARKET_MAP.FOR;
    case 'issue-resolution':
      return ROUTE_PATHS.LEARN_WITH.ISSUE_RESOLUTION;
    case 'talks':
      return ROUTE_PATHS.LEARN_WITH.OUR_TALKS;
    case 'vertical-toolkits':
      return ROUTE_PATHS.TOOLKIT.VERTICAL;
    // Add other collection mappings here
    default:
      return `${ROUTE_PATHS.LEARN_WITH.BASE}/${collectionName}`;
  }
}
