/**
 * remark-mermaid-tag.ts
 *
 * Custom remark plugin to tag Mermaid codeblocks in the Markdown AST (MDAST).
 * Adds a unique identifier and a flag to each Mermaid codeblock for downstream processing.
 *
 * Usage: .use(remarkMermaidTag)
 */

// Fix: Use type-only import for Node to comply with verbatimModuleSyntax
import type { Node } from 'unist';
import { visit } from 'unist-util-visit';

let mermaidCounter = 0;

/**
 * Generates a unique ID for each Mermaid codeblock in the document.
 *
 * @returns {string} A unique identifier for the Mermaid codeblock.
 */
function generateUniqueId(): string {
  return `mermaid-${Date.now()}-${mermaidCounter++}`;
}

/**
 * Custom remark plugin to tag Mermaid codeblocks in the Markdown AST (MDAST).
 * Adds a unique identifier and a flag to each Mermaid codeblock for downstream processing.
 *
 * Usage: .use(remarkMermaidTag)
 */
export default function remarkMermaidTag() {
  return (tree: Node) => {
    visit(tree, 'code', (node: any) => {
      if (node.lang === 'mermaid') {
        if (!node.data) node.data = {};
        node.data.isMermaid = true;
        node.data.mermaidId = generateUniqueId();
      }
    });
  };
}
