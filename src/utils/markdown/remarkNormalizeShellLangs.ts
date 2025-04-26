import { visit } from 'unist-util-visit';

/**
 * remarkNormalizeShellLangs
 *
 * Remark plugin to normalize shell language tags for code blocks.
 * Converts 'bash' and 'zsh' to 'shellscript' for consistent syntax highlighting.
 *
 * This plugin is placed in site/src/utils/markdown/ to follow project conventions for remark plugins.
 *
 * Usage locations:
 * - astro.config.mjs: Add to markdown.remarkPlugins array
 *
 * Calls:
 * - None (pure AST transformation)
 *
 * Called by:
 * - Astro markdown pipeline (via remarkPlugins)
 */
export default function remarkNormalizeShellLangs() {
  return (tree: any) => {
    visit(tree, 'code', (node: any) => {
      // Normalize bash and zsh to shellscript for Shiki highlighting
      if (node.lang === 'bash' || node.lang === 'zsh') {
        node.lang = 'shellscript';
      }
    });
  };
}
