/**
 * Simple Markdown Renderer for JSON Canvas File Previews
 * 
 * This is a lightweight renderer that handles the most common markdown patterns
 * used in the project, specifically designed for file previews in JSON Canvas.
 * It focuses on readability and performance over full feature completeness.
 */

export interface RenderedMarkdown {
  html: string;
  plainText: string;
}

/**
 * Renders markdown content to HTML for display in JSON Canvas file nodes
 */
export function renderSimpleMarkdown(content: string): RenderedMarkdown {
  if (!content) {
    return { html: '', plainText: '' };
  }

  let html = content;
  
  // Extract plain text for fallback
  const plainText = content
    .replace(/\[\[([^\]|]+)(\|[^\]]+)?\]\]/g, '$1') // Remove backlinks
    .replace(/#{1,6}\s+/g, '') // Remove headers
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.*?)\*/g, '$1') // Remove italic
    .replace(/`([^`]+)`/g, '$1') // Remove inline code
    .trim();

  // Handle headers (##, ###, etc.)
  html = html.replace(/^(#{1,6})\s+(.+)$/gm, (match, hashes, text) => {
    const level = hashes.length;
    return `<h${level} class="markdown-h${level}">${text.trim()}</h${level}>`;
  });

  // Handle backlinks [[path|display]] or [[path]]
  html = html.replace(/\[\[([^\]|]+)(\|([^\]]+))?\]\]/g, (match, path, _, display) => {
    const linkText = display || path.split('/').pop()?.replace(/\.md$/, '') || path;
    return `<span class="backlink" title="${path}">${linkText}</span>`;
  });

  // Handle bold text **text**
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Handle italic text *text*
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Handle inline code `code`
  html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

  // Handle line breaks
  html = html.replace(/\n\n/g, '</p><p class="markdown-p">');
  html = html.replace(/\n/g, '<br>');

  // Wrap in paragraph if not already wrapped
  if (!html.startsWith('<h') && !html.startsWith('<p')) {
    html = `<p class="markdown-p">${html}</p>`;
  }

  return { html, plainText };
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
