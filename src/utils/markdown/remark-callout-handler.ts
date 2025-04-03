import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';
import type { Root, Blockquote, Paragraph, Text } from 'mdast';

// Simple callout detection for now
function detectCallout(node: Blockquote) {
  if (!node.children?.length) return null;
  
  // Get first paragraph's text
  const firstParagraph = node.children[0] as Paragraph;
  if (!firstParagraph.children?.length) return null;
  
  const textNode = firstParagraph.children[0] as Text;
  if (!textNode || textNode.type !== 'text') return null;
  
  // Match [!TYPE] pattern
  const match = textNode.value.match(/^\[!(\w+)\]\s*(.*)$/);
  if (!match) return null;
  
  return {
    type: match[1],
    title: match[2] || match[1],
    // Keep remaining content as is
    content: node.children.slice(1)
  };
}

const remarkCallouts: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, 'blockquote', (node: Blockquote) => {
      const calloutData = detectCallout(node);
      if (!calloutData) return;

      // Transform blockquote into a callout
      node.data = {
        hName: 'article',
        hProperties: {
          className: ['callout', `callout-${calloutData.type.toLowerCase()}`],
          'data-type': calloutData.type
        }
      };

      // Structure content
      node.children = [
        {
          type: 'paragraph',
          children: [{
            type: 'text',
            value: calloutData.title
          }],
          data: {
            hName: 'header',
            hProperties: { className: ['callout-header'] }
          }
        },
        ...calloutData.content
      ];
    });

    return tree;
  };
};

export default remarkCallouts;
