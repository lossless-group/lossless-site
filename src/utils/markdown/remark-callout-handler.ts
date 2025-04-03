import type { Root } from 'mdast';
import type { Plugin } from 'unified';
import { processCallouts } from './callouts/processCalloutPipeline';
import { astDebugger } from '../debug/ast-debugger';

/* section open ==============================================================
|
| ??-- About: Remark Plugin for Callout Processing
| ??-- Type: Markdown AST Transformation
|
| ??-- Includes: 
| //---- Integration with unified pipeline
| //---- Error handling
| //---- Debug output
|
====================================== */

/**
 * Remark plugin that processes callouts in markdown.
 * Uses the four-phase pipeline from processCalloutPipeline:
 * 1. Detection (detectMarkdownCallouts)
 * 2. Isolation (isolateCalloutContent)
 * 3. Transformation (transformCalloutStructure)
 * 4. Embedding (embedCalloutNodes)
 */
const remarkCalloutHandler: Plugin<[], Root> = () => {
  return async (tree: Root) => {
    try {
      astDebugger.writeDebugFile('0-initial-tree', tree);
      
      // Process callouts through all phases
      const processedTree = await processCallouts(tree);
      
      astDebugger.writeDebugFile('5-final-tree', processedTree);
      return processedTree;
    } catch (error) {
      console.error('Error in remark-callout:', error);
      astDebugger.writeDebugFile('remark-callout-error', {
        phase: 'remark-plugin',
        error: error.message,
        stack: error.stack
      });
      // Return original tree on error to avoid breaking the pipeline
      return tree;
    }
  };
};

export default remarkCalloutHandler;

/* ========================================
??-- Affects: 
//----   Remark plugin pipeline
//----   AST transformation
//----   Debug logs
// 
// Close: Remark Plugin for Callout Processing
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*/