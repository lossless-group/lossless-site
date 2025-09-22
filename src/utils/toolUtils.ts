/**
 * Extracts a site name from a filename by removing the .md extension
 * and formatting the remaining text.
 * 
 * @param filename The filename to extract the site name from
 * @returns A formatted site name
 */
export function getSiteNameFromFilename(filename: string): string {
  if (!filename) return "";
  
  // Use only the last segment of the path
  const baseFilename = filename.split('/').pop() || filename;
  
  // Remove file extension (.md)
  let name = baseFilename.replace(/\.md$/, "");
  
  // Replace hyphens with spaces and capitalize each word
  name = name
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
  
  return name;
}

/**
 * Safely extracts and formats a domain name from a URL.
 * 
 * @param urlString The URL to extract the domain name from
 * @returns A formatted domain name
 */
export function getHostnameFromUrl(urlString: string): string {
  try {
    if (!urlString) return "";

    // Make sure URL has a protocol
    const urlWithProtocol =
      urlString.startsWith("http://") || urlString.startsWith("https://")
        ? urlString
        : `https://${urlString}`;

    // Get the hostname
    const hostname = new URL(urlWithProtocol).hostname;

    // Extract the domain name without www. and the TLD
    let domainName = hostname;

    // Remove www. if present
    if (domainName.startsWith("www.")) {
      domainName = domainName.substring(4);
    }

    // Remove the TLD (.com, .org, etc.)
    const tldMatch = domainName.match(/\.[a-z]+$/);
    if (tldMatch && tldMatch.index) {
      domainName = domainName.substring(0, tldMatch.index);
    }

    // Handle subdomains by taking the last part
    if (domainName.includes(".")) {
      domainName = domainName.split(".").pop() || domainName;
    }

    // Capitalize the first letter
    if (domainName.length > 0) {
      domainName = domainName.charAt(0).toUpperCase() + domainName.slice(1);
    }

    return domainName;
  } catch (error) {
    console.error(`Invalid URL: ${urlString}`);
    return urlString || "";
  }
}

// Title separator patterns - ADD NEW ONES HERE
const TITLE_SEPARATORS = [
    ' - ',    // space-hyphen-space
    ' – ',    // space-en-dash-space
    ' — ',    // space-em-dash-space
    ' | ',    // space-pipe-space
    ' : ',    // space-colon-space
    ' • ',    // space-bullet-space
    ' · ',    // space-middle-dot-space
    '-',      // hyphen
    '–',      // en-dash
    '—',      // em-dash
    '|',      // pipe
    ':',      // colon
    '•',      // bullet
    '·',      // middle dot
    ' -- ',   // space-double-hyphen-space
    ' * '     // space-asterisk-space
];

