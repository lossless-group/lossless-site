// plugins/remarkTableOfContents.ts
import { toc } from 'mdast-util-toc';
import type { Root, Content } from 'mdast';
import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';

/**
 * Inserts a custom `tableOfContents` node at the top of the MDAST tree.
 * This node can later be rendered however you want in Astro or React.
 */
const remarkTableOfContents: Plugin<[], Root> = () => (tree: Root) => {
  const result = toc(tree, { maxDepth: 3, heading: null });

  if (result.map) {
    const tocNode: Content = {
      type: 'tableOfContents',
      data: {
        hName: 'TableOfContents', // Optional: helpful if rendering via custom component
        map: result.map,
      }
    } as any;

    // Insert TOC node at the top of the tree (you can customize this)
    tree.children.unshift(tocNode);
  }
};

export default remarkTableOfContents;
