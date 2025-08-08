<script lang="ts">
  import type { FileNode } from '../../types/json-canvas';
  import { renderSimpleMarkdown, truncateRenderedMarkdown } from '../../utils/simpleMarkdownRenderer';

  export let node: FileNode;
  export let isSelected: boolean = false;
  export let onClick: ((event: MouseEvent) => void) | undefined = undefined;
  export let onKeydown: ((event: KeyboardEvent) => void) | undefined = undefined;

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
  function handleKeydown(event: KeyboardEvent) {
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
  }

  // Handle opening file in new tab
  function handleOpenInNewTab(event: MouseEvent) {
    console.log('🚀 handleOpenInNewTab called!');
    console.log('📁 File:', node.file);
    console.log('🎯 Event target:', event.target);
    
    event.preventDefault();
    event.stopPropagation(); // Prevent triggering the file selection
    
    try {
      // Create a URL for the markdown file to be rendered by AstroMarkdown
      const encodedPath = encodeURIComponent(node.file);
      const markdownUrl = `/markdown-preview?file=${encodedPath}`;
      
      console.log('🔗 Opening URL:', markdownUrl);
      const newWindow = window.open(markdownUrl, '_blank', 'noopener,noreferrer');
      
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

  // Render markdown content
  $: renderedContent = (() => {
    const fileContent = (node as any).fileContent;
    if (!fileContent || fileContent.includes('File not found') || fileContent.includes('Error reading')) {
      return { html: fileContent || 'Loading file content...', plainText: fileContent || 'Loading file content...' };
    }
    
    const rendered = renderSimpleMarkdown(fileContent);
    return rendered;
  })();
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

  <!-- File type icon (always render, but hide when selected) -->
  <circle
    class="file-icon"
    class:hidden={isSelected}
    cx="16"
    cy="16"
    r="6"
    fill="var(--clr-canvas-file-icon, #64748b)"
  />
  
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

  <!-- Open in new tab icon (appears when selected) -->
  <g 
    class="open-tab-icon"
    class:visible={isSelected}
    transform="translate({width - 20}, 6)"
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
    style="cursor: pointer;"
  >
    <!-- Background circle for better click target -->
    <circle
      cx="10"
      cy="10"
      r="10"
      fill="rgba(255, 255, 255, 0.1)"
      stroke="var(--clr-lossless-accent--brightest, #4a9eff)"
      stroke-width="1"
      class="icon-bg"
    />
    <!-- External link icon -->
    <g transform="translate(6, 6)">
      <path
        d="M6 6h2v2M8 4v2l-4 4"
        stroke="var(--clr-lossless-accent--brightest, #4a9eff)"
        stroke-width="1.2"
        stroke-linecap="round"
        stroke-linejoin="round"
        fill="none"
      />
      <path
        d="M6 4h2v2"
        stroke="var(--clr-lossless-accent--brightest, #4a9eff)"
        stroke-width="1.2"
        stroke-linecap="round"
        stroke-linejoin="round"
        fill="none"
      />
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

  <!-- Frontmatter indicator -->
  {#if (node as any).frontmatter}
    <g class="frontmatter-indicator">
      <circle
        cx={width - 20}
        cy="20"
        r="4"
        fill="var(--clr-lossless-accent--brightest)"
      />
      <title>Has frontmatter metadata</title>
    </g>
  {/if}

  <!-- File content area -->
  <foreignObject
    x="12"
    y="60"
    width={width - 24}
    height={height - 72}
  >
    <div class="file-content">
      <div class="content-text">
        {@html renderedContent.html}
      </div>
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

  /* Markdown element styles using theme variables - multiple selectors for maximum compatibility */
  .file-content .content-text :global(.markdown-h1),
  .file-content .content-text :global(.markdown-h2),
  .file-content .content-text :global(.markdown-h3),
  .file-content .content-text :global(.markdown-h4),
  .file-content .content-text :global(.markdown-h5),
  .file-content .content-text :global(.markdown-h6),
  .content-text :global(h1),
  .content-text :global(h2),
  .content-text :global(h3),
  .content-text :global(h4),
  .content-text :global(h5),
  .content-text :global(h6) {
    font-family: var(--ff-base) !important;
    font-weight: var(--fw-semi-bold) !important;
    color: var(--clr-heading) !important;
    margin: 0.5em 0 0.3em 0 !important;
    line-height: 1.2 !important;
  }

  .file-content .content-text :global(.markdown-h1),
  .content-text :global(h1) { font-size: 19px !important; } /* 1.6em of 12px base */
  
  .file-content .content-text :global(.markdown-h2),
  .content-text :global(h2) { font-size: 18px !important; } /* 1.5em of 12px base */
  
  .file-content .content-text :global(.markdown-h3),
  .content-text :global(h3) { font-size: 17px !important; } /* 1.4em of 12px base */
  
  .file-content .content-text :global(.markdown-h4),
  .content-text :global(h4) { font-size: 16px !important; } /* 1.3em of 12px base */
  
  .file-content .content-text :global(.markdown-h5),
  .content-text :global(h5) { font-size: 14px !important; } /* 1.2em of 12px base */
  
  .file-content .content-text :global(.markdown-h6),
  .content-text :global(h6) { font-size: 13px !important; } /* 1.1em of 12px base */

  .content-text :global(.markdown-p) {
    margin: 0.4em 0;
    line-height: 1.4;
    color: var(--clr-body);
    font-size: 12px !important; /* Match base font size */
  }

  .content-text :global(.backlink) {
    color: var(--clr-link);
    text-decoration: underline;
    cursor: pointer;
  }

  /* Mermaid chart styling for JSON Canvas - matches MermaidChart.astro structure */
  .content-text :global(.mermaid-breakout) {
    position: relative;
    margin: 1rem 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: transparent;
    box-sizing: border-box;
  }

  .content-text :global(.mermaid-chart-shell) {
    position: relative;
    width: 100%;
    max-width: 100%;
    margin: 0;
    overflow-x: auto;
    background: var(--clr-primary-bg);
    border: 1px solid var(--clr-lossless-accent--brightest);
    border-radius: 6px;
    padding: 0.5rem;
    display: block;
  }

  .content-text :global(.mermaid) {
    background: transparent !important;
    box-shadow: none !important;
    border-radius: 0 !important;
    padding: 0 !important;
    margin: 0 !important;
    font-size: 10px !important;
    max-width: 100%;
  }

  .content-text :global(.mermaid svg) {
    max-width: 100%;
    height: auto;
  }

  .content-text :global(.backlink:hover) {
    color: var(--clr-lossless-accent--brightest);
  }

  .content-text :global(.inline-code) {
    background: var(--clr-lossless-primary-glass--lighter);
    padding: 0.1em 0.3em;
    border-radius: 3px;
    font-family: monospace;
    font-size: var(--fs-150);
    color: var(--clr-body);
  }

  /* Code block styling for JSON Canvas - matches BaseCodeblock.astro structure */
  .content-text :global(.codeblock-container) {
    position: relative;
    margin: 1.5rem 0;
    border-radius: 0.5rem;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    background: var(--clr-code-bg, #1e1e1e);
  }
  
  .content-text :global(.codeblock-header) {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 1rem;
    background-color: rgba(0, 0, 0, 0.2);
    border-top-left-radius: 0.5rem;
    border-top-right-radius: 0.5rem;
    font-family: var(--ff-monospace, monospace);
    font-size: 0.8rem;
  }
  
  .content-text :global(.codeblock-language) {
    text-transform: uppercase;
    font-weight: bold;
    color: var(--clr-code-lang, #8a8a8a);
    letter-spacing: 0.05em;
  }
  
  .content-text :global(.copy-button) {
    background: transparent;
    border: none;
    color: var(--clr-code-lang, #8a8a8a);
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 0.25rem;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .content-text :global(.copy-button:hover) {
    background-color: rgba(255, 255, 255, 0.1);
    color: white;
  }
  
  .content-text :global(.copy-button.copied) {
    color: var(--clr-lossless-accent--brightest, #4a9eff);
  }
  
  .content-text :global(.codeblock-content) {
    margin: 0;
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    padding: 0;
    overflow-x: auto;
    background-color: var(--clr-code-bg, #1e1e1e);
    max-height: 400px;
    overflow-y: auto;
  }

  .content-text :global(.codeblock-content pre) {
    margin: 0;
    padding: 1em;
    background: transparent;
    border-radius: 0;
    font-size: 0.85rem;
    line-height: 1.5;
  }

  .content-text :global(.codeblock-content code) {
    background: transparent;
    padding: 0;
    border-radius: 0;
    font-family: var(--ff-monospace, 'Fira Code', 'Consolas', monospace);
  }

  .content-text :global(strong) {
    font-weight: var(--fw-bold);
    color: var(--clr-heading);
  }

  .content-text :global(em) {
    font-style: italic;
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
    fill: rgba(255, 255, 255, 0.2);
    stroke: var(--clr-lossless-accent--brightest, #4a9eff);
    stroke-width: 1.5;
  }

  .open-tab-icon:active .icon-bg {
    fill: rgba(255, 255, 255, 0.3);
    stroke-width: 2;
  }

  .open-tab-icon:focus {
    outline: none;
  }

  .open-tab-icon:focus .icon-bg {
    stroke: var(--clr-lossless-accent--brightest, #4a9eff);
    stroke-width: 2;
    filter: drop-shadow(0 0 4px var(--clr-lossless-accent--brightest, #4a9eff));
  }
</style>
