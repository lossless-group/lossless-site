import { visit } from 'unist-util-visit';
import type { Root, Paragraph, Parent } from 'mdast';

type CitationNode = {
  type: string;
  value: string;
  data?: {
    hName?: string;
    hProperties?: {
      className?: string;
    };
  };
};

type CitationsContainerNode = {
  type: 'citations';
  children: CitationNode[];
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
 * Pre-process content to extract citations before MDAST transformation
 * @param content The raw markdown content
 * @returns Object containing processed content and extracted citations
 */
export function processCitations(content: string = ''): { processedContent: string; citations: CitationNode[] } {
  if (!content) {
    return {
      processedContent: '',
      citations: []
    };
  }

  const lines = content.split('\n');
  const citations: CitationNode[] = [];
  const contentLines: string[] = [];
  let inCitationsBlock = false;

  for (const line of lines) {
    if (line.startsWith('Citations:') || line.match(/^\[\d+\]/)) {
      inCitationsBlock = true;
      if (line.startsWith('Citations:')) continue;
    }

    if (inCitationsBlock && line.trim()) {
      citations.push({
        type: 'citation',
        value: line.trim(),
        data: {
          hName: 'div',
          hProperties: {
            className: 'citation'
          }
        }
      });
    } else if (!inCitationsBlock) {
      contentLines.push(line);
    }
  }

  return {
    processedContent: contentLines.join('\n'),
    citations
  };
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
 * Check if a node is a Perplexity attribution
 */
function isPerplexityAttribution(node: any): boolean {
  return node.type === 'paragraph' && 
         node.children?.[0]?.type === 'text' &&
         node.children[0].value.startsWith('Answer from Perplexity');
}

/**
 * Remark plugin to transform citation paragraphs into a structured format
 * Takes pre-processed citations and injects them into the MDAST at the end
 */
export default function remarkCitations() {
  return (tree: Root) => {
    let citationsFound: CitationNode[] = [];

    // First pass: find and extract citations from paragraphs
    visit(tree, 'paragraph', (node: Paragraph, index: number, parent: Parent) => {
      const firstChild = node.children[0];
      if (firstChild?.type === 'text' && 
          (firstChild.value.startsWith('Citations:') || firstChild.value.includes('\n[1]'))) {
        
        // Split the citations text into individual citations
        const citations = firstChild.value
          .split('\n')
          .filter(line => line.trim() && !line.startsWith('Citations:'))
          .map(citation => ({
            type: 'citation',
            value: citation.trim(),
            data: {
              hName: 'div',
              hProperties: {
                className: 'citation'
              }
            }
          } as CitationNode));

        citationsFound = citationsFound.concat(citations);

        // Remove this paragraph since we'll add citations at the end
        if (typeof index === 'number' && Array.isArray(parent?.children)) {
          parent.children.splice(index, 1);
        }
      }
    });

    // Second pass: add citations container at the end if we found any
    if (citationsFound.length > 0) {
      const citationsNode = {
        type: 'citations',
        children: citationsFound.map((citation: CitationNode) => {
          const parsed = parseCitation(citation.value);
          
          if (parsed) {
            return {
              type: 'citation',
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
          }
          
          return citation;
        }),
        data: {
          hName: 'div',
          hProperties: {
            className: 'citations-container'
          }
        }
      } as CitationsContainerNode;

      tree.children.push(citationsNode as unknown as Paragraph);
    }

    visit(tree, (node: any, index: number, parent: any) => {
      if (node.type === 'citations') {
        // Look ahead for thematicBreak and Perplexity attribution
        const nextNodes = parent.children.slice(index + 1);
        let attributionIndex = -1;
        
        // Find the Perplexity attribution if it exists
        for (let i = 0; i < nextNodes.length; i++) {
          if (nextNodes[i].type === 'thematicBreak' && 
              nextNodes[i + 1] && isPerplexityAttribution(nextNodes[i + 1])) {
            attributionIndex = i;
            break;
          }
        }

        // If we found the attribution pattern, include it in the citations
        if (attributionIndex !== -1) {
          // Create attribution node
          const attributionNode = {
            type: 'citation-attribution',
            data: {
              hName: 'div',
              hProperties: {
                className: 'citation-attribution'
              }
            },
            children: [nextNodes[attributionIndex + 1]]
          };

          // Add attribution to citations node
          node.children.push(attributionNode);

          // Remove the thematicBreak and attribution from parent
          parent.children.splice(index + 1, 2);
        }

        // Transform citation nodes to include link structure
        if (node.children) {
          node.children = node.children.map((citation: CitationNode) => {
            if (citation.type === 'citation-attribution') return citation;

            const parsed = parseCitation(citation.value);
            if (parsed) {
              return {
                type: 'citation',
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
            }
            return citation;
          });
        }

        node.data = {
          hName: 'div',
          hProperties: {
            className: 'citations-container'
          }
        };
      }
    });
  };
}
