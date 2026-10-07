/**
 * Display helpers for collection entries whose ids are lowercased paths
 * (e.g. the content-areas collection: "ai-factories-datacenters/organizations/abb group").
 *
 * The on-disk path keeps the author's casing ("AI-Factories-Datacenters/Organizations/ABB Group"),
 * so labels and titles are recovered from `entry.filePath` rather than from the id.
 */

/**
 * Path segments relative to `baseDir`, with original casing and no `.md` extension.
 * Falls back to the (lowercased) id when filePath isn't available.
 */
export function originalSegments(entry: { id: string; filePath?: string }, baseDir: string): string[] {
  const fp = String(entry.filePath || '').replace(/\\/g, '/');
  const marker = `${baseDir}/`;
  const i = fp.lastIndexOf(marker);
  const rel = i >= 0 ? fp.slice(i + marker.length) : entry.id;
  return rel.replace(/\.mdx?$/i, '').split('/');
}

/**
 * Title fallback chain: title → og_title → original filename.
 * A folder's README renders as "<Folder> Overview".
 */
export function getDisplayTitle(
  entry: { id: string; filePath?: string; data?: Record<string, any> },
  baseDir: string
): string {
  const title = entry.data?.title;
  if (title && String(title).trim()) return String(title).trim();
  const ogTitle = entry.data?.og_title;
  if (ogTitle && String(ogTitle).trim()) return String(ogTitle).trim();
  const parts = originalSegments(entry, baseDir);
  const filename = parts.pop() || entry.id;
  if (filename.toLowerCase() === 'readme' && parts.length > 0) {
    return `${folderLabel(parts[parts.length - 1])} Overview`;
  }
  return filename;
}

/** "AI-Factories-Datacenters" → "AI Factories Datacenters" */
export function folderLabel(segment: string): string {
  return segment.replace(/-/g, ' ');
}
