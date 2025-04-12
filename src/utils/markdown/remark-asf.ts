import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import type { Root } from 'mdast'
import type { Plugin } from 'unified'
import { rehypeAstro } from '@nasa-gcn/remark-rehype-astro'

interface RemarkAsfOptions {
  markdownFile: string;
}

/**
 * Plugin to process Astro Special Format content
 * Converts markdown content to HTML with enhanced Astro features
 */
export default function remarkAsf(options?: RemarkAsfOptions) {
  if (!options?.markdownFile) {
    throw new Error('markdownFile is required for remarkAsf plugin');
  }

  return async function transformer(tree: Root): Promise<Root> {
    // Create a new processor for the transformation
    const processor = unified()
      .use(remarkParse) // Add markdown parser
      .use(remarkRehype) // Convert markdown to HTML
      .use(rehypeAstro, { markdownFile: options.markdownFile }) // Apply Astro features
      .use(rehypeStringify) // Add HTML stringifier

    // Process the tree
    const result = await processor.run(tree)
    return result as Root
  }
}