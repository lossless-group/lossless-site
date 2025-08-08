/**
 * remark-jsoncanvas-codeblocks.ts
 * 
 * A remark plugin specifically for JSON Canvas that transforms code blocks
 * into HTML elements that can be rendered in the canvas file previews.
 * 
 * This is simpler than the full MDX component system and works directly with HTML.
 */

import { visit } from 'unist-util-visit';
import type { Root, Parent } from 'mdast';
import type { Plugin } from 'unified';

// Utility function to escape HTML characters
function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

// Define the structure of a code node
interface Code {
  type: 'code';
  lang?: string;
  meta?: string;
  value: string;
}

// Define the structure of an HTML node
interface Html {
  type: 'html';
  value: string;
}

/**
 * remarkJsonCanvasCodeblocks
 * 
 * A remark plugin that transforms code blocks in markdown to HTML elements
 * suitable for JSON Canvas file previews.
 * 
 * @returns A transformer function that modifies the AST
 */
const remarkJsonCanvasCodeblocks: Plugin<[], Root> = function() {
  return function transformer(tree: Root) {
    try {
      visit(tree, 'code', (node: Code, index: number, parent: Parent | null) => {
        if (!parent) return;
        
        const lang = node.lang || 'text';
        const code = node.value;
        
        // Handle mermaid code blocks
        if (lang === 'mermaid') {
          // Generate a unique ID for this mermaid chart
          const chartId = `mermaid-chart-${Math.random().toString(36).slice(2, 10)}`;
          
          // Create HTML that matches the MermaidChart.astro component structure
          // This relies on the existing mermaid initialization from the main site
          const mermaidHtml = `
            <div id="${chartId}" class="mermaid-breakout" tabindex="0">
              <div class="mermaid-chart-shell">
                <div class="mermaid">${code}</div>
              </div>
            </div>
          `;
          
          // Add a script to ensure this chart gets rendered when mermaid is available
          // This follows the same pattern as MermaidChart.astro
          const initScript = `
            <script>
              (function() {
                function renderChart() {
                  if (window.mermaid && window.__MERMAID_LOADED__) {
                    const element = document.querySelector('#${chartId} .mermaid');
                    if (element && !element.getAttribute('data-processed')) {
                      try {
                        window.mermaid.run({ nodes: [element] });
                      } catch (e) {
                        console.error('Error rendering mermaid chart:', e);
                      }
                    }
                  } else {
                    // Retry in 100ms if mermaid isn't loaded yet
                    setTimeout(renderChart, 100);
                  }
                }
                
                // Start trying to render when DOM is ready
                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', renderChart);
                } else {
                  renderChart();
                }
              })();
            </script>
          `;
          
          const fullHtml = mermaidHtml + initScript;
          
          // Create an HTML node
          const htmlNode: Html = {
            type: 'html',
            value: fullHtml
          };
          
          // Replace the original code node with our HTML
          parent.children[index] = htmlNode as any;
        } else {
          // Handle regular code blocks with Prism.js highlighting
          // Create HTML that matches the BaseCodeblock.astro structure
          const escapedCode = escapeHtml(code);
          const codeBlockId = `codeblock-${Math.random().toString(36).slice(2, 10)}`;
          
          const codeBlockHtml = `
            <div class="codeblock-container" id="${codeBlockId}">
              <div class="codeblock-header">
                <span class="codeblock-language">${lang.toUpperCase()}</span>
                <button class="copy-button" aria-label="Copy code to clipboard">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2 2v1"></path>
                  </svg>
                </button>
              </div>
              <div class="codeblock-content">
                <pre class="language-${lang}" tabindex="0"><code class="language-${lang}">${escapedCode}</code></pre>
              </div>
            </div>
          `;
          
          // Add copy functionality script
          const copyScript = `
            <script>
              (function() {
                const container = document.getElementById('${codeBlockId}');
                if (!container) return;
                
                const copyButton = container.querySelector('.copy-button');
                if (!copyButton) return;
                
                copyButton.addEventListener('click', () => {
                  const codeElement = container.querySelector('pre code');
                  if (!codeElement) return;
                  
                  navigator.clipboard.writeText(codeElement.textContent || '')
                    .then(() => {
                      copyButton.classList.add('copied');
                      setTimeout(() => {
                        copyButton.classList.remove('copied');
                      }, 2000);
                    })
                    .catch(err => {
                      console.error('Failed to copy: ', err);
                    });
                });
              })();
            </script>
          `;
          
          const fullHtml = codeBlockHtml + copyScript;
          
          // Create an HTML node
          const htmlNode: Html = {
            type: 'html',
            value: fullHtml
          };
          
          // Replace the original code node with our HTML
          parent.children[index] = htmlNode as any;
        }
      });
      
      return tree;
    } catch (error) {
      console.error('Error in remark-jsoncanvas-codeblocks:', error);
      return tree;
    }
  };
};

export default remarkJsonCanvasCodeblocks;
