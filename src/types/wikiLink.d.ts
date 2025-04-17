declare module '@portaljs/remark-wiki-link' {
  import type { Plugin } from 'unified';
  
  interface WikiLinkOptions {
    hrefTemplate?: (permalink: string) => string;
    pageResolver?: (name: string) => string[];
    aliasDivider?: string;
    newClassName?: string;
    wikiLinkClassName?: string;
    hrefTemplate?: (permalink: string) => string;
    permalinks?: string[];
    pathFormat?: 'raw' | 'url';
  }

  const remarkWikiLink: Plugin<[WikiLinkOptions?]>;
  export default remarkWikiLink;
}
