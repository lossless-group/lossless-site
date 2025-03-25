#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function extractFrontmatter(fileContent) {
  const lines = fileContent.split('\n');
  let inFrontmatter = false;
  let frontmatterLines = [];
  let contentLines = [];
  let frontmatterCount = 0;

  for (const line of lines) {
    if (line.trim() === '---') {
      frontmatterCount++;
      if (frontmatterCount === 1) {
        inFrontmatter = true;
      } else if (frontmatterCount === 2) {
        inFrontmatter = false;
      }
      continue;
    }

    if (inFrontmatter) {
      frontmatterLines.push(line);
    } else {
      contentLines.push(line);
    }
  }

  return { frontmatterLines, contentLines };
}

function fixFile(filePath) {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { frontmatterLines, contentLines } = extractFrontmatter(fileContent);

    // Find and remove og_screenshot from frontmatter if it has a value
    const newFrontmatterLines = frontmatterLines.filter(line => {
      if (line.trim().startsWith('og_screenshot:')) {
        const value = line.split('og_screenshot:')[1].trim();
        // Only keep the line if it's null or empty
        return !value || value === 'null';
      }
      return true;
    });

    // Reconstruct the file
    const newContent = [
      '---',
      ...newFrontmatterLines,
      '---',
      ...contentLines
    ].join('\n');

    fs.writeFileSync(filePath, newContent);
    console.log(`✅ Fixed ${path.basename(filePath)}`);
  } catch (error) {
    console.error(`❌ Error fixing ${path.basename(filePath)}: ${error.message}`);
  }
}

async function main() {
  const toolingDir = path.resolve(__dirname, '../../content/tooling');
  const files = fs.readdirSync(toolingDir, { recursive: true });
  
  for (const file of files) {
    const filePath = path.join(toolingDir, file);
    if (filePath.endsWith('.md')) {
      fixFile(filePath);
    }
  }
}

main().catch(console.error);
