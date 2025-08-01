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
  'tool-showcase': 'toolkit/ToolShowcaseIsland.astro',
  'slides': 'direct', // Handled directly in AstroMarkdown.astro
  'slideshow': 'direct', // Alternative name to avoid conflict with slides codeblock
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
          // Special handling for tool-showcase directive
          if (directiveName === 'tool-showcase') {
            // Extract tool paths from the container content
            const toolPaths: string[] = [];
            
            if (node.type === 'containerDirective' && node.children) {
              // Find list nodes in the container
              const listNodes = node.children.filter((child: any) => child.type === 'list');
              
              for (const listNode of listNodes) {
                if (listNode.children) {
                  for (const listItem of listNode.children) {
                    if (listItem.type === 'listItem' && listItem.children) {
                      // Look for paragraph containing a link
                      const paragraph = listItem.children.find((child: any) => child.type === 'paragraph');
                      if (paragraph && paragraph.children) {
                        const link = paragraph.children.find((child: any) => child.type === 'link');
                        if (link && link.url) {
                          // Extract the tool path from the backlink URL
                          const url = link.url;
                          // Remove leading slash and .md extension if present
                          const toolPath = url.replace(/^\//, '').replace(/\.md$/, '');
                          toolPaths.push(toolPath);
                        }
                      }
                    }
                  }
                }
              }
            }
            
            // Convert directive to Astro component import and usage
            const componentName = 'ToolShowcaseIsland';
            const importPath = `@components/toolkit/ToolShowcaseIsland.astro`;
            
            // Create the component JSX with tool paths
            const toolPathsJson = JSON.stringify(toolPaths).replace(/"/g, '&quot;');
            
            // Replace the directive node with an HTML node that will render the component
            node.type = 'html';
            node.value = `<${componentName} toolPaths={${JSON.stringify(toolPaths)}} />`;
            
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
            // Handle other directives normally
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
          }
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
 * Preserve directive nodes for AstroMarkdown.astro to handle
 * This plugin does NOT generate HTML - it just ensures directive nodes are preserved in the AST
 * so that AstroMarkdown.astro can handle them properly
 */
export function remarkDirectiveToComponent() {
  return (tree: any) => {
    console.log('[remarkDirectiveToComponent] Plugin called, processing tree...');
    visit(tree, (node: any) => {
      if (node.type === 'leafDirective' || node.type === 'containerDirective') {
        const directiveName = node.name;
        console.log(`[remarkDirectiveToComponent] Found directive: ${directiveName}, type: ${node.type}`);
        
        // Validate that this is a supported directive
        if (isSupportedDirective(directiveName)) {
          // Leave the node as-is for AstroMarkdown.astro to handle
          // Just add some debug info if needed
          if (process.env.DEBUG_AST === 'true') {
            console.log(`[remarkDirectiveToComponent] Preserving directive: ${directiveName}`);
          }
        } else {
          // For unsupported directives, log a warning but preserve the node
          console.warn(`[remarkDirectiveToComponent] Unknown directive: ${directiveName}`);
        }
        
        // Always preserve the original directive node - don't transform to HTML
        // AstroMarkdown.astro will handle the actual rendering
      }
    });
  };
}
