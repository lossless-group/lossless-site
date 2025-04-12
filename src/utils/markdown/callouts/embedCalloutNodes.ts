import { visit, SKIP } from 'unist-util-visit';
import type { Node, Parent } from 'unist';
import type { Data } from 'unist';
import { astDebugger } from '../../debug/ast-debugger';

interface CalloutNode extends Node {
  data?: {
    hProperties?: {
      className?: string[];
      'data-type'?: string;
    };
  };
}

interface TransformedCallout {
  originalNode: Node;
  transformedNode: CalloutNode;
  metadata: {
    id: string;
    transformations: string[];
  };
}

/* section open ==============================================================
|
| ??-- About: Callout Embedding Phase
| ??-- Type: AST Node Replacement
|
| ??-- Includes: 
| //---- Node replacement
| //---- Tree traversal
| //---- Transformation tracking
|
====================================== */

/* function: -------------------------------------------------->

??-- Purpose:
   //-- Replace original callout nodes with transformed versions
   ---- Preserves tree structure and relationships
   ---- Maintains source locations
-->

??-- Logic:
   //-- Called after transformation phase
   ---- 1. Creates map of original to transformed nodes
   ---- 2. Traverses tree looking for matches
   ---- 3. Replaces nodes in-place
   ---- 4. Tracks replacements for debugging
-->
*/
export async function embedCallouts(tree: Node, transformed: TransformedCallout[]): Promise<Node> {
  try {
    // Create map for quick lookup
    const transformMap = new Map(
      transformed.map(t => [t.originalNode, t.transformedNode])
    );
    
    // Track replacements for debugging
    const replacements: string[] = [];
    
    /* ??-- Logic continued:
       //-- Replace nodes in tree
       ---- - Visit each element
       ---- - Check for transformation and callout class
       ---- - Replace if found
       ---- - Skip children to avoid re-processing
    -->
    */
    visit(tree, 'element', (node: CalloutNode, index: number, parent: Parent) => {
      const replacement = transformMap.get(node);
      if (!replacement || !node.data?.hProperties?.className?.includes('callout')) return SKIP;
      
      if (typeof index === 'number') {
        parent.children[index] = replacement;
        replacements.push(replacement.data.hProperties['data-type'] as string);
      }
      return SKIP;
    });
    
    /* returns: ----------------------------->
          - Modified tree with replacements
          - Original tree if error occurs
       to:
          - processCallouts in index.ts
          - remark-rehype pipeline
    */
    
    // Debug output for traceability
    astDebugger.writeDebugFile('5-embed-callouts', {
      phase: 'embed',
      replacements,
      finalTree: tree
    });
    
    return tree;
  } catch (error) {
    console.error('Error embedding callouts:', error);
    astDebugger.writeDebugFile('5-embed-error', {
      phase: 'embed',
      error: error.message
    });
    return tree;
  }
}

/* ========================================
??-- Affects: 
//----   AST structure
//----   Node relationships
//----   Debug logs
// 
// Close: Callout Embedding Phase
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*/
