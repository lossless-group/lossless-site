import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import matter from 'gray-matter';

/**
 * Counts words in a markdown file, excluding frontmatter and code blocks
 * @param content Markdown content
 * @returns Word count as number
 */
export function countWordsInMarkdown(content: string): number {
  // Remove YAML frontmatter
  const contentWithoutFrontmatter = content.replace(/^---[\s\S]*?---\s*/, '');
  
  // Remove code blocks
  const contentWithoutCode = contentWithoutFrontmatter.replace(/```[\s\S]*?```/g, '');
  
  // Remove inline code
  const cleanContent = contentWithoutCode.replace(/`[^`]+`/g, '');
  
  // Split by whitespace and filter out empty strings
  const words = cleanContent.split(/\s+/).filter(word => word.length > 0);
  
  return words.length;
}

/**
 * Gets total word count for all markdown files in a directory
 * @param dirPath Path to directory containing markdown files
 * @returns Total word count and file count
 */
export function getWordCountForDirectory(dirPath: string): { totalWords: number; fileCount: number } {
  try {
    const files = readdirSync(dirPath).filter(file => file.endsWith('.md'));
    let totalWords = 0;
    
    for (const file of files) {
      try {
        const fileContent = readFileSync(join(dirPath, file), 'utf-8');
        const { content } = matter(fileContent);
        totalWords += countWordsInMarkdown(content);
      } catch (error) {
        console.warn(`Error processing file ${file}:`, error);
      }
    }
    
    return { totalWords, fileCount: files.length };
  } catch (error) {
    console.error(`Error reading directory ${dirPath}:`, error);
    return { totalWords: 0, fileCount: 0 };
  }
}

// For testing
if (import.meta.main) {
  const dir = process.argv[2];
  if (!dir) {
    console.error('Please provide a directory path');
    process.exit(1);
  }
  
  const { totalWords, fileCount } = getWordCountForDirectory(dir);
  console.log(`Found ${fileCount} markdown files with ${totalWords} total words`);
}
