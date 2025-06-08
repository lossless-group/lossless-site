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
export function slugify(input: string): string {
  return input
    .toLowerCase()                           // Convert to lowercase
    .replace(/\.[^/.]+$/, '')               // Remove file extension like .md
    .replace(/[^a-z0-9\s-_]/g, '')          // Remove all non-alphanumeric except space, dash, underscore
    .replace(/[\s_]+/g, '-')                // Replace spaces and underscores with dashes
    .replace(/-+/g, '-')                    // Collapse multiple dashes
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
