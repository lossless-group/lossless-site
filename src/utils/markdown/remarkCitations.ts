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

  // Try to match [n] url
  let regex = /\[(\d+)\]\s*((?:https?|http):\/\/[^\s]+)/;
  let match = text.match(regex);
  if (match) {
    const [_, number, url] = match;
    return { number, url: url.trim() };
  }
  // Try to match [n] [title](url)
  regex = /\[(\d+)\]\s+\[.*?\]\((https?:\/\/[^\s]+)\)/;
  match = text.match(regex);
  if (match) {
    const [_, number, url] = match;
    return { number, url: url.trim() };
  }
  // Try to match [n] ... <url> anywhere in the line
  regex = /\[(\d+)\][^\[]*?(https?:\/\/[^\s]+)/;
  match = text.match(regex);
  if (match) {
    const [_, number, url] = match;
    return { number, url: url.trim() };
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
 * Extracts citations from anywhere in the document (including inside callouts/containers) and moves them to the end
 * Now robustly traverses ALL nodes, not just text, and removes empty parent containers after extraction.
 */
export default function remarkCitations() {
  return (tree: Root) => {
    markdownDebugger.startPlugin('Citations');
    let allCitations: CitationNode[] = [];

    // Helper: Recursively collect and remove citations from any node
    function collectCitations(node: any, parent: any, index: number | null): boolean {
      let isCitationNode = false;

      // --- Inline citation transformation ---
      // Transform inline [n] or [^hex] in text nodes to citation reference nodes
      if (node.type === 'text' && typeof node.value === 'string') {
        // Replace inline [n] or [^hex] with a custom citationRef node
        node.value = node.value.replace(/\[(\d+|\^[0-9a-f]{6})\]/g, (match, citationId) => {
          // Mark for AST replacement: we use a placeholder to split later
          return `|||CITEREF:${citationId}|||`;
        });
      }
      // After all replacements, split text node into text/citationRef nodes
      if (node.type === 'text' && typeof node.value === 'string' && node.value.includes('|||CITEREF:')) {
        const parts = node.value.split(/(\|\|\|CITEREF:[^|]+\|\|\|)/g).filter(Boolean);
        if (parts.length > 1 && parent && Array.isArray(parent.children)) {
          const newNodes = parts.map(part => {
            const match = part.match(/^\|\|\|CITEREF:([^|]+)\|\|\|$/);
            if (match) {
              return {
                type: 'citationRef',
                data: { citationId: match[1] },
                value: `[${match[1]}]` // fallback: render as plain text if not handled
              };
            } else {
              return { type: 'text', value: part };
            }
          });
          // Replace this node in parent.children
          parent.children.splice(index, 1, ...newNodes);
          // No further processing needed for this node
          return false;
        }
      }

      // Only process text or paragraph nodes for extraction
      if (node.type === 'text' || node.type === 'paragraph') {
        const text = node.value || (node.children && node.children.map((c: any) => c.value).join('\n')) || '';
        const lines = text.split('\n');
        const citationLines: string[] = [];
        const otherLines: string[] = [];
        lines.forEach((line, idx) => {
          const trimmedLine = line.trim();
          // Match [n] url or [n] [title](url) or [n] <url> anywhere in the line
          if (/\[(\d+|\^[0-9a-f]{6})\]:?\s+https?:\/\/\S+/i.test(trimmedLine) ||
              /\[(\d+|\^[0-9a-f]{6})\]\s+\[.*?\]\((https?:\/\/\S+)\)/i.test(trimmedLine) ||
              /\[(\d+|\^[0-9a-f]{6})\][^\[]*https?:\/\/\S+/i.test(trimmedLine)
          ) {
            citationLines.push(trimmedLine);
            const citationNode = createCitationNode(trimmedLine);
            if (citationNode) allCitations.push(citationNode);
            isCitationNode = true;
            // Remove this line from the paragraph
            lines[idx] = null;
          } else {
            otherLines.push(line);
          }
        });
        // Remove extracted citation lines from paragraph text
        const filteredLines = lines.filter(l => l !== null);
        if (citationLines.length > 0 && parent && index !== null) {
          if (filteredLines.length === 0) {
            parent.children.splice(index, 1);
            return true; // Node removed
          } else {
            if (node.type === 'text') node.value = filteredLines.join('\n');
            if (node.type === 'paragraph') node.children = [{ type: 'text', value: filteredLines.join('\n') }];
          }
        }
      }
      // Recursively process children
      if (node.children && Array.isArray(node.children)) {
        // Iterate in reverse to safely remove by index
        for (let i = node.children.length - 1; i >= 0; i--) {
          const removed = collectCitations(node.children[i], node, i);
          // If a child node was removed and parent is now empty, remove parent
          if (removed && node.children.length === 0 && parent && typeof index === 'number') {
            parent.children.splice(index, 1);
            return true;
          }
        }
      }
      return false;
    }

    collectCitations(tree, null, null);

    if (allCitations.length > 0) {
      debugNode('All Citations Collected', { type: 'collection', children: allCitations });
      const citationsNode = createCitationsSectionNode(allCitations);
      if (citationsNode) {
        debugNode('Final Citations Node', citationsNode);
        tree.children.push(citationsNode as unknown as Paragraph);
      }
    }
    markdownDebugger.endPlugin('Citations');
    return tree;
  };
}

// NOTE: Downstream renderer (AstroMarkdown.astro or rehype plugin) must render citationRef nodes as superscript or link, or fallback to value as plain text.
