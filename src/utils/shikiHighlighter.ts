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
        'bash',
        'shell',
        'python',
        'sql',
        'astro',
        'svelte',
        'jsx',
        'tsx',
        'plaintext'
        // Custom languages are handled by fallback logic in the highlighter utility
      ]
    });
  }
  
  return highlighterInstance;
}

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
 * Get the appropriate language for highlighting, handling custom directive languages
 */
export function getLanguageForHighlighting(lang: string): string {
  if (CUSTOM_DIRECTIVE_LANGUAGES.has(lang)) {
    return 'plaintext';
  }
  return lang;
}

/**
 * Check if a language is a custom directive language
 */
export function isCustomDirectiveLanguage(lang: string): boolean {
  return CUSTOM_DIRECTIVE_LANGUAGES.has(lang);
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
  const supportedLanguages = [
    'javascript', 'typescript', 'json', 'yaml', 'markdown', 
    'html', 'css', 'bash', 'shell', 'python', 'sql', 
    'astro', 'svelte', 'jsx', 'tsx', 'plaintext'
  ];
  
  return supportedLanguages.includes(lang.toLowerCase()) ? lang : 'plaintext';
}
