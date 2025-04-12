/**
 * Centralized debugging utility for markdown processing
 * Controls all debug output for the markdown processing pipeline
 */
import { astDebugger } from '../debug/ast-debugger';

/**
 * MarkdownDebugger class
 * 
 * Provides centralized debugging functionality for markdown processing.
 * Supports different levels of verbosity and conditional output based on
 * environment variables and URL parameters.
 */
class MarkdownDebugger {
  private isEnabled: boolean = false;
  private isVerbose: boolean = false;

  constructor() {
    // Check for environment variables
    this.isEnabled = process.env.DEBUG_MARKDOWN === 'true';
    this.isVerbose = process.env.DEBUG_MARKDOWN_VERBOSE === 'true';
    
    // For client-side, also enable if URL has debug-markdown parameter
    // This check only runs in the browser, not during SSG build
    if (typeof window !== 'undefined') {
      try {
        const url = new URL(window.location.href);
        if (url.searchParams.has('debug-markdown')) {
          this.isEnabled = true;
        }
        if (url.searchParams.has('debug-markdown-verbose')) {
          this.isEnabled = true;
          this.isVerbose = true;
        }
      } catch (e) {
        // Silently fail if window is not available (SSG build process)
      }
    }
  }

  /**
   * Log a message if debugging is enabled
   */
  log(message: string, ...args: any[]): void {
    if (!this.isEnabled) return;
    console.log(`[Markdown Debug] ${message}`, ...args);
  }

  /**
   * Log a verbose message (only if verbose debugging is enabled)
   */
  verbose(message: string, ...args: any[]): void {
    if (!this.isEnabled || !this.isVerbose) return;
    console.log(`[Markdown Debug Verbose] ${message}`, ...args);
  }

  /**
   * Log the start of a plugin's processing
   */
  startPlugin(pluginName: string): void {
    if (!this.isEnabled) return;
    console.log(`\n=== ${pluginName} Plugin: Starting transformation ===`);
  }

  /**
   * Log the end of a plugin's processing
   */
  endPlugin(pluginName: string): void {
    if (!this.isEnabled) return;
    console.log(`=== ${pluginName} Plugin: Finished transformation ===\n`);
  }

  /**
   * Log a node transformation
   */
  logTransformation(message: string, details?: any): void {
    if (!this.isEnabled) return;
    console.log(`  ↳ ${message}`);
    if (details && this.isVerbose) {
      console.log(details);
    }
  }

  /**
   * Write a debug file using the AST debugger
   */
  writeDebugFile(name: string, content: any): void {
    if (!this.isEnabled || process.env.DEBUG_AST !== 'true') return;
    astDebugger.writeDebugFile(name, content);
  }

  /**
   * Log an AST node with detailed information
   */
  debugNode(prefix: string, node: any): void {
    if (!this.isEnabled || !this.isVerbose) return;
    
    if (!node) {
      console.log(`\n=== ${prefix} ===`);
      console.log('Node is null or undefined');
      console.log('=== End Debug ===\n');
      return;
    }
    
    console.log(`\n=== ${prefix} ===`);
    console.log('Node type:', node.type);
    
    if (node.value) {
      console.log('Text value:', node.value);
    }
    
    if (node.children && node.children.length > 0) {
      console.log('Children types:', node.children.map((child: any) => child?.type || 'unknown'));
      console.log('Children values:', node.children.map((child: any) => child?.value || ''));
    }
    
    if (this.isVerbose) {
      console.log('Full node:', JSON.stringify(node, null, 2));
    }
    
    console.log('=== End Debug ===\n');
  }
}

// Create a singleton instance
const markdownDebugger = new MarkdownDebugger();

// Export as default (consistent with remark plugins)
export default markdownDebugger;

// Also provide named export for flexibility
export { markdownDebugger };
