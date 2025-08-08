<script lang="ts">
  import type { FileNode } from '../../types/json-canvas';

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

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (onClick) {
        onClick(event as any);
      }
    }
    if (onKeydown) {
      onKeydown(event);
    }
  }
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
    fill="var(--clr-canvas-file-bg, #ffffff)"
    stroke="var(--clr-canvas-file-border, #e2e8f0)"
    stroke-width="1"
  />
  
  <!-- File header section -->
  <rect
    class="file-header"
    width={width}
    height="32"
    rx="8"
    ry="8"
    fill="var(--clr-canvas-file-header-bg, #f8fafc)"
    stroke="none"
  />
  
  <!-- Mask to clean up header corners -->
  <rect
    class="file-header-mask"
    x="0"
    y="24"
    width={width}
    height="8"
    fill="var(--clr-canvas-file-header-bg, #f8fafc)"
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
    fill="var(--clr-canvas-file-text, #1e293b)"
    font-family="var(--font-family-primary, system-ui)"
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
      fill="var(--clr-canvas-file-path, #64748b)"
      font-family="var(--font-family-mono, monospace)"
      font-size="10"
      text-anchor="start"
    >
      {node.file.length > 35 ? '...' + node.file.substring(node.file.length - 32) : node.file}
    </text>
  {/if}

  <!-- Content preview area -->
  <rect
    class="content-preview"
    x="12"
    y="60"
    width={width - 24}
    height={height - 72}
    fill="var(--clr-canvas-file-content-bg, #fefefe)"
    stroke="var(--clr-canvas-file-content-border, #f1f5f9)"
    stroke-width="1"
    rx="4"
    ry="4"
  />

  <!-- Placeholder content lines -->
  {#each Array(Math.min(4, Math.floor((height - 80) / 16))) as _, i}
    <rect
      class="content-line"
      x="16"
      y={68 + i * 16}
      width={Math.max(20, width - 40 - Math.random() * 60)}
      height="2"
      fill="var(--clr-canvas-file-content-line, #cbd5e1)"
      rx="1"
    />
  {/each}

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
    stroke: var(--clr-canvas-file-border-hover, #cbd5e1);
    stroke-width: 2;
  }

  .canvas-file:hover .file-header {
    fill: var(--clr-canvas-file-header-bg-hover, #f1f5f9);
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
