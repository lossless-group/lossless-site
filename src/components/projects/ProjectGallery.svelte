
<script lang="ts">
  import { onMount } from 'svelte';
  
  // SVG icons as strings for Svelte
  const expandIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21 21-6-6m6 6v-4.8m0 4.8h-4.8"/><path d="M3 16.2V21m0 0h4.8M3 21l6-6"/><path d="M21 7.8V3m0 0h-4.8M21 3l-6 6"/><path d="M3 7.8V3m0 0h4.8M3 3l6 6"/></svg>`;
  const collapseIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="m3 3 5 5"/><path d="M8 21v-3a2 2 0 0 1 2-2h3"/><path d="m16 16 5 5"/><path d="M16 3v3a2 2 0 0 0 2 2h3"/><path d="m21 3-5 5"/><path d="M8 21v-3a2 2 0 0 0-2-2H3"/><path d="m3 21 5-5"/></svg>`;
  
  interface UseCase {
    title: string;
    description: string;
    href: string;
  }
  
  interface Project {
    id: string;
    title: string;
    subtitle: string;
    useCases: UseCase[];
    content?: string;
  }
  
  export let projects: Project[] = [];

  
  let expandedProject: string | null = null;
  let isFullPageView = false;
  let isClosing = false;

  // Track the currently expanded project
  let currentProject: Project | null = null;
  $: currentProject = projects.find(p => p.id === expandedProject) ?? null;
  
  function toggleProject(projectId: string) {
    if (expandedProject === projectId) {
      // Close current project with animation
      closeProject();
    } else {
      // Open new project
      expandedProject = projectId;
      isFullPageView = true;
      isClosing = false;
      document.body.style.overflow = 'hidden';
      
      // Inject Augment-It content if needed
      if (projectId === 'augment-it') {
        setTimeout(() => {
          const sourceContent = document.getElementById('augment-it-full-content');
          const targetContent = document.getElementById('augment-it-content');
          const navigationTarget = document.getElementById('augment-it-navigation');
          
          if (sourceContent && targetContent) {
            // Clone the source content
            const clonedContent = sourceContent.cloneNode(true) as Element;
            
            // Extract the entire sidebar from StorySidebarTree__VariantB
            const sidebar = clonedContent.querySelector('.sidebar');
            if (sidebar && navigationTarget) {
              navigationTarget.innerHTML = sidebar.innerHTML;
            }
            
            // Extract the content area from StorySidebarTree__VariantB
            const contentArea = clonedContent.querySelector('.content-area');
            if (contentArea && targetContent) {
              targetContent.innerHTML = contentArea.innerHTML;
            }
          }
        }, 100);
      }
    }
  }
  
  function closeProject() {
    expandedProject = null;
    isFullPageView = false;
    document.body.style.overflow = 'auto';
  }
  
  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      closeProject();
    }
  }
  
  onMount(() => {
    return () => {
      document.body.style.overflow = 'auto';
    };
  });
</script>

<!-- Project Gallery Grid -->
<section class="covers-grid">
  {#each projects as project}
    <article class="project-cover card">
      <header class="cover-hero">
        <div class="cover-titles">
          <h2 class="cover-title">{project.title}</h2>
          <p class="cover-subtitle">{project.subtitle}</p>
        </div>
      </header>
      
      {#if project.useCases && project.useCases.length > 0}
        <div class="usecases">
          {#each project.useCases as useCase}
            <a href={useCase.href} class="usecase-card">
              <h3 class="usecase-title">{useCase.title}</h3>
              <p class="usecase-desc">{useCase.description}</p>
            </a>
          {/each}
        </div>
      {/if}
      
      <div class="cover-expand">
        <button 
          class="toggle" 
          on:click={() => toggleProject(project.id)}
          aria-label={expandedProject === project.id ? 'Close' : 'Open'}
        >
          <span class="toggle-label">
            {expandedProject === project.id ? 'Close' : 'Open'}
          </span>
          <span class="chev" aria-hidden="true">
            {#if expandedProject === project.id}
              {@html collapseIcon}
            {:else}
              {@html expandIcon}
            {/if}
          </span>
        </button>
      </div>
    </article>
  {/each}
</section>
<!-- Full Page Project Overlay -->
{#if isFullPageView && expandedProject}
  <div class="project-overlay" role="dialog" aria-modal="true">
    <button 
      class="overlay-backdrop" 
      aria-label="Close project overlay"
      on:click={closeProject}
      on:keydown={handleKeydown}
    ></button>
    <div class="project-content" role="document">
      <button 
        type="button"
        class="mermaid-modal-close-btn"
        aria-label="Close expanded content"
        on:click={closeProject}
      >
        {@html collapseIcon}
      </button>
      <div class="project-full-content">
        {#if currentProject}
{#if expandedProject === 'augment-it'}
            <div class="augment-it-content">
              <div class="project-layout">
                <aside class="project-sidebar">
                  <div id="augment-it-navigation">
                    <!-- Navigation will be injected here from ContentSection_SidebarTreeVariantB -->
                  </div>
                </aside>
                <main class="project-main">
                  <header class="project-header">
                    <h1>Augment-It</h1>
                    <p class="project-subtitle">Data Augmentation Workflow with Microfrontends</p>
                  </header>
                  <div id="augment-it-content" class="project-content">
                    <!-- Additional content will be injected here -->
                  </div>
                </main>
              </div>
            </div>
          {:else}
            <div class="placeholder-content">
              <h1>{currentProject.title}</h1>
              <p>Full project content for {currentProject.title} coming soon.</p>
            </div>
          {/if}
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  .covers-grid {
    display: grid;
    gap: 1rem;
    grid-template-columns: repeat(2, 1fr);
  }
  
  .project-cover { 
    padding: 1.5rem; 
    background: linear-gradient(135deg, 
      color-mix(in oklab, var(--clr-lossless-primary-glass), transparent 95%) 0%,
      color-mix(in oklab, var(--clr-lossless-primary-glass), transparent 98%) 100%
    );
    border: 1px solid color-mix(in oklab, var(--clr-lossless-primary-light), transparent 80%);
    border-radius: 16px;
    box-shadow: 
      0 4px 20px color-mix(in oklab, var(--clr-lossless-primary-dark), transparent 90%),
      0 1px 3px color-mix(in oklab, black, transparent 95%);
    transition: all 200ms ease;
    position: relative;
    overflow: hidden;
  }
  
  .project-cover::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, 
      var(--clr-lossless-primary-light) 0%,
      var(--clr-lossless-primary) 50%,
      var(--clr-lossless-primary-light) 100%
    );
    opacity: 0.6;
  }
  
  .cover-hero { 
    display: flex; 
    align-items: center; 
    gap: 1.25rem; 
    margin-bottom: 0.5rem;
  }
  
  
  .cover-titles { display: grid; gap: 0.4rem; }
  
  .cover-title { 
    margin: 0; 
    font-size: clamp(1.4rem, 2.8vw, 1.8rem); 
    font-weight: 600;
    color: var(--clr-heading);
    text-shadow: 0 1px 2px color-mix(in oklab, black, transparent 95%);
  }
  
  .cover-subtitle { 
    margin: 0; 
    color: var(--clr-body); 
    opacity: 0.85; 
    font-size: 1rem;
    line-height: 1.4;
    font-weight: 400;
  }
  
  .usecases { 
    display: grid; 
    grid-template-columns: repeat(2, minmax(0, 1fr)); 
    gap: 1rem; 
    margin-top: 1.25rem; 
  }
  
  .usecase-card {
    display: grid; 
    gap: 0.5rem; 
    padding: 1.25rem; 
    text-decoration: none;
    color: var(--clr-heading);
    background: linear-gradient(135deg,
      color-mix(in oklab, var(--clr-lossless-primary-glass), transparent 85%) 0%,
      color-mix(in oklab, var(--clr-lossless-primary-glass), transparent 90%) 100%
    );
    border: 1px solid color-mix(in oklab, var(--clr-lossless-ui-btn-border), transparent 70%);
    border-radius: 14px;
    box-shadow: 
      0 3px 12px color-mix(in oklab, var(--clr-lossless-primary-dark), transparent 88%),
      inset 0 1px 0 color-mix(in oklab, white, transparent 95%);
    transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
  }
  
  .usecase-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, 
      transparent 0%,
      color-mix(in oklab, var(--clr-lossless-primary-light), transparent 70%) 50%,
      transparent 100%
    );
  }
  
  .usecase-card:hover { 
    transform: translateY(-2px) scale(1.02); 
    box-shadow: 
      0 8px 24px color-mix(in oklab, var(--clr-lossless-primary-dark), transparent 82%),
      inset 0 1px 0 color-mix(in oklab, white, transparent 90%);
    border-color: color-mix(in oklab, var(--clr-lossless-primary), transparent 60%);
  }
  
  .usecase-icon { 
    opacity: 0.9; 
    transition: opacity 200ms ease;
  }
  
  .usecase-card:hover .usecase-icon {
    opacity: 1;
  }
  
  .usecase-title { 
    margin: 0; 
    font-size: 1.1rem; 
    font-weight: 600;
    line-height: 1.3;
  }
  
  .usecase-desc { 
    margin: 0; 
    color: var(--clr-body); 
    opacity: 0.85; 
    font-size: 0.95rem;
    line-height: 1.4;
  }
  
  .cover-expand { 
    margin-top: 1rem; 
    border-top: 1px solid color-mix(in oklab, var(--clr-lossless-primary-light), transparent 85%); 
    padding-top: 1rem; 
    position: relative;
  }
  
  .cover-expand::before {
    content: '';
    position: absolute;
    top: -1px;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 1px;
    background: linear-gradient(90deg, 
      transparent 0%,
      var(--clr-lossless-primary-light) 50%,
      transparent 100%
    );
  }
  
  .toggle { 
    list-style: none; 
    cursor: pointer; 
    display: inline-flex; 
    align-items: center; 
    gap: 0.5rem; 
    padding: 0.6rem 1rem; 
    border-radius: 10px; 
    border: 1px solid color-mix(in oklab, var(--clr-lossless-ui-btn-border), transparent 60%); 
    background: linear-gradient(135deg,
      var(--surface-2) 0%,
      color-mix(in oklab, var(--surface-2), var(--surface-3) 30%) 100%
    );
    color: var(--clr-body); 
    user-select: none;
    font-weight: 500;
    transition: all 200ms ease;
    box-shadow: 
      0 2px 8px color-mix(in oklab, black, transparent 92%),
      inset 0 1px 0 color-mix(in oklab, white, transparent 95%);
  }
  
  .toggle:hover {
    transform: translateY(-1px);
    box-shadow: 
      0 4px 12px color-mix(in oklab, black, transparent 88%),
      inset 0 1px 0 color-mix(in oklab, white, transparent 90%);
    border-color: color-mix(in oklab, var(--clr-lossless-primary), transparent 70%);
  }
  
  .chev { 
    transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
    font-size: 1.1em;
  }
  
  .project-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1000;
    display: flex;
    align-items: stretch;
    justify-content: stretch;
    padding: 0;
    animation: fadeIn 0.3s ease-out;
  }
  
  .overlay-backdrop {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgb(0, 0, 0);
    border: none;
    cursor: pointer;
    z-index: 1;
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  
  @keyframes fadeOut {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }
  
  .project-content {
    background: var(--surface-1);
    border-radius: 0;
    width: 100%;
    height: 100%;
    max-width: none;
    max-height: none;
    overflow: hidden;
    position: relative;
    box-shadow: none;
    z-index: 2;
  }
  
  .mermaid-modal-close-btn {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: color-mix(in oklab, black, transparent 80%);
    border: 1px solid color-mix(in oklab, white, transparent 85%);
    border-radius: 8px;
    color: #fff;
    cursor: pointer;
    padding: 0.6rem;
    line-height: 1;
    z-index: 10;
    backdrop-filter: blur(8px);
    transition: all 200ms ease;
  }
  
  .mermaid-modal-close-btn:hover {
    background: color-mix(in oklab, black, transparent 70%);
  }

  /* Fix bullet points in injected Augment-It content */
  :global(.project-content .sequential-section),
  :global(.project-content .orientation-section) {
    position: relative;
  }

  :global(.project-content .tree-nav) { 
    list-style: none; 
    padding-left: 0; 
    margin: 0; 
  }
  
  :global(.project-content .tree-nav li) { 
    list-style: none;
    position: relative;
  }
  
  :global(.project-content .tree-nav li + li),
  :global(.project-content .tree-nav div + div) { 
    margin-top: 0.35rem; 
  }

  /* Override global a styles for injected content */
  :global(.project-content .sequential-section a.tree-link),
  :global(.project-content .orientation-section a.tree-link),
  :global(.project-content a.tree-link) { 
    display: flex !important; 
    align-items: center !important; 
    gap: 0.6rem !important; 
    padding: 0.2rem 0.3rem 0.2rem 0.55rem !important; 
    border-radius: 0.35rem !important; 
    color: var(--clr-heading) !important; 
    text-decoration: none !important; 
    position: relative !important; 
    transition: color 150ms ease, box-shadow 150ms ease, background 150ms ease !important;
    list-style: none !important;
    list-style-type: none !important;
  }

  :global(.project-content a.tree-link:hover) { 
    color: var(--clr-heading) !important; 
    background: color-mix(in oklab, var(--clr-lossless-primary-glass), transparent 80%) !important; 
  }
  
  :global(.project-content a.tree-link--active) { 
    color: var(--clr-lossless-accent--brightest) !important; 
    font-weight: 700 !important; 
    box-shadow: inset 3px 0 0 var(--clr-lossless-accent--brightest) !important; 
  }

  /* Project layout structure */
  .augment-it-content {
    height: 100%;
    overflow: hidden;
  }

  .project-layout {
    display: grid;
    grid-template-columns: 280px 1fr;
    height: 100%;
    gap: 0;
  }

  .project-sidebar {
    background: color-mix(in oklab, var(--surface-1), black 3%);
    border-right: 1px solid color-mix(in oklab, var(--clr-lossless-primary-light), transparent 85%);
    padding: 1.5rem;
    overflow-y: auto;
  }

  .project-main {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }

  .project-header {
    padding: 2rem 2rem 1rem 2rem;
    border-bottom: 1px solid color-mix(in oklab, var(--clr-lossless-primary-light), transparent 90%);
    flex-shrink: 0;
  }

  .project-header h1 {
    color: var(--clr-lossless-accent--brightest);
    font-size: 2.5rem;
    margin: 0 0 0.5rem 0;
  }

  .project-subtitle {
    color: var(--clr-lossless-primary-light);
    font-size: 1.1rem;
    margin: 0;
    opacity: 0.8;
  }

  .project-content {
    flex: 1;
    overflow-y: auto;
    padding: 2rem;
    color: var(--clr-body);
  }

  
  .mermaid-modal-close-btn :global(svg) {
    width: 1.4rem;
    height: 1.4rem;
    display: block;
  }
  
  .project-full-content {
    height: 100%;
    overflow-y: auto;
    padding: 2rem;
  }
  
  .placeholder-content {
    padding: 2rem;
    text-align: center;
  }
  
  .placeholder-content h1 {
    color: var(--clr-heading);
    margin-bottom: 1rem;
  }
  
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
  
  @media (max-width: 768px) {
    .project-cover { padding: 1.25rem; }
    .cover-hero { gap: 1rem; }
    .usecases { grid-template-columns: 1fr; gap: 0.75rem; }
    .usecase-card { padding: 1rem; }
    .covers-grid {
      grid-template-columns: 1fr;
    }
    
    .project-overlay {
      padding: 1rem;
    }
    
    .project-content {
      max-height: 95vh;
    }
    
    .project-full-content {
      padding: 1rem;
    }
  }
</style>
