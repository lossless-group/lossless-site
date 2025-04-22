import type { Root, Paragraph } from 'mdast';

export default function remarkCitations() {
  return (tree: Root) => {
    console.log("🚀 remarkCitations is running");

    const allCitations = [];
    const newChildren = [];

    for (let i = 0; i < tree.children.length; i++) {
      const node = tree.children[i];
    
      if (
        node.type === 'paragraph' &&
        node.children.length === 2 &&
        node.children[0].type === 'text' &&
        node.children[1].type === 'link'
      ) {
        const text = node.children[0].value.trim();
        const match = text.match(/^\[(\d+)\]$/);
        const url = node.children[1].url;
      
        if (match && /^https?:\/\/\S+$/.test(url)) {
          allCitations.push({ number: match[1], url });
          continue;
        }
      }
      
    
      // ...existing fallback match logic for single-line [n] https://... style
    

      // Also handle [n] https://... in same paragraph
      if (
        node.type === 'paragraph' &&
        node.children.length === 1 &&
        node.children[0].type === 'text' &&
        /^\[\d+\]\s+https?:\/\/\S+$/.test(node.children[0].value.trim())
      ) {
        const [_, number, url] = node.children[0].value.trim().match(/^\[(\d+)\]\s+(https?:\/\/\S+)$/)!;
        allCitations.push({ number, url });
        continue;
      }

      // Default: keep the node
      newChildren.push(node);
    }

    // Add citations block at the end
    if (allCitations.length > 0) {
      newChildren.push({
        type: 'citations',
        data: {
          hName: 'div',
          hProperties: {
            className: 'citations-container'
          }
        },
        children: [
          {
            type: 'heading',
            depth: 2,
            children: [{ type: 'text', value: 'Citations:' }],
            data: {
              hName: 'h2',
              hProperties: {
                className: 'citations-header'
              }
            }
          },
          ...allCitations.map(cite => ({
            type: 'paragraph',
            data: {
              hName: 'div',
              hProperties: { className: 'citation' }
            },
            children: [
              { type: 'text', value: `[${cite.number}] ` },
              {
                type: 'link',
                url: cite.url,
                data: {
                  hName: 'a',
                  hProperties: {
                    href: cite.url,
                    target: '_blank',
                    rel: 'noopener noreferrer'
                  }
                },
                children: [{ type: 'text', value: cite.url }]
              }
            ]
          }))
        ]
      });
    }

    // Replace the document tree
    tree.children = newChildren;
    return tree;
  };
}
