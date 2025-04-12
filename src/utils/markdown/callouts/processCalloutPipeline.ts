import type { Node } from 'unist';
import { astDebugger } from '../../debug/ast-debugger';
import { detectMarkdownCallouts } from './detectMarkdownCallouts';
import { isolateCallouts } from './isolateCalloutContent';
import { transformCallouts } from './transformCalloutStructure';
import { embedCallouts } from './embedCalloutNodes';
import type { CalloutNode, IsolatedCallout, TransformedCallout } from './calloutTypes';

/* section open ==============================================================
|
| ??-- About: Callout Processing Pipeline
| ??-- Type: AST Transformation Pipeline
|
| ??-- Includes: 
| //---- Phase coordination
| //---- Error handling
| //---- Debug output
|
====================================== */

/**
 * Complete callout processing pipeline
 * Follows the four-phase approach for AST transformation
 * 
 * @param tree MDAST tree to process
 * @returns Modified MDAST tree with callouts transformed
 */
export async function processCallouts(tree: Node): Promise<Node> {
  try {
    /* function: -------------------------------------------------->
    ??-- Purpose:
       //-- Process callouts through all transformation phases
       ---- Detect -> Isolate -> Transform -> Embed
       ---- Maintains error context and debug output
    -->

    ??-- Logic:
       //-- Called from remark plugin
       ---- 1. Detects callouts in blockquotes
       ---- 2. Isolates content and metadata
       ---- 3. Transforms to component structure
       ---- 4. Embeds back into AST
    -->
    */
    // Phase 1: Detection
    const detected = await detectMarkdownCallouts(tree);
    if (!detected.length) {
      astDebugger.writeDebugFile('1-no-callouts', {
        phase: 'detect',
        message: 'No callouts found'
      });
      return tree;
    }
    
    // Phase 2: Isolation
    const isolated = await isolateCallouts(detected);
    if (!isolated.length) {
      astDebugger.writeDebugFile('2-isolation-failed', {
        phase: 'isolate',
        message: 'Failed to isolate callouts'
      });
      return tree;
    }
    
    // Phase 3: Transformation
    const transformed = await transformCallouts(isolated);
    if (!transformed.length) {
      astDebugger.writeDebugFile('3-transform-failed', {
        phase: 'transform',
        message: 'Failed to transform callouts'
      });
      return tree;
    }
    
    // Phase 4: Embedding
    return await embedCallouts(tree, transformed);
  } catch (error) {
    console.error('Error in callout pipeline:', error);
    astDebugger.writeDebugFile('pipeline-error', {
      phase: 'pipeline',
      error: error.message
    });
    return tree;
  }
}

/* ========================================
??-- Affects: 
//----   AST structure
//----   Debug logs
//----   Error handling
// 
// Close: Callout Processing Pipeline
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*/
