// Extend mdast types to include wiki-style image nodes
import type { Parent, Image } from 'mdast';

declare module 'mdast' {
  interface WikiImageNode extends Image {
    type: 'wikiImage';
    url: string;
    alt?: string;
    title?: string;
  }

  interface RootContentMap {
    wikiImage: WikiImageNode;
  }
}
