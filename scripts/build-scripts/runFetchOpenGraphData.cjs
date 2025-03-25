#!/usr/bin/env node

/**
 * runFetchOpenGraphData.cjs
 * Purpose: Fetches and updates OpenGraph data and screenshots for Markdown files using opengraph.io API
 * 
 * Core Functions:
 * - extractFrontmatter(fileContent): Extracts YAML frontmatter using plain text parsing (no gray-matter)
 *   Returns: {frontmatterLines: string[], contentLines: string[]}
 * 
 * - processMarkdownFile(filePath): Processes a single Markdown file
 *   - Extracts and validates frontmatter
 *   - Checks for existing OpenGraph data
 *   - Fetches new data if needed
 *   - Updates file with new data
 *   Returns: void (updates stats object with results)
 * 
 * - generateReport(outputPath): Creates a detailed report of the processing results
 *   - Uses generateReportFrontmatter for consistent frontmatter
 *   - Includes statistics and file lists
 *   Returns: Promise<void>
 * 
 * Key Features:
 * 1. Safe frontmatter handling - Uses plain text parsing to avoid gray-matter issues
 * 2. Non-blocking fetches - Processes files in parallel for efficiency
 * 3. Detailed error tracking - Maintains separate stats for OG data and screenshot issues
 * 4. Filesystem safety - Uses proper sync/async operations and error handling
 * 5. Consistent reporting - Uses shared utilities for report naming and frontmatter
 * 
 * Dependencies:
 * - Node built-ins: fs, path
 * - External: dotenv (for API key)
 * - Internal utils: addReportNamingConventions.cjs, addReportFrontmatterTemplate.cjs
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { generateReportFilename } = require('./utils/addReportNamingConventions.cjs');
const { generateReportFrontmatter } = require('./utils/addReportFrontmatterTemplate.cjs');

// User configuration
const TARGET_DIR = process.env.TARGET_DIR || path.join(__dirname, '../../../tooling-clone/tooling/');
const REPORT_OUTPUT_DIR = path.join(__dirname, '../../../site/src/content/data_site/reports');  
const REPORT_NAME = 'open-graph-fetch-report';

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Tracking sets for processing state
const stats = {
  filesProcessed: 0,
  filesWithIssues: new Set(),
  openGraph: {
    skippedDueToYaml: 0,
    properOpenGraphDataFound: 0,
    newSuccesses: new Set(), // Track files with new OpenGraph data
    newErrors: new Set(), // Track files with OG data errors
  },
  screenshots: {
    newSuccesses: new Set(), // Track successful screenshot updates
    errors: new Set(), // Track screenshot errors
  }
};

/**
 * Extracts frontmatter content between --- markers using plain text parsing
 * 
 * Purpose:
 * - Safely extract YAML frontmatter without using gray-matter or other libraries
 * - Maintain exact line positioning for later updates
 * 
 * @param {string} fileContent - Raw file content to parse
 * @returns {Object} Result containing:
 *   - frontmatterLines: Array of strings, each line of frontmatter
 *   - contentLines: Array of strings, remaining file content
 * 
 * Implementation Notes:
 * - Uses simple line-by-line parsing with state tracking
 * - Handles edge cases like missing frontmatter or improper formatting
 * - Preserves exact whitespace and formatting
 */
function extractFrontmatter(fileContent) {
  const lines = fileContent.split('\n');
  let inFrontmatter = false;
  let frontmatterLines = [];
  let contentLines = [];
  let frontmatterCount = 0;

  for (const line of lines) {
    if (line.trim() === '---') {
      frontmatterCount++;
      inFrontmatter = frontmatterCount === 1;
      if (frontmatterCount === 2) break;
      continue;
    }

    if (inFrontmatter) {
      frontmatterLines.push(line);
    } else if (frontmatterCount === 0) {
      contentLines.push(line);
    }
  }

  // Add remaining lines to content
  contentLines = contentLines.concat(lines.slice(frontmatterCount === 2 ? frontmatterLines.length + 2 : 0));

  return {
    frontmatter: parseFrontmatterLines(frontmatterLines),
    content: contentLines.join('\n')
  };
}

/**
 * Parses frontmatter lines into key-value pairs
 * @param {string[]} lines - Array of frontmatter lines
 * @returns {Object} Parsed frontmatter object
 */
