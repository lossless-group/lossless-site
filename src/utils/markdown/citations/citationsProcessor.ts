/**
 * Citations Processor
 * 
 * This utility processes citations in markdown files and manages the citation registry.
 * It extracts hex citations from markdown files and updates the CitedSources table.
 * 
 * @module citationsProcessor
 */

import fs from 'fs';
import path from 'path';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import { visit } from 'unist-util-visit';
// Import AstroDB - Note: These imports will be available after AstroDB is fully set up
// For now, we'll define types to avoid TypeScript errors
type CitedSources = {
  id: string;
  created_at: Date;
  updated_at: Date;
  unique_source_url: string;
  source_type: string;
  completion_api_url: string;
  raw_response_object: any;
  referenced_in_instances: string[];
  children_source_ids: string[];
  parent_source_ids: string[];
};

// Temporary mock db until AstroDB is fully set up
const db = {
  insert: (table: string) => ({
    values: (data: any) => ({
      returning: () => Promise.resolve([data])
    })
  }),
  select: () => ({
    from: (table: string) => ({
      where: (condition: any) => ({
        get: () => Promise.resolve(null)
      }),
      get: () => Promise.resolve([])
    })
  }),
  update: (table: string) => ({
    set: (data: any) => ({
      where: (condition: any) => ({
        returning: () => Promise.resolve([data])
      })
    })
  })
};

// Import debugging utilities
import { citationsDebugger } from '../../../utils/debug/citations-completion-debugger';

// Set up environment variables for debugging
const DEBUG_CITATIONS = process.env.DEBUG_CITATIONS === 'true';
const DEBUG_CITATIONS_VERBOSE = process.env.DEBUG_CITATIONS_VERBOSE === 'true';

/**
 * Process statistics for tracking citation processing
 */
interface ProcessStats {
  total: number;
  new: number;
  updated: number;
  unchanged: number;
}

/**
 * Directory processing statistics
 */
interface DirectoryStats {
  files: number;
  citations: ProcessStats;
}

/**
 * Add a new citation to the registry
 * @param citation - CitedSources object without timestamps
 * @returns The newly created citation
 */
export async function addCitation(citation: Omit<CitedSources, 'created_at' | 'updated_at'>) {
  try {
    const result = await db.insert('CitedSources').values({
      ...citation,
      // created_at and updated_at will use the default values
    }).returning();
    
    citationsDebugger.logCitation(citation.id, 'Added new citation');
    
    return result;
  } catch (error) {
    console.error(`Error adding citation ${citation.id}:`, error);
    throw error;
  }
}

/**
 * Get a citation by its ID
 * @param id - The hexCode ID of the citation
 * @returns The citation or undefined if not found
 */
export async function getCitation(id: string) {
  try {
    return await db.select().from('CitedSources').where({ id }).get();
  } catch (error) {
    console.error(`Error getting citation ${id}:`, error);
    return undefined;
  }
}

/**
 * Update an existing citation
 * @param id - The hexCode ID of the citation
 * @param data - Partial citation data to update
 * @returns The updated citation
 */
export async function updateCitation(id: string, data: Partial<Omit<CitedSources, 'id' | 'created_at'>>) {
  try {
    const result = await db.update('CitedSources').set({
      ...data,
      updated_at: new Date(),
    }).where({ id }).returning();
    
    citationsDebugger.logCitation(id, 'Updated citation');
    
    return result;
  } catch (error) {
    console.error(`Error updating citation ${id}:`, error);
    throw error;
  }
}

/**
 * Get all citations in the registry
 * @returns Array of all citations
 */
export async function getAllCitations() {
  try {
    return await db.select().from('CitedSources');
  } catch (error) {
    console.error('Error getting all citations:', error);
    return [];
  }
}

/**
 * Check if a citation exists by URL
 * @param url - The URL to check
 * @returns The citation if found, undefined otherwise
 */
export async function getCitationByUrl(url: string) {
  try {
    return await db.select().from('CitedSources').where({ unique_source_url: url }).get();
  } catch (error) {
    console.error(`Error getting citation by URL ${url}:`, error);
    return undefined;
  }
}

/**
 * Load the citation registry
 * @returns The number of citations loaded
 */
export async function loadCitationRegistry() {
  try {
    const citations = await getAllCitations();
    const citationsArray = Array.isArray(citations) ? citations : [];
    
    citationsDebugger.log(`Loaded ${citationsArray.length} citations from registry`);
    
    return citationsArray.length;
  } catch (error) {
    console.error('Error loading citation registry:', error);
    return 0;
  }
}

/**
 * Process a single citation
 * @param hexCode - The citation hex code
 * @param filePath - The file containing the citation
 * @returns True if the citation was processed successfully
 */
