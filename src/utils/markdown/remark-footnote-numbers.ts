import type { Plugin } from 'unified';
import type { Root } from 'mdast';

/**
 * Number hex-code footnotes on render, the LFM convention: the source keeps
 * `[^fh0on7]` as a stable identity, the reader sees `[1]`, `[2]`, … by order of
 * first appearance, so moving a paragraph just renumbers.
 *
 * - Cited definitions take 1…n in order of first reference; definitions nothing
 *   cites keep rendering and continue the count. No source is dropped.
 * - Legacy `[N]: …` source lines aren't footnote syntax, so GFM folds them into the
 *   preceding definition (or a plain paragraph). They are split out into
 *   definitions of their own (`src-N`) so every source gets a number, and their
 *   stale `[N]` labels never collide with the new ones.
 * - A reference with no definition stays text; AstroMarkdown mutes it. It takes
 *   no number.
 * - Runs of adjacent definitions are sorted by number so the list reads 1, 2, 3.
 */

const LEGACY_LINE = /\n\[(\d+)\]:[ \t]*/g;

type Segment = { num: string | null; children: any[] };

// Split a paragraph's inline children at each line that starts with `[N]: `.
function splitLegacyLines(paragraph: any): Segment[] {
  const segments: Segment[] = [{ num: null, children: [] }];
  paragraph.children.forEach((child: any, i: number) => {
    if (child.type !== 'text') {
      segments[segments.length - 1].children.push(child);
      return;
    }
    // A paragraph's first text counts as starting a line.
    const value = i === 0 ? `\n${child.value}` : child.value;
    let last = 0;
    for (const m of value.matchAll(LEGACY_LINE)) {
      const before = value.slice(last, m.index).replace(/^\n/, '');
      if (before) segments[segments.length - 1].children.push({ type: 'text', value: before });
      segments.push({ num: m[1], children: [] });
      last = m.index! + m[0].length;
    }
    const rest = value.slice(last).replace(/^\n/, '');
    if (rest) segments[segments.length - 1].children.push({ type: 'text', value: rest });
  });
  return segments;
}

function trimTrailingBreak(children: any[]): any[] {
  const lastChild = children[children.length - 1];
  if (lastChild?.type === 'text') lastChild.value = lastChild.value.replace(/\s+$/, '');
  return children.filter((c) => c.type !== 'text' || c.value !== '');
}

function legacyDefinition(seg: Segment): any {
  return {
    type: 'footnoteDefinition',
    identifier: `src-${seg.num}`,
    label: `src-${seg.num}`,
    children: [{ type: 'paragraph', children: trimTrailingBreak(seg.children) }],
  };
}

// Replace paragraphs (top-level, or a definition's only paragraph) that carry
// `[N]:` lines with real definitions.
function extractLegacySources(parent: any): void {
  if (!parent.children) return;
  const out: any[] = [];
  for (const node of parent.children) {
    if (node.type === 'paragraph') {
      const segs = splitLegacyLines(node);
      if (segs.length > 1) {
        if (segs[0].children.length) out.push({ ...node, children: trimTrailingBreak(segs[0].children) });
        segs.slice(1).forEach((s) => out.push(legacyDefinition(s)));
        continue;
      }
    } else if (node.type === 'footnoteDefinition' && node.children?.length === 1 && node.children[0].type === 'paragraph') {
      const segs = splitLegacyLines(node.children[0]);
      if (segs.length > 1) {
        out.push({ ...node, children: [{ ...node.children[0], children: trimTrailingBreak(segs[0].children) }] });
        segs.slice(1).forEach((s) => out.push(legacyDefinition(s)));
        continue;
      }
    }
    extractLegacySources(node);
    out.push(node);
  }
  parent.children = out;
}

function walk(node: any, fn: (n: any, parent: any) => void, parent: any = null): void {
  fn(node, parent);
  node.children?.forEach((c: any) => walk(c, fn, node));
}

const remarkFootnoteNumbers: Plugin<[], Root> = () => (tree: Root) => {
  extractLegacySources(tree);

  const definitions: any[] = [];
  const references: any[] = [];
  walk(tree, (n) => {
    if (n.type === 'footnoteDefinition') definitions.push(n);
    else if (n.type === 'footnoteReference') references.push(n);
  });
  if (!definitions.length) return;

  const defined = new Set(definitions.map((d) => d.identifier));
  const index = new Map<string, number>();
  for (const ref of references) {
    if (defined.has(ref.identifier) && !index.has(ref.identifier)) index.set(ref.identifier, index.size + 1);
  }
  for (const def of definitions) {
    if (!index.has(def.identifier)) index.set(def.identifier, index.size + 1);
  }

  for (const n of [...references, ...definitions]) {
    const i = index.get(n.identifier);
    if (i !== undefined) n.data = { ...(n.data || {}), citationIndex: i };
  }

  // Sort each run of adjacent definitions by number.
  walk(tree, (n) => {
    if (!n.children) return;
    let start = -1;
    const flush = (end: number) => {
      if (start >= 0 && end - start > 1) {
        const run = n.children.slice(start, end).sort((a: any, b: any) => a.data.citationIndex - b.data.citationIndex);
        n.children.splice(start, end - start, ...run);
      }
      start = -1;
    };
    n.children.forEach((c: any, i: number) => {
      if (c.type === 'footnoteDefinition') { if (start < 0) start = i; }
      else flush(i);
    });
    flush(n.children.length);
  });
};

export default remarkFootnoteNumbers;
