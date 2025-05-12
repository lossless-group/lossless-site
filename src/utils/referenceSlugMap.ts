// referenceSlugMap.ts
// Single source of truth for slug <-> original filename mapping logic for reference collections (vocabulary, concepts, tooling)
// Used by getStaticPaths and any component/page that needs original filename or slug
// Aggressively comment: update ONLY here if slug or filename logic changes

import { slugify } from './slugify';

export function getReferenceSlug(filename: string, frontmatterSlug?: string): string {
  // Match getStaticPaths: use frontmatter slug if present, else slugify the filename
  return frontmatterSlug || slugify(filename);
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
  console.log('[getOriginalFilenameMap] files:', files);

  // Aggressively comment: This function guarantees slug -> true original filename (with correct casing)
  // by reading ALL .md filenames directly from the filesystem, recursively.
  // This supports concepts in nested folders (e.g., CARBS/Explainers for AI/ etc).
  // Do not trust Astro's id or slug for casing!
  const map: Record<string, string> = {};
  
  // DEBUG: Enhanced logging
  console.log(`[getOriginalFilenameMap] Processing ${entries.length} entries against ${files.length} files`);
  
  for (const entry of entries) {
    // DEBUG: Print entry.id and entry.data.slug
    console.log('\n[getOriginalFilenameMap] Processing entry.id:', entry.id);
    console.log('[getOriginalFilenameMap] entry.data.slug:', entry.data.slug);

// Use the FULL relative path (minus .md, lowercased) from Astro's id for nested files.
    // This fixes the bug where nested concepts (e.g., Explainers for AI/AI Hallucinations.md) were not mapped correctly.
    // Astro's entry.id is relative to the content root (e.g., concepts/Explainers for AI/AI Hallucinations.md)
    // Remove the collectionDir prefix, then remove .md and lowercase for matching.
    // Robust normalization: lowercase, replace spaces/dashes with dashes, strip .md
    // This allows matching between Astro's slugified id and the original filesystem path
    const normalize = (s: string) => {
      const result = s
        .replace(/\.md$/, '')
        .toLowerCase()
        .replace(/[\s_]+/g, '-')
        .replace(/-+/g, '-');
      return result;
    };
    
    const entryNorm = normalize(entry.id);
    // DEBUG: Print entryNorm
    console.log('[getOriginalFilenameMap] entryNorm:', entryNorm);
    
    // DEBUG: Show all normalized files for comparison
    console.log('[getOriginalFilenameMap] Looking for match among normalized files:');
    const normalizedFiles = files.map(f => ({ original: f, normalized: normalize(f) }));
    normalizedFiles.forEach(nf => {
      const isMatch = nf.normalized === entryNorm;
      console.log(`  ${isMatch ? '✓' : '✗'} ${nf.normalized} (from ${nf.original})`);
    });
    
    // Find the real file from the filesystem list by matching normalized path
    const realFile = files.find(f => normalize(f) === entryNorm);
    // DEBUG: Print realFile
    console.log('[getOriginalFilenameMap] realFile found:', realFile);
    
    if (realFile) {
      // Extract only the filename (no directory, no extension, original casing) for the map value
      // Example: 'Explainers for AI/World Foundation Models.md' -> 'World Foundation Models'
      const filenameNoExt = path.basename(realFile, '.md');
      
      // CRITICAL FIX: Use the SAME slug generation logic that's used in index.astro
      // This ensures the key used for lookup matches the key created here
      // We use the normalized entry.id as the key, which matches how index.astro generates slugs
      const slug = getReferenceSlug(entry.id, entry.data.slug);
      console.log(`[getOriginalFilenameMap] Using entry.id for slug key: ${slug}`);
      map[slug] = filenameNoExt;
      // DEBUG: Print the final mapping for this slug
      console.log(`[getOriginalFilenameMap] ADDED TO MAP: map[${slug}] = ${filenameNoExt}`);
    } else {
      console.log(`[getOriginalFilenameMap] ⚠️ NO MATCH FOUND for entry.id: ${entry.id}`);
      console.log(`[getOriginalFilenameMap] This entry will have undefined originalFilename`);
    }
  }
  
  // DEBUG: Show final map contents
  console.log('\n[getOriginalFilenameMap] Final map contents:');
  Object.entries(map).forEach(([k, v]) => {
    console.log(`  map[${k}] = ${v}`);
  });
  
  return map;
}
