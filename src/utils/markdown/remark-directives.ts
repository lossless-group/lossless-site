// src/utils/markdown/remark-directives.ts
// Configuration for mapping remark directive names to Astro components

import { visit } from 'unist-util-visit';

/**
 * Maps directive names (used in markdown) to their corresponding Astro component files
 * 
 * Directive Naming Convention:
 * - Use kebab-case for directive names
 * - Include service/tool name as prefix: figma-embed, miro-board, notion-page
 * - Use descriptive suffixes for different render types: -embed, -display, -preview
 * 
 * Component File Convention:
 * - Pattern: {Service}-{Type}--{Action}.astro
 * - Use PascalCase for component files to match Astro conventions
 */
export const directiveComponentMap: Record<string, string> = {
  'figma-embed': 'Figma-Object--Display.astro',
  // Future components following the same pattern:
  // 'miro-board': 'Miro-Board--Embed.astro',
  // 'notion-page': 'Notion-Page--Preview.astro',
  // 'youtube-video': 'YouTube-Video--Embed.astro',
  // 'github-gist': 'GitHub-Gist--Display.astro',
};

/**
 * Default props convention for all directive components
 * 
 * Required Props:
 * - src or url: The primary resource URL (required)
 * - auth-user: User identifier for authorization (optional, falls back to default)
 * - width/height: Dimensions (optional, component provides defaults)
 * - Component-specific props as needed
 */
export interface DirectiveProps {
  src?: string;
  url?: string;
  'auth-user'?: string;
  width?: string;
  height?: string;
  [key: string]: any; // Allow additional component-specific props
}

/**
 * Authentication pattern helper
 * Environment variables should follow: {SERVICE}_{USER}_TOKEN
 * With fallback to: {SERVICE}_DEFAULT_TOKEN
 */
export const getAuthTokenKey = (service: string, user?: string): string => {
  const serviceUpper = service.toUpperCase();
  if (user) {
    return `${serviceUpper}_${user.toUpperCase()}_TOKEN`;
  }
  return `${serviceUpper}_DEFAULT_TOKEN`;
};

/**
 * Helper function to validate if a directive name is supported
 */
export const isSupportedDirective = (directiveName: string): boolean => {
  return directiveName in directiveComponentMap;
};

/**
 * Helper function to get component path for a directive
 */
export const getComponentForDirective = (directiveName: string): string | null => {
  return directiveComponentMap[directiveName] || null;
};

/**
 * Custom remark plugin to transform directives into Astro components
 * This processes the parsed directive nodes and converts them to MDX/HTML
 */
export function remarkDirectiveTransform() {
  return (tree: any) => {
    visit(tree, (node: any) => {
      // Handle leaf directives (::directive{})
      if (node.type === 'leafDirective' || node.type === 'containerDirective') {
        const directiveName = node.name;
        const componentPath = getComponentForDirective(directiveName);
        
        if (componentPath) {
          // Extract props from directive attributes
          const props = node.attributes || {};
          
          // Convert directive to Astro component import and usage
          const componentName = componentPath.replace('.astro', '').replace(/[^a-zA-Z0-9]/g, '');
          const importPath = `@components/${componentPath}`;
          
          // Create the component JSX
          const propsString = Object.entries(props)
            .map(([key, value]) => `${key}="${value}"`)
            .join(' ');
          
          // Replace the directive node with an HTML node that will render the component
          node.type = 'html';
          node.value = `<${componentName} ${propsString} />`;
          
          // Store import information for later processing
          if (!tree.imports) {
            tree.imports = new Set();
          }
          tree.imports.add({
            componentName,
            importPath,
            componentPath
          });
        } else {
          console.warn(`Unknown directive: ${directiveName}`);
        }
      }
    });
    
    // Add imports to the beginning of the file if we have any
    if (tree.imports && tree.imports.size > 0) {
      const imports = Array.from(tree.imports).map((imp: any) => ({
        type: 'mdxjsEsm',
        value: `import ${imp.componentName} from '${imp.importPath}';`,
        data: {
          estree: {
            type: 'Program',
            body: [{
              type: 'ImportDeclaration',
              specifiers: [{
                type: 'ImportDefaultSpecifier',
                local: { type: 'Identifier', name: imp.componentName }
              }],
              source: { type: 'Literal', value: imp.importPath }
            }]
          }
        }
      }));
      
      tree.children.unshift(...imports);
    }
  };
}

/**
 * Simple approach - transform directives to raw HTML component calls
 * Since we're using rehype-raw, we can inject actual component HTML
 * The Figma API integration will happen in the Astro component itself
 */
export function remarkDirectiveToComponent() {
  return (tree: any) => {
    visit(tree, (node: any) => {
      if (node.type === 'leafDirective' || node.type === 'containerDirective') {
        const directiveName = node.name;
        const componentPath = getComponentForDirective(directiveName);
        
        if (componentPath && directiveName === 'figma-embed') {
          // Extract props from directive attributes
          const props = node.attributes || {};
          
          // Convert props to component attributes, properly escaping values
          const propsString = Object.entries(props)
            .map(([key, value]) => {
              const escapedValue = String(value)
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
              return `${key}="${escapedValue}"`;
            })
            .join(' ');
          
          // Create enhanced HTML with better styling and metadata support
          node.type = 'html';
          node.value = `
<!-- Figma Embed Directive -->
<div class="directive-component figma-embed" data-directive="${directiveName}">
  <iframe
    src="https://www.figma.com/embed?embed_host=lossless.group&url=${encodeURIComponent(props.src || '')}&initial_view=design&scaling=contain&hide_ui=true"
    allowfullscreen
    loading="lazy"
    title="Figma embed"
    style="border: none; width: ${props.width || '100%'}; height: ${props.height || '500px'}; border-radius: 8px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); max-width: 100%;"
  ></iframe>
  <div class="figma-embed-footer" style="font-size: 0.75rem; color: #9ca3af; margin-top: 0.25rem; text-align: right;">
    <a href="${props.src || ''}" target="_blank" rel="noopener" style="color: #6366f1; text-decoration: none;">Open in Figma →</a>
  </div>
</div>
`;
        } else if (componentPath) {
          // Handle other directive types with simple processing
          const propsString = Object.entries(props || {})
            .map(([key, value]) => {
              const escapedValue = String(value)
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
              return `${key}="${escapedValue}"`;
            })
            .join(' ');
          
          node.type = 'html';
          node.value = `<!-- Unknown directive component: ${directiveName} -->`;
        } else {
          // Unknown directive - leave as comment for debugging
          node.type = 'html';
          node.value = `<!-- Unknown directive: ${directiveName} -->`;
          console.warn(`Unknown directive: ${directiveName}`);
        }
      }
    });
  };
}
