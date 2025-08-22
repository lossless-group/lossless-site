<script lang="ts">
  import type { FileNode } from '../../types/json-canvas';
  import { slugify, getReferenceSlug } from '../../utils/slugify';
  import FrontmatterSVG from '../../assets/Icons/frontmatter-indicator.svg?raw';
  import SvelteMarkdown from '../markdown/SvelteMarkdown.svelte';


  export let node: FileNode;
  export let isSelected: boolean = false;
  export let onClick: ((event: MouseEvent) => void) | undefined = undefined;
  export let onKeydown: ((event: KeyboardEvent) => void) | undefined = undefined;
  export let onFrontmatterClick: ((frontmatter: any) => void) | undefined = undefined;

  // Calculate dimensions and position
  $: width = node.width || 250;
  $: height = node.height || 180;
  $: x = node.x || 0;
  $: y = node.y || 0;

  // Extract file name from path
  $: fileName = node.file.split('/').pop() || node.file;
  $: fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
  
  // Determine file type for styling
  $: fileType = getFileType(fileExtension);

  function getFileType(ext: string): string {
    const types: Record<string, string> = {
      'md': 'markdown',
      'txt': 'text',
      'js': 'javascript',
      'ts': 'typescript',
      'json': 'json',
      'yaml': 'yaml',
      'yml': 'yaml',
      'png': 'image',
      'jpg': 'image',
      'jpeg': 'image',
      'svg': 'image',
      'pdf': 'document',
    };
    return types[ext] || 'file';
  }

  // Handle click events
  function handleClick(event: MouseEvent) {
    if (onClick) {
      onClick(event);
    }
  }

  // Handle keyboard navigation
  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      // Create a synthetic mouse event for onClick callback
      const syntheticEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
      });
      if (onClick) {
        onClick(syntheticEvent);
      }
    }
    if (onKeydown) {
      onKeydown(event);
    }
  };

  const handleFrontmatterClick = (event: MouseEvent) => {
    console.log('🔍 handleFrontmatterClick called!');
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    if (onFrontmatterClick && (node as any).frontmatter) {
      onFrontmatterClick((node as any).frontmatter);
    }
  };

  // Convert file system path to site URL using existing utilities
  function convertFilePathToSiteUrl(filePath: string): string {
    console.log('🔄 Converting path:', filePath);
    
    // Extract the relative content path from the file path
    let contentPath = '';
    
    // Check if it's already a relative path (starts with content type)
    if (filePath.startsWith('client-content/') || filePath.startsWith('lost-in-public/') || filePath.startsWith('vocabulary/') || filePath.startsWith('projects/')) {
      contentPath = filePath;
      console.log('📁 Using relative path directly:', contentPath);
    } else {
      // Try to extract content path from absolute path
      const contentMatch = filePath.match(/.*\/content\/(.+)$/);
      if (contentMatch) {
        contentPath = contentMatch[1];
        console.log('📁 Extracted from absolute path:', contentPath);
      } else {
        console.warn('⚠️ Could not extract content path from:', filePath);
        return filePath; // Fallback to original path
      }
    }
    
    // Simple client-side path conversion for client-content structure
    let siteUrl = '';
    
    if (contentPath.startsWith('client-content/')) {
      const pathParts = contentPath.split('/');
      // ["client-content", "Laerdal", "Projects", "Augment-It", "Specs", "RecordCollector-Tanuj.md"]
      
      if (pathParts.length >= 4 && pathParts[2].toLowerCase() === 'projects') {
        const clientName = pathParts[1].toLowerCase(); // "Laerdal" → "laerdal"
        const projectPathParts = pathParts.slice(3); // Skip client-content, Client, Projects
        
        // Use the site-wide slugify utility function
        const projectSlug = projectPathParts
          .map(part => slugify(part))
          .join('/');
        
        siteUrl = `/client/${clientName}/projects/${projectSlug}`;
      } else {
        // Fallback for other client-content structures
        siteUrl = `/${contentPath.replace(/\.md$/, '').toLowerCase().replace(/[^a-z0-9\/]/g, '-')}`;
      }
    } else if (contentPath.startsWith('projects/')) {
      // Handle regular projects directory - use frontmatter slug if available
      // For now, use the same logic as the collection until we can read frontmatter
      const projectPath = contentPath.replace(/\.md$/, '');
      
      // Use the site-wide getReferenceSlug utility function
      const slugifiedPath = getReferenceSlug(projectPath);
      
      siteUrl = `/${slugifiedPath}`;
    } else {
      // Fallback for other content types
      siteUrl = `/${contentPath.replace(/\.md$/, '').toLowerCase().replace(/[^a-z0-9\/]/g, '-')}`;
    }
    
    console.log('🎯 Converted to site URL:', siteUrl);
    return siteUrl;
  }

  // Handle opening file in new tab
  function handleOpenInNewTab(event: MouseEvent) {
    console.log('🚀 handleOpenInNewTab called!');
    console.log('📁 File:', node.file);
    console.log('🎯 Event target:', event.target);
    
    event.preventDefault();
    event.stopPropagation(); // Prevent triggering the file selection
    
    try {
      // Convert file system path to proper site URL
      const siteUrl = convertFilePathToSiteUrl(node.file);
      
      console.log('🔗 Opening URL:', siteUrl);
      const newWindow = window.open(siteUrl, '_blank', 'noopener,noreferrer');
      
      if (!newWindow) {
        console.error('❌ Failed to open new window - popup blocked?');
        alert('Could not open new tab. Please check popup blocker settings.');
      } else {
        console.log('✅ New tab opened successfully');
      }
    } catch (error) {
      console.error('❌ Error opening new tab:', error);
    }
  }

  // Get file content for markdown rendering
  $: fileContent = (node as any).fileContent;
  $: hasValidContent = fileContent && !fileContent.includes('File not found') && !fileContent.includes('Error reading');
