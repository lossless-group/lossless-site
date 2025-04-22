/**
 * Converts a string to a URL-friendly slug.
 * Example: "My Cool Tool" -> "my-cool-tool"
 * No dependencies or external libraries used.
 *
 * @param input - The string to slugify
 * @returns The slugified string
 */
export function slugify(input: string): string {
  // Lowercase the string
  let slug = input.toLowerCase();
  // Replace all non-alphanumeric characters (except spaces) with nothing
  slug = slug.replace(/[^a-z0-9\s]/g, '');
  // Replace whitespace (spaces/tabs) with hyphens
  slug = slug.replace(/\s+/g, '-');
  // Remove multiple consecutive hyphens
  slug = slug.replace(/-+/g, '-');
  // Trim leading/trailing hyphens
  slug = slug.replace(/^-+|-+$/g, '');
  return slug;
}

/**
 * Where this function is used:
 * - Used in any place where a slug must be generated for routing or display
 * - Example: in /site/src/pages/vibe-with/[tag].astro when mapping items
 */
