/**
 * Utility functions for counting words in files and collections
 */

/**
 * Counts words in a markdown string
 * @param content - The markdown content to count words in
 * @returns The number of words in the content
 */
export function countWordsInMarkdown(content: string): number {
  if (!content) return 0;
  
  // Remove frontmatter
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
 * Counts words in a file's content and its frontmatter
 * @param fileContent - The file content including frontmatter
 * @returns The total word count
 */
export function countWordsInFile(fileContent: string): number {
  if (!fileContent) return 0;
  
  // Extract frontmatter and content
  const frontmatterMatch = fileContent.match(/^---\s*([\s\S]*?)\s*---/);
  const frontmatter = frontmatterMatch ? frontmatterMatch[1] : '';
  const content = frontmatterMatch ? fileContent.slice(frontmatterMatch[0].length) : fileContent;
  
  // Count words in both frontmatter and content
  const frontmatterWordCount = frontmatter
    .split('\n')
    .filter(line => !line.startsWith('---') && line.trim() !== '')
    .map(line => line.split(/\s+/).length)
    .reduce((sum, count) => sum + count, 0);
    
  const contentWordCount = countWordsInMarkdown(content);
  
  return frontmatterWordCount + contentWordCount;
}
