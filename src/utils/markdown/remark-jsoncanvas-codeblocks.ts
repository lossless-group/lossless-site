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
        }
        // For other code blocks, leave them as-is (they'll be handled by the default remark-html)
      });
      
      return tree;
    } catch (error) {
      console.error('Error in remark-jsoncanvas-codeblocks:', error);
      return tree;
    }
  };
};

export default remarkJsonCanvasCodeblocks;
