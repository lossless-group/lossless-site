import type { Plugin } from 'unified';
import type { Root, Image, Text } from 'mdast';
import { visit } from 'unist-util-visit';
import markdownDebugger from './markdownDebugger';

interface Options {
  visualsDirectory: string;
}

/**
 * Normalize image path by:
 * 1. Removing leading slash if present
 * 2. Removing 'visuals/' prefix if present
 * 3. Adding appropriate directory prefix:
 *    - Keep assets/ paths as is
 *    - Add visualsDirectory prefix for non-asset paths
 * 4. Ensure leading slash for final URL
 */
function normalizePath(path: string, visualsDirectory: string): string {
  let normalizedPath = path.trim();

  // Remove leading slash if present
  normalizedPath = normalizedPath.replace(/^\//, '');

  // If it's an assets path, return as is with leading slash
  if (normalizedPath.toLowerCase().startsWith('assets/')) {
    markdownDebugger.verbose(`  ↳ Assets path detected: ${normalizedPath}`);
    return `/${normalizedPath}`;
  }

  // Remove visuals/ prefix if present
  normalizedPath = normalizedPath.replace(/^visuals\//i, '');

  // Add visualsDirectory prefix and leading slash
  return `/${visualsDirectory}/${normalizedPath}`;
}

/**
 * Transform wiki-style image syntax into standard markdown image syntax
 * Example: ![[image.png|alt text]] -> ![alt text](/content/visuals/image.png)
 */
const remarkImages: Plugin<[Options?], Root> = (options = { visualsDirectory: 'content/visuals' }) => {
  return async (tree) => {
    markdownDebugger.startPlugin('Images');
    markdownDebugger.log('\n=== AST Debug ===');
    markdownDebugger.log('Tree structure:', JSON.stringify(tree, null, 2));

    // Match ![[...]] for image links
    const wikiImageRegex = /!\[\[(.*?)(?:\|(.*?))?\]\]/g;

    visit(tree, 'text', (node: Text, index, parent) => {
      if (!parent || index === null) return;

      markdownDebugger.log('\n=== Node Debug ===');
      markdownDebugger.log('Node type:', node.type);
      markdownDebugger.log('Node value:', node.value);
      markdownDebugger.log('Parent type:', parent.type);
      markdownDebugger.log('Parent children:', JSON.stringify(parent.children, null, 2));

      const value = node.value;
      const matches = Array.from(value.matchAll(wikiImageRegex));

      if (matches.length > 0) {
        markdownDebugger.log(`\n🔍 Found ${matches.length} images in text:`, value.slice(0, 50) + (value.length > 50 ? '...' : ''));

        const newNodes = [];
        let lastIndex = 0;

        for (const match of matches) {
          const [fullMatch, path, alt = ''] = match;
          const matchIndex = match.index!;

          // Add text before the match if any
          if (matchIndex > lastIndex) {
            newNodes.push({ type: 'text', value: value.slice(lastIndex, matchIndex) });
          }

          const finalPath = normalizePath(path, options.visualsDirectory);
          const displayAlt = alt.trim() || path.trim().replace(/^(assets|visuals)\//, '');

          // Create image node with proper type and URL
          const imageNode: Image = {
            type: 'image',
            url: finalPath,
            alt: displayAlt,
            title: displayAlt,
            data: {
              hName: 'img',
              hProperties: {
                src: finalPath,
                alt: displayAlt,
                class: 'embedded-image'
              }
            }
          };

          markdownDebugger.log('\n=== Image Node ===');
          markdownDebugger.log('Image node:', JSON.stringify(imageNode, null, 2));
          markdownDebugger.verbose(`  ↳ Converting wiki image: ${fullMatch} → ![${imageNode.alt}](${imageNode.url})`);
          newNodes.push(imageNode);

          lastIndex = matchIndex + fullMatch.length;
        }

        // Add remaining text if any
        if (lastIndex < value.length) {
          newNodes.push({ type: 'text', value: value.slice(lastIndex) });
        }

        markdownDebugger.log('\n=== New Nodes ===');
        markdownDebugger.log('New nodes:', JSON.stringify(newNodes, null, 2));

        // Replace the current node with our new nodes
        parent.children.splice(index, 1, ...newNodes);
      }
    });

    markdownDebugger.endPlugin('Images');
  };
};

export default remarkImages;
