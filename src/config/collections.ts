// Configuration for content collections and their URL paths
export const COLLECTION_ROUTES = {
  'issue-resolution': 'issue-resolution',
  'talks': 'our-talks'  // Using 'our-talks' to match the route structure in ROUTE_PATHS
} as const;

export type CollectionKey = keyof typeof COLLECTION_ROUTES;
