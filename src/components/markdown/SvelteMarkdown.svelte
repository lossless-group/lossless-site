<script lang="ts">
  import { onMount } from 'svelte';
  import { remark } from 'remark';
  import remarkHtml from 'remark-html';
  import remarkGfm from 'remark-gfm';
  import remarkJsonCanvasCodeblocks from '../../utils/markdown/remark-jsoncanvas-codeblocks.js';
  import { sanitizeMermaidCode, getShikiHighlighter, getLanguageRoutingStrategy } from '../../utils/shikiHighlighter.js';
  import { slugify, extractAllText } from '../../utils/slugify.js';

  export let content: string = '';
  export let className: string = '';

  let renderedHtml = '';
  let isProcessing = true;

  // Simple remark plugin to sanitize Mermaid code blocks
  function remarkSanitizeMermaid() {
    return (tree: any) => {
      function visit(node: any) {
        if (node.type === 'code' && node.lang === 'mermaid') {
          node.value = sanitizeMermaidCode(node.value);
        }
        if (node.children) {
          node.children.forEach(visit);
        }
      }
      visit(tree);
    };
  }

  // Process markdown content using the same pipeline as AstroMarkdown.astro
  async function processMarkdown(markdownContent: string): Promise<string> {
    if (!markdownContent) {
      return '';
    }

    try {
      // Remove frontmatter before processing
      let contentWithoutFrontmatter = markdownContent;
      
      // Check if content starts with frontmatter (--- at the beginning)
      if (markdownContent.startsWith('---')) {
        const frontmatterEndIndex = markdownContent.indexOf('---', 3);
        if (frontmatterEndIndex !== -1) {
          // Remove the frontmatter section (including the closing ---)
          contentWithoutFrontmatter = markdownContent.substring(frontmatterEndIndex + 3).trim();
        }
      }

      // Use the same remark pipeline as AstroMarkdown.astro
      const processor = remark()
        .use(remarkGfm)
        .use(remarkSanitizeMermaid)
        .use(remarkJsonCanvasCodeblocks)
        .use(remarkHtml, { sanitize: false });

      let html = String(processor.processSync(contentWithoutFrontmatter));

      // Add CSS classes to elements for styling (same as AstroMarkdown.astro)
      html = html
        .replace(/<h1>/g, '<h1 class="markdown-h1">')
        .replace(/<h2>/g, '<h2 class="markdown-h2">')
        .replace(/<h3>/g, '<h3 class="markdown-h3">')
        .replace(/<h4>/g, '<h4 class="markdown-h4">')
        .replace(/<h5>/g, '<h5 class="markdown-h5">')
        .replace(/<h6>/g, '<h6 class="markdown-h6">')
        .replace(/<p>/g, '<p class="markdown-p">')
        .replace(/<code>/g, '<code class="inline-code">');

      // Handle backlinks [[path|display]] or [[path]] (same as AstroMarkdown.astro)
      html = html.replace(/\[\[([^\]|]+)(\|([^\]]+))?\]\]/g, (match, path, _, display) => {
        const linkText = display || path.split('/').pop()?.replace(/\.md$/, '') || path;
        return `<span class="backlink" title="${path}">${linkText}</span>`;
      });

      return html;
    } catch (error) {
      console.error('Error processing markdown:', error);
      return `<p class="markdown-p">${markdownContent}</p>`;
    }
  }

  // Process content when it changes
  $: if (content) {
    isProcessing = true;
    processMarkdown(content).then(html => {
      renderedHtml = html;
      isProcessing = false;
    });
  }

  onMount(() => {
    if (content) {
      processMarkdown(content).then(html => {
        renderedHtml = html;
        isProcessing = false;
      });
    }
  });
</script>

