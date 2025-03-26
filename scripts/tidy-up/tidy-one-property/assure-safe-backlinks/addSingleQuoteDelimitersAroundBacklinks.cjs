const fs = require('fs').promises;
const path = require('path');

/**
 * Add single quotes around backlinks ([[text]]) in frontmatter
 * Remove any quotes or delimiters from backlinks outside frontmatter
 */
async function addBacklinkQuotes(filePath) {
    try {
        const content = await fs.readFile(filePath, 'utf8');
        const lines = content.split('\n');
        let modified = false;
        let inFrontmatter = false;
        let frontmatterCount = 0;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmedLine = line.trim();
            
            // Track if we're in frontmatter
            if (trimmedLine === '---') {
                frontmatterCount++;
                inFrontmatter = frontmatterCount === 1;
                continue;
            }

            // ONLY process lines in frontmatter that have backlinks
            if (inFrontmatter && frontmatterCount === 1 && trimmedLine.includes('[[') && trimmedLine.includes(']]')) {
                const [key, ...valueParts] = line.split(':');
                
                if (key && valueParts.length) {
                    const value = valueParts.join(':').trim();
                    
                    // Remove all quotes, handling nested quotes too
                    let cleanValue = value;
                    while (cleanValue.match(/^["'].*["']$/)) {
                        cleanValue = cleanValue.replace(/^["']|["']$/g, '');
                    }
                    
                    // Preserve original indentation
                    const indentation = line.match(/^\s*/)[0];
                    
                    // Add single quotes around the value
                    lines[i] = `${indentation}${key.trim()}: '${cleanValue}'`;
                    modified = true;
                }
            }

            // Exit frontmatter mode when we hit the second delimiter
            if (frontmatterCount === 2) {
                inFrontmatter = false;
            }
        }

        if (modified) {
            await fs.writeFile(filePath, lines.join('\n'));
            return {
                success: true,
                modified: true,
                file: filePath
            };
        }

        return {
            success: true,
            modified: false,
            file: filePath
        };

    } catch (error) {
        return {
            success: false,
            error: error.message,
            file: filePath
        };
    }
}

async function processDirectory(directory) {
    const results = [];
    
    async function processFile(filePath) {
        if (path.extname(filePath) === '.md') {
            const result = await addBacklinkQuotes(filePath);
            results.push(result);
        }
    }

    async function walk(dir) {
        const files = await fs.readdir(dir);
        
        for (const file of files) {
            const filePath = path.join(dir, file);
            const stat = await fs.stat(filePath);
            
            if (stat.isDirectory()) {
                await walk(filePath);
            } else {
                await processFile(filePath);
            }
        }
    }

    await walk(directory);
    return results;
}

async function generateReport(results) {
    const date = new Date().toISOString().split('T')[0];
    const reportsDir = path.join(__dirname, 'reports');
    
    // Find existing reports to determine next number
    const files = await fs.readdir(reportsDir);
    const existingReports = files.filter(f => f.startsWith(`${date}_backlink-quotes-report`));
    const nextNumber = existingReports.length + 1;
    
    const reportPath = path.join(reportsDir, `${date}_backlink-quotes-report_${String(nextNumber).padStart(2, '0')}.md`);

    let report = '# Backlink Quotes Report\n\n';
    report += '## Summary\n';
    report += `- Total files processed: ${results.length}\n`;
    report += `- Files modified: ${results.filter(r => r.modified).length}\n`;
    report += `- Files with errors: ${results.filter(r => !r.success).length}\n\n`;

    report += '## Files Modified\n';
    results
        .filter(r => r.modified)
        .forEach(r => {
            const relativePath = path.relative(__dirname, r.file);
            report += `- [[${relativePath}]] (Added quotes around backlinks)\n`;
        });

    await fs.writeFile(reportPath, report);
    console.log(`Report written to: ${reportPath}`);
}

async function main() {
    try {
        const toolingDir = path.join(__dirname, 'tooling');
        console.log('Adding quotes around backlinks...');
        
        const results = await processDirectory(toolingDir);
        await generateReport(results);

    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

main();