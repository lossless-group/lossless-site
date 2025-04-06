import type { Root, Paragraph, Parent } from 'mdast';
import { visit } from 'unist-util-visit';

type CitationNode = {
  type: 'citation';
  value: string;
  data: {
    hName: string;
    hProperties: {
      className: string;
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
        children: citationsFound,
        data: {
          hName: 'div',
          hProperties: {
            className: 'citations-container'
          }
        }
      } as CitationsContainerNode;

      tree.children.push(citationsNode as unknown as Paragraph);
    }
  };
}
