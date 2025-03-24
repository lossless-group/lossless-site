/**
 * Utility functions for consistent report naming across scripts
 */

const fs = require('fs');
const path = require('path');

/**
 * Ensures a directory exists and has proper permissions
 * @param {string} dirPath - Path to the directory to ensure
 */
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true, mode: 0o755 });
  }
}

/**
 * Generates a report filename following the convention: YYYY-MM-DD_reportName_runIndex.md
 * Will auto-increment the runIndex if files with the same date and reportName exist
 * 
 * @param {Object} options - Options for generating the report name
 * @param {string} options.reportName - Base name of the report (e.g., 'open-graph-fetch-report')
 * @param {string} options.outputDir - Directory where the report will be saved
 * @param {Date} [options.date] - Optional date to use (defaults to current date)
 * @returns {Object} Object containing { filePath, fileName, runIndex }
 */
function generateReportFilename({ reportName, outputDir, date = new Date() }) {
  // Ensure the output directory exists with proper permissions
  ensureDirectoryExists(outputDir);
  
  // Format date as YYYY-MM-DD
  const dateStr = date.toISOString().split('T')[0];
  
  // Find existing reports with same date and name
  const existingFiles = fs.readdirSync(outputDir)
    .filter(file => file.startsWith(`${dateStr}_${reportName}_`) && file.endsWith('.md'));

  // Get the highest run index
  let maxRunIndex = 0;
  existingFiles.forEach(file => {
    const match = file.match(new RegExp(`${dateStr}_${reportName}_(\\d+)\\.md`));
    if (match) {
      const runIndex = parseInt(match[1], 10);
      maxRunIndex = Math.max(maxRunIndex, runIndex);
    }
  });

  // Generate new filename with next run index
  const runIndex = maxRunIndex + 1;
  const fileName = `${dateStr}_${reportName}_${String(runIndex).padStart(2, '0')}.md`;
  const filePath = path.join(outputDir, fileName);

  return {
    filePath,
    fileName,
    runIndex
  };
}

module.exports = {
  generateReportFilename,
  ensureDirectoryExists
};