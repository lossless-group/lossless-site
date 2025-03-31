import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import type { Root } from 'mdast'
import { toMarkdown } from 'mdast-util-to-markdown'
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

  return async function transformer(tree: Root) {
    // First convert markdown to HTML using remark-rehype
    // @ts-expect-error Types between remark-rehype and unified are temporarily incompatible
    const htmlTree = remarkRehype()(tree)
    
    // Then apply rehypeAstro to the HTML tree
    // @ts-expect-error Types between rehype-astro and unified are temporarily incompatible
    const astroTree = rehypeAstro({ markdownFile: options.markdownFile })(htmlTree)

    return astroTree
  }
}