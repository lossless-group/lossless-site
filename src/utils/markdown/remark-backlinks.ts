import { visit } from 'unist-util-visit';
import type { Root, Text } from 'mdast';

const backlinkRegex = /\[\[(.*?)(?:\|(.*?))?\]\]/g;  // Added 'g' flag for global matching

function transformPath(path: string): string {
  // Transform the path as needed
  return `/content/${path.toLowerCase().replace(/ /g, '-')}`;
}

/**
 * Transform wiki-style backlinks [[Page]] into markdown links
 */
export default function remarkBacklinks() {
  return function transformer(tree: Root) {
    visit(tree, 'text', (node: Text, index, parent) => {
      if (!parent || index === null) return;
      
      const value = node.value;
      const matches = Array.from(value.matchAll(backlinkRegex));
      
      if (matches.length > 0) {
        // Create an array to hold the new nodes
        const newNodes = [];
        let lastIndex = 0;

        matches.forEach(match => {
          const [fullMatch, path, displayText] = match;
          const startIndex = match.index!;
          
          // Add any text before the match
          if (startIndex > lastIndex) {
            newNodes.push({
              type: 'text',
              value: value.slice(lastIndex, startIndex)
            });
          }

          // Add the link node
          const transformedPath = transformPath(path);
          const finalDisplayText = displayText || path.split('/').pop()?.replace(/\.md$/, '').replace(/-/g, ' ') || '';
          
          newNodes.push({
            type: 'link',
            url: transformedPath,
            children: [{
              type: 'text',
              value: finalDisplayText
            }]
          });

          lastIndex = startIndex + fullMatch.length;
        });

        // Add any remaining text after the last match
        if (lastIndex < value.length) {
          newNodes.push({
            type: 'text',
            value: value.slice(lastIndex)
          });
        }

        // Replace the original node with our new nodes
        parent.children.splice(index, 1, ...newNodes);
      }
    });
  };
}
