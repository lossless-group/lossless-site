import remarkWikiLink from '@portaljs/remark-wiki-link';
import type { Plugin, Transformer } from 'unified';
import type { Root, Node, Parent } from 'mdast';
import { markdownDebugger } from './markdownDebugger';

interface WikiLinkOptions {
  hrefTemplate?: (permalink: string) => string;
  pageResolver?: (name: string) => string[];
  aliasDivider?: string;
  newClassName?: string;
  wikiLinkClassName?: string;
  permalinks?: string[];
  pathFormat?: 'raw' | 'url';
}

const defaultOptions: WikiLinkOptions = {
  hrefTemplate: (permalink) => `/${permalink}`,
  pageResolver: (name) => [name.replace(/\s+/g, '-').toLowerCase()],
  wikiLinkClassName: 'wiki-link',
  newClassName: 'new-wiki-link',
  aliasDivider: '|',
  pathFormat: 'url'
};

/**
 * Wrapper for remark-wiki-link that adds error handling and debugging
 */
const remarkWikiLinkWrapper: Plugin<[WikiLinkOptions?]> = (options = {}) => {
  const mergedOptions = { ...defaultOptions, ...options };

  return function transformer(tree: Root) {
    try {
      markdownDebugger.startPlugin('remark-wiki-link');
      markdownDebugger.verbose('Using options:', mergedOptions);

      // Initialize data object if it doesn't exist
      if (!tree.data) {
        tree.data = {};
      }

      // Initialize data property on all nodes recursively
      const visit = (node: Node) => {
        if (!node.data) {
          node.data = {};
        }
        if (isParent(node)) {
          node.children.forEach(visit);
        }
      };
      visit(tree);

      // Call the original plugin
      const wikiLinkPlugin = remarkWikiLink(mergedOptions) as Transformer<Root>;
      wikiLinkPlugin.bind(this)(tree);

      markdownDebugger.endPlugin('remark-wiki-link');
    } catch (error) {
      markdownDebugger.log('Error in remark-wiki-link:', error);
      // Don't throw the error, just log it and continue
    }
  };
};

// Type guard for Parent nodes
function isParent(node: Node): node is Parent {
  return 'children' in node;
}

export default remarkWikiLinkWrapper;
