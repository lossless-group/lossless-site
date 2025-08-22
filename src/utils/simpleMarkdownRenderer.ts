import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import remarkDirective from 'remark-directive';
import remarkBacklinks from '@utils/markdown/remark-backlinks';
import remarkImages from '@utils/markdown/remark-images';
import remarkCitations from '@utils/markdown/remark-citations';
import remarkTableOfContents from '@utils/markdown/remark-toc';
import { remarkDirectiveToComponent } from '@utils/markdown/remark-directives';

interface RenderResult {
  html: string;
  plainText: string;
}

/**
 * Simple markdown renderer utility that processes markdown content
 * through the unified ecosystem with all necessary remark plugins
 * 
 * @param markdown - The markdown content to render
 * @returns Object containing HTML and plain text versions
 */
export async function renderSimpleMarkdown(markdown: string): Promise<RenderResult> {
  if (!markdown || markdown.trim() === '') {
    return { html: '', plainText: '' };
  }

  try {
    // Create processor with all necessary plugins
    const processor = unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkBacklinks)
      .use(remarkImages)
      .use(remarkDirective)
      .use(remarkDirectiveToComponent)
      .use(remarkCitations)
      .use(remarkTableOfContents)
      .use(remarkRehype)
      .use(rehypeStringify);

    // Process the markdown
    const result = await processor.process(markdown);
    const html = String(result);

    // Extract plain text by removing HTML tags
    const plainText = html.replace(/<[^>]*>/g, '').trim();

    return { html, plainText };
  } catch (error) {
    console.error('Error rendering markdown:', error);
    return { html: markdown, plainText: markdown };
  }
}
