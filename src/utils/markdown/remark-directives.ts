// src/utils/markdown/remark-directives.ts
// Configuration for mapping remark directive names to Astro components

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
