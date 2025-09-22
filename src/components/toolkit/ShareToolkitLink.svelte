<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let selectedTags: string[] = [];
  export let baseUrl: string = '';

  const dispatch = createEventDispatcher();

  // Format tag string for display (remove hyphens, capitalize)
  function formatTagString(tags: string[]): string {
    if (tags.length === 0) return 'All Tools';
    if (tags.length === 1) {
      return tags[0].split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
    }
    // For multiple tags, show first tag + "and X more"
    const firstTag = tags[0].split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
    return `${firstTag} and ${tags.length - 1} more`;
  }

  // Generate share URL for the selected tags
  function generateShareUrl(): string {
    if (selectedTags.length === 0) {
      return `${baseUrl}/toolkit`;
    }
    if (selectedTags.length === 1) {
      // Use the dedicated tag page for single tags
      return `${baseUrl}/toolkit/tag/${selectedTags[0]}`;
    }
    // For multiple tags, use the main toolkit page with query params
    return `${baseUrl}/toolkit?tags=${selectedTags.join(',')}`;
  }

  // Generate share title for Open Graph
  function generateShareTitle(): string {
    const tagString = formatTagString(selectedTags);
    return `The ${tagString} Toolkit`;
  }

  // Generate share description for Open Graph
  function generateShareDescription(): string {
    const tagString = formatTagString(selectedTags);
    return `Checkout the ${tagString} toolkit, a great resource for innovators and founders. Curated by The Lossless Group.`;
  }

  // Copy share URL to clipboard
  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(generateShareUrl());
      dispatch('copied', { url: generateShareUrl() });
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  }

  // Share via Web Share API if available
  async function shareNative() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: generateShareTitle(),
          text: generateShareDescription(),
          url: generateShareUrl()
        });
        dispatch('shared', { url: generateShareUrl() });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback to copy to clipboard
      copyToClipboard();
    }
  }

  $: shareUrl = generateShareUrl();
  $: shareTitle = generateShareTitle();
  $: tagDisplayString = formatTagString(selectedTags);
</script>

<div class="share-toolkit-container">
    <div class="share-header">
      <h3 class="share-title">
        Share the toolkit for <span class="tag-highlight">{tagDisplayString}</span>
      </h3>
      <p class="share-description">
        Found the perfect tools? Share this curated collection with others.
      </p>
    </div>

    <div class="share-actions">
      <button 
        class="share-button primary"
        on:click={shareNative}
        title="Share this toolkit collection"
      >
        <svg class="share-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
          <polyline points="16,6 12,2 8,6"/>
          <line x1="12" y1="2" x2="12" y2="15"/>
        </svg>
        Share Collection
      </button>

      <button 
        class="share-button secondary"
        on:click={copyToClipboard}
        title="Copy link to clipboard"
      >
        <svg class="copy-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
        </svg>
        Copy Link
      </button>
    </div>

    <div class="share-url">
      <input 
        type="text" 
        readonly 
        value={shareUrl}
        class="url-input"
        on:click={(e) => (e.target as HTMLInputElement).select()}
      />
    </div>
  </div>

<style>
  .share-toolkit-container {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 12px;
    padding: 1.5rem;
    margin: 1.5rem 0;
    color: white;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }

  .share-header {
    margin-bottom: 1.25rem;
  }

  .share-title {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0 0 0.5rem 0;
    line-height: 1.4;
  }

  .tag-highlight {
    background: rgba(255, 255, 255, 0.2);
    padding: 0.125rem 0.375rem;
    border-radius: 0.25rem;
    font-weight: 700;
  }

  .share-description {
    margin: 0;
    opacity: 0.9;
    font-size: 0.875rem;
    line-height: 1.5;
  }

  .share-actions {
    display: flex;
    gap: 0.75rem;
    margin-bottom: 1rem;
    flex-wrap: wrap;
  }

  .share-button {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.625rem 1rem;
    border: none;
    border-radius: 0.5rem;
    font-weight: 500;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s ease;
    text-decoration: none;
  }

  .share-button.primary {
    background: rgba(255, 255, 255, 0.2);
    color: white;
    backdrop-filter: blur(10px);
  }

  .share-button.primary:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
  }

  .share-button.secondary {
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.3);
  }

  .share-button.secondary:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.5);
  }

  .share-icon,
  .copy-icon {
    width: 1rem;
    height: 1rem;
  }

  .share-url {
    margin-top: 1rem;
  }

  .url-input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 0.5rem;
    background: rgba(255, 255, 255, 0.1);
    color: white;
    font-size: 0.875rem;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    backdrop-filter: blur(10px);
  }

  .url-input::placeholder {
    color: rgba(255, 255, 255, 0.7);
  }

  .url-input:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.6);
    background: rgba(255, 255, 255, 0.15);
  }

  /* Responsive design */
  @media (max-width: 640px) {
    .share-toolkit-container {
      padding: 1rem;
      margin: 1rem 0;
    }

    .share-title {
      font-size: 1.125rem;
    }

    .share-actions {
      flex-direction: column;
    }

    .share-button {
      justify-content: center;
    }
  }
</style>