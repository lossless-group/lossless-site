declare module 'rehype-stringify' {
  import type { Plugin } from 'unified';
  import type { Root } from 'hast';
  
  const rehypeStringify: Plugin<[Options?], Root>;
  
  export interface Options {
    quoteSmart?: boolean;
    closeSelfClosing?: boolean;
    omitOptionalTags?: boolean;
    entities?: {
      useShortestReferences?: boolean;
    };
  }
  
  export default rehypeStringify;
}
