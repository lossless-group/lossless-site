import { visit } from 'unist-util-visit';
import type { Root, Element, Properties, Text } from 'hast';
import type { Visitor } from 'unist-util-visit';

export default function rehypeCalloutHandler() {
  return (tree: Root) => {
    console.log('=== START REHYPE CALLOUT HANDLER ===');
    
    const visitor: Visitor<Element> = (node) => {
      if (
        node.type !== 'element' ||
        node.tagName !== 'article' ||
        !Array.isArray(node.properties?.className) ||
        !node.properties?.className.includes('callout')
      ) {
        return;
      }

      console.log('Found callout article:', node);

      const type = node.properties['data-type'] as string;
      const title = node.properties['data-title'] as string;

      // Create header element with icon and title
      const header: Element = {
        type: 'element',
        tagName: 'header',
        properties: { className: ['callout-header'] },
        children: [
          // Add icon based on type
          {
            type: 'element',
            tagName: 'span',
            properties: { className: ['callout-icon', `icon-${type.toLowerCase()}`] },
            children: []
          },
          // Add title text
          {
            type: 'element',
            tagName: 'span',
            properties: { className: ['callout-title'] },
            children: [{ type: 'text', value: title || type }]
          }
        ]
      };

      // Create content container that preserves all block elements
      const content: Element = {
        type: 'element',
        tagName: 'div',
        properties: { className: ['callout-content'] },
        children: node.children.map(child => {
          // Ensure paragraphs are properly wrapped
          if (child.type === 'element' && child.tagName === 'p') {
            return {
              type: 'element',
              tagName: 'p',
              properties: { className: ['callout-paragraph'] },
              children: child.children
            };
          }
          return child;
        })
      };

      // Update the article's children
      node.children = [header, content];

      // Clean up data attributes we don't need anymore
      delete (node.properties as Properties)['data-type'];
      delete (node.properties as Properties)['data-title'];

      console.log('Transformed callout:', node);
    };

    visit(tree, 'element', visitor);
    
    console.log('=== END REHYPE CALLOUT HANDLER ===');
    return tree;
  };
}
