import { visit } from 'unist-util-visit';
import type { Node } from 'unist';
import type { Blockquote, Paragraph, Text } from 'mdast';
import { astDebugger } from '../../debug/ast-debugger';
import type { CalloutNode } from './calloutTypes';
import { knownCalloutCases } from './calloutCases';

/* section open ==============================================================
|
| ??-- About: Callout Detection Phase
| ??-- Type: AST Pattern Matching
|
| ??-- Includes: 
| //---- Syntax detection
| //---- Type extraction
| //---- Title parsing
|
====================================== */

/* function: -------------------------------------------------->

??-- Purpose:
   //-- Detect callout syntax in markdown blockquotes
   ---- Matches [!TYPE] Title pattern
   ---- Extracts type and title information
-->

??-- Logic:
   //-- Called from processCallouts
   ---- 1. Visits each blockquote node
   ---- 2. Reconstructs blockquote content
   ---- 3. Tests against known patterns
   ---- 4. Returns array of detected nodes
-->
*/
export async function detectMarkdownCallouts(tree: Node): Promise<CalloutNode[]> {
  const callouts: CalloutNode[] = [];
  const detectionResults: Record<string, number> = {};
  
  try {
    visit(tree, 'blockquote', (node: Blockquote) => {
      // Reconstruct the full blockquote content
      const blockContent = reconstructBlockquote(node);
      if (!blockContent) return;
      
      // Try each known case
      for (const [caseId, calloutCase] of Object.entries(knownCalloutCases)) {
        const match = blockContent.match(calloutCase.detectPattern);
        if (!match) continue;
        
        // Track which case matched
        detectionResults[caseId] = (detectionResults[caseId] || 0) + 1;
        
        const [, type = calloutCase.type, title = type] = match;
        callouts.push({
          node,
          info: {
            type: type.toLowerCase(),
            title: title.trim() || type
          }
        });
        
        break; // Stop after first match
      }
    });
    
    /* returns: ----------------------------->
          - Array of detected callout nodes
          - Empty array if none found
       to:
          - processCallouts in processCalloutPipeline.ts
          - isolateCalloutContent in isolateCalloutContent.ts
    */
    
    // Debug output for traceability
    astDebugger.writeDebugFile('2-detect-callouts', {
      phase: 'detect',
      found: callouts.length,
      types: callouts.map(c => c.info.type),
      matchedCases: detectionResults
    });
    
    return callouts;
  } catch (error) {
    console.error('Error detecting callouts:', error);
    astDebugger.writeDebugFile('2-detect-error', {
      phase: 'detect',
      error: error.message
    });
    return [];
  }
}

/* function: -------------------------------------------------->

??-- Purpose:
   //-- Reconstruct blockquote content from AST
   ---- Preserves line structure
   ---- Maintains blockquote prefixes
-->

??-- Logic:
   //-- Called for each blockquote node
   ---- 1. Extracts text from paragraphs
   ---- 2. Adds blockquote prefix
   ---- 3. Preserves line breaks
-->
*/
function reconstructBlockquote(node: Blockquote): string | null {
  try {
    let content = '';
    
    for (const child of node.children) {
      if (child.type === 'paragraph') {
        const paragraph = child as Paragraph;
        for (const textNode of paragraph.children) {
          if (textNode.type === 'text') {
            // Add blockquote prefix to each line
            const lines = textNode.value.split('\n');
            content += lines.map(line => `> ${line}`).join('\n');
          }
        }
        content += '\n';
      }
    }
    
    return content.trim();
  } catch (error) {
    console.error('Error reconstructing blockquote:', error);
    return null;
  }
}

/* ========================================
??-- Affects: 
//----   AST traversal
//----   Pattern matching
//----   Debug logs
// 
// Close: Callout Detection Phase
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*/
