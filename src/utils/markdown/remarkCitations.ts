import { visit } from 'unist-util-visit';
import type { Root, Paragraph, Parent, PhrasingContent, Text } from 'mdast';
import type { RemarkCitationsOptions, CitationNode, CitationsContainerNode } from '../../types/remarkPluginOptions';

/* section open ==============================================================
|
| ??-- About: Citation Processing Plugin
| ??-- Type: Remark Plugin
|
| ??-- Includes: 
| //---- Citation node transformation
| //---- Citation container creation
| //---- HTML property mapping
|
====================================== */

/**
 * Debug utility function
 */
function debugNode(prefix: string, node: any) {
  if (!node) {
    console.log(`\n=== ${prefix} ===`);
    console.log('Node is null or undefined');
    console.log('=== End Debug ===\n');
    return;
  }

  console.log(`\n=== ${prefix} ===`);
  console.log('Node type:', node.type);
  if (node.type === 'text' && node.value) {
    console.log('Text value:', node.value);
  }
  if (Array.isArray(node.children)) {
    console.log('Children types:', node.children.map((child: any) => child?.type || 'unknown'));
    console.log('Children values:', node.children.map((child: any) => child?.value || ''));
  }
  console.log('Full node:', JSON.stringify(node, null, 2));
  console.log('=== End Debug ===\n');
}

/**
 * Function to parse citation text and convert URLs to links
 */
function parseCitation(text: string | undefined) {
  // Guard against undefined or empty text
  if (!text) return null;

  // Regular expression to match citation number and URL
  // Supports both http:// and https:// URLs
  const regex = /\[(\d+)\]\s*((?:https?|http):\/\/[^\s]+)/;
  const match = text.match(regex);
  
  if (match) {
    const [_, number, url] = match;
    return {
      number,
      url: url.trim()
    };
  }
  
  return null;
}

/**
 * Process a citation text into a citation node
 */
function createCitationNode(text: string): CitationNode {
  const [id, url] = text.split(' ');
  return {
    type: 'citation' as const,
    data: {
      hName: 'div',
      hProperties: {
        className: 'citation'
      }
    },
    children: [{
      type: 'link',
      url: url,
      data: {
        hName: 'a',
        hProperties: {
          href: url,
          target: '_blank',
          rel: 'noopener noreferrer'
        }
      },
      children: [{
        type: 'text',
        value: id
      }]
    }] as PhrasingContent[]
  };
}

/**
 * Create a citations section node with header
 */
function createCitationsSectionNode(citations: any[]): any {
  debugNode('Citations Array Input', citations);
  
  const citationsNode = {
    type: 'citationsContainer' as const,
    children: [
      {
        type: 'heading',
        depth: 2,
        children: [{
          type: 'text',
          value: 'Citations:'
        }],
        data: {
          hName: 'h2',
          hProperties: {
            className: 'citations-header'
          }
        }
      },
      ...citations.map((citation: any) => {
        const parsed = parseCitation(citation.children[0].value);
        debugNode('Parsed Citation', parsed);
        
        if (parsed) {
          const parsedNode = {
            type: 'paragraph',
            data: {
              hName: 'div',
              hProperties: {
                className: 'citation'
              }
            },
            children: [
              {
                type: 'text',
                value: `[${parsed.number}] `
              },
              {
                type: 'link',
                url: parsed.url,
                data: {
                  hName: 'a',
                  hProperties: {
                    href: parsed.url,
                    target: '_blank',
                    rel: 'noopener noreferrer'
                  }
                },
                children: [{
                  type: 'text',
                  value: parsed.url
                }]
              }
            ]
          };
          debugNode('Created Parsed Citation Node', parsedNode);
          return parsedNode;
        }
        
        const unparsedNode = {
          type: 'paragraph',
          children: [{
            type: 'text',
            value: citation.children[0].value
          }],
          data: {
            hName: 'div',
            hProperties: {
              className: 'citation'
            }
          }
        };
        debugNode('Created Unparsed Citation Node', unparsedNode);
        return unparsedNode;
      })
    ],
    data: {
      hName: 'div',
      hProperties: {
        className: 'citations-container'
      }
    }
  };
  
  debugNode('Final Citations Section Node', citationsNode);
  return citationsNode;
}

/**
 * Remark plugin to transform citation paragraphs into a structured format
 * Extracts citations from anywhere in the document and moves them to the end
 */
const remarkCitations = (options: RemarkCitationsOptions = {}) => {
  return (tree: Root) => {
    debugNode('Initial Tree', tree);
    
    let allCitations: CitationNode[] = [];
    let hasProcessedCitations = false;
    let nodesToRemove: number[] = [];

    // First pass: find all citations in any text content
    visit(tree, 'text', (node: any, index: number, parent: Parent) => {
      if (hasProcessedCitations) return;
      
      // Skip if we're already inside a citation or citations container
      if (parent && (parent.type === 'citation' || parent.type === 'citationsContainer' || 
          (parent.data?.hProperties?.className === 'citation'))) {
        return;
      }

      const text = node.value || '';
      const lines = text.split('\n');
      const citationLines: string[] = [];
      const otherLines: string[] = [];
      
      lines.forEach(line => {
        const trimmedLine = line.trim();
        // Only treat a line as a citation if it ONLY contains a citation pattern
        // i.e., [number] followed by a URL, and nothing else
        if (trimmedLine && /^\[\d+\]\s+https?:\/\/\S+$/.test(trimmedLine)) {
          console.log('Found citation:', trimmedLine);
          citationLines.push(trimmedLine);
          const citationNode = createCitationNode(trimmedLine);
          if (citationNode) {
            allCitations.push(citationNode);
          }
        } else {
          otherLines.push(line);
        }
      });

      // If we found citations in this node, update the node's text to exclude them
      if (citationLines.length > 0 && parent) {
        if (otherLines.length === 0) {
          // If all lines were citations, mark the parent for removal
          nodesToRemove.push(index);
        } else {
          // Otherwise update the node's text to only include non-citation lines
          node.value = otherLines.join('\n');
        }
      }
    });

    // Remove nodes marked for deletion, in reverse order to maintain correct indices
    nodesToRemove.sort((a, b) => b - a).forEach(index => {
      tree.children.splice(index, 1);
    });

    // Only add citations section if we actually found citations
    if (allCitations.length > 0) {
      // Create a container div for all citations
      const citationsContainer: CitationsContainerNode = {
        type: 'citations',
        data: {
          hName: 'div',
          hProperties: {
            className: 'citations-container'
          }
        },
        children: allCitations
      };
      
      tree.children.push(citationsContainer as any);
    }

    debugNode('Final Tree', tree);
    return tree;
  };
};

export default remarkCitations;
