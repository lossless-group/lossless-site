import type { Parent, PhrasingContent } from 'mdast';

// Plugin options interface
export interface RemarkCitationsOptions {
  className?: string;
}

// Custom node types that will be used with type assertions
export interface CitationNode {
  type: 'citation';
  data: {
    hName: string;
    hProperties: {
      href?: string;
      className: string;
      'data-citation'?: '';
      target?: '_blank';
      rel?: 'noopener noreferrer';
    };
  };
  children: PhrasingContent[];
}

export interface CitationsContainerNode {
  type: 'citations';
  data: {
    hName: 'div';
    hProperties: {
      className: 'citations-container';
    };
  };
  children: CitationNode[];
}
