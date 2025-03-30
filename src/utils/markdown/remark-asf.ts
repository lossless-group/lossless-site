import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import type { Root } from 'mdast'
import type { Plugin } from 'unified'
import { toMarkdown } from 'mdast-util-to-markdown'


const rehypeAstro: (options: { markdownFile: string }) => (tree: Root) => Root = (options) => (tree) => {
  return rehypeAstro({ markdownFile: options.markdownFile })(tree);
};

interface RemarkAsfOptions {
  markdownFile: string;
}

/**
 * Plugin to process Astro Special Format content
 * Converts markdown content to HTML with enhanced Astro features
 */
export default function remarkAsf(options?: RemarkAsfOptions): Plugin<[], Root, Root> {
  if (!options?.markdownFile) {
    throw new Error('markdownFile is required for remarkAsf plugin');
  }

  return function () {
    return async function (tree: Root): Promise<Root> {
      console.log('\n🚀 Remark ASF Plugin: Starting transformation...\n');
      console.log('Processing markdown file:', options.markdownFile);
      
      try {
        // Convert tree to markdown string
        const markdown = toMarkdown(tree);
        
        // Process the content through the unified pipeline
        const result = await unified()
          .use(remarkParse)
          .use(remarkRehype)
          .use(rehypeAstro, { markdownFile: options.markdownFile })
          .process(markdown);
        
        if (!result) {
          throw new Error('Failed to process content');
        }
        
        // Create a new Root node with the processed content
        return {
          type: 'root',
          children: [{
            type: 'text',
            value: result.value.toString()
          }]
        } as Root;
      } catch (error) {
        console.error('Error in remarkAsf transformation:', error);
        return tree; // Return original tree if transformation fails
      }
    }
  }
}