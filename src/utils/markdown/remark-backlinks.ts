import { visit } from 'unist-util-visit';
import type { Root, Text } from 'mdast';

const backlinkRegex = /\[\[(.*?)(?:\|(.*?))?\]\]/g;

function transformPath(path: string): string {
  return `/content/${path.toLowerCase().replace(/ /g, '-')}`;
}

/**
 * Transform wiki-style backlinks [[Page]] into markdown links
 */
export default function remarkBacklinks() {
  return async function transformer(tree: Root) {
    console.log('\n🔗 Remark Backlinks Plugin: Starting transformation...\n');
    
    // Add a paragraph node at the start to verify plugin execution
    tree.children.unshift({
      type: 'paragraph',
      children: [{
        type: 'text',
        value: '🔗 Remark Plugin Active'
      }]
    });

    visit(tree, 'text', (node: Text, index, parent) => {
      if (!parent || index === null) return;
      
      const value = node.value;
      const matches = Array.from(value.matchAll(backlinkRegex));
      
      if (matches.length > 0) {
        console.log(`\n🔍 Found ${matches.length} backlinks in text:`, value.slice(0, 50) + (value.length > 50 ? '...' : ''));
        
        const newNodes = [];
        let lastIndex = 0;

        matches.forEach(match => {
          const [fullMatch, path, displayText] = match;
          console.log(`  ↳ Converting: [[${path}]] → ${transformPath(path)}`);
          const startIndex = match.index!;
          
          if (startIndex > lastIndex) {
            newNodes.push({
              type: 'text',
              value: value.slice(lastIndex, startIndex)
            });
          }

          const transformedPath = transformPath(path);
          const finalDisplayText = displayText || path.split('/').pop()?.replace(/\.md$/, '').replace(/-/g, ' ') || '';
          
          newNodes.push({
            type: 'link',
            url: transformedPath,
            data: {
              hProperties: {
                'data-internal-link': ''
              }
            },
            children: [{
              type: 'text',
              value: finalDisplayText
            }]
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
