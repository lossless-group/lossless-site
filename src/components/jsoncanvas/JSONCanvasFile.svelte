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
      handleClick(event as any);
    }
    if (onKeydown) {
      onKeydown(event);
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

  <!-- File type icon -->
  <circle
    class="file-icon"
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
</style>
