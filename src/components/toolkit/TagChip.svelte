<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  // Props interface matching the Astro component
  export let tagString: string;
  export let count: number = 0;
  export let isSelected: boolean = false;
  export let showCount: boolean = false;
  export let title: string = '';
  export let fontSize: string = '';

  const dispatch = createEventDispatcher();

  function trainCaseToNormalCase(tag: string): string {
    if (typeof tag !== 'string') {
      console.error('[TagChip] trainCaseToNormalCase received non-string tag:', tag);
      return String(tag);
    }
    return tag
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  $: normalCase = trainCaseToNormalCase(tagString);
  $: effectiveTitle = title || `Click to filter by ${normalCase}`;
  $: ariaLabel = `Filter by ${normalCase}${isSelected ? ' (currently selected)' : ''}`;

  function handleClick(event: MouseEvent) {
    event.preventDefault();
    dispatch('click', { tag: tagString });
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      dispatch('click', { tag: tagString });
    }
  }
</script>

<span
  class={`tool-tag${isSelected ? ' selected' : ''}`}
  title={effectiveTitle}
  aria-label={ariaLabel}
  data-tag={tagString}
  data-count={count}
  role="button"
  tabindex="0"
  on:click={handleClick}
  on:keydown={handleKeydown}
>
  <p style={fontSize ? `font-size: ${fontSize};` : undefined}>{normalCase}</p>
  {#if showCount && count > 0}
    <span class="count">({count})</span>
  {/if}
</span>

<style>
  :global(.tool-tag) {
    background: var(--clr-lossless-primary-dark, #2a2a30);
    color: var(--clr-lossless-primary-glass, #ccc);
    border-radius: 0.25em;
    white-space: nowrap;
    padding: 0.1em 0.1em;
    display: inline-block;
    height: fit-content;
    position: relative;
    cursor: pointer;
    border: 1px solid transparent;
    transition: all 0.2s ease-in-out;
    margin: 3px;
    overflow: visible;
  }

  :global(.tool-tag p) {
    font-size: var(--fs-250, 0.85rem);
    margin: 0.1em 0.3em;
    display: inline-block;
  }

  :global(.tool-tag .count) {
    font-size: inherit;
    margin-left: 0.3em;
    opacity: 0.8;
    display: inline-block;
  }

  :global(.tool-tag:hover) {
    background-color: #3a3a45;
    border-color: var(--clr-lossless-accent--brightest);
    color: var(--clr-lossless-primary-glass--lighter);
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  :global(.tool-tag.selected) {
    background-color: var(--clr-lossless-primary-glass, #444);
    color: var(--clr-white, #fff);
    border-color: var(--clr-lossless-primary-glass, #666);
    box-shadow: 0 0 5px rgba(100, 100, 100, 0.5);
  }
</style>