// Create the regex pattern - DO NOT MODIFY THIS
const SEPARATOR_PATTERN = TITLE_SEPARATORS
    .map(sep => sep.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|');

/**
 * Filters a title by removing the site name and extracting the relevant part.
 * Add new separators to TITLE_SEPARATORS array above.
 * 
 * @param title The full title to filter
 * @param siteName The site name to remove from the title
 * @returns The filtered title
 */
export function filterTitle(title: string, siteName: any): string {
    // Handle non-string inputs gracefully
    const titleStr = String(title || '');
    const siteNameStr = String(siteName || '');
    
    if (!titleStr || !siteNameStr) return titleStr;
    
    const separatorRegex = new RegExp(`\\s*(${SEPARATOR_PATTERN})\\s*`);
    let cleanTitle = titleStr;

    // Split site name into parts and clean each part
    const siteNameParts = siteNameStr.split(separatorRegex).filter(Boolean);
    
    siteNameParts.forEach(part => {
        const escapedPart = part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        // Remove "Part <separator> Rest"
        cleanTitle = cleanTitle.replace(new RegExp(`^${escapedPart}\\s*(${SEPARATOR_PATTERN})\\s*`), '');
        // Remove "Rest <separator> Part"
        cleanTitle = cleanTitle.replace(new RegExp(`\\s*(${SEPARATOR_PATTERN})\\s*${escapedPart}$`), '');
    });
    
    return cleanTitle.trim();
}

/**
 * Determines the effective site name based on available information.
 * 
 * @param site_name The explicitly provided site name
 * @param filename The filename to extract a site name from
 * @param url The URL to extract a site name from
 * @returns The effective site name
 */
export function getEffectiveSiteName(
  site_name?: string,
  filename?: string,
  url?: string
): string {
  // Priority: site_name > filename > url hostname
  if (site_name && site_name.trim()) {
    return site_name.trim();
  }
  
  if (filename && filename.trim()) {
    // Remove .md extension if present and preserve original casing
    return filename.replace(/\.md$/, '');
  }
  
  if (url && url.trim()) {
    try {
      const urlObj = new URL(url);
      let hostname = urlObj.hostname;
      
      // Remove www. prefix if present
      if (hostname.startsWith('www.')) {
        hostname = hostname.substring(4);
      }
      
      // Remove common TLD extensions for cleaner display
      const cleanHostname = hostname
        .replace(/\.(com|org|net|io|co|ai|app|dev)$/, '')
        .replace(/\.(co\.uk|com\.au|co\.jp)$/, '');
      
      // Capitalize first letter for better display
      return cleanHostname.charAt(0).toUpperCase() + cleanHostname.slice(1);
    } catch {
      return url;
    }
  }
  
  return '';
}

// Helper function to extract actual filename from Astro entry
export function getActualFilename(entry: any): string {
  if (entry.filePath) {
    // Extract just the filename from the full path
    const pathParts = entry.filePath.split('/');
    return pathParts[pathParts.length - 1];
  }
  
  if (entry.originalFilename) {
    return entry.originalFilename;
  }
  
  // Fallback to ID if no file path available
  return entry.id || '';
}

/**
 * Extracts the default category directory from a file path.
 * The function assumes the file path contains 'src/content/tooling/' and returns the directory name immediately following it.
 * For example, for a file path 'src/content/tooling/Databases/orientdb.md', it returns 'Databases'.
 * 
 * @param filePath The full file path of the file
 * @returns The category directory or an empty string if not found
 */
export function defaultCategoryDir(filePath: string): string {
  if (!filePath) return "";
  
  const prefix = 'src/content/tooling/';
  const index = filePath.indexOf(prefix);
  if (index === -1) return "";
  
  // Get the part after the prefix
  const relativePath = filePath.substring(index + prefix.length);
  const segments = relativePath.split('/');
  
  // The first segment should be the category if it exists and there is more than one segment
  if (segments.length > 1 && segments[0].trim() !== "") {
    return segments[0];
  }
  
  return "";
} 

import { slugify } from '@utils/slugify';
import { transformContentPathToRoute } from '@utils/routing/routeManager';

export async function resolveToolId(input: string, allTools: any[]): Promise<string | null> {
  // 1. Try exact match
  const directMatch = allTools.find(tool => tool.id === input);
  if (directMatch) return directMatch.id;

  // 2. Try normalized match
  const normalized = slugify(input);
  const normMatch = allTools.find(tool => slugify(tool.id) === normalized);
  if (normMatch) return normMatch.id;

  // 3. Try case-insensitive filename match with space handling
  const filename = input.split('/').pop() || input;
  const filenameMatch = allTools.find(tool => {
    const toolFilename = tool.id.split('/').pop()?.replace(/\.md$/, '') || '';
    
    // Compare both original and slugified versions
    const inputLower = filename.toLowerCase();
    const toolLower = toolFilename.toLowerCase();
    const inputSlugified = slugify(filename);
    const toolSlugified = slugify(toolFilename);
    
    return inputLower === toolLower || 
           inputSlugified === toolSlugified ||
           inputLower.replace(/[-_]/g, ' ') === toolLower ||
           toolLower.replace(/[-_]/g, ' ') === inputLower;
  });
  if (filenameMatch) return filenameMatch.id;

  // 4. Try matching by slugified filename across all tools
  const slugifiedInput = slugify(input);
  const slugMatch = allTools.find(tool => {
    const toolFilename = tool.id.split('/').pop()?.replace(/\.md$/, '') || '';
    return slugify(toolFilename) === slugifiedInput;
  });
  if (slugMatch) return slugMatch.id;

  // 5. Try partial path matching for route-transformed inputs
  // Handle cases like "toolkit/ai-toolkit/flowise" -> "flowise"
  if (input.includes('/')) {
    const pathSegments = input.split('/');
    const lastSegment = pathSegments[pathSegments.length - 1];
    
    // Try to find by converting slugified back to spaced version
    const unslugified = lastSegment.replace(/-/g, ' ');
    const unslugifiedMatch = allTools.find(tool => {
      const toolFilename = tool.id.split('/').pop()?.replace(/\.md$/, '') || '';
      return toolFilename.toLowerCase() === unslugified.toLowerCase();
    });
    if (unslugifiedMatch) return unslugifiedMatch.id;
  }

  // 6. Try recursive routeManager resolution as last resort
  const route = transformContentPathToRoute(input);
  const finalSlug = route.split('/').pop();
  const finalMatch = allTools.find(tool => slugify(tool.id).endsWith(finalSlug || ''));
  return finalMatch?.id || null;
}

export async function resolvePortfolioId(input: string, allPortfolios: any[]): Promise<string | null> {
  // 1. Try exact match
  const directMatch = allPortfolios.find(portfolio => portfolio.id === input);
  if (directMatch) return directMatch.id;

  // 2. Try normalized match
  const normalized = slugify(input);
  const normMatch = allPortfolios.find(portfolio => slugify(portfolio.id) === normalized);
  if (normMatch) return normMatch.id;

  // 3. Try case-insensitive filename match with space handling
  const filename = input.split('/').pop() || input;
  const filenameMatch = allPortfolios.find(portfolio => {
    const portfolioFilename = portfolio.id.split('/').pop()?.replace(/\.md$/, '') || '';
    
    // Compare both original and slugified versions
    const inputLower = filename.toLowerCase();
    const portfolioLower = portfolioFilename.toLowerCase();
    const inputSlugified = slugify(filename);
    const portfolioSlugified = slugify(portfolioFilename);
    
    return inputLower === portfolioLower || 
           inputSlugified === portfolioSlugified ||
           inputLower.replace(/[-_]/g, ' ') === portfolioLower ||
           portfolioLower.replace(/[-_]/g, ' ') === inputLower;
  });
  if (filenameMatch) return filenameMatch.id;

  // 4. Try matching by slugified filename across all portfolios
  const slugifiedInput = slugify(input);
  const slugMatch = allPortfolios.find(portfolio => {
    const portfolioFilename = portfolio.id.split('/').pop()?.replace(/\.md$/, '') || '';
    return slugify(portfolioFilename) === slugifiedInput;
  });
  if (slugMatch) return slugMatch.id;

  // 5. Try partial path matching for route-transformed inputs
  // Handle cases like "client/hypernova/portfolio/maven-clinic" -> "maven clinic"
  if (input.includes('/')) {
    const pathSegments = input.split('/');
    const lastSegment = pathSegments[pathSegments.length - 1];
    
    // Try to find by converting slugified back to spaced version
    const unslugified = lastSegment.replace(/-/g, ' ');
    const unslugifiedMatch = allPortfolios.find(portfolio => {
      const portfolioFilename = portfolio.id.split('/').pop()?.replace(/\.md$/, '') || '';
      return portfolioFilename.toLowerCase() === unslugified.toLowerCase();
    });
    if (unslugifiedMatch) return unslugifiedMatch.id;
  }

  // 6. Try recursive routeManager resolution as last resort
  const route = transformContentPathToRoute(input);
  const finalSlug = route.split('/').pop();
  const finalMatch = allPortfolios.find(portfolio => slugify(portfolio.id).endsWith(finalSlug || ''));
  return finalMatch?.id || null;
}

/**
 * Parse MOC content and extract tool IDs and tag filters
 * This function replicates the logic from AstroMarkdown's tooling gallery directive
 * 
 * @param content The markdown content from the MOC file
 * @returns Object containing rawToolIds and tagFilters arrays
 */
export function parseMocContent(content: string): { rawToolIds: string[], tagFilters: string[] } {
  const rawToolIds: string[] = [];
  const tagFilters: string[] = [];
  
  // Split content into lines and handle different line endings
  const lines = content.split(/\r?\n/);
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Skip empty lines and frontmatter
    if (!trimmedLine || trimmedLine.startsWith('---')) continue;
    
    console.log('[parseMocContent] Processing line:', trimmedLine);
    
    // Check if this is a tag filter line
    const tagMatch = trimmedLine.match(/^-\s*tag:\s*(?:\[\[(.*?)\]\]|(.*))/i);
    if (tagMatch) {
      const tagName = (tagMatch[1] ?? tagMatch[2]).trim();
      if (tagName) {
        tagFilters.push(tagName);
        console.log('[parseMocContent] Added tag filter:', tagName);
      }
      continue;
    }
    
    // Check if this is a tool link (backlink format)
    const backlinkMatch = trimmedLine.match(/^-\s*\[\[(?!.*?visuals)(.*?)(?:\|.*?)?\]\]$/);
    if (backlinkMatch) {
      const toolId = backlinkMatch[1].trim();
      rawToolIds.push(toolId);
      console.log('[parseMocContent] Added tool ID:', toolId);
      continue;
    }
    
    // Check if this is a regular list item with a link
    const linkMatch = trimmedLine.match(/^-\s*\[.*?\]\((.*?)\)/);
    if (linkMatch) {
      const url = linkMatch[1];
      // Remove leading slash and .md extension if present
      const toolPath = url.replace(/^\//, '').replace(/\.md$/, '');
      rawToolIds.push(toolPath);
      console.log('[parseMocContent] Added tool path:', toolPath);
    }
  }
  
  console.log('[parseMocContent] Final result:', { rawToolIds, tagFilters });
  return { rawToolIds, tagFilters };
}

/**
 * Parse MOC content and extract tool IDs and tag filters from toolingGallery directives
 * This function extracts content from :::toolingGallery ... ::: blocks in MOC files
 * 
 * @param content The markdown content from the MOC file
 * @returns Object containing rawToolIds and tagFilters arrays
 */
export function parseToolingGalleryFromMoc(content: string): { rawToolIds: string[], tagFilters: string[] } {
  const rawToolIds: string[] = [];
  const tagFilters: string[] = [];
  
  // Extract the toolingGallery directive block
  const toolingGalleryMatch = content.match(/:::toolingGallery([\s\S]*?):::/i);
  if (!toolingGalleryMatch) {
    console.log('[parseToolingGalleryFromMoc] No toolingGallery directive found');
    return { rawToolIds, tagFilters };
  }
  
  const blockContent = toolingGalleryMatch[1] || '';
  console.log('[parseToolingGalleryFromMoc] Found toolingGallery block:', blockContent);
  
  // Split content into lines and handle different line endings
  const lines = blockContent.split(/\r?\n/);
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Skip empty lines
    if (!trimmedLine) continue;
    
    console.log('[parseToolingGalleryFromMoc] Processing line:', trimmedLine);
    
    // Check if this is a tag filter line
    const tagMatch = trimmedLine.match(/^-\s*tag:\s*(?:\[\[(.*?)\]\]|(.*))/i);
    if (tagMatch) {
      const tagName = (tagMatch[1] ?? tagMatch[2]).trim();
      if (tagName) {
        tagFilters.push(tagName);
        console.log('[parseToolingGalleryFromMoc] Added tag filter:', tagName);
      }
      continue;
    }
    
    // Check if this is a tool link (backlink format)
    const backlinkMatch = trimmedLine.match(/^-\s*\[\[(?!.*?visuals)(.*?)(?:\|.*?)?\]\]$/);
    if (backlinkMatch) {
      const toolId = backlinkMatch[1].trim();
      rawToolIds.push(toolId);
      console.log('[parseToolingGalleryFromMoc] Added tool ID:', toolId);
      continue;
    }
    
    // Check if this is a regular list item with a link
    const linkMatch = trimmedLine.match(/^-\s*\[.*?\]\((.*?)\)/);
    if (linkMatch) {
      const url = linkMatch[1];
      // Remove leading slash and .md extension if present
      const toolPath = url.replace(/^\//, '').replace(/\.md$/, '');
      rawToolIds.push(toolPath);
      console.log('[parseToolingGalleryFromMoc] Added tool path:', toolPath);
    }
  }
  
  console.log('[parseToolingGalleryFromMoc] Final result:', { rawToolIds, tagFilters });
  return { rawToolIds, tagFilters };
}

/**
 * Load tools from a MOC file's toolingGallery directive using the same logic as AstroMarkdown
 * 
 * @param mocContent The raw content of the MOC file
 * @param allTools Array of all available tools
 * @returns Array of resolved tools
 */
export async function loadToolsFromMocToolingGallery(mocContent: string, allTools: any[]): Promise<any[]> {
  const { rawToolIds, tagFilters } = parseToolingGalleryFromMoc(mocContent);
  
  const toolMap = new Map(allTools.map(entry => [entry.id, {
    ...entry.data,
    id: entry.id,
    filePath: entry.id,
  }]));

  const tools: any[] = [];
  const toolErrors: string[] = [];

  // Resolve toolIds
  for (const input of rawToolIds) {
    let id = input;

    const backlinkMatch = input.match(/^\[\[(?!.*?visuals)(.*?)(?:\|.*?)?\]\]$/);
    if (backlinkMatch) {
      id = backlinkMatch[1].trim();
    }

    const resolvedId = await resolveToolId(id, allTools);
    if (resolvedId && toolMap.has(resolvedId)) {
      tools.push(toolMap.get(resolvedId));
    } else {
      toolErrors.push(input);
    }
  }

  // Add tools matching tagFilters
  const normalizeTag = (tag: string) => slugify(tag).toLowerCase();

  if (tagFilters.length > 0) {
    console.log('[loadToolsFromMocToolingGallery] Searching for tools with tags:', tagFilters);
    
    const tagFilteredTools = allTools
      .filter(tool => {
        if (!tool.data.tags) return false;
        
        const hasMatchingTag = tool.data.tags.some(tag => {
          const normalizedToolTag = normalizeTag(tag);
          const hasMatch = tagFilters.some(filterTag => {
            const normalizedFilterTag = normalizeTag(filterTag);
            const matches = normalizedFilterTag === normalizedToolTag;
            if (matches) {
              console.log(`[loadToolsFromMocToolingGallery] Tag match found: "${filterTag}" (${normalizedFilterTag}) matches "${tag}" (${normalizedToolTag}) in tool "${tool.id}"`);
            }
            return matches;
          });
          return hasMatch;
        });
        
        return hasMatchingTag;
      })
      .map(entry => ({
        ...entry.data,
        id: entry.id,
        filePath: entry.id,
      }));
    
    console.log('[loadToolsFromMocToolingGallery] Found', tagFilteredTools.length, 'tools matching tags');
    
    // Add tag-matched tools if not already added
    for (const tool of tagFilteredTools) {
      if (!tools.some(t => t.id === tool.id)) {
        tools.push(tool);
      }
    }
  }

  if (toolErrors.length > 0) {
    console.warn('[loadToolsFromMocToolingGallery] Missing tools for IDs:', toolErrors);
  }

  return tools;
}

/**
 * Load tools from a MOC entry using the same logic as AstroMarkdown
 * 
 * @param mocEntry The MOC collection entry
 * @param allTools Array of all available tools
 * @returns Array of resolved tools
 */
export async function loadToolsFromMoc(mocEntry: any, allTools: any[]): Promise<any[]> {
  const { rawToolIds, tagFilters } = parseMocContent(mocEntry.body);
  const maxCards = mocEntry.data.MAX_CARDS || 20; // Default to 20 if not specified
  
  const toolMap = new Map(allTools.map(entry => [entry.id, {
    ...entry.data,
    id: entry.id,
    filePath: entry.id,
  }]));

  const tools: any[] = [];
  const toolErrors: string[] = [];

  // Resolve toolIds
  for (const input of rawToolIds) {
    let id = input;

    const backlinkMatch = input.match(/^\[\[(?!.*?visuals)(.*?)(?:\|.*?)?\]\]$/);
    if (backlinkMatch) {
      id = backlinkMatch[1].trim();
    }

    const resolvedId = await resolveToolId(id, allTools);
    if (resolvedId && toolMap.has(resolvedId)) {
      tools.push(toolMap.get(resolvedId));
    } else {
      toolErrors.push(input);
    }
  }

  // Add tools matching tagFilters
  const normalizeTag = (tag: string) => slugify(tag).toLowerCase();

  if (tagFilters.length > 0) {
    console.log('[loadToolsFromMoc] Searching for tools with tags:', tagFilters);
    
    // Debug: Log all available tags in the tooling collection
    const allAvailableTags = new Set<string>();
    allTools.forEach(tool => {
      if (tool.data.tags) {
        tool.data.tags.forEach(tag => allAvailableTags.add(tag));
      }
    });
    console.log('[loadToolsFromMoc] All available tags in tooling collection:', Array.from(allAvailableTags));
    
    const tagFilteredTools = allTools
      .filter(tool => {
        if (!tool.data.tags) return false;
        
        const hasMatchingTag = tool.data.tags.some(tag => {
          const normalizedToolTag = normalizeTag(tag);
          const hasMatch = tagFilters.some(filterTag => {
            const normalizedFilterTag = normalizeTag(filterTag);
            const matches = normalizedFilterTag === normalizedToolTag;
            if (matches) {
              console.log(`[loadToolsFromMoc] Tag match found: "${filterTag}" (${normalizedFilterTag}) matches "${tag}" (${normalizedToolTag}) in tool "${tool.id}"`);
            }
            return matches;
          });
          return hasMatch;
        });
        
        return hasMatchingTag;
      })
      .map(entry => ({
        ...entry.data,
        id: entry.id,
        filePath: entry.id,
      }));
    
    console.log('[loadToolsFromMoc] Found', tagFilteredTools.length, 'tools matching tags');
    
    // Add tag-matched tools if not already added
    for (const tool of tagFilteredTools) {
      if (!tools.some(t => t.id === tool.id)) {
        tools.push(tool);
      }
    }
  }

  if (toolErrors.length > 0) {
    console.warn('[loadToolsFromMoc] Missing tools for IDs:', toolErrors);
  }

  // Apply MAX_CARDS limit
  const limitedTools = tools.slice(0, maxCards);
  if (tools.length > maxCards) {
    console.log(`[loadToolsFromMoc] Limited tools from ${tools.length} to ${maxCards} (MAX_CARDS limit)`);
  }

  return limitedTools;
}