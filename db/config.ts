import { defineDb, defineTable, column } from 'astro:db';

/**
 * CitedSources table for storing citation information
 * This table serves as the central registry for all citations across markdown files
 */
const CitedSources = defineTable({
  columns: {
    // Primary key using the hexCode as ID
    id: column.text({ primaryKey: true }),
    
    // Timestamps
    created_at: column.date(),
    updated_at: column.date(),
    
    // Basic citation metadata
    unique_source_url: column.text(),
    source_type: column.text(),

    // Designated API endpoint for completion
    completion_api_url: column.text(),
    
    // Store the raw API response as JSON
    raw_response_object: column.json(),

    companion_markdown_file_for_source: column.text(),
    
    // Array of files that reference this citation
    referenced_in_instances: column.json({ default: [] }),
    
    // Relationships (stored as JSON arrays)
    children_source_ids: column.json({ default: [] }),
    parent_source_ids: column.json({ default: [] }),
  }
});

// https://astro.build/db/config
export default defineDb({
  tables: { CitedSources }
});
