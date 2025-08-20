
<script lang="ts">
  import { onMount } from 'svelte';
  
  // SVG icons as strings for Svelte
  const expandIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21 21-6-6m6 6v-4.8m0 4.8h-4.8"/><path d="M3 16.2V21m0 0h4.8M3 21l6-6"/><path d="M21 7.8V3m0 0h-4.8M21 3l-6 6"/><path d="M3 7.8V3m0 0h4.8M3 3l6 6"/></svg>`;
  const collapseIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="m3 3 5 5"/><path d="M8 21v-3a2 2 0 0 1 2-2h3"/><path d="m16 16 5 5"/><path d="M16 3v3a2 2 0 0 0 2 2h3"/><path d="m21 3-5 5"/><path d="M8 21v-3a2 2 0 0 0-2-2H3"/><path d="m3 21 5-5"/></svg>`;
  
  interface UseCase {
    title: string;
    description: string;
  }
  
  interface Project {
    id: string;
    title: string;
    subtitle: string;
    useCases: UseCase[];
    hasSidebar?: boolean;
    demoSteps?: any[] | null;
    content?: any;
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
      
      // Inject project content if it exists
      const project = projects.find(p => p.id === projectId);
      if (project && project.content) {
        setTimeout(() => {
          const sourceContent = document.getElementById(`${projectId}-full-content`);
          const targetContent = document.getElementById(`${projectId}-content`);
          const navigationTarget = document.getElementById(`${projectId}-navigation`);
          
          if (sourceContent && targetContent) {
            // Clone the source content
            const clonedContent = sourceContent.cloneNode(true) as Element;
            
            if (project.hasSidebar && navigationTarget) {
              // Extract the entire sidebar from StorySidebarTree__VariantB
              const sidebar = clonedContent.querySelector('.sidebar');
              if (sidebar) {
                navigationTarget.innerHTML = sidebar.innerHTML;
              }
            }
            
            // Extract the content area
            let contentArea;
            if (project.hasSidebar) {
              contentArea = clonedContent.querySelector('.content-area');
            } else {
              // For simple content, the entire cloned content is the content area
              contentArea = clonedContent.querySelector('.project-content-simple');
            }
            
            if (contentArea && targetContent) {
              targetContent.innerHTML = contentArea.innerHTML;
              
              // Check for mermaid charts in the injected content
              const mermaidCharts = targetContent.querySelectorAll('.mermaid');
              
              // Wait for Mermaid library to be loaded before rendering
              if (mermaidCharts.length > 0) {
                const waitForMermaid = () => {
                  if ((window as any).mermaid && (window as any).renderMermaidCharts) {
                    // Clear the processed state and re-render each chart
                    mermaidCharts.forEach((chart) => {
                      // Get the original mermaid code from the expand button
                      const expandBtn = chart.parentElement?.querySelector('.mermaid-expand-btn');
                      const originalCode = expandBtn?.getAttribute('data-mermaid-code');
                      
                      if (originalCode) {
                        // Clear the chart and remove processed attribute
                        chart.innerHTML = '';
                        chart.removeAttribute('data-processed');
                        
                        // Set the original mermaid code
                        chart.textContent = originalCode;
                      }
                    });
                    
                    // Now render all charts
                    (window as any).mermaid.run();
                    
                    // Re-initialize modal functionality for the newly rendered charts
                    setTimeout(() => {
                      const expandButtons = targetContent.querySelectorAll('.mermaid-expand-btn');
                      
                      expandButtons.forEach(expandBtn => {
                        const chartId = expandBtn.getAttribute('data-chart-id');
                        const modal = document.getElementById(`modal-${chartId}`);
                        
                        if (modal) {
                          const closeBtn = modal.querySelector('.mermaid-modal-close-btn');
                          let previouslyFocusedElement;
                          
                          const openModal = () => {
                            previouslyFocusedElement = document.activeElement;
                            const rawMermaidCode = expandBtn.getAttribute('data-mermaid-code');
                            const modalMermaidDiv = modal.querySelector('.mermaid');
                            
                            if (modalMermaidDiv && rawMermaidCode && (window as any).mermaid) {
                              // Restore raw code and prepare for re-render
                              modalMermaidDiv.innerHTML = ''; // Clear current content
                              modalMermaidDiv.removeAttribute('data-processed'); // Allow mermaid to reprocess
                              modalMermaidDiv.textContent = rawMermaidCode; // Set the raw mermaid code

                              // Ensure modal is visible BEFORE rendering
                              modal.hidden = false;
                              setTimeout(() => {
                                modal.setAttribute('data-visible', 'true');

                                // Now render the chart in the modal
                                try {
                                  (window as any).mermaid.run({ nodes: [modalMermaidDiv] });
                                } catch (e) {
                                  console.error('Error rendering Mermaid chart in modal:', e);
                                  modalMermaidDiv.textContent = 'Error rendering chart.';
                                }

                                document.body.style.overflow = 'hidden';
                                expandBtn.setAttribute('aria-expanded', 'true');
                                if (closeBtn) (closeBtn as HTMLElement).focus();
                              }, 10);
                            }
                          };
                          
                          const closeModal = () => {
                            modal.setAttribute('data-visible', 'false');
                            setTimeout(() => {
                              modal.hidden = true;
                            }, 300);
                            document.body.style.overflow = '';
                            expandBtn.setAttribute('aria-expanded', 'false');
                            if (previouslyFocusedElement) {
                              (previouslyFocusedElement as HTMLElement).focus();
                            }
                          };
                          
                          expandBtn.addEventListener('click', openModal);
                          if (closeBtn) {
                            closeBtn.addEventListener('click', closeModal);
                          }
                          
                          modal.addEventListener('keydown', (event) => {
                            if (event.key === 'Escape') {
                              closeModal();
                            }
                          });
                        }
                      });
                    }, 500);
                    
                  } else {
                    setTimeout(waitForMermaid, 100);
                  }
                };
                waitForMermaid();
              }
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
    // Ensure tooltips can break out of container constraints
    const tooltipWrappers = document.querySelectorAll('.tooltip-wrapper');
    tooltipWrappers.forEach(wrapper => {
      (wrapper as HTMLElement).style.overflow = 'visible';
      (wrapper as HTMLElement).style.position = 'relative';
    });
    
    // Handle tooltip positioning for project overlay
    const handleTooltipPositioning = () => {
      const projectOverlay = document.querySelector('.project-overlay');
      if (projectOverlay) {
        const tooltips = projectOverlay.querySelectorAll('.tooltip');
        tooltips.forEach(tooltip => {
          const wrapper = tooltip.closest('.tooltip-wrapper');
          if (wrapper) {
            const wrapperRect = wrapper.getBoundingClientRect();
            const tooltipRect = tooltip.getBoundingClientRect();
            
            if (tooltip.classList.contains('tooltip--right')) {
              (tooltip as HTMLElement).style.left = (wrapperRect.right + 8) + 'px';
              (tooltip as HTMLElement).style.top = (wrapperRect.top + wrapperRect.height / 2 - tooltipRect.height / 2) + 'px';
            } else if (tooltip.classList.contains('tooltip--left')) {
              (tooltip as HTMLElement).style.left = (wrapperRect.left - tooltipRect.width - 8) + 'px';
              (tooltip as HTMLElement).style.top = (wrapperRect.top + wrapperRect.height / 2 - tooltipRect.height / 2) + 'px';
            } else if (tooltip.classList.contains('tooltip--top')) {
              (tooltip as HTMLElement).style.left = (wrapperRect.left + wrapperRect.width / 2 - tooltipRect.width / 2) + 'px';
              (tooltip as HTMLElement).style.top = (wrapperRect.top - tooltipRect.height - 8) + 'px';
            } else if (tooltip.classList.contains('tooltip--bottom')) {
              (tooltip as HTMLElement).style.left = (wrapperRect.left + wrapperRect.width / 2 - tooltipRect.width / 2) + 'px';
              (tooltip as HTMLElement).style.top = (wrapperRect.bottom + 8) + 'px';
            }
          }
        });
      }
    };
    
    // Set up tooltip positioning observers
    const observer = new MutationObserver(handleTooltipPositioning);
    const projectOverlay = document.querySelector('.project-overlay');
    if (projectOverlay) {
      observer.observe(projectOverlay, { childList: true, subtree: true });
    }
    
    // Also handle on hover
    document.addEventListener('mouseover', (e) => {
      if ((e.target as Element).closest('.tooltip-wrapper')) {
        setTimeout(handleTooltipPositioning, 10);
      }
    });
    
    return () => {
      document.body.style.overflow = 'auto';
      observer.disconnect();
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
            <div class="usecase-card">
              <h3 class="usecase-title">{useCase.title}</h3>
              <p class="usecase-desc">{useCase.description}</p>
            </div>
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
          {#if currentProject.content}
            <div class="project-content-wrapper">
              {#if currentProject.hasSidebar}
                <div class="project-layout">
                  <aside class="project-sidebar">
                    <div id="{currentProject.id}-navigation">
                      <!-- Navigation will be injected here from ContentSection_SidebarTreeVariantB -->
                    </div>
                  </aside>
                  <main class="project-main">
                    <header class="project-header">
                      <h1>{currentProject.title}</h1>
                      <p class="project-subtitle">{currentProject.subtitle}</p>
                    </header>
                    <div id="{currentProject.id}-content" class="project-content">
                      <!-- Additional content will be injected here -->
                    </div>
                  </main>
                </div>
              {:else}
                <div class="project-content-simple-layout">
                  <header class="project-header">
                    <h1>{currentProject.title}</h1>
                    <p class="project-subtitle">{currentProject.subtitle}</p>
                  </header>
                  <div id="{currentProject.id}-content" class="project-content">
                    <!-- Content will be injected here -->
                  </div>
                </div>
              {/if}
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
  
  .usecase-icon { 
    opacity: 0.9; 
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

  /* Fix bullet points in injected project content */
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
  .project-content-wrapper {
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
    overflow-x: visible; /* Allow tooltips to extend beyond sidebar boundaries */
  }

  .project-main {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    overflow-x: visible; /* Allow tooltips to extend beyond main container boundaries */
  }

  .project-content-simple-layout {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    overflow-x: visible;
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
    overflow-x: visible; /* Allow mermaid charts to break out */
    padding: 2rem;
    color: var(--clr-body);
  }

  /* Minimal CSS to ensure mermaid charts work properly in project overlay */
  :global(.project-content .mermaid-breakout) {
    overflow: visible;
  }

  :global(.project-content .mermaid-chart-shell) {
    overflow: visible;
  }

  /* Remove custom mermaid styling - let them use the original MermaidChart.astro styles */
  
  /* Comprehensive tooltip overrides to escape container constraints */
  :global(.project-overlay .tooltip-wrapper) {
    position: relative !important;
    overflow: visible !important;
  }
  
  :global(.project-overlay .tooltip) {
    position: fixed !important;
    z-index: 10000 !important;
    max-width: 400px !important;
    width: auto !important;
  }
  
  /* Ensure all project overlay containers allow tooltips to break out */
  :global(.project-overlay),
  :global(.project-content),
  :global(.project-full-content),
  :global(.project-content-wrapper),
  :global(.project-layout),
  :global(.project-main),
  :global(.project-sidebar),
  :global(.project-content-simple-layout) {
    overflow-x: visible !important;
  }
  
  /* Force tooltips to use fixed positioning to escape all containers */
  :global(.project-overlay .tooltip--right) {
    position: fixed !important;
    left: auto !important;
    right: auto !important;
    top: auto !important;
    transform: none !important;
  }
  
  :global(.project-overlay .tooltip--top) {
    position: fixed !important;
    left: auto !important;
    right: auto !important;
    top: auto !important;
    transform: none !important;
  }
  
  :global(.project-overlay .tooltip--bottom) {
    position: fixed !important;
    left: auto !important;
    right: auto !important;
    top: auto !important;
    transform: none !important;
  }
  
  :global(.project-overlay .tooltip--left) {
    position: fixed !important;
    left: auto !important;
    right: auto !important;
    top: auto !important;
    transform: none !important;
  }
  
  /* Ensure tooltip can extend beyond any container boundaries */
  :global(.project-overlay *) {
    overflow-x: visible !important;
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
