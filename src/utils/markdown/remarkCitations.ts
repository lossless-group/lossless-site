import { visit } from 'unist-util-visit';
import type { Root, Paragraph, Parent } from 'mdast';
import markdownDebugger from './markdownDebugger';

type CitationNode = {
  type: string;
  value?: string;
  data?: {
    hName?: string;
    hProperties?: {
      className?: string;
    };
  };
  children?: Array<{
    type: string;
    value?: string;
    url?: string;
    data?: {
      hName?: string;
      hProperties?: {
        href?: string;
        target?: string;
        rel?: string;
        className?: string;
      };
    };
    children?: Array<{
      type: string;
      value: string;
    }>;
  }>;
};

type CitationsContainerNode = {
  type: 'citations';
  children: (CitationNode | {
    type: string;
    depth?: number;
    children: Array<{
      type: string;
      value: string;
    }>;
    data?: {
      hName: string;
      hProperties: {
        className: string;
      };
    };
  })[];
  data: {
    hName: string;
    hProperties: {
      className: string;
    };
  };
};

interface RemarkCitationsOptions {
  citations?: CitationNode[];
}

/**
 * Debug utility for logging node information
 */
function debugNode(prefix: string, node: any): void {
  markdownDebugger.debugNode(prefix, node);
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
  const node = {
    type: 'citation',
    value: text,
    data: {
      hName: 'div',
      hProperties: {
        className: 'citation'
      }
    }
  };
  debugNode('Citation Node Created', node);
  return node;
}

/**
 * Create a citations section node with header
 */
function createCitationsSectionNode(citations: CitationNode[]): CitationsContainerNode {
  debugNode('Citations Array Input', citations);
  
  const citationsNode: CitationsContainerNode = {
    type: 'citations' as const,
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
      ...citations.map((citation: CitationNode) => {
        const parsed = parseCitation(citation.value);
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
            value: citation.value
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
export default function remarkCitations() {
  return (tree: Root) => {
    markdownDebugger.startPlugin('Citations');
    
    let allCitations: CitationNode[] = [];
    let hasProcessedCitations = false;
    let nodesToRemove: number[] = [];

    // First pass: find all citations in any text content
    visit(tree, 'text', (node: any, index: number, parent: Parent) => {
      if (hasProcessedCitations) return;
      
      // Skip if we're already inside a citation or citations container
      if (parent && (parent.type === 'citation' || parent.type === 'citations' || 
          (parent.data?.hProperties?.className === 'citation'))) {
        return;
      }

      const text = node.value || '';
      const lines = text.split('\n');
      const citationLines: string[] = [];
      const otherLines: string[] = [];
      
      lines.forEach(line => {
        const trimmedLine = line.trim();
        if (trimmedLine && /^\[\d+\]\s+https?:\/\/\S+$/.test(trimmedLine)) {
          markdownDebugger.verbose('Found citation:', trimmedLine);
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

    if (allCitations.length > 0) {
      debugNode('All Citations Collected', { type: 'collection', children: allCitations });
      const citationsNode = createCitationsSectionNode(allCitations);
      if (citationsNode) {
        hasProcessedCitations = true;
        debugNode('Final Citations Node', citationsNode);
        tree.children.push(citationsNode as unknown as Paragraph);
      }
    }

    markdownDebugger.endPlugin('Citations');
    return tree;
  };
}
