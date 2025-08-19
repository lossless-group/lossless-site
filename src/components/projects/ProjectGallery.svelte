
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
          if (sourceContent && targetContent) {
            targetContent.innerHTML = sourceContent.innerHTML;
            targetContent.style.display = 'block';
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
          <div id="augment-it-content" style="display: {expandedProject === 'augment-it' ? 'block' : 'none'}">
            <!-- Augment-It specific content will be injected here -->
          </div>
          {#if expandedProject !== 'augment-it'}
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
    align-items: center;
    justify-content: center;
    padding: 2rem;
    animation: fadeIn 0.3s ease-out;
  }
  
  .overlay-backdrop {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.85);
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
    border-radius: 16px;
    width: 100%;
    height: 100%;
    max-width: 1200px;
    max-height: 90vh;
    overflow: hidden;
    position: relative;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    z-index: 2;
  }
  
  .mermaid-modal-close-btn {
    position: absolute;
    top: 1rem;
    left: 1rem;
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
    transform: scale(1.05);
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
