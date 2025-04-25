import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';
import type { Root, Paragraph, Text, Link } from 'mdast';

const remarkCitations: Plugin<[], Root> = () => {
  return (tree: Root) => {
    const citations: { index: number; url: string }[] = [];

    console.log('=== remarkCitations: Starting transformation ===');

    visit(tree, 'paragraph', (node: Paragraph) => {
      // console.log('--- Inspecting paragraph node ---');
      // console.dir(node, { depth: null });

      const newChildren = [];
      let i = 0;

      while (i < node.children.length) {
        const a = node.children[i];
        const b = node.children[i + 1];
        const c = node.children[i + 2];

        if (
          a?.type === 'text' &&
          b?.type === 'link' &&
          c?.type === 'text' &&
          a.value.match(/\[\d+\]\s*\($/) &&
          c.value.trim() === ')'
        ) {
          const indexMatch = a.value.match(/\[(\d+)\]/);
          const indexStr = indexMatch?.[1] ?? '?';
          const index = parseInt(indexStr);
          const before = a.value.slice(0, a.value.indexOf(`[${indexStr}]`));

          console.log(`✅ Found citation: [${index}] (${b.url})`);

          if (before) {
            newChildren.push({ type: 'text', value: before });
          }

          // Inline superscript link
          newChildren.push({
            type: 'citationReference',
            data: {
              hName: 'a',
              hProperties: {
                href: `#citation-${index}`,
                id: `ref-${index}`,
              },
            },
            children: [{ type: 'text', value: indexStr }],
          });

          citations[index - 1] = { index, url: b.url };

          i += 3;
          continue;
        }

        newChildren.push(a);
        i++;
      }

      node.children = newChildren;
    });

    console.log('Collected citations:', citations);

    if (citations.length > 0) {
      const citationNodes = citations
        .filter(Boolean)
        .map(({ index, url }) => {
          const domain = new URL(url).hostname.replace(/^www\./, '');
          return {
            type: 'citation',
            children: [
              {
                type: 'text',
                value: `(${index}) `,
              },
              {
                type: 'link',
                url,
                children: [
                  {
                    type: 'text',
                    value: domain,
                  },
                ],
              },
            ],
          };
        });

      tree.children.push({
        type: 'citations',
        children: citationNodes,
      } as any);
    }

    // console.log('=== Final Transformed MDAST ===');
    // console.dir(tree, { depth: null });
    console.log('=== remarkCitations: Finished ===');
  };
};

export default remarkCitations;
