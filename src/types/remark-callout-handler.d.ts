declare module '@utils/markdown/remark-callout-handler' {
  import type { Plugin } from 'unified';
  import type { Root } from 'mdast';

  export interface CalloutData {
    type: string;
    title: string;
    content: string;
  }

  export interface CalloutHandlerOptions {
    // Add any options here if needed
  }

  const remarkCalloutHandler: Plugin<[CalloutHandlerOptions?], Root>;
  export default remarkCalloutHandler;
}
