/**
 * Citation Processing Script
 * 
 * This script processes citations in markdown files and updates the citation registry.
 * It can process a single file or recursively process a directory.
 * 
 * Usage:
 * ```
 * ts-node scripts/process-citations.ts <target>
 * ```
 * 
 * Where <target> is either a markdown file or a directory containing markdown files.
 */

import { processCitationsTarget } from '../src/utils/markdown/citations/citationsProcessor';

// Set up debugging environment variables
process.env.DEBUG_CITATIONS = process.env.DEBUG_CITATIONS || 'false';
process.env.DEBUG_CITATIONS_VERBOSE = process.env.DEBUG_CITATIONS_VERBOSE || 'false';

// Check if target is provided
const target = process.argv[2];

if (!target) {
  console.error('Please provide a target file or directory');
  process.exit(1);
}

// Run the script
console.log('Citation Registry Processor');
console.log('==========================');
console.log(`Target: ${target}`);
console.log(`Debug mode: ${process.env.DEBUG_CITATIONS === 'true' ? 'ON' : 'OFF'}`);
console.log(`Verbose debug: ${process.env.DEBUG_CITATIONS_VERBOSE === 'true' ? 'ON' : 'OFF'}`);
console.log('==========================');

processCitationsTarget(target)
  .then(() => {
    console.log('Citation processing complete');
  })
  .catch((error) => {
    console.error('Error processing citations:', error);
    process.exit(1);
  });
