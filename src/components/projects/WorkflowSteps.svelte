<script lang="ts">
  export let steps: Array<{
    href: string;
    title: string;
    step?: number;
    type?: string;
  }> = [];
  export let currentHref: string = '';
  export let title: string = 'Workflow Steps';

  const sequentialSteps = steps.filter(step => step.type === 'sequential');
</script>

<div class="workflow-section">
  <h3 class="section-header">{title}</h3>
  <div class="tree-nav">
    {#each sequentialSteps as step, i}
      <div class={currentHref === step.href ? 'active-cluster' : ''}>
        {#if currentHref === step.href}
          <span class="cluster-bracket" aria-hidden="true"></span>
        {/if}
        <a href={step.href} class="tree-link tree-link--sequential{currentHref === step.href ? ' tree-link--active' : ''}">
          <span class="chip">{String(i + 1).padStart(2, '0')}</span>
          <span class="tree-text">{step.title}</span>
        </a>
      </div>
    {/each}
  </div>
</div>

<style>
  .workflow-section { 
    position: relative;
  }

  .section-header {
    font-size: 0.85rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--clr-lossless-accent--brightest, #04e5e5);
    margin-bottom: 0.75rem;
    padding-bottom: 0.25rem;
    border-bottom: 1px solid color-mix(in oklab, var(--clr-lossless-primary-light, #e0f2f1), transparent 70%);
  }

  /* Tree navigation base styles */
  .tree-nav { 
    list-style: none; 
    padding-left: 0; 
    margin: 0; 
  }
  
  .tree-nav div + div { 
    margin-top: 0.35rem; 
  }

  /* Links - clean implementation */
  .tree-link { 
    display: flex !important; 
    align-items: center !important; 
    gap: 0.6rem !important; 
    padding: 0.2rem 0.3rem 0.2rem 0.55rem !important; 
    border-radius: 0.35rem !important; 
    color: var(--clr-heading, #04e5e5) !important; 
    text-decoration: none !important; 
    position: relative !important; 
    transition: color 150ms ease, box-shadow 150ms ease, background 150ms ease !important;
    list-style: none !important;
    list-style-type: none !important;
  }
  
  .tree-link .tree-text { 
    flex: 1 1 auto; 
    min-width: 0; 
    line-height: 1.35; 
  }
  
  .tree-link .chip { 
    flex: 0 0 auto; 
    background: color-mix(in oklab, var(--clr-lossless-accent--brightest, #04e5e5), transparent 85%);
    color: var(--clr-lossless-accent--brightest, #04e5e5);
    padding: 0.15rem 0.4rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    font-weight: 600;
    border: 1px solid color-mix(in oklab, var(--clr-lossless-accent--brightest, #04e5e5), transparent 60%);
  }
  
  .tree-link:hover { 
    color: var(--clr-heading, #04e5e5) !important; 
    background: color-mix(in oklab, var(--clr-lossless-primary-glass, rgba(224, 242, 241, 0.4)), transparent 80%) !important; 
  }
  
  .tree-link:focus-visible { 
    outline: 2px solid color-mix(in oklab, var(--clr-lossless-accent--brightest, #04e5e5), transparent 25%); 
    outline-offset: 2px; 
  }
  
  .tree-link--active { 
    color: var(--clr-lossless-accent--brightest, #04e5e5) !important; 
    font-weight: 700; 
    box-shadow: inset 3px 0 0 var(--clr-lossless-accent--brightest, #04e5e5); 
  }

  /* Active cluster styling */
  .active-cluster { 
    position: relative; 
    padding-left: 0.25rem; 
  }
  
  .active-cluster .cluster-bracket { 
    position: absolute; 
    left: -0.5rem; 
    top: -0.1rem; 
    bottom: -0.1rem; 
    width: 0.35rem; 
    border-left: 3px solid var(--clr-lossless-accent--brightest, #04e5e5); 
    border-top-left-radius: 10px; 
    border-bottom-left-radius: 10px; 
    opacity: 0.95; 
  }
</style>
