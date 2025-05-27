// referenceSlugMap.ts
// Single source of truth for slug <-> original filename mapping logic for reference collections (vocabulary, concepts, tooling)
// Used by getStaticPaths and any component/page that needs original filename or slug
// Aggressively comment: update ONLY here if slug or filename logic changes

import { slugify } from './slugify';

export function getReferenceSlug(filename: string, frontmatterSlug?: string): string {
  if (frontmatterSlug) return frontmatterSlug;

  const parts = filename.split('/');
  const slugifiedParts = parts.map(p => slugify(p));
  return slugifiedParts.join('/');
}

import fs from 'fs';
import path from 'path';

// Refactored: Accept collectionDir as second arg to guarantee correct casing from filesystem
// Recursively collect all .md files under a directory, preserving relative path from collection root
function getAllMarkdownFiles(dir: string, collectionDir: string): string[] {
  let results: string[] = [];
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of list) {
    const filePath = path.join(dir, file.name);
    if (file.isDirectory()) {
      // Recurse into subdirectories, preserving relative path
      // Aggressively comment: We're building a tree of all .md files, relative to the collection root
      results = results.concat(getAllMarkdownFiles(filePath, collectionDir));
    } else if (file.isFile() && file.name.endsWith('.md')) {
      // Get the relative path from the collection root
      const relativePath = path.relative(collectionDir, filePath);
      results.push(relativePath);
    }
  }
  return results;
}

export function getOriginalFilenameMap(
  entries: { id: string; data: { slug?: string } }[],
  collectionDir: string
): Record<string, string> {
  // DEBUG: Print collectionDir and files
  console.log('[getOriginalFilenameMap] collectionDir:', collectionDir);
  const files = getAllMarkdownFiles(collectionDir, collectionDir);
  // console.log('[getOriginalFilenameMap] files:', files);

  // Aggressively comment: This function guarantees slug -> true original filename (with correct casing)
  // by reading ALL .md filenames directly from the filesystem, recursively.
  // This supports concepts in nested folders (e.g., CARBS/Explainers for AI/ etc).
  // Do not trust Astro's id or slug for casing!
  const map: Record<string, string> = {}
  
  // DEBUG: Enhanced logging
  console.log(`[getOriginalFilenameMap] Processing ${entries.length} entries against ${files.length} files`);
  
  // Create a map of normalized paths to their original paths for faster lookups
  const normalizedFileMap = new Map<string, string>();
  for (const file of files) {
    const normalized = file.toLowerCase().replace(/\.[^/.]+$/, '').replace(/[\s_]+/g, '-');
    normalizedFileMap.set(normalized, file);
  }
  
  for (const entry of entries) {
    // Skip processing if entry.id is empty or invalid
    if (!entry?.id) {
      console.log(`[getOriginalFilenameMap] ⚠️ Invalid entry.id for entry:`, entry);
      continue;
    }

    // Normalize the entry ID for comparison - remove .md extension and normalize separators
    const normalizedEntryId = entry.id
      .replace(/\.md$/, '')
      .toLowerCase()
      .replace(/[\\/]/g, '/')  // Normalize path separators
      .replace(/[\s_]+/g, '-'); // Replace spaces/underscores with hyphens
    
    // Try to find a matching file
    let matchedFile = normalizedFileMap.get(normalizedEntryId);
    
    // If no direct match, try removing collection name prefix (e.g., 'concepts/' or 'vocabulary/')
    if (!matchedFile && normalizedEntryId.includes('/')) {
      const parts = normalizedEntryId.split('/');
      const withoutCollection = parts.slice(1).join('/');
      matchedFile = normalizedFileMap.get(withoutCollection);
    }
    
    if (matchedFile) {
      // Extract only the filename (no directory, no extension, original casing)
      const filenameNoExt = path.basename(matchedFile, '.md');
      // Use the same slug generation logic as in index.astro
      const slug = getReferenceSlug(entry.id, entry.data?.slug);
      map[slug] = filenameNoExt;
    } else {
      console.log(`[getOriginalFilenameMap] ⚠️ NO MATCH FOUND for entry.id: ${entry.id}`);
      console.log(`[getOriginalFilenameMap] This entry will have undefined originalFilename`);
      
      // Fallback: Use the entry ID as the filename (without .md)
      const fallbackName = entry.id.replace(/\.md$/, '').split('/').pop() || entry.id;
      const slug = getReferenceSlug(entry.id, entry.data?.slug);
      map[slug] = fallbackName;
      console.log(`[getOriginalFilenameMap] Using fallback name: ${fallbackName} for slug: ${slug}`);
    }
  }
  
  // DEBUG: Show final map contents
  // console.log('\n[getOriginalFilenameMap] Final map contents:');
  // Object.entries(map).forEach(([k, v]) => {
  //   console.log(`  map[${k}] = ${v}`);
  // });
  
  return map;
}
