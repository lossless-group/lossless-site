import { marked } from 'marked';
import { baseUrl } from 'marked-base-url';

// Function to transform directory paths to kebab-case but preserve file name case
const transformPath = (path: string): string => {
  // Remove 'content/' prefix if present
  const withoutContent = path.replace(/^content\//, '');
  
  // Split into directory path and filename
  const parts = withoutContent.split('/');
  const fileName = parts.pop() || '';
  
  // Transform directories to kebab-case
  const transformedDirs = parts.map(dir => 
    dir.toLowerCase()
       .replace(/\s+/g, '-')  // Replace spaces with dashes
       .replace(/[^a-z0-9-]/g, '') // Remove special chars
  );
  
  // Transform filename: preserve case but replace spaces with dashes
  const transformedFileName = fileName
    .replace(/\.md$/, '')  // Remove .md extension
    .replace(/\s+/g, '-'); // Replace spaces with dashes

  return [...transformedDirs, transformedFileName].join('/');
};

// Regex for matching wiki-style backlinks with optional display text
const backlinkRegex = /\[\[([^|\]]+)(?:\|([^\]]+))?\]\]/g;

// Transform backlinks in HTML
const transformBacklinks = (html: string): string => {
  console.log('transformBacklinks called with:', { html });
  
  const matches = [...html.matchAll(backlinkRegex)];
  console.log('Found backlinks:', matches);
  
  const transformed = html.replace(backlinkRegex, (match, path, displayText) => {
    const transformedPath = transformPath(path);
    const defaultDisplayText = path.split('/').pop()?.replace(/\.md$/, '').replace(/-/g, ' ') || '';
    const finalDisplayText = displayText || defaultDisplayText;
    
    console.log('Processing backlink:', {
      original: match,
      path,
      displayText,
      transformedPath,
      defaultDisplayText,
      finalDisplayText
    });
    
    return `<a href="/${transformedPath}" class="backlink">${finalDisplayText}</a>`;
  });
  
  console.log('Final transformed HTML:', transformed);
  return transformed;
};

// Configure marked
const markedConfig = {
  hooks: {
    postprocess: (html: string) => {
      console.log('postprocess hook called with:', { html });
      return transformBacklinks(html);
    }
  }
};

console.log('Configuring marked with:', markedConfig);
marked.use(baseUrl('/'), markedConfig);

export { marked };
