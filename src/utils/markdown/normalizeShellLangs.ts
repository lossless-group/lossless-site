import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';

/**
 * Unified plugin to normalize shell language tags for code blocks.
 * Converts 'bash' and 'zsh' to 'shellscript'.
 *
 * Usage: Add to Astro markdown.remarkPlugins (unified-compatible).
 */
const normalizeShellLangs: Plugin = () => (tree: any) => {
  visit(tree, 'code', (node: any) => {
    if (node.lang === 'bash' || node.lang === 'zsh') {
      node.lang = 'shellscript';
    }
  });
};

export default normalizeShellLangs;