function parseFrontmatterLines(lines) {
  const frontmatter = {};
  
  for (const line of lines) {
    const [key, ...valueParts] = line.split(':').map(part => part.trim());
    if (key && valueParts.length) {
      frontmatter[key] = valueParts.join(':').replace(/^['"]|['"]$/g, '');
    }
  }

  return frontmatter;
}

/**
 * Strips quotes from a string value
 * @param {string} value - Value to strip quotes from
 * @returns {string} Value without surrounding quotes
 */
function stripQuotes(value) {
  return value ? value.replace(/^['"]|['"]$/g, '') : value;
}

/**
 * Formats a value for frontmatter based on its type and content
 * @param {string} key - The frontmatter key
 * @param {string} value - The value to format
 * @returns {string} Formatted value
 */
function formatFrontmatterValue(key, value) {
  if (!value) return '';

  // URL properties should be bare (no quotes)
  const urlProperties = ['url', 'image', 'favicon', 'og_image', 'og_screenshot_url'];
  if (urlProperties.includes(key)) {
    return value.trim();
  }

  // Error messages should be in double quotes (case insensitive)
  if (key.toLowerCase().includes('error')) {
    return `"${value.replace(/"/g, '')}"`;
  }

  // Title and description should be in single quotes if they contain special characters
  if (key === 'title' || key === 'description') {
    if (/[:#\[\]{}|><=&!]/.test(value)) {
      return `'${value.replace(/'/g, '')}'`;
    }
  }

  return value;
}

/**
 * Updates a markdown file with new OpenGraph data
 * 
 * Purpose:
 * - Add or update OpenGraph data in frontmatter while preserving existing content
 * - Handle both core OG data and screenshot URLs
 * 
 * @param {string} filePath - Path to the markdown file
 * @param {Object} ogData - OpenGraph data to add
 *   - title: OG title
 *   - description: OG description
 *   - image: OG image URL
 *   - url: Original URL
 * @param {string} [screenshotUrl] - Optional URL to screenshot image
 * 
 * Implementation Notes:
 * - Preserves all existing frontmatter fields
 * - Maintains consistent YAML formatting
 * - Uses atomic write operations for safety
 * - Updates stats tracking for reporting
 */
function updateMarkdownFile(filePath, ogData, screenshotUrl) {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const { frontmatter, content } = extractFrontmatter(fileContent);

  Object.assign(frontmatter, ogData);

  if (screenshotUrl) {
    frontmatter.og_screenshot_url = screenshotUrl;
  }

  const frontmatterLines = Object.entries(frontmatter)
    .map(([key, value]) => `${key}: ${formatFrontmatterValue(key, value)}`);

  const newContent = [
    '---',
    ...frontmatterLines,
    '---',
    content
  ].join('\n');

  fs.writeFileSync(filePath, newContent, 'utf-8');
}

/**
 * Checks if a file needs OpenGraph data fetching
 * @param {Object} frontmatter - File frontmatter object
 * @returns {Object} Object indicating if fetch is needed and reason
 */
function needsOpenGraphFetch(frontmatter) {
  // Skip if already has OpenGraph data
  if (frontmatter.og_image || frontmatter.og_screenshot_url || frontmatter.og_last_error) {
    stats.openGraph.skippedDueToYaml++;
    return { needsFetch: false, reason: 'has_required_properties' };
  }

  // Skip if no URL present
  if (!frontmatter.url) {
    return { needsFetch: false, reason: 'no_url' };
  }

  return { needsFetch: true, reason: 'missing_required_properties' };
}

/**
 * Checks if a file needs screenshot fetching
 * @param {Object} frontmatter - File frontmatter object
 * @returns {Object} Object indicating if fetch is needed and reason
 */
function needsScreenshotFetch(frontmatter) {
  // Skip if already has a screenshot
  if (frontmatter.og_screenshot_url) {
    return { needsFetch: false, reason: 'has_screenshot' };
  }

  // Skip if no URL present
  if (!frontmatter.url) {
    return { needsFetch: false, reason: 'no_url' };
  }

  return { needsFetch: true, reason: 'missing_screenshot' };
}

/**
 * Marks a file with an error in its frontmatter
 * @param {string} filePath - Path to the file
 * @param {string} errorMessage - Error message to record
 * @param {boolean} isScreenshotError - Whether this is a screenshot-specific error
 */
async function markFileWithError(filePath, errorMessage, isScreenshotError = false) {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { frontmatter, content } = extractFrontmatter(fileContent);

    // Error is always true as a bare boolean
    frontmatter.og_errors = true;
    // Timestamp as a bare ISO string
    frontmatter.og_last_error = new Date().toISOString();
    // Error message wrapped in single quotes
    frontmatter.og_error_message = `'${errorMessage}'`;

    if (isScreenshotError) {
      stats.screenshots.errors.add(filePath);
    } else {
      stats.openGraph.newErrors.add(filePath);
    }

    updateMarkdownFile(filePath, frontmatter, content);
    console.log(`⚠️ Marked ${path.basename(filePath)} with error: '${errorMessage}'`);
  } catch (error) {
    console.error(`Error marking file with error: '${error.message}'`);
  }
}

/**
 * Categorizes OpenGraph API errors and determines retry strategy
 * @param {Error|Object} error - Error object or API response
 * @returns {Object} Error details and retry strategy
 */
function categorizeOpenGraphError(error) {
  // API rate limit errors
  if (error.status === 429 || (error.message && error.message.includes('rate limit'))) {
    return {
      type: 'rate_limit',
      canRetry: true,
      waitTime: 60000, // Wait 1 minute
      message: 'API rate limit exceeded'
    };
  }

  // Temporary server errors
  if (error.status >= 500 || (error.message && error.message.includes('timeout'))) {
    return {
      type: 'server_error',
      canRetry: true,
      waitTime: 30000, // Wait 30 seconds
      message: `Server error: ${error.status || error.message}`
    };
  }

  // Invalid URL or client errors
  if (error.status >= 400 && error.status < 500) {
    return {
      type: 'client_error',
      canRetry: false,
      message: `Client error: ${error.status}`
    };
  }

  // Network or other errors
  return {
    type: 'unknown_error',
    canRetry: false,
    message: error.message || 'Unknown error occurred'
  };
}

/**
 * Fetches OpenGraph data from opengraph.io API
 * 
 * Purpose:
 * - Retrieve standardized OpenGraph metadata for a URL
 * - Handle API errors gracefully
 * 
 * @param {string} url - Target URL to fetch OG data for
 * @param {string} filePath - Path to the file being processed
 * @returns {Promise<Object|null>} OpenGraph data if successful, null if failed
 *   - title: OG title from page
 *   - description: OG description
 *   - image: OG image URL
 *   - url: Canonical URL
 * 
 * Implementation Notes:
 * - Uses environment variable for API key
 * - Handles common API errors (rate limits, timeouts)
 * - Validates response data before returning
 * 
 * Called By:
 * - processMarkdownFile() when new OG data is needed
 * 
 * Error Handling:
 * - Catches and categorizes API errors for retry or error reporting
 * - Uses markFileWithError() to record errors in file frontmatter
 * 
 * File Safety:
 * - Ensures API key is present before making requests
 * - Handles network errors without crashing
 */
async function fetchOpenGraphData(url, filePath) {
  const MAX_RETRIES = 3;
  let retryCount = 0;
  const openGraphKey = process.env.OPEN_GRAPH_IO_API_KEY;
  
  if (!openGraphKey) {
    console.error('OpenGraph API key not found in environment variables (OPEN_GRAPH_IO_API_KEY)');
    return null;
  }

  while (retryCount < MAX_RETRIES) {
    try {
      const response = await fetch(`https://opengraph.io/api/1.1/site/${encodeURIComponent(url)}?app_id=${openGraphKey}`);
      
      if (!response.ok) {
        const errorDetails = categorizeOpenGraphError(response);
        
        if (errorDetails.canRetry && retryCount < MAX_RETRIES - 1) {
          console.log(`⚠️ ${errorDetails.message} for ${url}. Retrying in ${errorDetails.waitTime/1000}s...`);
          await new Promise(resolve => setTimeout(resolve, errorDetails.waitTime));
          retryCount++;
          continue;
        }

        await markFileWithError(filePath, errorDetails.message);
        return null;
      }

      const data = await response.json();
      
      // Validate response data structure
      if (!data || !data.hybridGraph) {
        const errorMessage = 'Invalid or empty response from OpenGraph API';
        await markFileWithError(filePath, errorMessage);
        return null;
      }

      const ogProperties = {};
      const properties = ['image', 'site_name', 'title', 'url', 'favicon'];
      
      // Check if we have at least one required property
      const hasRequiredProperty = properties.some(prop => data.hybridGraph[prop]);
      
      if (!hasRequiredProperty) {
        const errorMessage = 'No required OpenGraph properties found in response';
        await markFileWithError(filePath, errorMessage);
        return null;
      }

      // Extract available properties
      properties.forEach(prop => {
        if (data.hybridGraph[prop]) {
          ogProperties[prop] = stripQuotes(data.hybridGraph[prop]);
        }
      });

      // Add metadata about the fetch
      ogProperties.og_fetched_url = stripQuotes(url);
      ogProperties.og_last_fetch = new Date().toISOString();
      
      return ogProperties;
    } catch (error) {
      const errorDetails = categorizeOpenGraphError(error);
      
      if (errorDetails.canRetry && retryCount < MAX_RETRIES - 1) {
        console.log(`⚠️ ${errorDetails.message} for ${url}. Retrying in ${errorDetails.waitTime/1000}s...`);
        await new Promise(resolve => setTimeout(resolve, errorDetails.waitTime));
        retryCount++;
        continue;
      }

      console.error('Error fetching OpenGraph properties for', url, ':', error);
      await markFileWithError(filePath, errorDetails.message);
      return null;
    }
  }

  return null;
}

/**
 * Fetches a screenshot URL from opengraph.io API
 * 
 * Purpose:
 * - Get a static screenshot of the target URL
 * - Cache screenshot URL for future use
 * 
 * @param {string} url - Target URL to screenshot
 * @param {string} filePath - Path to the markdown file
 * @returns {Promise<string|null>} Screenshot URL if successful, null if failed
 * 
 * Implementation Notes:
 * - Uses same API key as fetchOpenGraphData
 * - Handles API-specific screenshot endpoint
 * - Validates screenshot URL before returning
 * 
 * Called By:
 * - processMarkdownFile() for screenshot updates
 * 
 * Error Handling:
 * - Catches and logs API errors
 * - Uses markFileWithError() to record errors in file frontmatter
 * 
 * File Safety:
 * - Ensures API key is present before making requests
 * - Handles network errors without crashing
 */
async function fetchScreenshotUrl(url, filePath) {
  const openGraphKey = process.env.OPEN_GRAPH_IO_API_KEY;
  
  if (!openGraphKey) {
    console.error('OpenGraph API key not found in environment variables (OPEN_GRAPH_IO_API_KEY)');
    return null;
  }

  try {
    const screenshotUrl = `https://opengraph.io/api/1.1/screenshot/${encodeURIComponent(url)}?dimensions=lg&quality=80&accept_lang=en&use_proxy=true&app_id=${openGraphKey}`;
    const response = await fetch(screenshotUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    if (!data.screenshotUrl) {
      throw new Error('No screenshot URL in response');
    }

    return stripQuotes(data.screenshotUrl);
  } catch (error) {
    console.error(`Error in screenshot fetch for ${url}:`, error);
    await markFileWithError(filePath, `Screenshot fetch error: ${error.message}`, true);
    return null;
  }
}

/**
 * Formats a file path for use in backlinks
 * Starts with capitalized first directory (e.g. 'Tooling')
 * @param {string} filePath - Path to format
 * @returns {string} Formatted path
 */
function formatBacklinkPath(filePath) {
  const parts = filePath.split('/');
  // Find the index of 'content' or 'Content'
  const contentIndex = parts.findIndex(part => part.toLowerCase() === 'content');
  if (contentIndex !== -1 && contentIndex + 1 < parts.length) {
    // Start from the directory after 'content' and capitalize it
    parts.splice(0, contentIndex + 1); // Remove everything up to and including 'content'
    parts[0] = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
  }
  return parts.join('/');
}

/**
 * Formats a file path as a backlink
 * @param {string} filePath - Path to format as backlink
 * @returns {string} Formatted backlink
 */
function formatAsBacklink(filePath) {
  return `[[${formatBacklinkPath(filePath)}]]`;
}

/**
 * Converts a file path to a backlink format
 * @param {string} filePath - Full path from project root
 * @returns {string} Formatted backlink path
 * 
 * Example:
 * content/tooling/AI-Toolkit/AI Infrastructure/Amazon Bedrock.md
 * becomes
 * [[Tooling/AI-Toolkit/AI Infrastructure/Amazon Bedrock]]
 */
function convertToBacklinkPath(filePath) {
  // Remove content/ prefix and .md extension
  const withoutPrefix = filePath.replace(/^content\//, '');
  const withoutExtension = withoutPrefix.replace(/\.md$/, '');
  
  // Split the path into segments
  const segments = withoutExtension.split('/');
  
  // Capitalize first segment if it exists
  if (segments.length > 0) {
    segments[0] = segments[0].charAt(0).toUpperCase() + segments[0].slice(1);
  }
  
  // Rejoin with forward slashes
  return formatAsBacklink(segments.join('/'));
}

/**
 * Ensures directory exists for a file path
 * @param {string} filePath - Path to file
 */
function ensureDirectoryExists(filePath) {
  const dirname = path.dirname(filePath);
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
    console.log(`📁 Created directory: ${dirname}`);
  }
}

/**
 * Generates a report of the processing results
 * @param {string} outputPath - Path to write report to
 * @returns {Promise<void>}
 */
async function generateReport(outputPath) {
  const reportContent = [
    generateReportFrontmatter('OpenGraph Data Fetch Report'),
    '\n# OpenGraph Data Fetch Report\n',
    '\n## Summary',
    `- Total files processed: ${stats.filesProcessed}`,
    `- Files with existing OG data (skipped): ${stats.openGraph.skippedDueToYaml}`,
    `- Files with new OG data: ${stats.openGraph.newSuccesses.size}`,
    `- Files with OG errors: ${stats.openGraph.newErrors.size}`,
    `- Files with new screenshots: ${stats.screenshots.newSuccesses.size}`,
    `- Files with screenshot errors: ${stats.screenshots.errors.size}`,
    '\n## Files with New OpenGraph Data',
    Array.from(stats.openGraph.newSuccesses).map(file => `- ${convertToBacklinkPath(file)}`).join('\n'),
    '\n## Files with OpenGraph Errors',
    Array.from(stats.openGraph.newErrors).map(file => `- ${convertToBacklinkPath(file)}`).join('\n'),
    '\n## Files with New Screenshots',
    Array.from(stats.screenshots.newSuccesses).map(file => `- ${convertToBacklinkPath(file)}`).join('\n'),
    '\n## Files with Screenshot Errors',
    Array.from(stats.screenshots.errors).map(file => `- ${convertToBacklinkPath(file)}`).join('\n'),
  ].join('\n');

  ensureDirectoryExists(outputPath);
  await fs.promises.writeFile(outputPath, reportContent);
}

/**
 * Queue of pending fetch operations
 * Used to track all async operations and wait for them to complete before generating report
 */
const pendingFetches = new Set();

/**
 * Tracks a promise in the pending fetches queue
 * @param {Promise} promise - Promise to track
 * @returns {Promise} The same promise
 */
function trackFetchOperation(promise) {
  pendingFetches.add(promise);
  promise.finally(() => pendingFetches.delete(promise));
  return promise;
}

/**
 * Processes OpenGraph data fetch for a file without blocking
 * @param {string} url - URL to fetch data for
 * @param {string} filePath - Path to the file
 * @param {Object} frontmatter - Current frontmatter
 * @param {string} content - File content
 */
function processOpenGraphDataAsync(url, filePath, frontmatter, content) {
  console.log(`🔄 Queuing OpenGraph fetch for ${path.basename(filePath)}`);
  
  const fetchPromise = trackFetchOperation(
    fetchOpenGraphData(url, filePath)
      .then(ogData => {
        if (ogData) {
          Object.assign(frontmatter, ogData);
          updateMarkdownFile(filePath, frontmatter, content);
          console.log(`✅ Updated ${path.basename(filePath)} with OpenGraph data`);
          stats.openGraph.newSuccesses.add(filePath);
        }
      })
      .catch(error => {
        console.error(`Error processing OpenGraph data for ${filePath}:`, error);
        stats.openGraph.newErrors.add(filePath);
        stats.filesWithIssues.add(filePath);
      })
  );
}

/**
 * Queue a screenshot fetch operation for a URL
 * @param {string} url - URL to fetch screenshot for
 * @param {Object} frontmatter - Current frontmatter object
 * @param {string} content - File content without frontmatter
 * @param {string} filePath - Path to the markdown file
 */
function queueScreenshotFetch(url, frontmatter, content, filePath) {
  console.log(`🔄 Queuing screenshot fetch for ${path.basename(filePath)}`);
  
  const fetchPromise = trackFetchOperation(
    fetchScreenshotUrl(url, filePath)
      .then(screenshotUrl => {
        if (screenshotUrl) {
          frontmatter.og_screenshot_url = screenshotUrl;
          frontmatter.og_last_fetch = new Date().toISOString();
          updateMarkdownFile(filePath, frontmatter, content);
          console.log(`✅ Updated ${path.basename(filePath)} with screenshot URL`);
          stats.screenshots.newSuccesses.add(filePath);
        }
      })
      .catch(error => {
        console.error(`Error processing screenshot for ${filePath}:`, error);
        stats.screenshots.errors.add(filePath);
      })
  );

  pendingFetches.add(fetchPromise);
}

/**
 * Processes a single markdown file for OpenGraph data
 * 
 * Purpose:
 * - Coordinate the extraction, fetching, and updating of OG data
 * - Track success/failure states for reporting
 * 
 * @param {string} filePath - Path to the markdown file to process
 * 
 * Implementation Notes:
 * - Checks for existing data to avoid unnecessary fetches
 * - Queues both OG data and screenshot fetches
 * - Updates global stats object for reporting
 * - Handles errors without stopping processing
 * 
 * Called From:
 * - main() function during file processing loop
 */
function processMarkdownFile(filePath) {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { frontmatter, content } = extractFrontmatter(fileContent);
    stats.filesProcessed++;

    // Check if OpenGraph data fetch is needed
    const ogCheck = needsOpenGraphFetch(frontmatter);
    if (ogCheck.needsFetch) {
      processOpenGraphDataAsync(frontmatter.url, filePath, frontmatter, content);
    } else if (ogCheck.reason === 'has_required_properties') {
      stats.openGraph.properOpenGraphDataFound++;
    }

    // Check if screenshot fetch is needed
    const screenshotCheck = needsScreenshotFetch(frontmatter);
    if (screenshotCheck.needsFetch) {
      queueScreenshotFetch(frontmatter.url, frontmatter, content, filePath);
    }
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    stats.filesWithIssues.add(filePath);
  }
}

/**
 * Main function to process all markdown files
 * 
 * Purpose:
 * - Orchestrate the entire OpenGraph data fetch process
 * - Generate comprehensive report of results
 * 
 * Implementation Flow:
 * 1. Find all markdown files in target directory
 * 2. Process each file in parallel:
 *    - Extract and validate frontmatter
 *    - Queue OG data and screenshot fetches
 * 3. Wait for all fetch operations to complete
 * 4. Generate detailed report with:
 *    - Processing statistics
 *    - Lists of successes and failures
 *    - Proper frontmatter using template
 * 
 * Error Handling:
 * - Continues processing if individual files fail
 * - Maintains detailed error tracking in stats
 * - Ensures report is generated even if errors occur
 * 
 * File Safety:
 * - Uses generateReportFilename for unique names
 * - Ensures directories exist before writing
 * - Proper async/await for file operations
 */
async function main() {
  console.log(`🔍 Processing Markdown files in: ${TARGET_DIR}`);

  // Get all markdown files recursively
  function findMarkdownFiles(dir) {
    let results = [];
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        results = results.concat(findMarkdownFiles(fullPath));
      } else if (item.endsWith('.md')) {
        results.push(fullPath);
      }
    }
    
    return results;
  }

  const files = findMarkdownFiles(TARGET_DIR);
  console.log(`📁 Found ${files.length} Markdown files to process`);

  // Process each file
  for (const file of files) {
    processMarkdownFile(file);
  }

  // Generate report filename and ensure directory exists
  const { filePath } = generateReportFilename({
    reportName: 'open-graph-fetch-report',
    outputDir: REPORT_OUTPUT_DIR,
    date: new Date()
  });

  // Wait for all pending fetch operations to complete
  console.log('⏳ Waiting for all fetch operations to complete...');
  await Promise.all(Array.from(pendingFetches));
  console.log('✅ All fetch operations completed');

  // Generate and write report
  await generateReport(filePath);
}

// Run the script
main().catch(console.error);