import { visit } from 'unist-util-visit';
import type { Node, Parent } from 'unist';
import type { Blockquote, Paragraph, Text, BlockContent } from 'mdast';
import { astDebugger } from '../../debug/ast-debugger';
import type { CalloutNode, CalloutElement, CalloutText } from './calloutTypes';

/* section open ==============================================================
|
| ??-- About: Callout Detection Phase
| ??-- Type: AST Pattern Matching
|
| ??-- Includes: 
| //---- Syntax detection
| //---- Type extraction
| //---- Title parsing
| //---- Custom node creation
|
====================================== */

/* function: -------------------------------------------------->

??-- Purpose:
   //-- Detect callout syntax in markdown blockquotes
   ---- Matches [!TYPE] Title pattern
   ---- Creates custom callout nodes with proper HTML structure
-->

??-- Logic:
   //-- Called from processCallouts
   ---- 1. Visits each blockquote node
   ---- 2. Checks for [!TYPE] pattern
   ---- 3. Creates custom callout node with semantic HTML
   ---- 4. Preserves content structure
-->
*/

// Get debug mode from environment
const DEBUG_AST = process.env.DEBUG_AST === 'true';

function convertBlockContentToCalloutElement(content: BlockContent): CalloutElement {
  return {
    type: 'element',
    data: {
      hName: 'div',
      hProperties: {
        className: ['callout-content-block']
      }
    },
    children: [content as any] // Type assertion needed due to mdast/hast type mismatch
  };
}

export async function detectMarkdownCallouts(tree: Node): Promise<Node> {
  const transformations: string[] = [];
  
  try {
    if (DEBUG_AST) {
      astDebugger.writeDebugFile('2d-detect-input', {
        phase: 'detect-input',
        tree
      });
    }

    visit(tree, 'blockquote', (node: Blockquote, index: number | null, parent: Parent | null) => {
      if (!parent || typeof index !== 'number' || !node.children?.length) return;

      // Check first paragraph for callout syntax
      const firstParagraph = node.children[0] as Paragraph;
      if (!firstParagraph?.type || firstParagraph.type !== 'paragraph' || !firstParagraph.children?.length) return;

      const firstText = firstParagraph.children[0] as Text;
      if (!firstText?.type || firstText.type !== 'text' || typeof firstText.value !== 'string') return;

      // Match [!<string>] pattern
      const match = firstText.value.match(/^\[!(\w+)\](?:\s+(.+))?/);
      if (!match) return;

      const [fullMatch, calloutType, title] = match;
      const calloutId = `callout-${Math.random().toString(36).substring(2, 9)}`;

      if (DEBUG_AST) {
        astDebugger.writeDebugFile('2e-detect-match', {
          phase: 'detect-match',
          match: {
            fullMatch,
            calloutType,
            title,
            calloutId
          },
          node
        });
      }

      // Create new callout node with semantic HTML structure
      const calloutNode: CalloutNode = {
        type: 'callout',
        calloutType: calloutType.toLowerCase(),
        title: title?.trim() || calloutType,
        data: {
          hName: 'article',
          hProperties: {
            className: ['callout', `callout-${calloutType.toLowerCase()}`],
            'data-type': calloutType.toLowerCase(),
            'data-title': title?.trim() || calloutType,
            id: calloutId
          }
        },
        children: [
          // Header section
          {
            type: 'element',
            data: {
              hName: 'header',
              hProperties: {
                className: ['callout-header']
              }
            },
            children: [
              {
                type: 'text',
                value: title?.trim() || calloutType
              }
            ]
          } as CalloutElement,
          // Close button
          {
            type: 'element',
            data: {
              hName: 'span',
              hProperties: {
                className: ['closebtn'],
                onclick: `this.parentElement.style.display='none';`
              }
            },
            children: [
              {
                type: 'text',
                value: '×'
              }
            ]
          } as CalloutElement,
          // Content container
          {
            type: 'element',
            data: {
              hName: 'details',
              hProperties: {
                className: ['callout-container'],
                open: true
              }
            },
            children: []
          } as CalloutElement
        ]
      };

      if (DEBUG_AST) {
        astDebugger.writeDebugFile('2f-detect-node', {
          phase: 'detect-node',
          calloutNode
        });
      }

      // Move remaining content to callout container
      const contentContainer = calloutNode.children[2];
      if (contentContainer && contentContainer.children) {
        if (firstText.value.length > fullMatch.length) {
          // Keep remaining text in first paragraph
          firstText.value = firstText.value.slice(fullMatch.length);
          contentContainer.children.push(convertBlockContentToCalloutElement(firstParagraph));
        }

        // Add remaining paragraphs to content
        node.children.slice(1).forEach(child => {
          contentContainer.children.push(convertBlockContentToCalloutElement(child));
        });
      }

      // Replace blockquote with callout in the tree
      parent.children[index] = calloutNode;
      transformations.push(`converted-blockquote-to-callout-${calloutType}`);

      if (DEBUG_AST) {
        astDebugger.writeDebugFile('2g-detect-transform', {
          phase: 'detect-transform',
          transformations,
          parent
        });
      }
    });

    /* returns: ----------------------------->
          - Modified AST tree with callouts transformed
          - Original tree if no callouts found
       to:
          - processCallouts in processCalloutPipeline.ts
    */
    
    // Debug output for traceability
    if (DEBUG_AST) {
      astDebugger.writeDebugFile('2h-detect-output', {
        phase: 'detect',
        transformations,
        tree
      });
    }
    
    return tree;
  } catch (error) {
    console.error('Error detecting callouts:', error);
    if (DEBUG_AST) {
      astDebugger.writeDebugFile('2i-detect-error', {
        phase: 'detect',
        error: error.message,
        stack: error.stack
      });
    }
    return tree;
  }
}

/* ========================================
??-- Affects: 
//----   AST traversal
//----   Pattern matching
//----   HTML structure generation
//----   Debug logs
// 
// Close: Callout Detection Phase
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*/
