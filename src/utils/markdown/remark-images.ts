import { visit } from 'unist-util-visit';
import type { Root, Text } from 'mdast';

// Regex patterns for different image types
const wikiImageRegex = /!\[\[((.*?\/)?[^/|]+?)(?:\|(.*?))?\]\]/g;
const markdownImageRegex = /!\[(.*?)\]\((https?:\/\/.*?)\)/g;

interface ImagePluginOptions {
  renderInFrontmatter: boolean;
  defaultAltText: string;
}

const defaultOptions: ImagePluginOptions = {
  renderInFrontmatter: false,
  defaultAltText: 'Image from URL'
};

function getImageDirectory(filename: string): string {
  return filename.includes('Hero') ? 'Heroes' : 'Screenshots';
}

function transformImagePath(filename: string): string {
  // If filename already contains a path, strip any leading content/ and ensure proper format
  if (filename.includes('/')) {
    // Remove any leading content/ if present
    const normalizedPath = filename.replace(/^content\//, '');
    return `/${normalizedPath}`;
  }
  
  // Otherwise use the default directory structure
  const directory = getImageDirectory(filename);
  return `/visuals/${directory}/${filename}`;
}

function generateAltText(filename: string): string {
  // Extract the name after the last underscore and before the extension
  const match = filename.match(/_([^_]+)\.[^.]+$/);
  if (!match) return filename;
  
  const baseName = match[1];
  const extension = filename.split('.').pop()?.toUpperCase() || '';
  return `${baseName} ${extension}`;
}

/**
 * Transform wiki-style image embeds and markdown images into proper HTML img tags
 */
export default function remarkImages(userOptions: Partial<ImagePluginOptions> = {}) {
  const options = { ...defaultOptions, ...userOptions };
  
  return async function transformer(tree: Root) {
    console.log('\n🖼️ Remark Images Plugin: Starting transformation...\n');

    visit(tree, 'text', (node: Text, index, parent) => {
      if (!parent || index === null) return;
      
      const value = node.value;
      const wikiMatches = Array.from(value.matchAll(wikiImageRegex));
      const markdownMatches = Array.from(value.matchAll(markdownImageRegex));
      
      if (wikiMatches.length > 0 || markdownMatches.length > 0) {
        console.log(`\n🔍 Found images in text:`, value.slice(0, 50) + (value.length > 50 ? '...' : ''));
        
        const newNodes = [];
        let lastIndex = 0;

        // Handle wiki-style images
        wikiMatches.forEach(match => {
          const [fullMatch, filename, _pathComponent, displayText] = match;
          const startIndex = match.index!;
          
          if (startIndex > lastIndex) {
            newNodes.push({
              type: 'text',
              value: value.slice(lastIndex, startIndex)
            });
          }

          const transformedPath = transformImagePath(filename.trim());
          const altText = displayText?.trim() || generateAltText(filename.trim());
          
          console.log(`  ↳ Converting wiki image: [[${filename}]] → ${transformedPath}`);
          
          newNodes.push({
            type: 'image',
            url: transformedPath,
            alt: altText,
            title: null
          });

          lastIndex = startIndex + fullMatch.length;
        });

        // Handle markdown-style images with URLs
        markdownMatches.forEach(match => {
          const [fullMatch, alt, url] = match;
          const startIndex = match.index!;
          
          if (startIndex > lastIndex) {
            newNodes.push({
              type: 'text',
              value: value.slice(lastIndex, startIndex)
            });
          }

          console.log(`  ↳ Processing URL image: ${url}`);
          
          newNodes.push({
            type: 'image',
            url: url,
            alt: options.defaultAltText,
            title: null
          });

          lastIndex = startIndex + fullMatch.length;
        });

        if (lastIndex < value.length) {
          newNodes.push({
            type: 'text',
            value: value.slice(lastIndex)
          });
        }

        parent.children.splice(index, 1, ...newNodes);
      }
    });
  };
}
