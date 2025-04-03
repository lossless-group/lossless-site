import type { Node, Parent } from 'unist';
import type { Blockquote, BlockContent } from 'mdast';

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

export interface CalloutElementData {
  hName: string;
  hProperties: {
    className?: string[];
    'data-type'?: string;
    'data-title'?: string;
    id?: string;
    onclick?: string;
    open?: boolean;
    [key: string]: any;
  };
}

export interface CalloutElement extends Node {
  type: 'element';
  data: CalloutElementData;
  children: (CalloutElement | CalloutText)[];
}

export interface CalloutText extends Node {
  type: 'text';
  value: string;
}

export interface CalloutNode extends Node {
  type: 'callout';
  calloutType: string;
  title?: string;
  data: CalloutElementData;
  children: CalloutElement[];
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

/* ========================================
??-- Affects: 
//----   AST node types
//----   HTML transformation
//----   Type safety
// 
// Close: Callout Type Definitions
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*/
