import { createHighlighter, type Highlighter } from 'shiki';

let highlighterInstance: Highlighter | null = null;

/**
 * Get or create a singleton Shiki highlighter instance
 * This prevents multiple instances from being created and improves performance
 */
export async function getShikiHighlighter(): Promise<Highlighter> {
  if (!highlighterInstance) {
    highlighterInstance = await createHighlighter({
      themes: ['github-dark', 'github-light'],
      langs: [
        'javascript',
        'typescript',
        'json',
        'yaml',
        'markdown',
        'html',
        'css',
        'shellscript', 
        'sql',
        'astro',
        'svelte',
        'jsx',
        'tsx',
        'plaintext'
      ]
    });
  }
  
  return highlighterInstance;
}

/**
 * Languages that require special rendering components (not Shiki highlighting)
 * These are routed to dedicated Astro components
 */
const SPECIAL_RENDERER_LANGUAGES = new Set([
  'mermaid'
]);

/**
 * Custom languages that should be treated as directive languages
 * These will fallback to plaintext but without warnings
 */
const CUSTOM_DIRECTIVE_LANGUAGES = new Set([
  'litegal', 'tree', 'dataview', 'dataviewjs', 'emphasis', 
  'warning', 'info', 'success', 'error', 'tip', 'note', 
  'quote', 'slides', 'tool-showcase'
]);

/**
 * Language normalization map for Shiki compatibility
 * Maps common language aliases to their Shiki equivalents
 */
const LANGUAGE_NORMALIZATION_MAP: Record<string, string> = {
  'zsh': 'shellscript',
  'bash': 'shellscript', 
  'shell': 'shellscript',
  'sh': 'shellscript'
};

/**
 * Get the appropriate language for highlighting, handling custom directive languages
 */
export function getLanguageForHighlighting(lang: string): string {
  if (CUSTOM_DIRECTIVE_LANGUAGES.has(lang)) {
    return 'plaintext';
  }
  
  // Normalize language aliases for Shiki compatibility
  const normalizedLang = LANGUAGE_NORMALIZATION_MAP[lang.toLowerCase()] || lang;
  
  // Check if it's a supported Shiki language, fallback to plaintext if not
  const supportedLanguages = [
    'javascript', 'typescript', 'json', 'yaml', 'markdown', 
    'html', 'css', 'shellscript', 'python', 'sql', 
    'astro', 'svelte', 'jsx', 'tsx', 'plaintext'
  ];
  
  if (!supportedLanguages.includes(normalizedLang.toLowerCase())) {
    return 'plaintext';
  }
  
  return normalizedLang;
}

/**
 * Check if a language requires a special renderer component
 */
export function isSpecialRendererLanguage(lang: string): boolean {
  return SPECIAL_RENDERER_LANGUAGES.has(lang);
}

/**
 * Sanitize Mermaid code to handle Obsidian-style wikilinks and other problematic syntax
 * This prevents build failures from AI-generated diagrams with invalid characters
 */
export function sanitizeMermaidCode(code: string): string {
  return code
    // Replace Obsidian wikilinks [[text]] with just text
    .replace(/\[\[([^\]]+)\]\]/g, '$1')
    // Handle file paths in node labels - convert /path/to/file to path|to|file
    .replace(/\[([^[\]]*\/[^[\]]*)\]/g, (match, path) => {
      // Extract just the filename or convert slashes to pipes
      const sanitizedPath = path.replace(/\//g, '|');
      return `[${sanitizedPath}]`;
    })
    // Handle file paths in node IDs - convert /path/to/file to path_to_file
    .replace(/([A-Z])\[([^[\]]*\/[^[\]]*)\]/g, (match, nodeId, path) => {
      const sanitizedPath = path.replace(/\//g, '_');
      return `${nodeId}[${sanitizedPath}]`;
    })
    // Replace problematic characters in node labels
    .replace(/([A-Z]\s*-->\s*[A-Z]\[[^\]]*)\[([^\]]*)\]/g, '$1$2')
    // Clean up any remaining double brackets that might break parsing
    .replace(/\[\[/g, '[')
    .replace(/\]\]/g, ']')
    // Remove any trailing spaces that might cause issues
    .replace(/\s+$/gm, '')
    // Ensure proper line endings
    .trim();
}

/**
 * Check if a language is a custom directive language
 */
export function isCustomDirectiveLanguage(lang: string): boolean {
  return CUSTOM_DIRECTIVE_LANGUAGES.has(lang);
}

/**
 * Determine the routing strategy for a given language
 */
export function getLanguageRoutingStrategy(lang: string): 'shiki' | 'special-renderer' | 'directive' | 'plaintext' {
  if (SPECIAL_RENDERER_LANGUAGES.has(lang)) {
    return 'special-renderer';
  }
  if (CUSTOM_DIRECTIVE_LANGUAGES.has(lang)) {
    return 'directive';
  }
  
  // Normalize language aliases for Shiki compatibility
  const normalizedLang = LANGUAGE_NORMALIZATION_MAP[lang.toLowerCase()] || lang;
  
  // Check if it's a supported Shiki language
  const supportedLanguages = [
    'javascript', 'typescript', 'json', 'yaml', 'markdown', 
    'html', 'css', 'shellscript', 'python', 'sql', 
    'astro', 'svelte', 'jsx', 'tsx', 'plaintext'
  ];
  
  if (supportedLanguages.includes(normalizedLang.toLowerCase())) {
    return 'shiki';
  }
  
  return 'plaintext';
}

/**
 * Dispose of the highlighter instance (useful for cleanup)
 */
export function disposeShikiHighlighter(): void {
  if (highlighterInstance) {
    highlighterInstance.dispose();
    highlighterInstance = null;
  }
}

/**
 * Check if a language is supported, fallback to plaintext if not
 */
export function getSupportedLanguage(lang: string): string {
  // Normalize language aliases for Shiki compatibility
  const normalizedLang = LANGUAGE_NORMALIZATION_MAP[lang.toLowerCase()] || lang;
  
  const supportedLanguages = [
    'javascript', 'typescript', 'json', 'yaml', 'markdown', 
    'html', 'css', 'shellscript', 'python', 'sql', 
    'astro', 'svelte', 'jsx', 'tsx', 'plaintext'
  ];
  
  return supportedLanguages.includes(normalizedLang.toLowerCase()) ? normalizedLang : 'plaintext';
}
