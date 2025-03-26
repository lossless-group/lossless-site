const fs = require('fs').promises;
const path = require('path');

const REPORT_FILE = path.join(__dirname, 'reports', '2025-03-25_open-graph-fetch-report_01.md');
const BASE_PATH = '/Users/mpstaton/lossless-monorepo/tooling-clone/tooling/';

/**
 * Fix absolute paths in backlinks to be relative
 */
async function fixBacklinkPaths(filePath) {
    try {
        const content = await fs.readFile(filePath, 'utf8');
        const lines = content.split('\n');
        let modified = false;
        let newLines = [];

        for (const line of lines) {
            if (line.includes('[[' + BASE_PATH)) {
                // Replace absolute path with relative path starting with Tooling/
                const newLine = line.replace(new RegExp('\\[\\[' + BASE_PATH.replace(/\//g, '\\/'), 'g'), '[[Tooling/');
                newLines.push(newLine);
                modified = true;
            } else {
                newLines.push(line);
            }
        }

        if (modified) {
            await fs.writeFile(filePath, newLines.join('\n'));
            console.log('Modified file:', filePath);
        } else {
            console.log('No changes needed for:', filePath);
        }

        return {
            file: filePath,
            modified,
            success: true
        };
    } catch (error) {
        console.error('Error processing file:', error);
        return {
            file: filePath,
            success: false,
            error: error.message
        };
    }
}

// Main execution
console.log('Fixing absolute paths in backlinks...');
fixBacklinkPaths(REPORT_FILE)
    .then(result => {
        if (result.success) {
            console.log('Successfully processed file');
            if (result.modified) {
                console.log('File was modified');
            }
        } else {
            console.error('Failed to process file:', result.error);
        }
    })
    .catch(console.error);
