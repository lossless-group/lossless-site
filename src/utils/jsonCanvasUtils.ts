/**
 * JSON Canvas Utilities
 * Parsing, validation, and transformation utilities for JSON Canvas files
 * Following JSON Canvas Specification v1.0
 */

import type {
  CanvasColor,
  CanvasNode,
  CanvasEdge,
  JSONCanvas,
  ParsedCanvas,
  ValidationResult
} from '../types/json-canvas';

// Re-export types for convenience
export type {
  CanvasColor,
  CanvasNode,
  CanvasEdge,
  JSONCanvas,
  ParsedCanvas,
  ValidationResult
} from '../types/json-canvas';

// Preset colors mapping (implementation-specific values)
export const PRESET_COLORS = {
  '1': '#ff6b6b', // red
  '2': '#ffa726', // orange
  '3': '#ffeb3b', // yellow
  '4': '#66bb6a', // green
  '5': '#26c6da', // cyan
  '6': '#ab47bc'  // purple
} as const;

/**
 * Parse and validate a JSON Canvas file
 */
export function parseJSONCanvas(jsonContent: string): ParsedCanvas {
  const result: ParsedCanvas = {
    canvas: null,
    validation: {
      isValid: false,
      errors: [],
      warnings: []
    },
    debugInfo: {
      nodeCount: 0,
      edgeCount: 0,
      nodeTypes: {},
      invalidEdges: []
    }
  };

  try {
    // Parse JSON
    const parsed = JSON.parse(jsonContent);
    
    // Basic structure validation
    if (!parsed || typeof parsed !== 'object') {
      result.validation.errors.push('Invalid JSON Canvas format: not an object');
      return result;
    }

    if (!Array.isArray(parsed.nodes)) {
      result.validation.errors.push('Invalid JSON Canvas format: nodes must be an array');
      return result;
    }

    if (!Array.isArray(parsed.edges)) {
      result.validation.errors.push('Invalid JSON Canvas format: edges must be an array');
      return result;
    }

    // Validate nodes
    const validNodes: CanvasNode[] = [];
    const nodeIds = new Set<string>();

    for (let i = 0; i < parsed.nodes.length; i++) {
      const node = parsed.nodes[i];
      const nodeValidation = validateNode(node, i);
      
      if (nodeValidation.isValid && node) {
        validNodes.push(node);
        nodeIds.add(node.id);
        
        // Count node types
        result.debugInfo.nodeTypes[node.type] = (result.debugInfo.nodeTypes[node.type] || 0) + 1;
      } else {
        result.validation.errors.push(...nodeValidation.errors);
      }
    }

    // Validate edges
    const validEdges: CanvasEdge[] = [];
    
    for (let i = 0; i < parsed.edges.length; i++) {
      const edge = parsed.edges[i];
      const edgeValidation = validateEdge(edge, i, nodeIds);
      
      if (edgeValidation.isValid && edge) {
        validEdges.push(edge);
      } else {
        result.validation.errors.push(...edgeValidation.errors);
        if (edge?.id) {
          result.debugInfo.invalidEdges.push(edge.id);
        }
      }
    }

    // Create canvas object
    result.canvas = {
      nodes: validNodes,
      edges: validEdges
    };

    result.debugInfo.nodeCount = validNodes.length;
    result.debugInfo.edgeCount = validEdges.length;
    
    // Determine overall validity
    result.validation.isValid = result.validation.errors.length === 0;
    
    // Add warnings for missing nodes referenced by edges
    if (result.debugInfo.invalidEdges.length > 0) {
      result.validation.warnings.push(
        `${result.debugInfo.invalidEdges.length} edges reference missing nodes`
      );
    }

  } catch (error) {
    result.validation.errors.push(`JSON parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return result;
}

/**
 * Validate a single node
 */
function validateNode(node: any, index: number): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  if (!node || typeof node !== 'object') {
    result.isValid = false;
    result.errors.push(`Node ${index}: must be an object`);
    return result;
  }

  // Required properties
  const requiredProps = ['id', 'type', 'x', 'y', 'width', 'height'];
  for (const prop of requiredProps) {
    if (!(prop in node)) {
      result.isValid = false;
      result.errors.push(`Node ${index}: missing required property '${prop}'`);
    }
  }

  // Validate types
  if (typeof node.id !== 'string') {
    result.isValid = false;
    result.errors.push(`Node ${index}: 'id' must be a string`);
  }

  if (!['text', 'file', 'link', 'group'].includes(node.type)) {
    result.isValid = false;
    result.errors.push(`Node ${index}: 'type' must be one of: text, file, link, group`);
  }

  // Validate coordinates and dimensions
  for (const prop of ['x', 'y', 'width', 'height']) {
    if (typeof node[prop] !== 'number') {
      result.isValid = false;
      result.errors.push(`Node ${index}: '${prop}' must be a number`);
    }
  }

  // Type-specific validation
  switch (node.type) {
    case 'text':
      if (typeof node.text !== 'string') {
        result.isValid = false;
        result.errors.push(`Text node ${index}: 'text' property must be a string`);
      }
      break;
    case 'file':
      if (typeof node.file !== 'string') {
        result.isValid = false;
        result.errors.push(`File node ${index}: 'file' property must be a string`);
      }
      break;
    case 'link':
      if (typeof node.url !== 'string') {
        result.isValid = false;
        result.errors.push(`Link node ${index}: 'url' property must be a string`);
      }
      break;
    case 'group':
      // Group nodes have optional properties, no additional validation needed
      break;
  }

  return result;
}

/**
 * Validate a single edge
 */
function validateEdge(edge: any, index: number, nodeIds: Set<string>): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  if (!edge || typeof edge !== 'object') {
    result.isValid = false;
    result.errors.push(`Edge ${index}: must be an object`);
    return result;
  }

  // Required properties
  const requiredProps = ['id', 'fromNode', 'toNode'];
  for (const prop of requiredProps) {
    if (!(prop in edge)) {
      result.isValid = false;
      result.errors.push(`Edge ${index}: missing required property '${prop}'`);
    }
  }

  // Validate types
  if (typeof edge.id !== 'string') {
    result.isValid = false;
    result.errors.push(`Edge ${index}: 'id' must be a string`);
  }

  if (typeof edge.fromNode !== 'string') {
    result.isValid = false;
    result.errors.push(`Edge ${index}: 'fromNode' must be a string`);
  }

  if (typeof edge.toNode !== 'string') {
    result.isValid = false;
    result.errors.push(`Edge ${index}: 'toNode' must be a string`);
  }

  // Validate node references
  if (edge.fromNode && !nodeIds.has(edge.fromNode)) {
    result.isValid = false;
    result.errors.push(`Edge ${index}: 'fromNode' references non-existent node '${edge.fromNode}'`);
  }

  if (edge.toNode && !nodeIds.has(edge.toNode)) {
    result.isValid = false;
    result.errors.push(`Edge ${index}: 'toNode' references non-existent node '${edge.toNode}'`);
  }

  // Validate optional side properties
  const validSides = ['top', 'right', 'bottom', 'left'];
  if (edge.fromSide && !validSides.includes(edge.fromSide)) {
    result.isValid = false;
    result.errors.push(`Edge ${index}: 'fromSide' must be one of: ${validSides.join(', ')}`);
  }

  if (edge.toSide && !validSides.includes(edge.toSide)) {
    result.isValid = false;
    result.errors.push(`Edge ${index}: 'toSide' must be one of: ${validSides.join(', ')}`);
  }

  // Validate optional end properties
  const validEnds = ['none', 'arrow'];
  if (edge.fromEnd && !validEnds.includes(edge.fromEnd)) {
    result.isValid = false;
    result.errors.push(`Edge ${index}: 'fromEnd' must be one of: ${validEnds.join(', ')}`);
  }

  if (edge.toEnd && !validEnds.includes(edge.toEnd)) {
    result.isValid = false;
    result.errors.push(`Edge ${index}: 'toEnd' must be one of: ${validEnds.join(', ')}`);
  }

  return result;
}

/**
 * Transform canvas coordinates for web rendering
 */
export function transformCoordinates(canvas: JSONCanvas): JSONCanvas {
  if (!canvas.nodes.length) return canvas;

  // Find bounding box
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const node of canvas.nodes) {
    minX = Math.min(minX, node.x);
    minY = Math.min(minY, node.y);
    maxX = Math.max(maxX, node.x + node.width);
    maxY = Math.max(maxY, node.y + node.height);
  }

  // Transform nodes to start from (0, 0)
  const transformedNodes = canvas.nodes.map(node => ({
    ...node,
    x: node.x - minX,
    y: node.y - minY
  }));

  return {
    nodes: transformedNodes,
    edges: canvas.edges
  };
}

/**
 * Resolve color value (hex or preset)
 */
export function resolveColor(color: CanvasColor): string {
  // Handle string colors
  if (typeof color === 'string') {
    if (color.startsWith('#')) {
      return color;
    }
    if (color in PRESET_COLORS) {
      return PRESET_COLORS[color as keyof typeof PRESET_COLORS];
    }
    return color; // Return as-is if not a preset
  }
  
  // Handle numeric preset colors
  if (typeof color === 'number') {
    const colorKey = color.toString();
    if (colorKey in PRESET_COLORS) {
      return PRESET_COLORS[colorKey as keyof typeof PRESET_COLORS];
    }
  }
  
  // Fallback to a default color
  return '#666666';
}

/**
 * Get canvas dimensions
 */
export function getCanvasDimensions(canvas: JSONCanvas): { width: number; height: number } {
  if (!canvas.nodes.length) {
    return { width: 800, height: 600 };
  }

  let maxX = 0;
  let maxY = 0;

  for (const node of canvas.nodes) {
    maxX = Math.max(maxX, node.x + node.width);
    maxY = Math.max(maxY, node.y + node.height);
  }

  return {
    width: Math.max(maxX, 800),
    height: Math.max(maxY, 600)
  };
}
