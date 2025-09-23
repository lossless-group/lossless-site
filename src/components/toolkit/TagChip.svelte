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
    
    // Toggle selection state
    const wasSelected = isSelected;
    isSelected = !isSelected;
    
    // DEBUG: Log tag selection change with detailed analysis
    console.log('🔍 TagChip.svelte DEBUG - Tag clicked:', {
      tag: tagString,
      tagType: typeof tagString,
      tagLength: tagString?.length,
      tagValue: JSON.stringify(tagString),
      wasSelected,
      isNowSelected: isSelected,
      element: event.currentTarget
    });
    
    // Dispatch Svelte component event
    dispatch('click', { tag: tagString, selected: isSelected });
    
    // Also dispatch global custom event for TagShareHeader to listen to
    const tagSelectionEvent = new CustomEvent('tagSelectionChanged', {
      detail: {
        tag: tagString,
        selected: isSelected,
        element: event.currentTarget
      },
      bubbles: true
    });
    
    // DEBUG: Log event dispatch with validation
    console.log('🔍 TagChip.svelte DEBUG - Dispatching tagSelectionChanged event:', {
      eventDetail: tagSelectionEvent.detail,
      tagIsString: typeof tagString === 'string',
      tagIsValid: tagString && tagString.length > 0,
      tagContainsHTML: tagString && (tagString.includes('<') || tagString.includes('>')),
      originalTagString: tagString
    });
    
    document.dispatchEvent(tagSelectionEvent);
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