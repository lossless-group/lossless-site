/**
 * Centralized debugging utility for citations processing and completion
 * Controls all debug output for the citations processing and API completion pipeline
 */
import { astDebugger } from './ast-debugger';

class CitationsCompletionDebugger {
  private isEnabled: boolean = false;
  private isVerbose: boolean = false;

  constructor() {
    // Check for environment variables
    this.isEnabled = process.env.DEBUG_CITATIONS === 'true';
    this.isVerbose = process.env.DEBUG_CITATIONS_VERBOSE === 'true';
    
    // Also enable if URL has debug-citations parameter
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (url.searchParams.has('debug-citations')) {
        this.isEnabled = true;
      }
      if (url.searchParams.has('debug-citations-verbose')) {
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
    console.log(`[Citations Debug] ${message}`, ...args);
  }

  /**
   * Log a verbose message (only if verbose debugging is enabled)
   */
  verbose(message: string, ...args: any[]): void {
    if (!this.isEnabled || !this.isVerbose) return;
    console.log(`[Citations Debug Verbose] ${message}`, ...args);
  }

  /**
   * Log the start of a processing phase
   */
  startProcess(processName: string): void {
    if (!this.isEnabled) return;
    console.log(`\n=== Citations ${processName}: Starting processing ===`);
  }

  /**
   * Log the end of a processing phase
   */
  endProcess(processName: string): void {
    if (!this.isEnabled) return;
    console.log(`=== Citations ${processName}: Finished processing ===\n`);
  }

  /**
   * Log a citation extraction or update
   */
  logCitation(hexCode: string, message: string, details?: any): void {
    if (!this.isEnabled) return;
    console.log(`  ↳ [${hexCode}] ${message}`);
    if (details && this.isVerbose) {
      console.log(details);
    }
  }

  /**
   * Log an API request for citation completion
   */
  logApiRequest(hexCode: string, apiUrl: string, details?: any): void {
    if (!this.isEnabled) return;
    console.log(`  ↳ [${hexCode}] API Request to: ${apiUrl}`);
    if (details && this.isVerbose) {
      console.log(details);
    }
  }

  /**
   * Log an API response for citation completion
   */
  logApiResponse(hexCode: string, status: string, details?: any): void {
    if (!this.isEnabled) return;
    console.log(`  ↳ [${hexCode}] API Response: ${status}`);
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
   * Log statistics about citation processing
   */
  logStats(stats: any): void {
    if (!this.isEnabled) return;
    console.log('\n=== Citation Processing Statistics ===');
    console.log(JSON.stringify(stats, null, 2));
    console.log('=== End Statistics ===\n');
  }
}

export const citationsDebugger = new CitationsCompletionDebugger();
