/**
 * Centralized debugging utility for markdown processing
 * Controls all debug output for the markdown processing pipeline
 */
import { astDebugger } from './ast-debugger';

class MarkdownDebugger {
  private isEnabled: boolean = false;
  private isVerbose: boolean = false;

  constructor() {
    // Check for environment variables
    this.isEnabled = process.env.DEBUG_MARKDOWN === 'true';
    this.isVerbose = process.env.DEBUG_MARKDOWN_VERBOSE === 'true';
    
    // Also enable if URL has debug-markdown parameter
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (url.searchParams.has('debug-markdown')) {
        this.isEnabled = true;
      }
      if (url.searchParams.has('debug-markdown-verbose')) {
        this.isEnabled = true;
        this.isVerbose = true;
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
    if (!this.isEnabled) return;
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

export const markdownDebugger = new MarkdownDebugger();
