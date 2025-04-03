import { visit } from 'unist-util-visit';
import type { Root, Text, Blockquote, Parent, Paragraph } from 'mdast';
import { toString } from 'mdast-util-to-string';
import type { Visitor } from 'unist-util-visit';

function debugNode(node: any, depth = 0): string {
  const indent = '  '.repeat(depth);
  let result = `${indent}type: ${node.type}\n`;
  
  if (node.value) {
    result += `${indent}value: ${node.value}\n`;
  }
  
  if (node.children) {
    result += `${indent}children:\n`;
    node.children.forEach((child: any) => {
      result += debugNode(child, depth + 1);
    });
  }
  
  return result;
}

function parseCalloutFromText(text: string): { type: string; title: string } | null {
  // Look for [!Type] pattern at the start
  const calloutMatch = text.match(/^\[!(.*?)\]/);
  if (!calloutMatch) return null;

  const type = calloutMatch[1].trim();
  
  // Rest of first line is title
  const title = text.slice(calloutMatch[0].length).split('\n')[0].trim() || type;
  
  return {
    type,
    title
  };
}

export default function remarkCalloutHandler() {
  return (tree: Root) => {
    console.log('=== START REMARK CALLOUT HANDLER ===');
    console.log('Full tree structure:');
    console.log(debugNode(tree));
    
    const visitor: Visitor<Blockquote, Parent> = (node, index, parent) => {
      if (!node.children?.length) return;

      // Only look at the first paragraph for callout syntax
      const firstParagraph = node.children[0] as Paragraph;
      if (firstParagraph?.type !== 'paragraph' || !firstParagraph.children?.length) return;

      const firstText = firstParagraph.children[0] as Text;
      if (firstText?.type !== 'text') return;

      const callout = parseCalloutFromText(firstText.value);
      if (!callout) {
        console.log('No callout found in blockquote');
        return;
      }

      console.log('Found callout:', callout);

      // Remove the [!Type] syntax from first text node
      firstText.value = firstText.value.replace(/^\[!.*?\]/, '').trim();

      // If first paragraph is now empty, remove it
      if (!firstText.value && firstParagraph.children.length === 1) {
        node.children.shift();
      }

      // Mark this blockquote as a callout
      node.data = {
        hName: 'article',
        hProperties: {
          className: ['callout', `callout-${callout.type.toLowerCase()}`],
          'data-type': callout.type,
          'data-title': callout.title
        }
      };
      
      console.log('Transformed node:', debugNode(node));
    };

    visit(tree, 'blockquote', visitor);
    
    console.log('=== END REMARK CALLOUT HANDLER ===');
    return tree;
  };
}