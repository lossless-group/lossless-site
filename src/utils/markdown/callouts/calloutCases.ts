/* section open ==============================================================
|
| ??-- About: Callout Pattern Cases
| ??-- Type: Pattern Matching Configuration
| ??-- Note: Follows Obsidian-style callout syntax where all subsequent
|           lines starting with '>' are part of the same callout block
|
| ??-- Includes: 
| //---- Known patterns
| //---- Example cases
| //---- Detection rules
|
====================================== */

import type { CalloutInfo } from './calloutTypes';

export interface CalloutCase {
  exampleInputs: string[];
  properSyntax: string;
  detectPattern: RegExp;
  messageToLog: string;
  type: CalloutInfo['type'];
  title?: string;
  isCritical: boolean;
}

export const knownCalloutCases: Record<string, CalloutCase> = {
  standardCallout: {
    exampleInputs: [
      '[!NOTE] Title Here',
      '[!WARNING] Important Warning',
      '[!INFO] Information Block',
      `[!LLM Response] 
This is a multiline response
Each line is part of the callout
Even with empty lines:

Still part of the same callout`
    ],
    properSyntax: '[!TYPE] Title\nContent',
    // Matches [!TYPE] at start, captures type and optional title
    detectPattern: /^\[!(\w+)\](?:\s+([^\n]+))?(?:\n(?:[^\n]*(?:\n|$))*)?/m,
    messageToLog: 'Standard callout pattern with optional multiline content',
    type: 'note',
    isCritical: false
  },

  noTitleCallout: {
    exampleInputs: [
      '[!NOTE]\nContent here\nMore content',
      '[!WARNING]\nMultiple lines\nIn the callout',
      '[!INFO]\nWith empty lines\n\nStill in callout'
    ],
    properSyntax: '[!TYPE]\nContent',
    // Matches [!TYPE] without title, followed by content lines
    detectPattern: /^\[!(\w+)\](?:\n(?:[^\n]*(?:\n|$))*)?/m,
    messageToLog: 'Callout without title but with content',
    type: 'note',
    isCritical: false
  },

  complexCallout: {
    exampleInputs: [
      `[!LLM Response] Complex Example
Question: What is the meaning of life?

Here's a detailed response:
1. First point
   - Subpoint
   - Another subpoint
2. Second point

Final thoughts...`,
      `[!WARNING] Critical Issue
### Background
- Point 1
- Point 2

### Solution
1. Step one
2. Step two`
    ],
    properSyntax: '[!TYPE] Title\nMarkdown content\nMore content...',
    // Matches full callout block with nested markdown
    detectPattern: /^\[!(\w+)\](?:\s+([^\n]+))?(?:\n(?:[^\n]*(?:\n|$))*)?/m,
    messageToLog: 'Complex callout with nested markdown content',
    type: 'note',
    isCritical: false
  }
};

/* ========================================
??-- Affects: 
//----   Callout detection
//----   Pattern matching
//----   Error logging
// 
// Close: Callout Pattern Cases
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*/
