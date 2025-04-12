import type { Node } from 'unist';
import type { BlockContent, Content } from 'mdast';
import { astDebugger } from '../../debug/ast-debugger';
import type { CalloutNode, IsolatedCallout } from './calloutTypes';

/* section open ==============================================================
|
| ??-- About: Callout Isolation Phase
| ??-- Type: AST Content Extraction
|
| ??-- Includes: 
| //---- Content node extraction
| //---- Source location tracking
| //---- Metadata preservation
|
====================================== */

/* function: -------------------------------------------------->

??-- Purpose:
   //-- Extract and preserve callout content with context
   ---- Separates title/type from content
   ---- Maintains source location for debugging
-->

??-- Logic:
   //-- Called after detection phase
   ---- 1. Maps over detected callout nodes
   ---- 2. Extracts title paragraph
   ---- 3. Preserves remaining content
   ---- 4. Adds source tracking metadata
-->
*/
export async function isolateCallouts(callouts: CalloutNode[]): Promise<IsolatedCallout[]> {
  return callouts.map(({ node, info }) => {
    try {
      // Split content while preserving structure
      const [titleNode, ...contentNodes] = (node.children || []) as Content[];
      
      // Generate tracking ID
      const id = `callout-${info.type}-${Date.now()}`;
      
      /* returns: ----------------------------->
          - Isolated callout data with:
            - Original node reference
            - Extracted content nodes
            - Source location
            - Unique tracking ID
       to:
          - processCallouts in index.ts
          - transformCallouts in transform.ts
      */
      const isolated: IsolatedCallout = {
        node,
        info,
        content: contentNodes as BlockContent[],
        metadata: {
          sourceLocation: {
            line: node.position?.start?.line || 0,
            column: node.position?.start?.column || 0
          },
          id
        }
      };
      
      // Debug output for traceability
      astDebugger.writeDebugFile(`3-isolate-${id}`, {
        phase: 'isolate',
        id,
        type: info.type,
        title: info.title,
        contentNodes: contentNodes.length
      });
      
      return isolated;
    } catch (error) {
      console.error('Error isolating callout:', error);
      astDebugger.writeDebugFile('3-isolate-error', {
        phase: 'isolate',
        error: error.message,
        node: node
      });
      return null;
    }
  }).filter(Boolean);
}

/* ========================================
??-- Affects: 
//----   Content structure
//----   Source tracking
//----   Debug logs
// 
// Close: Callout Isolation Phase
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*/
