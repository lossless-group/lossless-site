<script lang="ts">
  import type { GroupNode } from '../../types/json-canvas';

  export let node: GroupNode;
  export let isSelected: boolean = false;
  export let onClick: ((event: MouseEvent) => void) | undefined = undefined;
  export let onKeydown: ((event: KeyboardEvent) => void) | undefined = undefined;

  // Calculate dimensions and position
  $: width = node.width || 200;
  $: height = node.height || 150;
  $: x = node.x || 0;
  $: y = node.y || 0;

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

<!-- Group container with proper ARIA attributes -->
<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<g 
  class="canvas-group" 
  class:selected={isSelected}
  role="group"
  aria-label={node.label || 'Canvas group'}
  tabindex="0"
  on:click={handleClick}
  on:keydown={handleKeydown}
  transform="translate({x}, {y})"
>
  <!-- Group background rectangle -->
  <rect
    class="group-background"
    width={width}
    height={height}
    rx="12"
    ry="12"
    fill="var(--clr-canvas-group-bg, #1a1a1a)"
    stroke="var(--clr-canvas-group-border, #333333)"
    stroke-width="2"
    opacity="0.2"
  />
  
  <!-- Group label if present -->
  {#if node.label}
    <text
      class="group-label"
      x="12"
      y="24"
      fill="var(--clr-canvas-group-text, #e2e8f0)"
      font-family="var(--font-family-primary, system-ui)"
      font-size="14"
      font-weight="600"
      text-anchor="start"
    >
      {node.label}
    </text>
  {/if}

  <!-- Selection indicator -->
  {#if isSelected}
    <rect
      class="selection-indicator"
      width={width}
      height={height}
      rx="12"
      ry="12"
      fill="none"
      stroke="var(--clr-primary, #00d4ff)"
      stroke-width="3"
      stroke-dasharray="5,5"
      opacity="0.8"
    />
  {/if}
</g>

<style>
  .canvas-group {
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .canvas-group:hover .group-background {
    stroke: var(--clr-lossless-accent--brightest);
    stroke-width: 2;
  }

  .canvas-group:focus {
    outline: none;
  }

  .canvas-group:focus .group-background {
    stroke: var(--clr-primary, #00d4ff);
    stroke-width: 3;
  }

  .group-background {
    transition: all 0.2s ease;
  }

  .group-label {
    pointer-events: none;
    user-select: none;
  }

  .selection-indicator {
    pointer-events: none;
    animation: dash 1s linear infinite;
  }

  @keyframes dash {
    to {
      stroke-dashoffset: -10;
    }
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .group-label {
      font-size: 12px;
    }
  }
</style>
