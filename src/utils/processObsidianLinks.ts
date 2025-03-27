// ================================================================================
// Open: Process Obsidian-style wiki links in markdown content
// Type: Content Processing Function
// Includes: 
//   - processObsidianLinks: function(content?: string) -> string
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

/* =====================================================================>
   Process Obsidian Wiki Links in Markdown Content
/* =====================================================================>

??-- Type: Content Processor
??-- Includes: 
   //---- Function to convert [[path/to/file]] syntax to HTML links
   //---- Handles both .md and non-.md file paths
   //---- Preserves original path in link text
   //---- Called by markdown processing pipeline
   //---- Used by ChangelogEntry.astro for titles and descriptions

?-- Affects:
   //---- Any markdown content with [[wiki-style]] links
   //---- Returns HTML links for wiki syntax
   //---- Returns empty string for undefined/null input
/* <======================================< */

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

export function processObsidianLinks(content?: string): string {
  // Return empty string for undefined/null input
  if (!content) return '';
  
  return content.replace(
    /\[\[(.*?)\]\]/g,
    (_, path) => {
      const processedPath = processWikiPath(path);
      return `<a href="/content/${processedPath}" class="internal-link">${path}</a>`;
    }
  );
}
