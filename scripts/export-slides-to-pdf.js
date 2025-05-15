#!/usr/bin/env node

/**
 * export-slides-to-pdf.js
 * 
 * A script to export RevealJS presentations to PDF using DeckTape
 * 
 * This script:
 * 1. Takes a URL to a RevealJS presentation
 * 2. Uses DeckTape to export it to a PDF file
 * 3. Saves the PDF to a specified output directory
 * 
 * Usage:
 *   node scripts/export-slides-to-pdf.js [options]
 * 
 * Options:
 *   --url <url>          URL of the RevealJS presentation (default: http://localhost:4321/slides/)
 *   --output <path>      Output file path (default: ./exports/slides.pdf)
 *   --size <dimensions>  Slide size in format WxH (default: 1600x900)
 *   --delay <ms>         Delay in ms before capturing each slide (default: 1000)
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Parse command line arguments
const args = process.argv.slice(2);
let url = 'http://localhost:4321/slides/';
let output = './exports/slides.pdf';
let size = '1600x900';
let delay = 1000;

// Parse arguments
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--url' && args[i + 1]) {
    url = args[i + 1];
    i++;
  } else if (args[i] === '--output' && args[i + 1]) {
    output = args[i + 1];
    i++;
  } else if (args[i] === '--size' && args[i + 1]) {
    size = args[i + 1];
    i++;
  } else if (args[i] === '--delay' && args[i + 1]) {
    delay = parseInt(args[i + 1], 10);
    i++;
  }
}

// Ensure the output directory exists
const outputDir = path.dirname(output);
if (!fs.existsSync(outputDir)) {
  console.log(`Creating output directory: ${outputDir}`);
  fs.mkdirSync(outputDir, { recursive: true });
}

// Log the export parameters
console.log('Exporting RevealJS presentation to PDF:');
console.log(`URL: ${url}`);
console.log(`Output: ${output}`);
console.log(`Size: ${size}`);
console.log(`Delay: ${delay}ms`);

try {
  // Build the DeckTape command
  // Using npx to run the local installation of DeckTape
  const command = `npx decktape reveal \
    --size ${size} \
    --slides 1-1000 \
    --load-pause ${delay} \
    "${url}" "${output}"`;
  
  console.log('\nRunning DeckTape...');
  console.log(command);
  
  // Execute the command
  execSync(command, { stdio: 'inherit' });
  
  console.log(`\nPDF export successful! File saved to: ${output}`);
} catch (error) {
  console.error('Error exporting PDF:', error.message);
  process.exit(1);
}
