import type { Node } from 'unist';
import type { BlockContent } from 'mdast';
import { astDebugger } from '../../debug/ast-debugger';
import type { IsolatedCallout, TransformedCallout, CalloutElement, CalloutText, CalloutData, TransformedBlockquote } from './types';

/* section open ==============================================================
|
| ??-- About: Callout Transformation Phase
| ??-- Type: MDAST to Component Structure
|
| ??-- Includes: 
| //---- Component structure creation
| //---- HAST property setting
| //---- Content wrapping
| //---- Transformation tracking
|
====================================== */

/* function: -------------------------------------------------->

??-- Purpose:
   //-- Transform isolated callouts into component structure
   ---- Creates article wrapper with header and content
   ---- Sets HAST properties for HTML generation
-->

??-- Logic:
   //-- Called after isolation phase
   ---- 1. Creates article element with class and data attrs
   ---- 2. Creates header with title
   ---- 3. Wraps content in div
   ---- 4. Tracks all transformations
-->
*/
export async function transformCallouts(isolated: IsolatedCallout[]): Promise<TransformedCallout[]> {
  return isolated.map(item => {
    try {
      // Track transformations for debugging
      const transformations: string[] = [];
      
      /* ??-- Logic continued:
         //-- Set HAST properties for HTML generation
         ---- - Element name (article)
         ---- - Classes for styling
         ---- - Data attributes for type/title
      -->
      */
      const calloutData: CalloutData = {
        hName: 'article',
        hProperties: {
          className: ['callout', `callout-${item.info.type}`],
          'data-type': item.info.type,
          'data-title': item.info.title
        }
      };
      transformations.push('set-hast-properties');
      
      /* ??-- Logic continued:
         //-- Create component structure
         ---- - Header with title
         ---- - Content wrapper div
         ---- - Combine into final structure
      -->
      */
      const headerNode: CalloutElement = {
        type: 'element',
        data: {
          hName: 'header',
          hProperties: {
            className: ['callout-header']
          }
        },
        children: [{
          type: 'text',
          value: item.info.title
        } as CalloutText]
      };
      transformations.push('created-header');
      
      const contentNode: CalloutElement = {
        type: 'element',
        data: {
          hName: 'div',
          hProperties: {
            className: ['callout-content']
          }
        },
        children: item.content
      };
      transformations.push('wrapped-content');
      
      /* returns: ----------------------------->
          - Original node for error recovery
          - Transformed node with component structure
          - Metadata with transformation history
       to:
          - processCallouts in index.ts
          - embedCallouts in embed.ts
      */
      const transformedNode: TransformedBlockquote = {
        type: 'element',
        data: calloutData,
        children: [headerNode, contentNode],
        position: item.node.position
      };
      transformations.push('combined-structure');
      
      // Debug output for traceability
      astDebugger.writeDebugFile(`4-transform-${item.metadata.id}`, {
        phase: 'transform',
        id: item.metadata.id,
        transformations
      });
      
      return {
        originalNode: item.node,
        transformedNode,
        metadata: {
          id: item.metadata.id,
          transformations
        }
      };
    } catch (error) {
      console.error('Error transforming callout:', error);
      astDebugger.writeDebugFile('4-transform-error', {
        phase: 'transform',
        error: error.message,
        id: item.metadata.id
      });
      return {
        originalNode: item.node,
        transformedNode: {
          type: 'element',
          data: {
            hName: 'article',
            hProperties: {
              className: ['callout', 'callout-error']
            }
          },
          children: [],
          position: item.node.position
        },
        metadata: {
          id: item.metadata.id,
          transformations: ['error-preserved-original']
        }
      };
    }
  });
}

/* ========================================
??-- Affects: 
//----   Node structure
//----   HAST properties
//----   Component hierarchy
//----   Debug logs
// 
// Close: Callout Transformation Phase
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*/