</script>

<!-- File node with proper ARIA attributes -->
<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<g 
  class="canvas-file file-type-{fileType}" 
  class:selected={isSelected}
  role="button"
  aria-label="File: {fileName}"
  tabindex="0"
  on:click={handleClick}
  on:keydown={handleKeydown}
  transform="translate({x}, {y})"
>
  <!-- File background card -->
  <rect
    class="file-background"
    width={width}
    height={height}
    rx="8"
    ry="8"
    fill="rgba(255, 255, 255, 0.1)"
    stroke="rgba(255, 255, 255, 0.2)"
    stroke-width="1"
  />
  
  <!-- File header section -->
  <rect
    class="file-header"
    x="0"
    y="0"
    width={width}
    height="32"
    rx="8"
    ry="8"
    fill="var(--clr-primary-bg)"
    stroke="none"
  />
  
  <!-- Mask to clean up header corners -->
  <rect
    class="file-header-mask"
    x="0"
    y="24"
    width={width}
    height="8"
    fill="var(--clr-primary-bg)"
  />

  <!-- File type icon (indicates file type) -->
  <circle
    class="file-icon"
    class:hidden={isSelected}
    cx="16"
    cy="16"
    r="6"
    fill="var(--clr-canvas-file-icon, #64748b)"
  />
  
  <!-- Frontmatter icon (appears when selected, replacing file type dot) -->
  <g 
    class="frontmatter-icon"
    class:visible={isSelected}
    transform="translate(10, 10) scale(0.5)"
    on:click={handleFrontmatterClick}
    on:mousedown={handleFrontmatterClick}
    on:keydown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const syntheticEvent = new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          view: window
        });
        handleFrontmatterClick(syntheticEvent);
      }
    }}
    tabindex={isSelected ? 0 : -1}
    role="button"
    aria-label="View frontmatter metadata"
    style="cursor: pointer; color: var(--clr-lossless-accent--brightest); display: {isSelected ? 'block' : 'none'};"
  >
    {@html FrontmatterSVG}
  </g>
  
  <!-- File name -->
  <text
    class="file-name"
    x="32"
    y="20"
    fill="var(--clr-heading)"
    font-family="var(--ff-base)"
    font-size="12"
    font-weight="600"
    text-anchor="start"
  >
    {fileName.length > 25 ? fileName.substring(0, 22) + '...' : fileName}
  </text>

  <!-- Open in new tab icon (only appears when selected) -->
  <g 
    class="open-tab-icon"
    class:visible={isSelected}
    transform="translate({width - 24}, 4)"
    on:click={handleOpenInNewTab}
    on:mousedown={handleOpenInNewTab}
    on:keydown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const syntheticEvent = new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          view: window
        });
        handleOpenInNewTab(syntheticEvent);
      }
    }}
    tabindex={isSelected ? 0 : -1}
    role="button"
    aria-label="Open file in new tab"
    style="cursor: pointer; display: {isSelected ? 'block' : 'none'};"
  >
    <!-- Refined external link icon matching design system -->
    <g transform="translate(2, 2)">
      <!-- Background for better visibility -->
      <rect
        x="0"
        y="0"
        width="16"
        height="16"
        rx="3"
        fill="rgba(0, 0, 0, 0.6)"
        stroke="var(--clr-lossless-accent--brightest, #4a9eff)"
        stroke-width="0.5"
        class="icon-bg"
      />
      <!-- External link icon - cleaner design -->
      <g transform="translate(3, 3)">
        <!-- Arrow pointing up-right -->
        <path
          d="M7 3L3 7M7 3H4M7 3V6"
          stroke="var(--clr-lossless-accent--brightest, #4a9eff)"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          fill="none"
        />
        <!-- Box outline -->
        <path
          d="M1 1h2v2M1 9h8V1"
          stroke="var(--clr-lossless-accent--brightest, #4a9eff)"
          stroke-width="1"
          stroke-linecap="round"
          stroke-linejoin="round"
          fill="none"
          opacity="0.7"
        />
      </g>
    </g>
  </g>

  <!-- File path (if different from name) -->
  {#if node.file !== fileName}
    <text
      class="file-path"
      x="12"
      y="50"
      fill="var(--clr-body)"
      font-family="var(--ff-legible)"
      font-size="10"
      text-anchor="start"
    >
      {node.file.length > 35 ? '...' + node.file.substring(node.file.length - 32) : node.file}
    </text>
  {/if}

  <!-- Frontmatter indicator removed - was the unwanted bright blue dot -->

  <!-- File content area -->
  <foreignObject
    x="12"
    y="60"
    width={width - 24}
    height={height - 72}
  >
    <div class="file-content">
      {#if hasValidContent}
        <SvelteMarkdown content={fileContent} className="content-text" />
      {:else}
        <div class="content-text">
          {fileContent || 'Loading file content...'}
        </div>
      {/if}
    </div>
  </foreignObject>

  <!-- Selection indicator -->
  {#if isSelected}
    <rect
      class="selection-indicator"
      width={width}
      height={height}
      rx="8"
      ry="8"
      fill="none"
      stroke="var(--clr-primary, #00d4ff)"
      stroke-width="2"
      stroke-dasharray="4,4"
      opacity="0.8"
    />
  {/if}
</g>

<style>
  .canvas-file {
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .canvas-file:hover .file-background {
    stroke: var(--clr-lossless-accent--brightest);
    stroke-width: 2;
    filter: drop-shadow(0 0 8px var(--clr-lossless-accent--brightest));
  }

  .canvas-file:focus {
    outline: none;
  }

  .canvas-file:focus .file-background {
    stroke: var(--clr-primary, #00d4ff);
    stroke-width: 2;
  }

  .file-background,
  .file-header {
    transition: all 0.2s ease;
  }

  .file-name,
  .file-path,
  .content-line {
    pointer-events: none;
    user-select: none;
  }

  .selection-indicator {
    pointer-events: none;
    animation: dash 1.5s linear infinite;
  }

  /* File type specific styling */
  .file-type-markdown .file-icon {
    fill: var(--clr-file-markdown, #0969da);
  }

  .file-type-javascript .file-icon {
    fill: var(--clr-file-javascript, #f7df1e);
  }

  .file-type-typescript .file-icon {
    fill: var(--clr-file-typescript, #3178c6);
  }

  .file-type-json .file-icon {
    fill: var(--clr-file-json, #ff6b35);
  }

  .file-type-image .file-icon {
    fill: var(--clr-file-image, #10b981);
  }



  .file-content {
    width: 100%;
    height: 100%;
    padding: 8px;
    background: var(--clr-primary-bg);
    border: 1px solid var(--clr-lossless-primary-glass--lighter);
    border-radius: 6px;
    overflow-y: auto;
    overflow-x: hidden;
    font-family: var(--ff-legible);
    font-size: 12px; /* Base font size for content */
    line-height: 1.5;
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
  }

  .content-text {
    color: var(--clr-body);
    word-break: break-word;
    font-weight: var(--fw-regular);
  }

  /* Custom scrollbar styling */
  .file-content::-webkit-scrollbar {
    width: 6px;
  }

  .file-content::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }

  .file-content::-webkit-scrollbar-thumb {
    background: var(--clr-lossless-accent--brightest);
    border-radius: 3px;
    opacity: 0.7;
  }

  .file-content::-webkit-scrollbar-thumb:hover {
    background: var(--clr-lossless-accent--bright);
    opacity: 1;
  }



  @keyframes dash {
    to {
      stroke-dashoffset: -8;
    }
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .file-name {
      font-size: 11px;
    }
    
    .file-path {
      font-size: 9px;
    }
  }

  /* File icon visibility */
  .file-icon.hidden {
    opacity: 0;
    visibility: hidden;
  }

  /* Frontmatter icon visibility - appears when file is selected */
  .frontmatter-icon {
    opacity: 0;
    visibility: hidden;
    transition: all 0.2s ease;
  }

  .frontmatter-icon.visible {
    opacity: 0.7;
    visibility: visible;
  }

  .frontmatter-icon:hover {
    opacity: 1;
  }

  /* Open in new tab icon styling */
  .open-tab-icon {
    cursor: pointer;
    transition: all 0.2s ease;
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
  }

  .open-tab-icon.visible {
    opacity: 0.8;
    visibility: visible;
    pointer-events: all;
  }

  .open-tab-icon:hover {
    opacity: 1;
  }

  .open-tab-icon:hover .icon-bg {
    fill: rgba(0, 0, 0, 0.8);
    stroke: var(--clr-lossless-accent--brightest, #4a9eff);
    stroke-width: 1;
  }

  .open-tab-icon:active .icon-bg {
    fill: rgba(0, 0, 0, 0.9);
    stroke-width: 1.5;
  }

  .open-tab-icon:focus {
    outline: none;
  }

  .open-tab-icon:focus .icon-bg {
    stroke: var(--clr-lossless-accent--brightest, #4a9eff);
    stroke-width: 1.5;
    filter: drop-shadow(0 0 3px var(--clr-lossless-accent--brightest, #4a9eff));
  }
</style>
