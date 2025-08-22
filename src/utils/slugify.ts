/**
 * Converts a string to a URL-friendly slug.
 * Example: "My Cool_Tool.md" -> "my-cool-tool"
 * 
 * Rules:
 * - Lowercases all letters
 * - Removes non-alphanumeric characters (except spaces, underscores, and dashes)
 * - Converts spaces and underscores to single dashes
 * - Removes leading/trailing and duplicate dashes
 *
 * @param input - The string to slugify
 * @returns The slugified string
 */
// Process entries to add titles from filenames if missing and sort
// Aggressively commented: If logic changes, update all call sites and this block.
// Generic type that represents a collection entry with basic properties
type BaseCollectionEntry = {
  id: string;
  filePath: string;
  data: {
    title?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

// Process entries to ensure they have required fields and proper formatting
export function processEntries<T extends BaseCollectionEntry>(entries: T[]): (T & { slug: string; data: { title: string } })[] {
  return entries
    .map(entry => {
      // Always generate title from filename, preserving original case
      const filename = entry.filePath.replace(/\.md$/, '');
      const filenameParts = filename.split('/');
      const baseFilename = filenameParts[filenameParts.length - 1];
      
      // Create a new object to avoid mutating the original
      const processedEntry = {
        ...entry,
        slug: getReferenceSlug(entry.id),
        data: {
          ...entry.data,
          title: entry.data.title || baseFilename,
        },
      };

      return processedEntry as T & { slug: string; data: { title: string } };
    })
    .sort((a, b) => a.data.title.localeCompare(b.data.title));
}


export function slugify(input: string): string {
  return input
    .toLowerCase()                           // Convert to lowercase
    .replace(/\.[a-z0-9]+$/, '')            // Remove file extension like .md (only if it's just letters/numbers)
    .replace(/[^a-z0-9\s\-_]/g, '')         // Remove all non-alphanumeric except space, dash, underscore (REMOVE dots)
    .replace(/\s+/g, '-')                   // Replace spaces with dashes (but KEEP underscores)
    .replace(/-{3,}/g, '--')                // Collapse 3+ dashes to double dashes (preserve intentional double dashes)
    .replace(/^-+|-+$/g, '');               // Trim leading/trailing dashes
}

// Helper to recursively extract all text content from a node and its children
export function extractAllText(children) {
  let text = '';
  if (Array.isArray(children)) {
    for (const child of children) {
      if (child.type === 'text') {
        text += child.value;
      } else if (child.children && Array.isArray(child.children)) {
        // Check if child.children is indeed an array before recursing
        text += extractAllText(child.children);
      }
    }
  }
  return text;
}

export function getReferenceSlug(filename: string): string {
  if (!filename) {
    throw new Error("Blank or improper filename passed to the getReferenceSlug function. Work backwards from where this function is being called")
  }
  
  const parts = filename.split('/');
  const slugifiedParts = parts.map(p => slugify(p));
  return slugifiedParts.join('/');
}
/**
 * Capitalizes the first letter of each word in a string.
 * Example: "world foundation models" → "World Foundation Models"
 *
 * @param input - The string to capitalize
 * @returns The capitalized string
 */
export function toProperCase(str: string): string {
  return str
    .replace(/[-_]/g, ' ') // replace hyphens and underscores with space
    .split(' ')            // split into words
    .filter(word => word.length > 0) // remove empty strings
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // capitalize
    .join(' ');            // join back into a sentence
}

/**
 * Converts a file path to a proper URL path with base URL.
 * Example: "/projects/Augment-It/Specs/apps-microfrontends/PromptTemplateManager.md" 
 *       -> "http://localhost:4321/projects/augment-it/specs/apps-microfrontends/prompttemplatemanager"
 * 
 * @param filePath - The file path to convert
 * @param baseUrl - The base URL (defaults to "http://localhost:4321")
 * @returns The full URL path
 */
export function pathToUrl(filePath: string, baseUrl: string = "http://localhost:4321"): string {
  // Remove leading slash if present
  const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
  
  // Split path into segments, process each segment, then rejoin
  const segments = cleanPath.split('/');
  const processedSegments = segments.map(segment => {
    return segment
      .toLowerCase()                    // Convert to lowercase
      .replace(/\.[a-z0-9]+$/, '')     // Remove file extension like .md
      .replace(/[^a-z0-9\-_]/g, '')    // Remove non-alphanumeric except dash and underscore
      .replace(/_+/g, '-')             // Replace underscores with dashes
      .replace(/-{3,}/g, '--')         // Collapse 3+ dashes to double dashes (preserve intentional double dashes)
      .replace(/^-+|-+$/g, '');        // Trim leading/trailing dashes
  });
  
  // Join segments back with slashes and add base URL
  const processedPath = processedSegments.join('/');
  return `${baseUrl}/${processedPath}`;
}