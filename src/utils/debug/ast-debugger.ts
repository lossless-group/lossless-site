import fs from 'fs';
import path from 'path';

class AstDebugger {
  private debugDir: string | undefined;
  private isEnabled: boolean = false; // Default to disabled

  constructor() {
    // Only enable in development environment
    if (process.env.NODE_ENV !== 'development') return;
  
    // Enable if env var or URL param is present
    this.isEnabled =
      process.env.DEBUG_AST === 'true' ||
      (typeof window !== 'undefined' && new URL(window.location.href).searchParams.has('debug-ast'));
  
    // If enabled, initialize (on load if client-side)
    if (this.isEnabled) {
      if (typeof window !== 'undefined') {
        if (document.readyState === 'complete') {
          this.init();
        } else {
          window.addEventListener('load', () => this.init());
        }
      } else {
        this.init();
      }
    }
  }

  private init() {
    if (!this.isEnabled) return;
    this.createDebugDir();
  }

  private createDebugDir() {
    const baseDebugDir = path.join(process.cwd(), 'debug');
    if (!fs.existsSync(baseDebugDir)) {
      fs.mkdirSync(baseDebugDir);
    }
    // Get current date in YYYY-MM-DD format
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    // Find existing directories for today
    const todayDirs = fs.readdirSync(baseDebugDir)
      .filter(name => name.startsWith(dateStr))
      .map(name => {
        const num = parseInt(name.split('_')[1], 10);
        return isNaN(num) ? 0 : num;
      })
      .sort((a, b) => b - a);
    // Get next number (start with 1 if no directories exist)
    const nextNum = todayDirs.length > 0 ? todayDirs[0] + 1 : 1;
    this.debugDir = path.join(baseDebugDir, `${dateStr}_${nextNum.toString().padStart(2, '0')}`);
    fs.mkdirSync(this.debugDir);
    console.log('Debug output directory:', this.debugDir);
  }

  public writeDebugFile(name: string, content: any) {
    if (!this.isEnabled || !this.debugDir) return;
    const filePath = path.join(this.debugDir, `${name}.json`);
    fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
  }
}

export const astDebugger = new AstDebugger();
