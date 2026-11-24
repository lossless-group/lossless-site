/**
 * Rewrite relative links that point into the monorepo
 * (e.g. ../../ai-labs/corpora-builder/context-v/specs/Storage-Seam.md) to
 * their public URL: the context-v-corpus page when one exists, else GitHub.
 *
 * The lookup table is src/config/monorepo-link-map.json, built by
 * scripts/build-monorepo-link-map.mjs from src/config/monorepo-links.json.
 * Links not in the table are left as they are.
 */
import { visit } from 'unist-util-visit';
import type { Root, Link } from 'mdast';
import linkMap from '../../config/monorepo-link-map.json';

const map = linkMap as Record<string, string>;

export default function remarkMonorepoLinks() {
  return (tree: Root) => {
    visit(tree, 'link', (node: Link) => {
      if (!node.url.startsWith('../')) return;
      const [path, hash] = node.url.split('#');
      let key = path.replace(/^(\.\.?\/)+/, '');
      try { key = decodeURI(key); } catch {}
      const target = map[key];
      if (target) node.url = hash ? `${target}#${hash}` : target;
    });
  };
}
