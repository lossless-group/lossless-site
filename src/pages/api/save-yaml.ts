import type { APIRoute } from 'astro';
import { promises as fs } from 'fs';
import { join } from 'path';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { filePath, content } = await request.json();
    console.log('Received filePath:', filePath);
    
    // Ensure filePath is within the content directory
    if (!filePath.includes('content/tooling/')) {
      return new Response('Invalid file path', { status: 400 });
    }

    // Get absolute path to the file
    const absolutePath = join(process.cwd(), filePath);
    console.log('Absolute path:', absolutePath);

    // Read existing file to preserve non-frontmatter content
    const existingContent = await fs.readFile(absolutePath, 'utf-8');
    const [_, frontmatter, ...rest] = existingContent.split('---\n');
    
    // Update only the frontmatter section
    const newContent = `---\n${content}\n---\n${rest.join('---\n')}`;
    
    // Write the updated content back to the file
    await fs.writeFile(absolutePath, newContent, 'utf-8');
    console.log('File saved successfully');

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error saving YAML:', error);
    return new Response(JSON.stringify({ error: 'Failed to save file' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}