{#if isProcessing}
  <div class="markdown-loading {className}">
    <span>Processing markdown...</span>
  </div>
{:else}
  <div class="svelte-markdown {className}">{@html renderedHtml}</div>
{/if}

<style>
  .markdown-loading {
    color: var(--clr-body);
    font-style: italic;
    opacity: 0.7;
  }

  .svelte-markdown {
    width: 100%;
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    font-family: var(--ff-legible);
    font-size: 12px;
    line-height: 1.5;
    color: var(--clr-body);
  }

  /* Markdown element styles - same as AstroMarkdown.astro */
  .svelte-markdown :global(.markdown-h1),
  .svelte-markdown :global(.markdown-h2),
  .svelte-markdown :global(.markdown-h3),
  .svelte-markdown :global(.markdown-h4),
  .svelte-markdown :global(.markdown-h5),
  .svelte-markdown :global(.markdown-h6),
  .svelte-markdown :global(h1),
  .svelte-markdown :global(h2),
  .svelte-markdown :global(h3),
  .svelte-markdown :global(h4),
  .svelte-markdown :global(h5),
  .svelte-markdown :global(h6) {
    font-family: var(--ff-base) !important;
    font-weight: var(--fw-semi-bold) !important;
    color: var(--clr-heading) !important;
    margin: 0.5em 0 0.3em 0 !important;
    line-height: 1.2 !important;
  }

  .svelte-markdown :global(.markdown-h1),
  .svelte-markdown :global(h1) { font-size: 19px !important; }
  
  .svelte-markdown :global(.markdown-h2),
  .svelte-markdown :global(h2) { font-size: 18px !important; }
  
  .svelte-markdown :global(.markdown-h3),
  .svelte-markdown :global(h3) { font-size: 17px !important; }
  
  .svelte-markdown :global(.markdown-h4),
  .svelte-markdown :global(h4) { font-size: 16px !important; }
  
  .svelte-markdown :global(.markdown-h5),
  .svelte-markdown :global(h5) { font-size: 14px !important; }
  
  .svelte-markdown :global(.markdown-h6),
  .svelte-markdown :global(h6) { font-size: 13px !important; }

  .svelte-markdown :global(.markdown-p) {
    margin: 0.4em 0;
    line-height: 1.4;
    color: var(--clr-body);
    font-size: 12px !important;
  }

  .svelte-markdown :global(.backlink) {
    color: var(--clr-link);
    text-decoration: underline;
    cursor: pointer;
  }

  .svelte-markdown :global(.backlink:hover) {
    color: var(--clr-lossless-accent--brightest);
  }

  .svelte-markdown :global(.inline-code) {
    background: var(--clr-lossless-primary-glass--lighter);
    padding: 0.1em 0.3em;
    border-radius: 3px;
    font-family: monospace;
    font-size: var(--fs-150);
    color: var(--clr-body);
  }

  /* Mermaid chart styling for JSON Canvas */
  .svelte-markdown :global(.mermaid-breakout) {
    position: relative;
    margin: 1rem 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: transparent;
    box-sizing: border-box;
  }

  .svelte-markdown :global(.mermaid-chart-shell) {
    position: relative;
    width: 100%;
    max-width: 100%;
    margin: 0;
    overflow-x: auto;
    background: var(--clr-primary-bg);
    border: 1px solid var(--clr-lossless-accent--brightest);
    border-radius: 6px;
    padding: 0.5rem;
    display: block;
  }

  .svelte-markdown :global(.mermaid) {
    background: transparent !important;
    box-shadow: none !important;
    border-radius: 0 !important;
    padding: 0 !important;
    margin: 0 !important;
    font-size: 10px !important;
    max-width: 100%;
  }

  .svelte-markdown :global(.mermaid svg) {
    max-width: 100%;
    height: auto;
  }

  /* Code block styling for JSON Canvas */
  .svelte-markdown :global(.codeblock-container) {
    position: relative;
    margin: 1.5rem 0;
    border-radius: 0.5rem;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    background: var(--clr-code-bg, #1e1e1e);
  }
  
  .svelte-markdown :global(.codeblock-header) {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 1rem;
    background-color: rgba(0, 0, 0, 0.2);
    border-top-left-radius: 0.5rem;
    border-top-right-radius: 0.5rem;
    font-family: var(--ff-monospace, monospace);
    font-size: 0.8rem;
  }
  
  .svelte-markdown :global(.codeblock-language) {
    text-transform: uppercase;
    font-weight: bold;
    color: var(--clr-code-lang, #8a8a8a);
    letter-spacing: 0.05em;
  }
  
  .svelte-markdown :global(.codeblock-content) {
    margin: 0;
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    padding: 0;
    overflow-x: auto;
    background-color: var(--clr-code-bg, #1e1e1e);
    max-height: 400px;
    overflow-y: auto;
  }

  .svelte-markdown :global(.codeblock-content pre) {
    margin: 0;
    padding: 1em;
    background: transparent;
    border-radius: 0;
    font-size: 0.85rem;
    line-height: 1.5;
  }

  .svelte-markdown :global(.codeblock-content code) {
    background: transparent;
    padding: 0;
    border-radius: 0;
    font-family: var(--ff-monospace, 'Fira Code', 'Consolas', monospace);
  }

  .svelte-markdown :global(strong) {
    font-weight: var(--fw-bold);
    color: var(--clr-heading);
  }

  .svelte-markdown :global(em) {
    font-style: italic;
  }

  /* Custom scrollbar styling */
  .svelte-markdown::-webkit-scrollbar {
    width: 6px;
  }

  .svelte-markdown::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }

  .svelte-markdown::-webkit-scrollbar-thumb {
    background: var(--clr-lossless-accent--brightest);
    border-radius: 3px;
    opacity: 0.7;
  }

  .svelte-markdown::-webkit-scrollbar-thumb:hover {
    background: var(--clr-lossless-accent--bright);
    opacity: 1;
  }
</style>
