import fs from 'fs';
import path from 'path';

class AstDebugger {
  private debugDir: string | undefined;
  private isEnabled: boolean = process.env.DEBUG_AST === 'true';

  constructor() {
    if (this.isEnabled) {
      // Initialize immediately
      this.init();
    }
  }

  private init() {
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
    const newDebugDir = path.join(baseDebugDir, `${dateStr}_${nextNum.toString().padStart(2, '0')}`);
    
    // Only create a new directory if we don't have one yet
    if (!this.debugDir) {
      this.debugDir = newDebugDir;
      if (!fs.existsSync(this.debugDir)) {
        fs.mkdirSync(this.debugDir);
      }
      console.log('Debug output directory:', this.debugDir);
    }
  }

  public writeDebugFile(name: string, content: any) {
    if (!this.isEnabled) return;

    if (!this.debugDir) {
      this.createDebugDir();
    }

    try {
      const filePath = path.join(this.debugDir!, `${name}.json`);
      fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
      console.log(`Debug file written: ${filePath}`);
    } catch (error) {
      console.error('Error writing debug file:', error);
    }
  }
}

export const astDebugger = new AstDebugger();
