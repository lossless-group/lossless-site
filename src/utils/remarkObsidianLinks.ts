// ================================================================================
// Open: Remark plugin to handle Obsidian-style wiki links in markdown content
// Type: Markdown Processing Plugin
// Includes: 
//   - remarkObsidianLinks: function() -> transformer
//   - transformer: function(tree: Root) -> void
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

/* =====================================================================>
   Remark Plugin for Obsidian Wiki Links
/* =====================================================================>

// -- Type: Markdown Transformer
// -- Includes: 
  //---- Function to convert [[path/to/file]] syntax to HTML links
  //---- Handles both .md and non-.md file paths
  //---- Preserves original path in link text
  //---- Called by Astro/MDX for each markdown file

// -- Affects:
  //---- Any markdown content with [[wiki-style]] links
  //---- Outputs HTML links with internal-link class
/* <======================================< */

import { visit } from 'unist-util-visit';
import type { Root } from 'mdast';

/**
 * Process a wiki-style path into a proper URL path
 * Handles directory structure and file extensions
 */
function processWikiPath(path: string): string {
  // Remove .md extension if present
  const withoutExt = path.replace(/\.md$/, '');
  
  // Split path into segments and filter out empty ones
  const segments = withoutExt.split('/').filter(Boolean);
  
  // Join segments with forward slashes
  return segments.join('/');
}

/**
 * Remark plugin to convert Obsidian-style wiki links to HTML links
 * Processes [[path/to/file]] syntax in any text content
 */
export function remarkObsidianLinks() {
  /* export function: -------------------------------------------------->
  // -- Purpose:
     // -- Turn Obsidian-style wiki links into HTML links
     // -- Process any text content that contains [[path/to/file]]
     // -- Allow any input to flow through without validation
  */
  return function transformer(tree: Root) {
    /* transformer: -------------------------------------------------->
    // -- Purpose:
       // -- Process markdown AST nodes that contain wiki links
       // -- Convert [[path]] to <a href="/content/path">path</a>
       // -- Skip nodes that don't have wiki link patterns
    */
    visit(tree, 'text', (node) => {
      // Only try to process if we find a wiki link pattern
      if (node?.value?.includes('[[')) {
        /* replace: -------------------------------------------------->
        // -- Purpose:
           // -- Find all [[path]] patterns in the text
           // -- If path exists: convert to HTML link
           // -- If path empty: preserve original [[]] syntax
           // -- Always trim .md extension from paths
        */
        node.value = node.value.replace(
          /\[\[(.*?)\]\]/g,
          (_, path) => {
            const processedPath = processWikiPath(path);
            return `<a href="/content/${processedPath}" class="internal-link">${path}</a>`;
          }
        );
      }
    });
  };
}
