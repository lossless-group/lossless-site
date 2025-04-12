import { visit } from 'unist-util-visit';
import type { Root, Blockquote, Paragraph, Text, CalloutNode } from 'mdast';
import type { Plugin } from 'unified';
import { astDebugger } from '../../../utils/debug/ast-debugger';

/**
 * A remark plugin that converts blockquotes with [!<string>] syntax into callout nodes
 */
const remarkCallout: Plugin<[], Root> = () => {
  return async (tree: Root) => {
    const transformations: string[] = [];

    try {
      // Phase 1: Detection - Find blockquotes that might be callouts
      visit(tree, 'blockquote', (node: Blockquote, index: number, parent: Parent) => {
        if (!parent) return;

        // Check first paragraph for callout syntax
        const firstParagraph = node.children[0] as Paragraph;
        if (!firstParagraph || firstParagraph.type !== 'paragraph') return;

        const firstText = firstParagraph.children[0] as Text;
        if (!firstText || firstText.type !== 'text') return;

        // Match [!<string>] pattern
        const match = firstText.value.match(/^\[!(\w+)\](?:\s+(.+))?/);
        if (!match) return;

        const [fullMatch, calloutType, title] = match;

        // Create new callout node
        const calloutNode: CalloutNode = {
          type: 'callout',
          calloutType: calloutType.toLowerCase(),
          title: title?.trim(),
          children: [],
          data: {
            // Mark for HTML transformation
            hName: 'article',
            hProperties: {
              className: ['callout', `callout-${calloutType.toLowerCase()}`],
              'data-type': calloutType.toLowerCase(),
              'data-title': title?.trim() || calloutType
            }
          }
        };

        // Move remaining content to callout node
        if (firstText.value.length > fullMatch.length) {
          // Keep remaining text in first paragraph
          firstText.value = firstText.value.slice(fullMatch.length);
          calloutNode.children.push(firstParagraph);
        }

        // Add remaining paragraphs to callout
        calloutNode.children.push(...node.children.slice(1));

        // Replace blockquote with callout in the tree
        parent.children[index] = calloutNode;
        transformations.push(`converted-blockquote-to-callout-${calloutType}`);
      });

      // Debug output
      if (transformations.length > 0) {
        astDebugger.writeDebugFile('remark-callout-transformations', {
          phase: 'remark-callout',
          transformations
        });
      }

      return tree;
    } catch (error) {
      console.error('Error in remark-callout:', error);
      astDebugger.writeDebugFile('remark-callout-error', {
        phase: 'remark-callout',
        error: error.message,
        stack: error.stack
      });
      return tree;
    }
  };
};

export default remarkCallout;
