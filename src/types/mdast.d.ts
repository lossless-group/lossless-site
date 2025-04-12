import type { Parent } from 'mdast';

declare module 'mdast' {
  interface CitationNode extends Parent {
    type: 'citation';
    value: string;
  }
  
  interface CitationsNode extends Parent {
    type: 'citations';
    children: CitationNode[];
  }

  interface RootContentMap {
    citation: CitationNode;
    citations: CitationsNode;
  }
}
