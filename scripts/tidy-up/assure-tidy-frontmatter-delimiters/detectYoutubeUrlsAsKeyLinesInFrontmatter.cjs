const fs = require('fs').promises;
const path = require('path');

const TARGET_DIR = path.join(__dirname, 'tooling');
const REPORT_OUTPUT_DIR = path.join(__dirname, 'reports');

// YouTube URL patterns to look for
const YOUTUBE_PATTERNS = [
    'youtu.be/',
    'youtube.com/',
    'www.youtube.com/'
];

/**
 * Process a single file to detect YouTube URLs in frontmatter
 */
async function detectYoutubeUrls(filePath) {
    try {
        const content = await fs.readFile(filePath, 'utf8');
        const lines = content.split('\n');
        let inFrontmatter = false;
        let frontmatterCount = 0;
        let youtubeUrls = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            // Track frontmatter boundaries
            if (line.trim() === '---') {
                frontmatterCount++;
                inFrontmatter = frontmatterCount === 1;
                continue;
            }

            // Look for YouTube URLs anywhere in frontmatter
            if (inFrontmatter && frontmatterCount === 1) {
                // Check for any YouTube URL pattern
                if (YOUTUBE_PATTERNS.some(pattern => line.includes(pattern))) {
                    youtubeUrls.push({
                        line: line,
                        lineNumber: i + 1,
                        indentation: line.match(/^\s*/)[0].length,
                        pattern: YOUTUBE_PATTERNS.find(pattern => line.includes(pattern))
                    });
                }
            }

            // Exit frontmatter when we hit second delimiter
            if (frontmatterCount === 2) {
                inFrontmatter = false;
            }
        }

        return {
            file: filePath,
            youtubeUrls: youtubeUrls,
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
        withYoutubeUrls: 0,
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
                results.withYoutubeUrls += subResults.withYoutubeUrls;
                results.errors += subResults.errors;
                results.files = results.files.concat(subResults.files);
            } else if (entry.name.endsWith('.md')) {
                results.processed++;
                
                const fileResult = await detectYoutubeUrls(fullPath);
                
                if (!fileResult.success) {
                    results.errors++;
                } else if (fileResult.youtubeUrls.length > 0) {
                    results.withYoutubeUrls++;
                    results.files.push({
                        file: fileResult.file,
                        youtubeUrls: fileResult.youtubeUrls
                    });
                }
            }
        }
    } catch (error) {
        console.error(`Error processing directory ${directory}:`, error);
    }

    return results;
}

/**
 * Generate a report of files with YouTube URLs in frontmatter
 */
async function generateReport(results) {
    const timestamp = new Date().toISOString().split('T')[0];
    const reportPath = path.join(REPORT_OUTPUT_DIR, `${timestamp}_youtube-urls-report.md`);
    
    let report = `# YouTube URLs in Frontmatter Report\n\n`;
    report += `Generated: ${new Date().toISOString()}\n\n`;
    report += `## Summary\n`;
    report += `- Total files processed: ${results.processed}\n`;
    report += `- Files with YouTube URLs in frontmatter: ${results.withYoutubeUrls}\n`;
    report += `- Files with errors: ${results.errors}\n\n`;
    
    if (results.files.length > 0) {
        report += `## Files with YouTube URLs in Frontmatter\n\n`;
        
        for (const file of results.files) {
            const relativePath = path.relative(TARGET_DIR, file.file);
            report += `### ${relativePath}\n\n`;
            
            for (const url of file.youtubeUrls) {
                report += `Line ${url.lineNumber} (indent: ${url.indentation}, pattern: ${url.pattern}): \`${url.line}\`\n`;
            }
            report += '\n';
        }
    }

    await fs.writeFile(reportPath, report);
    console.log(`Report written to: ${reportPath}`);
}

// Main execution
console.log('Detecting YouTube URLs in frontmatter...');
processDirectory(TARGET_DIR)
    .then(generateReport)
    .catch(console.error);