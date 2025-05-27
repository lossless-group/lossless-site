import { visit } from 'unist-util-visit';
import type { Root, Text, Link } from 'mdast';
import markdownDebugger from './markdownDebugger';
import { transformContentPathToRoute } from '../routing/routeManager';
import { DEBUG_BACKLINKS } from '@utils/envUtils';
// Match [[...]] but skip if it's a visual path
const backlinkRegex = /\[\[((?!.*?visuals).*?)(?:\|(.*?))?\]\]/gi;

// This function is kept for backward compatibility but uses the route manager internally
function transformPath(path: string): string {
  return transformContentPathToRoute(path);
}

/**
 * Transform wiki-style backlinks [[Page]] into markdown links
 * Skips any paths containing 'visuals' as those are handled by remark-images
 */
export default function remarkBacklinks() {
  return async function transformer(tree: Root) {
    markdownDebugger.startPlugin('Backlinks');

    if (DEBUG_BACKLINKS) {
      console.log('=== remarkBacklinks: Starting transformation ===');
    }

    visit(tree, 'text', (node: Text, index, parent) => {
      if (!parent || index === null) return;
      
      const value = node.value;
      const matches = Array.from(value.matchAll(backlinkRegex));
      
      if (matches.length > 0) {
        if (DEBUG_BACKLINKS) {
          console.log(`\n🔍 Found ${matches.length} backlinks in text:`, value.slice(0, 50) + (value.length > 50 ? '...' : ''));
        }
        
        const newNodes = [];
        let lastIndex = 0;

        matches.forEach(match => {
          const [fullMatch, path, displayText] = match;
          const startIndex = match.index!;
          
          if (startIndex > lastIndex) {
            newNodes.push({
              type: 'text',
              value: value.slice(lastIndex, startIndex)
            });
          }

          // Use the route manager to transform the path
          const transformedPath = transformContentPathToRoute(path);
          const finalDisplayText = displayText || path.split('/').pop()?.replace(/\.md$/, '').replace(/-/g, ' ') || '';
          
          if (DEBUG_BACKLINKS) {
            console.log(`  ↳ Converting to link: [[${path}]] → ${transformedPath}`);
          }
          
          // Create a standard MDAST link node instead of a custom backLink node
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
          } as Link);

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
    
    markdownDebugger.endPlugin('Backlinks');
  };
}
