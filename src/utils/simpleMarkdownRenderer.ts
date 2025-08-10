/**
 * Remark-based Markdown Renderer for JSON Canvas File Previews
 * 
 * Uses remark for proper AST parsing and rendering, ensuring accurate
 * header hierarchy and markdown processing.
 */

import { remark } from 'remark';
import remarkHtml from 'remark-html';
import remarkGfm from 'remark-gfm';
import remarkJsonCanvasCodeblocks from './markdown/remark-jsoncanvas-codeblocks.js';
import { sanitizeMermaidCode, getShikiHighlighter, getLanguageRoutingStrategy } from './shikiHighlighter.js';

export interface RenderedMarkdown {
  html: string;
  plainText: string;
}

/**
 * Simple remark plugin to sanitize Mermaid code blocks
 */
function remarkSanitizeMermaid() {
  return (tree: any) => {
    // Find all code blocks with lang="mermaid"
    function visit(node: any) {
      if (node.type === 'code' && node.lang === 'mermaid') {
        // Apply sanitization to the code value
        node.value = sanitizeMermaidCode(node.value);
      }
      if (node.children) {
        node.children.forEach(visit);
      }
    }
    visit(tree);
  };
}

/**
 * Simple remark plugin for basic syntax highlighting using Shiki
 */
function remarkBasicShiki() {
  return async (tree: any) => {
    const highlighter = await getShikiHighlighter();
    
    // Find all code blocks and apply syntax highlighting
    async function visit(node: any) {
      if (node.type === 'code' && node.lang) {
        const lang = node.lang;
        const code = node.value;
        const routingStrategy = getLanguageRoutingStrategy(lang);
        
        if (routingStrategy === 'shiki') {
          try {
            // Apply Shiki highlighting
            const highlighted = highlighter.codeToHtml(code, {
              lang: lang,
              theme: 'github-dark'
            });
            
            // Convert to HTML node for remark-html
            node.type = 'html';
            node.value = highlighted;
            delete node.lang;
          } catch (error) {
            // Fallback to plain code block if highlighting fails
            console.warn(`Failed to highlight ${lang} code:`, error);
          }
        }
      }
      if (node.children) {
        for (const child of node.children) {
          await visit(child);
        }
      }
    }
    await visit(tree);
  };
}

/**
 * Renders markdown content to HTML for display in JSON Canvas file nodes
 */
export function renderSimpleMarkdown(content: string): RenderedMarkdown {
  if (!content) {
    return { html: '', plainText: '' };
  }

  try {
    // Process markdown with remark (no syntax highlighting to avoid Shiki conflicts)
    const processor = remark()
      .use(remarkGfm)
      .use(remarkSanitizeMermaid) // Sanitize Mermaid before other processing
      .use(remarkJsonCanvasCodeblocks)
      .use(remarkHtml, { sanitize: false });

    let html = String(processor.processSync(content));
    
    // Extract plain text for fallback
    const plainText = content
      .replace(/\[\[([^\]|]+)(\|[^\]]+)?\]\]/g, '$1') // Remove backlinks
      .replace(/#{1,6}\s+/g, '') // Remove headers
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
      .replace(/\*(.*?)\*/g, '$1') // Remove italic
      .replace(/`([^`]+)`/g, '$1') // Remove inline code
      .trim();

    // Add CSS classes to elements for styling
    html = html
      .replace(/<h1>/g, '<h1 class="markdown-h1">')
      .replace(/<h2>/g, '<h2 class="markdown-h2">')
      .replace(/<h3>/g, '<h3 class="markdown-h3">')
      .replace(/<h4>/g, '<h4 class="markdown-h4">')
      .replace(/<h5>/g, '<h5 class="markdown-h5">')
      .replace(/<h6>/g, '<h6 class="markdown-h6">')
      .replace(/<p>/g, '<p class="markdown-p">')
      .replace(/<code>/g, '<code class="inline-code">');

    // Handle backlinks [[path|display]] or [[path]]
    html = html.replace(/\[\[([^\]|]+)(\|([^\]]+))?\]\]/g, (match, path, _, display) => {
      const linkText = display || path.split('/').pop()?.replace(/\.md$/, '') || path;
      return `<span class="backlink" title="${path}">${linkText}</span>`;
    });

    return { html, plainText };
  } catch (error) {
    console.error('Error processing markdown:', error);
    // Fallback to plain text if remark fails
    return { html: `<p class="markdown-p">${content}</p>`, plainText: content };
  }
}

/**
 * Truncates rendered markdown to a specific character limit while preserving HTML structure
 */
export function truncateRenderedMarkdown(rendered: RenderedMarkdown, maxLength: number): RenderedMarkdown {
  if (rendered.plainText.length <= maxLength) {
    return rendered;
  }

  const truncatedPlainText = rendered.plainText.substring(0, maxLength) + '...';
  
  // Simple truncation of HTML - could be improved with proper HTML parsing
  let truncatedHtml = rendered.html;
  if (rendered.html.length > maxLength * 1.5) { // Account for HTML tags
    truncatedHtml = rendered.html.substring(0, maxLength * 1.5) + '...</p>';
  }

  return {
    html: truncatedHtml,
    plainText: truncatedPlainText
  };
}
