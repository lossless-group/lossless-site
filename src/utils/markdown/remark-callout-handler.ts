import { visit } from 'unist-util-visit';
import type { Root, Text, Blockquote, Parent, Paragraph } from 'mdast';
import type { Visitor } from 'unist-util-visit';
import { detectMarkdownCallouts } from './callouts/detectMarkdownCallouts';
import { isolateCallouts } from './callouts/isolateCalloutContent';
import { transformCallouts } from './callouts/transformCalloutStructure';
import { embedCallouts } from './callouts/embedCalloutNodes';
import { astDebugger } from '../debug/ast-debugger';

/* section open ==============================================================
|
| ??-- About: Remark Plugin for Callout Processing
| ??-- Type: Markdown AST Transformation
|
| ??-- Includes: 
| //---- Callout detection
| //---- Content isolation
| //---- Structure transformation
| //---- Node embedding
|
====================================== */

export default function remarkCalloutHandler() {
  return async (tree: Root) => {
    astDebugger.writeDebugFile('1-initial-tree', tree);
    
    try {
      // Phase 1: Detect callouts in the AST
      const detectedCallouts = await detectMarkdownCallouts(tree);
      astDebugger.writeDebugFile('2-detected-callouts', detectedCallouts);
      
      if (detectedCallouts.length === 0) {
        astDebugger.writeDebugFile('2a-no-callouts', { message: 'No callouts detected' });
        return tree;
      }
      
      // Phase 2: Isolate callout content
      const isolatedCallouts = await isolateCallouts(detectedCallouts);
      astDebugger.writeDebugFile('3-isolated-callouts', isolatedCallouts);
      
      // Phase 3: Transform callout structure
      const transformedCallouts = await Promise.all(
        isolatedCallouts.map(callout => transformCalloutStructure(callout))
      );
      astDebugger.writeDebugFile('4-transformed-callouts', transformedCallouts);
      
      // Phase 4: Embed transformed nodes back into AST
      const updatedTree = await embedCalloutNodes(tree, transformedCallouts);
      astDebugger.writeDebugFile('5-final-tree', updatedTree);
      
      return updatedTree;
    } catch (error) {
      console.error('Error in callout processing:', error);
      astDebugger.writeDebugFile('error-callout-processing', {
        phase: 'remarkCalloutHandler',
        error: error.message,
        stack: error.stack
      });
      // Return original tree on error to avoid breaking the pipeline
      return tree;
    }
  };
}

/* ========================================
??-- Affects: 
//----   AST traversal
//----   Callout processing
//----   Debug logs
// 
// Close: Remark Plugin for Callout Processing
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*/