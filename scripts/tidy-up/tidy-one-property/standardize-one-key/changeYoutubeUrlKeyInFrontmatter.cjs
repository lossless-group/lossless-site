const fs = require('fs').promises;
const path = require('path');

const TARGET_DIR = path.join(__dirname, 'tooling');
const REPORT_OUTPUT_DIR = path.join(__dirname, 'reports');

/**
 * Change youtube_url to youtube_channel_url in frontmatter
 */
async function changeYoutubeUrlKey(filePath) {
    try {
        const content = await fs.readFile(filePath, 'utf8');
        const lines = content.split('\n');
        let inFrontmatter = false;
        let frontmatterCount = 0;
        let modified = false;
        let newLines = [];

        for (const line of lines) {
            // Track frontmatter boundaries
            if (line.trim() === '---') {
                frontmatterCount++;
                inFrontmatter = frontmatterCount === 1;
                newLines.push(line);
                continue;
            }

            // Only modify within frontmatter
            if (inFrontmatter && frontmatterCount === 1) {
                if (line.startsWith('youtube_url:')) {
                    newLines.push(line.replace('youtube_url:', 'youtube_channel_url:'));
                    modified = true;
                } else {
                    newLines.push(line);
                }
            } else {
                newLines.push(line);
            }

            // Exit frontmatter when we hit second delimiter
            if (frontmatterCount === 2) {
                inFrontmatter = false;
            }
        }

        if (modified) {
            await fs.writeFile(filePath, newLines.join('\n'));
        }

        return {
            file: filePath,
            modified,
            success: true
        };
    } catch (error) {
        return {
            file: filePath,
            success: false,
            error: error.message
        };
    }
}

/**
 * Process all markdown files in a directory recursively
 */
async function processDirectory(directory) {
    const results = {
        processed: 0,
        modified: 0,
        errors: 0,
        files: []
    };

    try {
        const entries = await fs.readdir(directory, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(directory, entry.name);

            if (entry.isDirectory()) {
                const subResults = await processDirectory(fullPath);
                results.processed += subResults.processed;
                results.modified += subResults.modified;
                results.errors += subResults.errors;
                results.files = results.files.concat(subResults.files);
            } else if (entry.name.endsWith('.md')) {
                results.processed++;
                
                const fileResult = await changeYoutubeUrlKey(fullPath);
                
                if (!fileResult.success) {
                    results.errors++;
                } else if (fileResult.modified) {
                    results.modified++;
                    results.files.push(fileResult.file);
                }
            }
        }
    } catch (error) {
        console.error(`Error processing directory ${directory}:`, error);
    }

    return results;
}

/**
 * Generate a report of modified files
 */
async function generateReport(results) {
    const timestamp = new Date().toISOString().split('T')[0];
    const reportPath = path.join(REPORT_OUTPUT_DIR, `${timestamp}_youtube-key-changes-report.md`);
    
    let report = `# YouTube Key Changes Report\n\n`;
    report += `Generated: ${new Date().toISOString()}\n\n`;
    report += `## Summary\n`;
    report += `- Total files processed: ${results.processed}\n`;
    report += `- Files modified: ${results.modified}\n`;
    report += `- Files with errors: ${results.errors}\n\n`;
    
    if (results.files.length > 0) {
        report += `## Modified Files\n\n`;
        for (const file of results.files) {
            report += `- ${path.relative(TARGET_DIR, file)}\n`;
        }
    }

    await fs.writeFile(reportPath, report);
    console.log(`Report written to: ${reportPath}`);
}

// Main execution
console.log('Changing youtube_url to youtube_channel_url in frontmatter...');
processDirectory(TARGET_DIR)
    .then(generateReport)
    .catch(console.error);
