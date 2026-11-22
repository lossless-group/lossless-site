// Configuration for content collections and their URL paths
export const COLLECTION_ROUTES = {
  'talks': 'our-talks',  // Using 'our-talks' to match the route structure in ROUTE_PATHS
  // The explorations index links to /learn-with/explorations/<slug>; until 2026-11-22
  // nothing built those pages, so every exploration link 404'd.
  'explorations': 'explorations',
} as const;

export type CollectionKey = keyof typeof COLLECTION_ROUTES;
