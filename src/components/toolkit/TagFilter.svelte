<script lang="ts">
  import { writable, derived } from 'svelte/store';
  import { onMount } from 'svelte';
  import TagChip from './TagChip.svelte';
  import ToolCard from './ToolCard.svelte';

  // TypeScript interface for Tool data structure
  interface Tool {
    id: string;
    slug: string;
    title: string;
    lede: string;
    description: string;
    banner_image: string;
    url: string;
    company: string;
    pricing: string;
    category: string;
    tags: string[];
    collection: string;
  }

  interface TagCount {
    tag: string;
    count: number;
  }

  // Props from the Island wrapper
  export let tools: Tool[] = [];
  export let allTags: TagCount[] = [];
  export let initialSelectedTags: string[] = [];
  export let initialSearch: string = '';
  export let initialSort: string = 'title';
  export let showSearch: boolean = true;
  export let showSortControls: boolean = true;
  export let showTagSidebar: boolean = true;

  // Reactive stores
  const selectedTags = writable<Set<string>>(new Set(initialSelectedTags));
  const searchQuery = writable<string>(initialSearch);
  const sortBy = writable<string>(initialSort);

  // Derived store for filtered tools
  const filteredTools = derived(
    [selectedTags, searchQuery, sortBy],
    ([$selectedTags, $searchQuery, $sortBy]) => {
      let filtered = tools;

      // Filter by selected tags
      if ($selectedTags.size > 0) {
        filtered = filtered.filter(tool => 
          Array.from($selectedTags).every(selectedTag =>
            tool.tags.some(toolTag => toolTag === selectedTag)
          )
        );
      }

      // Filter by search query
      if ($searchQuery.trim()) {
        const query = $searchQuery;
        filtered = filtered.filter(tool =>
          tool.title.includes(query) ||
          tool.description.includes(query) ||
          tool.company.includes(query) ||
          tool.tags.some(tag => tag.includes(query))
        );
      }

      // Sort results
      filtered.sort((a, b) => {
        switch ($sortBy) {
          case 'title':
            return a.title.localeCompare(b.title);
          case 'company':
            return a.company.localeCompare(b.company);
          case 'category':
            return a.category.localeCompare(b.category);
          case 'recent':
            return a.id.localeCompare(b.id); // Assuming newer entries have later IDs
          default:
            return 0;
        }
      });

      return filtered;
    }
  );

  // Update URL when filters change
  function updateURL() {
    if (typeof window === 'undefined') return;
    
    const url = new URL(window.location.href);
    const params = new URLSearchParams();
    
    // Add selected tags
    if ($selectedTags.size > 0) {
      params.set('tags', Array.from($selectedTags).join(','));
    }
    
    // Add search query
    if ($searchQuery.trim()) {
      params.set('search', $searchQuery);
    }
    
    // Add sort option (only if not default)
    if ($sortBy !== 'title') {
      params.set('sort', $sortBy);
    }
    
    // Update URL without page reload
    const newUrl = params.toString() ? `${url.pathname}?${params.toString()}` : url.pathname;
    window.history.pushState({}, '', newUrl);
  }

  // Tag selection handlers
  function toggleTag(tag: string) {
    selectedTags.update(tags => {
      const newTags = new Set(tags);
      
      if (newTags.has(tag)) {
        newTags.delete(tag);
      } else {
        newTags.add(tag);
      }
      
      return newTags;
    });
  }

  function clearAllTags() {
    selectedTags.set(new Set());
  }

  function clearSearch() {
    searchQuery.set('');
  }

  // Reactive statements to update URL
  $: if (typeof window !== 'undefined') {
    updateURL();
  }

  // Get filtered tag counts
  $: filteredTagCounts = (() => {
    const tagCounts = new Map<string, number>();
    
    $filteredTools.forEach(tool => {
      tool.tags.forEach(tag => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    });
    
    return allTags.map(({ tag, count }) => ({
      tag,
      count: tagCounts.get(tag) || 0,
      isSelected: $selectedTags.has(tag)
    })).filter(({ count, tag }) => count > 0 || $selectedTags.has(tag));
  })();

  onMount(() => {
    // Handle browser back/forward navigation
    const handlePopState = () => {
      const url = new URL(window.location.href);
      const urlTags = url.searchParams.get('tags');
      const urlSearch = url.searchParams.get('search') || '';
      const urlSort = url.searchParams.get('sort') || 'title';
      
      selectedTags.set(new Set(urlTags ? urlTags.split(',').map(t => t.trim()) : []));
      searchQuery.set(urlSearch);
      sortBy.set(urlSort);
    };
    
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  });
</script>

<div class="tag-filter-container">
  <!-- Filter Controls -->
  <div class="filter-controls">
    <!-- Search Input -->
    {#if showSearch}
      <div class="search-container">
        <input
          type="text"
          placeholder="Search tools..."
          bind:value={$searchQuery}
          class="search-input"
        />
        {#if $searchQuery}
          <button 
            class="clear-search-btn"
            on:click={clearSearch}
            aria-label="Clear search"
          >
            ×
          </button>
        {/if}
      </div>
    {/if}

    <!-- Sort Controls -->
    {#if showSortControls}
      <div class="sort-container">
        <label for="sort-select">Sort by:</label>
        <select id="sort-select" bind:value={$sortBy} class="sort-select">
          <option value="title">Title</option>
          <option value="company">Company</option>
          <option value="category">Category</option>
          <option value="recent">Recently Added</option>
        </select>
      </div>
    {/if}

    <!-- Results Count -->
    <div class="results-count">
      {$filteredTools.length} of {tools.length} tools
      {#if $selectedTags.size > 0 || $searchQuery}
        <button class="clear-all-btn" on:click={() => { clearAllTags(); clearSearch(); }}>
          Clear all filters
        </button>
      {/if}
    </div>
  </div>

  <div class="filter-layout">
    <!-- Tag Sidebar -->
    <aside class="tag-sidebar">
      <h3>Filter by Tags</h3>
      
      {#if $selectedTags.size > 0}
        <div class="selected-tags">
          <h4>Selected Tags</h4>
          <div class="tag-list">
            {#each Array.from($selectedTags) as tag}
              <TagChip 
                tagString={tag}
                isSelected={true}
                on:click={() => toggleTag(tag)}
                showCount={false}
              />
            {/each}
          </div>
          <button class="clear-tags-btn" on:click={clearAllTags}>
            Clear all tags
          </button>
        </div>
      {/if}

      <div class="available-tags">
        <h4>Available Tags</h4>
        <div class="tag-list">
          {#each filteredTagCounts as { tag, count, isSelected }}
            <TagChip 
              tagString={tag}
              count={count}
              isSelected={isSelected}
              showCount={true}
              on:click={() => toggleTag(tag)}
            />
          {/each}
        </div>
      </div>
    </aside>

    <!-- Tool Grid -->
    <main class="tool-grid-container">
      {#if $filteredTools.length > 0}
        <div class="tool-grid">
          {#each $filteredTools as tool}
            <ToolCard {tool} highlightTags={Array.from($selectedTags)} />
          {/each}
        </div>
      {:else}
        <div class="empty-state">
          <h3>No tools found</h3>
          <p>
            {#if $selectedTags.size > 0 && $searchQuery}
              No tools match your selected tags and search query.
            {:else if $selectedTags.size > 0}
              No tools match your selected tags.
            {:else if $searchQuery}
              No tools match your search query.
            {:else}
              No tools available.
            {/if}
          </p>
          {#if $selectedTags.size > 0 || $searchQuery}
            <button class="clear-filters-btn" on:click={() => { clearAllTags(); clearSearch(); }}>
              Clear all filters
            </button>
          {/if}
        </div>
      {/if}
    </main>
  </div>
</div>

<style>
  .tag-filter-container {
    width: 100%;
    max-width: 1400px;
    margin: 0 auto;
    padding: 1rem;
  }

  .filter-controls {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: center;
    margin-bottom: 2rem;
    padding: 1rem;
    background: #f8fafc;
    border-radius: 0.5rem;
    border: 1px solid #e2e8f0;
  }

  .search-container {
    position: relative;
    flex: 1;
    min-width: 200px;
  }

  .search-input {
    width: 100%;
    padding: 0.5rem 2rem 0.5rem 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    font-size: 0.875rem;
  }

  .search-input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .clear-search-btn {
    position: absolute;
    right: 0.5rem;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    font-size: 1.25rem;
    cursor: pointer;
    color: #6b7280;
    padding: 0.25rem;
  }

  .clear-search-btn:hover {
    color: #374151;
  }

  .sort-container {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .sort-container label {
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
  }

  .sort-select {
    padding: 0.5rem;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    background: white;
  }

  .results-count {
    display: flex;
    align-items: center;
    gap: 1rem;
    font-size: 0.875rem;
    color: #6b7280;
    margin-left: auto;
  }

  .clear-all-btn {
    padding: 0.25rem 0.75rem;
    background: #ef4444;
    color: white;
    border: none;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .clear-all-btn:hover {
    background: #dc2626;
  }

  .filter-layout {
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 2rem;
  }

  .tag-sidebar {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 0.5rem;
    padding: 1.5rem;
    height: fit-content;
    position: sticky;
    top: 2rem;
  }

  .tag-sidebar h3 {
    margin: 0 0 1rem 0;
    font-size: 1.125rem;
    font-weight: 600;
    color: #111827;
  }

  .tag-sidebar h4 {
    margin: 1rem 0 0.5rem 0;
    font-size: 0.875rem;
    font-weight: 600;
    color: #374151;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .selected-tags {
    margin-bottom: 1.5rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid #e5e7eb;
  }

  .tag-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .clear-tags-btn {
    padding: 0.375rem 0.75rem;
    background: #f3f4f6;
    color: #374151;
    border: 1px solid #d1d5db;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .clear-tags-btn:hover {
    background: #e5e7eb;
  }

  .tool-grid-container {
    min-height: 400px;
  }

  .tool-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    text-align: center;
    color: #6b7280;
  }

  .empty-state h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: #374151;
  }

  .empty-state p {
    margin: 0 0 1.5rem 0;
    font-size: 0.875rem;
  }

  .clear-filters-btn {
    padding: 0.75rem 1.5rem;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .clear-filters-btn:hover {
    background: #2563eb;
  }

  /* Responsive Design */
  @media (max-width: 1024px) {
    .filter-layout {
      grid-template-columns: 1fr;
    }

    .tag-sidebar {
      position: static;
      order: 2;
    }

    .tool-grid-container {
      order: 1;
    }
  }

  @media (max-width: 768px) {
    .filter-controls {
      flex-direction: column;
      align-items: stretch;
    }

    .results-count {
      margin-left: 0;
      justify-content: space-between;
    }

    .tool-grid {
      grid-template-columns: 1fr;
    }
  }
</style>