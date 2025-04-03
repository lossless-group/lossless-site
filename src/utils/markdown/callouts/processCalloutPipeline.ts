import type { Node } from 'unist';
import type { Plugin } from 'unified';
import { astDebugger } from '../../debug/ast-debugger';
import { detectMarkdownCallouts } from './detectMarkdownCallouts';
import type { CalloutNode } from './calloutTypes';

/* section open ==============================================================
|
| ??-- About: Callout Processing Pipeline
| ??-- Type: Remark Plugin
|
| ??-- Includes: 
| //---- Debug mode handling
| //---- AST transformation
| //---- Error recovery
|
====================================== */

/**
 * Complete callout processing pipeline
 * Transforms blockquotes with [!TYPE] syntax into callout nodes
 * 
 * @param tree MDAST tree to process
 * @returns Modified MDAST tree with callouts transformed
 */
/* function: -------------------------------------------------->

??-- Purpose:
   //-- Process callouts in markdown content
   ---- Detect and transform callout syntax
   ---- Write debug files at each step
-->

??-- Logic:
   //-- Called from unified pipeline
   ---- 1. Check debug mode
   ---- 2. Run detection phase
   ---- 3. Write debug files
   ---- 4. Return transformed AST
-->
*/

// Get debug mode from environment
const DEBUG_AST = process.env.DEBUG_AST === 'true';

export const processCallouts: Plugin = () => {
  return async function transformer(tree: Node): Promise<Node> {
    try {
      // Write initial tree state
      if (DEBUG_AST) {
        astDebugger.writeDebugFile('2a-callouts-input', {
          phase: 'callouts-input',
          tree
        });
      }

      /* function: -------------------------------------------------->
      ??-- Purpose:
         //-- Transform blockquotes into callout nodes
         ---- Detects [!TYPE] syntax
         ---- Creates custom callout nodes
         ---- Preserves content structure
      -->

      ??-- Logic:
         //-- Called from remark plugin
         ---- 1. Detects callouts in blockquotes
         ---- 2. Creates custom nodes
         ---- 3. Updates AST in place
      -->
      */
      const transformedTree = await detectMarkdownCallouts(tree);

      // Write final tree state
      if (DEBUG_AST) {
        astDebugger.writeDebugFile('2b-callouts-output', {
          phase: 'callouts-output',
          tree: transformedTree
        });
      }

      return transformedTree;
    } catch (error) {
      console.error('Error in callout pipeline:', error);
      if (DEBUG_AST) {
        astDebugger.writeDebugFile('2c-callouts-error', {
          phase: 'callouts-error',
          error: error.message,
          stack: error.stack
        });
      }
      return tree;
    }
  };
};

/* ========================================
??-- Affects: 
//----   AST structure
//----   Debug logs
//----   Error handling
// 
// Close: Callout Processing Pipeline
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*/
