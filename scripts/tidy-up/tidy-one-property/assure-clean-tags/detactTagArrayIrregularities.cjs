const fs = require('fs').promises;
const path = require('path');

const REPORT_FILE = path.join(__dirname, '..', 'reports', '2025-03-25_tag-irregularities-report.md');
const CONTENT_DIR = path.join(__dirname, '..', '../content/tooling');

/**
 * Check if a line contains tag-related irregularities
 * @param {string} line - The line to check
 * @returns {Object} Object containing irregularity details if found
 */
function checkForTagIrregularities(line) {
    // Skip if not a tag line
    if (!line.trim().startsWith('tags:')) {
        return null;
    }

    const irregularities = [];

    // Check for brackets
    if (line.includes('[') || line.includes(']')) {
        irregularities.push('contains brackets');
    }

    // Check for quotes (single or double)
    if (line.includes("'") || line.includes('"')) {
        irregularities.push('contains quotes');
    }

    if (irregularities.length > 0) {
        return {
            line: line.trim(),
            issues: irregularities
        };
    }

    return null;
}

/**
 * Process a single markdown file
 */
async function processFile(filePath) {
    try {
        const content = await fs.readFile(filePath, 'utf8');
        const lines = content.split('\n');
        let inFrontmatter = false;
        let irregularities = null;

        for (const line of lines) {
            // Track frontmatter boundaries
            if (line.trim() === '---') {
                inFrontmatter = !inFrontmatter;
                continue;
            }

            // Only check lines within frontmatter
            if (inFrontmatter) {
                const result = checkForTagIrregularities(line);
                if (result) {
                    irregularities = result;
                    break;
                }
            }
        }

        if (irregularities) {
            return {
                file: filePath,
                ...irregularities
            };
        }

        return null;
    } catch (error) {
        console.error('Error processing file:', filePath, error);
        return null;
    }
}

/**
 * Recursively find all markdown files
 */
async function findMarkdownFiles(dir) {
    const files = await fs.readdir(dir);
    const markdownFiles = [];

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = await fs.stat(fullPath);

        if (stat.isDirectory()) {
            const nestedFiles = await findMarkdownFiles(fullPath);
            markdownFiles.push(...nestedFiles);
        } else if (file.endsWith('.md')) {
            markdownFiles.push(fullPath);
        }
    }

    return markdownFiles;
}

/**
 * Generate report content
 */
function generateReport(results) {
    const timestamp = new Date().toISOString();
    let content = `---
date: 2025-03-25
datetime: ${timestamp}
authors: 
 - Michael Staton
augmented_with: 'Windsurf on Claude 3.5 Sonnet'
category: Data-Integrity
tags:
- Documentation-Standards
- YAML
- Memory-Management
- Session-Logs
- Prompts
---

# Tag Irregularities Report

## Summary
- Total files processed: ${results.totalFiles}
- Files with tag irregularities: ${results.irregularFiles.length}

## Files with Tag Irregularities
${results.irregularFiles.map(item => `
### ${path.relative(CONTENT_DIR, item.file)}
- Line: \`${item.line}\`
- Issues: ${item.issues.join(', ')}
`).join('\n')}
`;

    return content;
}

// Main execution
console.log('Detecting tag irregularities...');
findMarkdownFiles(CONTENT_DIR)
    .then(async files => {
        console.log('Processing', files.length, 'files...');
        const results = [];
        
        for (const file of files) {
            const result = await processFile(file);
            if (result) {
                results.push(result);
            }
        }

        const report = generateReport({
            totalFiles: files.length,
            irregularFiles: results
        });

        await fs.writeFile(REPORT_FILE, report);
        console.log('Report generated:', REPORT_FILE);
        console.log('Found', results.length, 'files with tag irregularities');
    })
    .catch(console.error);