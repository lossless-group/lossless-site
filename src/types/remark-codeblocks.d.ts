declare module '@utils/markdown/remark-codeblocks' {
  import type { Plugin } from 'unified';
  import type { Root, Code } from 'mdast';

  export interface CodeblockInfo {
    lang: string;
    meta?: string;
  }

  export interface MdxJsxAttribute {
    type: 'mdxJsxAttribute';
    name: string;
    value: string;
  }

  export interface MdxJsxFlowElement {
    type: 'mdxJsxFlowElement';
    name: string;
    attributes: MdxJsxAttribute[];
    children: any[];
    data?: { _mdxExplicitJsx: boolean };
  }

  const remarkCodeblocks: Plugin<[], Root>;
  export default remarkCodeblocks;
}
