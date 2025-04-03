import type { Node } from 'unist';
import type { Blockquote, BlockContent, Content } from 'mdast';

/* section open ==============================================================
|
| ??-- About: Callout Type Definitions
| ??-- Type: TypeScript Interfaces
|
| ??-- Includes: 
| //---- Core data structures
| //---- MDAST extensions
| //---- Pipeline interfaces
|
====================================== */

export interface CalloutInfo {
  type: string;
  title?: string;
}

export interface CalloutNode {
  node: Blockquote;
  info: CalloutInfo;
}

export interface IsolatedCallout {
  node: Blockquote;
  info: CalloutInfo;
  content: BlockContent[];
  metadata: {
    sourceLocation: {
      line: number;
      column: number;
    };
    id: string;
  };
}

export interface CalloutText {
  type: 'text';
  value: string;
}

export interface CalloutElement {
  type: 'element';
  data: {
    hName: string;
    hProperties: {
      className: string[];
      [key: string]: unknown;
    };
  };
  children: (BlockContent | CalloutElement | CalloutText)[];
}

export interface CalloutData {
  hName: string;
  hProperties: {
    className: string[];
    [key: string]: unknown;
  };
}

export interface TransformedBlockquote {
  type: 'blockquote';
  data: CalloutData;
  children: CalloutElement[];
  position?: Blockquote['position'];
}

export interface TransformedCallout {
  originalNode: Blockquote;
  transformedNode: TransformedBlockquote;
  metadata: {
    id: string;
    transformations: string[];
  };
}

/* ========================================
??-- Affects: 
//----   AST type safety
//----   Pipeline interfaces
//----   Component structure
// 
// Close: Callout Type Definitions
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*/
