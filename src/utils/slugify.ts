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

/**
 * Capitalizes the first letter of each word in a string.
 * Example: "world foundation models" → "World Foundation Models"
 *
 * @param input - The string to capitalize
 * @returns The capitalized string
 */
export function capitalizeTitle(input: string): string {
  return input
    .split(' ')
    .map(word =>
      word.length > 0
        ? word[0].toUpperCase() + word.slice(1).toLowerCase()
        : ''
    )
    .join(' ');
}