export async function processCitation(hexCode: string, filePath: string): Promise<boolean> {
  try {
    // Check if citation exists
    const existingCitation = await getCitation(hexCode);
    
    if (existingCitation) {
      // Update the citation with the new file reference
      const referencedIn = existingCitation.referenced_in_instances as string[] || [];
      
      // Add the file if it's not already in the list
      if (!referencedIn.includes(filePath)) {
        referencedIn.push(filePath);
        await updateCitation(hexCode, { referenced_in_instances: referencedIn });
        
        citationsDebugger.logCitation(hexCode, `Updated with new reference: ${filePath}`);
      }
    } else {
      // Create a new citation
      await addCitation({
        id: hexCode,
        unique_source_url: '', // Will be populated later by API
        source_type: 'unknown', // Will be determined later
        completion_api_url: '',
        raw_response_object: {},
        children_source_ids: [],
        parent_source_ids: [],
        referenced_in_instances: [filePath],
      });
      
      citationsDebugger.logCitation(hexCode, `Added new citation from file: ${filePath}`);
    }
    
    return true;
  } catch (error) {
    console.error(`Error processing citation ${hexCode}:`, error);
    return false;
  }
}

/**
 * Process citations in a markdown file
 * @param filePath - Path to the markdown file
 * @returns Object with counts of processed citations
 */
export async function processCitations(filePath: string): Promise<ProcessStats> {
  // Load the citation registry first
  await loadCitationRegistry();
  
  const stats: ProcessStats = {
    total: 0,
    new: 0,
    updated: 0,
    unchanged: 0,
  };
  
  try {
    // Read the markdown file
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Parse the markdown
    const processor = unified()
      .use(remarkParse)
      .use(() => (tree) => {
        // Find all footnote references
        visit(tree, 'footnoteReference', (node: any) => {
          stats.total++;
          
          // Check if this is a hex citation (e.g., [^a1b2c3])
          const hexCode = node.identifier;
          const isHexCitation = /^[0-9a-f]{6}$/.test(hexCode);
          
          if (isHexCitation) {
            // Process hex citation
            processCitation(hexCode, filePath);
          }
        });
        
        return tree;
      });
    
    // Process the markdown
    await processor.process(content);
    
    citationsDebugger.log(`Processed ${stats.total} citations in ${filePath}`);
    
    return stats;
  } catch (error) {
    console.error(`Error processing citations in ${filePath}:`, error);
    return stats;
  }
}

/**
 * Process all markdown files in a directory
 * @param dirPath - Path to the directory
 * @returns Object with counts of processed citations
 */
export async function processDirectory(dirPath: string): Promise<DirectoryStats> {
  const stats: DirectoryStats = {
    files: 0,
    citations: {
      total: 0,
      new: 0,
      updated: 0,
      unchanged: 0,
    },
  };
  
  try {
    // Read all files in the directory
    const files = fs.readdirSync(dirPath);
    
    for (const file of files) {
      const fullPath = path.join(dirPath, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Recursively process subdirectories
        const subStats = await processDirectory(fullPath);
        stats.files += subStats.files;
        stats.citations.total += subStats.citations.total;
        stats.citations.new += subStats.citations.new;
        stats.citations.updated += subStats.citations.updated;
        stats.citations.unchanged += subStats.citations.unchanged;
      } else if (file.endsWith('.md')) {
        // Process markdown files
        stats.files++;
        const fileStats = await processCitations(fullPath);
        stats.citations.total += fileStats.total;
        stats.citations.new += fileStats.new;
        stats.citations.updated += fileStats.updated;
        stats.citations.unchanged += fileStats.unchanged;
      }
    }
    
    citationsDebugger.log(`Processed ${stats.files} files with ${stats.citations.total} citations in ${dirPath}`);
    
    return stats;
  } catch (error) {
    console.error(`Error processing directory ${dirPath}:`, error);
    return stats;
  }
}

/**
 * Main function to process citations
 * @param target - File or directory to process
 */
export async function processCitationsTarget(target: string): Promise<void> {
  console.log(`Processing citations in ${target}`);
  citationsDebugger.startProcess('Target');
  
  try {
    const stat = fs.statSync(target);
    
    if (stat.isDirectory()) {
      const stats = await processDirectory(target);
      console.log(`Processed ${stats.files} files with ${stats.citations.total} citations`);
      console.log(`- New: ${stats.citations.new}`);
      console.log(`- Updated: ${stats.citations.updated}`);
      console.log(`- Unchanged: ${stats.citations.unchanged}`);
      
      citationsDebugger.logStats(stats);
    } else if (target.endsWith('.md')) {
      const stats = await processCitations(target);
      console.log(`Processed file with ${stats.total} citations`);
      console.log(`- New: ${stats.new}`);
      console.log(`- Updated: ${stats.updated}`);
      console.log(`- Unchanged: ${stats.unchanged}`);
      
      citationsDebugger.logStats({
        files: 1,
        citations: stats
      });
    } else {
      console.error('Target must be a markdown file or directory');
    }
    
    citationsDebugger.endProcess('Target');
  } catch (error) {
    console.error('Error processing citations:', error);
    citationsDebugger.log('Error processing citations:', error);
    citationsDebugger.endProcess('Target');
  }
}