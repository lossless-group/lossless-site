/**
 * JSON Canvas Types
 * Type definitions for JSON Canvas specification v1.0
 * https://jsoncanvas.org/spec/1.0/
 */

// Color types
export type CanvasColor = string | number;

// Base interface for all canvas nodes
interface BaseCanvasNode {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color?: CanvasColor;
}

// Text node - contains markdown text
export interface TextNode extends BaseCanvasNode {
  type: 'text';
  text: string;
}

// File node - references a file path
export interface FileNode extends BaseCanvasNode {
  type: 'file';
  file: string;
  subpath?: string;
}

// Link node - references a URL
export interface LinkNode extends BaseCanvasNode {
  type: 'link';
  url: string;
}

// Group node - visual grouping container
export interface GroupNode extends BaseCanvasNode {
  type: 'group';
  label?: string;
  background?: string;
  backgroundStyle?: 'cover' | 'ratio' | 'repeat';
}

// Union type for all canvas nodes
export type CanvasNode = TextNode | FileNode | LinkNode | GroupNode;

// Canvas edge interface
export interface CanvasEdge {
  id: string;
  fromNode: string;
  fromSide?: 'top' | 'right' | 'bottom' | 'left';
  fromEnd?: 'none' | 'arrow';
  toNode: string;
  toSide?: 'top' | 'right' | 'bottom' | 'left';
  toEnd?: 'none' | 'arrow';
  color?: CanvasColor;
  label?: string;
}

// Main JSON Canvas interface
export interface JSONCanvas {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
}

// Validation result interface
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Parsed canvas with validation info
export interface ParsedCanvas {
  canvas: JSONCanvas;
  validation: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  };
  debugInfo: {
    nodeCount: number;
    edgeCount: number;
    nodeTypes: Record<string, number>;
    invalidEdges: string[];
  };
}

// Canvas dimensions
export interface CanvasDimensions {
  width: number;
  height: number;
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

// Transformed canvas for rendering
export interface TransformedCanvas {
  canvas: JSONCanvas;
  dimensions: CanvasDimensions;
  canvasId: string;
}
