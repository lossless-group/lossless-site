import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

async function inspectEntry() {
  // Read from the changelog--code directory
  const contentPath = join(process.cwd(), 'src/content/changelog--code');
  const files = await readdir(contentPath);
  
  if (files.length > 0) {
    // Read the first markdown file we find
    const firstMdFile = files.find(f => f.endsWith('.md'));
    if (firstMdFile) {
      const content = await readFile(join(contentPath, firstMdFile), 'utf-8');
      console.log('File content:', content);
    }
  }
}

inspectEntry().catch(console.error);
