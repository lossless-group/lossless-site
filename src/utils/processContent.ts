// ================================================================================
// Open: Content processing utilities for rendering markdown content
// Type: Content Processing Functions
// Includes: 
//   - processContent: function(content: string) -> string
//   - processInlineContent: function(content: string) -> string
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

/* =====================================================================>
   Content Processing Pipeline
/* =====================================================================>

??-- Type: Content Processor
??-- Includes: 
   //---- Functions to process markdown content before rendering
   //---- Handles various content transformations:
   //     - Obsidian-style wiki links
   //     - [Future] Other content transformations
   //---- Can be used for both full content and inline content

?-- Affects:
   //---- Any markdown or text content that needs processing
   //---- Returns processed content ready for rendering
/* <======================================< */

import { processObsidianLinks } from './processObsidianLinks';

/**
 * Process full content blocks (like article bodies)
 * Add any content processing steps here
 */
export function processContent(content: string): string {
  if (!content) return '';
  
  let processed = content;
  
  // Process Obsidian-style links
  processed = processObsidianLinks(processed);
  
  // [Future] Add more content processing steps here
  // Example: process custom syntax, handle other transformations
  
  return processed;
}

/**
 * Process inline content (like titles, descriptions)
 * May have different processing rules than full content
 */
export function processInlineContent(content: string): string {
  if (!content) return '';
  
  let processed = content;
  
  // Process Obsidian-style links
  processed = processObsidianLinks(processed);
  
  // [Future] Add more inline-specific processing here
  // Example: handle special inline syntax
  
  return processed;
}
