const fs = require('fs').promises;
const path = require('path');

const REPORT_FILES = [
    'reports/2025-03-24_yamllint-report_03.txt',
    'reports/2025-03-25_backlink-quotes-report_02.md',
    'reports/2025-03-25_backlink-quotes-report_03.md',
    'reports/2025-03-25_backlink-quotes-report_04.md',
    'reports/2025-03-25_backlink-quotes-report_05.md',
    'reports/2025-03-25_frontmatter-cleanup-report_01.md'
];

/**
 * Fix backlink paths in a report file
 */
async function fixBacklinkPaths(filePath) {
    try {
        const content = await fs.readFile(filePath, 'utf8');
        const newContent = content.replace(/\[\[tooling\//g, '[[Tooling/');
        
        if (content !== newContent) {
            await fs.writeFile(filePath, newContent);
            return {
                file: filePath,
                modified: true,
                success: true
            };
        }

        return {
            file: filePath,
            modified: false,
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
 * Process all specified report files
 */
async function processReports() {
    const results = {
        processed: 0,
        modified: 0,
        errors: 0,
        files: []
    };

    for (const reportFile of REPORT_FILES) {
        const fullPath = path.join(__dirname, reportFile);
        results.processed++;

        const fileResult = await fixBacklinkPaths(fullPath);
        if (!fileResult.success) {
            results.errors++;
            console.error(`Error processing ${reportFile}:`, fileResult.error);
        } else if (fileResult.modified) {
            results.modified++;
            results.files.push(reportFile);
        }
    }

    return results;
}

// Main execution
console.log('Fixing backlink paths in reports...');
processReports()
    .then(results => {
        console.log('\nSummary:');
        console.log(`- Total files processed: ${results.processed}`);
        console.log(`- Files modified: ${results.modified}`);
        console.log(`- Files with errors: ${results.errors}`);
        
        if (results.files.length > 0) {
            console.log('\nModified files:');
            results.files.forEach(file => console.log(`- ${file}`));
        }
    })
    .catch(console.error);
