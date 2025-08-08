/**
 * remark-codeblocks.ts
 * 
 * A remark plugin to transform code blocks in markdown to use custom components
 * based on the language specified.
 * 
 * This plugin transforms standard markdown code blocks into custom Astro components
 * that provide enhanced functionality like copy buttons and language indicators.
 */

import { visit } from 'unist-util-visit';
import type { Root, Parent } from 'mdast';
import type { Plugin } from 'unified';
import { astDebugger } from '../debug/ast-debugger';

// Define the structure of a code node
interface Code {
  type: 'code';
  lang?: string;
  meta?: string;
  value: string;
}

// Define the structure of an MDX JSX node for our component
interface MdxJsxAttribute {
  type: 'mdxJsxAttribute';
  name: string;
  value: string;
}

interface MdxJsxFlowElement {
  type: 'mdxJsxFlowElement';
  name: string;
  attributes: MdxJsxAttribute[];
  children: any[];
  data?: { _mdxExplicitJsx: boolean };
}

/**
 * remarkCodeblocks
 * 
 * A remark plugin that transforms code blocks in markdown to use custom Astro components
 * based on the language specified.
 * 
 * @returns A transformer function that modifies the AST
 */
const remarkCodeblocks: Plugin<[], Root> = function() {
  return function transformer(tree: Root) {
    // Track transformations for debugging
    const transformations: string[] = [];
    
    try {
      visit(tree, 'code', (node: Code, index: number, parent: Parent | null) => {
        if (!parent) return;
        
        const lang = node.lang || 'text';
        
        // Determine which component to use based on language
        let componentName = 'BaseCodeblock';
        if (lang === 'litegal') {
          componentName = 'LitegalCodeblockDisplay';
        } else if (lang === 'dataview') {
          componentName = 'DataviewCodeblockDisplay';
        } else if (lang === 'mermaid') {
          componentName = 'MermaidChart';
        }
        
        // Create an MDX component node
        const mdxNode: MdxJsxFlowElement = {
          type: 'mdxJsxFlowElement',
          name: componentName,
          attributes: [
            {
              type: 'mdxJsxAttribute',
              name: 'code',
              value: node.value
            },
            {
              type: 'mdxJsxAttribute',
              name: 'lang',
              value: lang
            }
          ],
          children: [],
          data: { _mdxExplicitJsx: true }
        };
        
        // Replace the original code node with our custom component
        parent.children[index] = mdxNode as any;
        transformations.push(`transformed-codeblock-${lang}-to-${componentName}`);
      });
      
      // Debug output
      if (transformations.length > 0) {
        astDebugger.writeDebugFile('remark-codeblocks-transformations', {
          phase: 'remark-codeblocks',
          transformations
        });
      }
      
      return tree;
    } catch (error) {
      console.error('Error in remark-codeblocks:', error);
      astDebugger.writeDebugFile('remark-codeblocks-error', {
        phase: 'remark-codeblocks',
        error: error.message,
        stack: error.stack
      });
      return tree;
    }
  };
};

export default remarkCodeblocks;
