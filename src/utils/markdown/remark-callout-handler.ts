import { visit } from 'unist-util-visit';
import type { Root } from 'mdast';
import { toString } from 'mdast-util-to-string';

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

function parseCalloutFromText(text: string): { type: string; title: string; content: string } | null {
  // Split into lines and look for blockquote pattern
  const lines = text.split('\n');
  const calloutLines: string[] = [];
  let inCallout = false;
  let type = '';
  let title = '';

  for (const line of lines) {
    if (line.startsWith('> [!')) {
      // Start of callout
      inCallout = true;
      const match = line.match(/^>\s*\[!(\w+)\]\s*(.*)$/);
      if (match) {
        [, type, title] = match;
      }
    } else if (inCallout && line.startsWith('>')) {
      // Continuation of callout
      calloutLines.push(line.substring(1).trim());
    } else if (inCallout) {
      // End of callout
      break;
    }
  }

  if (!type || !inCallout) {
    return null;
  }

  return {
    type: type.toLowerCase(),
    title: title.trim(),
    content: calloutLines.join('\n').trim()
  };
}

export default function remarkCalloutHandler() {
  return (tree: Root) => {
    console.log('=== START REMARK CALLOUT HANDLER ===');
    console.log('Full tree structure:');
    console.log(debugNode(tree));
    
    visit(tree, 'text', (node: any, index: number, parent: any) => {
      const text = node.value;
      console.log('Processing text node:', text);

      const callout = parseCalloutFromText(text);
      if (!callout) {
        console.log('No callout found in text');
        return;
      }

      console.log('Found callout:', callout);

      // Create HTML
      const html = `
<div class="callout callout-${callout.type}">
  <div class="callout-title">
    <span class="callout-icon">${callout.type === 'llm-response' ? '🤖' : '📝'}</span>
    <span class="callout-title-text">${callout.title}</span>
  </div>
  <div class="callout-content">
    ${callout.content}
  </div>
</div>`;

      // Replace the node with our HTML
      Object.assign(node, {
        type: 'html',
        value: html
      });
      
      console.log('Transformed to HTML node:', node);
    });
    
    console.log('=== END REMARK CALLOUT HANDLER ===');
  };
}