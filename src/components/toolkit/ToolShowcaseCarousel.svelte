<script lang="ts">
  import { onMount } from 'svelte';
  
  export let tools: Array<{
    title: string;
    og_image?: string;
    image?: string;
    og_screenshot?: string;
    og_screenshot_url?: string;
    og_favicon?: string;
    favicon?: string;
    og_title?: string;
    url?: string;
    og_description?: string;
    description_site_cp?: string;
  }> = [];

  let currentSlide = 0;
  let carouselTrack: HTMLElement;
  let touchStartX = 0;
  let isDragging = false;

  function nextSlide() {
    currentSlide = (currentSlide + 1) % tools.length;
    updateSlidePosition();
  }

  function prevSlide() {
    currentSlide = currentSlide === 0 ? tools.length - 1 : currentSlide - 1;
    updateSlidePosition();
  }

  function goToSlide(index: number) {
    currentSlide = index;
    updateSlidePosition();
  }

  function updateSlidePosition() {
    if (carouselTrack) {
      const offset = -currentSlide * 100;
      carouselTrack.style.transform = `translateX(${offset}%)`;
    }
  }

  function handleTouchStart(e: TouchEvent) {
    touchStartX = e.touches[0].clientX;
    isDragging = true;
  }

  function handleTouchMove(e: TouchEvent) {
    if (!isDragging) return;
    e.preventDefault();
  }

  function handleTouchEnd(e: TouchEvent) {
    if (!isDragging) return;
    isDragging = false;

    const endX = e.changedTouches[0].clientX;
    const diffX = touchStartX - endX;

    if (Math.abs(diffX) > 50) {
      if (diffX > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
  }

  function getBannerImage(tool: any) {
    return tool.og_image || tool.image || tool.og_screenshot || tool.og_screenshot_url;
  }

  function getCompanyIcon(tool: any) {
    return tool.og_favicon || tool.favicon;
  }

  function getDisplayTitle(tool: any) {
    return tool.og_title || tool.title;
  }

  function getDescription(tool: any) {
    return tool.og_description || tool.description_site_cp;
  }

  function cleanUrl(url: string) {
    return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
  }

  onMount(() => {
    updateSlidePosition();
  });
</script>

<div class="tool-showcase-carousel">
  {#if tools.length > 0}
    <div class="carousel-container">
      <div 
        class="carousel-track" 
        bind:this={carouselTrack}
        on:touchstart={handleTouchStart}
        on:touchmove={handleTouchMove}
        on:touchend={handleTouchEnd}
      >
        {#each tools as tool, index}
          <div class="carousel-slide" data-slide={index}>
            <div class="tool-showcase-wide">
              {#if getBannerImage(tool)}
                <div class="banner-container">
                  <img 
                    src={getBannerImage(tool)} 
                    alt="{getDisplayTitle(tool)} banner"
                    class="banner-image"
                    loading="lazy"
                  />
                  <div class="banner-overlay"></div>
                </div>
              {/if}
              
              <div class="company-header">
                <button 
                  class="carousel-chevron carousel-left" 
                  aria-label="Previous item"
                  on:click={prevSlide}
                  style="display: {tools.length > 1 ? 'flex' : 'none'}"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="15,18 9,12 15,6"></polyline>
                  </svg>
                </button>
                
                <div class="company-info">
                  {#if getCompanyIcon(tool)}
                    <div class="company-icon">
                      <img 
                        src={getCompanyIcon(tool)} 
                        alt="{getDisplayTitle(tool)} logo"
                        class="icon-image"
                        loading="lazy"
                      />
                    </div>
                  {/if}
                  
                  <div class="company-details">
                    <div class="company-left">
                      <h3 class="company-name">{getDisplayTitle(tool)}</h3>
                      {#if tool.url}
                        <a href={tool.url} target="_blank" rel="noopener noreferrer" class="company-url">
                          {cleanUrl(tool.url)}
                        </a>
                      {/if}
                    </div>
                    {#if getDescription(tool)}
                      <div class="company-right">
                        <p class="company-description">{getDescription(tool)}</p>
                      </div>
                    {/if}
                  </div>
                </div>
                
                <button 
                  class="carousel-chevron carousel-right" 
                  aria-label="Next item"
                  on:click={nextSlide}
                  style="display: {tools.length > 1 ? 'flex' : 'none'}"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9,18 15,12 9,6"></polyline>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        {/each}
      </div>
      
      {#if tools.length > 1}
        <div class="carousel-indicators">
          {#each tools as _, index}
            <button 
              class="carousel-dot"
              class:active={index === currentSlide}
              on:click={() => goToSlide(index)}
              aria-label="Go to tool {index + 1}"
            ></button>
          {/each}
        </div>
      {/if}
    </div>
  {:else}
    <div class="tool-showcase-empty">
      <p>No tools found in showcase</p>
    </div>
  {/if}
</div>

<style>
  .tool-showcase-carousel {
    position: relative;
    margin: 2rem 0;
    width: 100%;
  }

  .carousel-container {
    position: relative;
    overflow: hidden;
    border-radius: 12px;
  }

  .carousel-track {
    display: flex;
    transition: transform 0.3s ease;
    width: 100%;
  }

  .carousel-slide {
    flex: 0 0 100%;
    width: 100%;
  }

  /* Tool showcase styling (copied from ToolShowcaseItem--Wide-Responsive) */
  .tool-showcase-wide {
    position: relative;
    width: 100%;
    border-radius: 12px;
    overflow: hidden;
    background: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    transition: all 0.3s ease;
  }

  .tool-showcase-wide:hover {
    border-color: var(--clr-lossless-accent--brightest);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
  }

  .banner-container {
    position: relative;
    width: 100%;
    overflow: hidden;
  }

  .banner-image {
    width: 100%;
    height: auto;
    display: block;
  }

  .banner-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.1) 0%,
      rgba(0, 0, 0, 0.3) 70%,
      rgba(0, 0, 0, 0.6) 100%
    );
  }

  .company-header {
    position: relative;
    background: rgba(255, 255, 255, 0.05);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    padding: 1rem;
    z-index: 2;
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .banner-container + .company-header {
    margin-top: -30px;
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(15px);
    border-top: none;
    border-radius: 0 0 12px 12px;
  }

  .company-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex: 1;
  }

  .company-icon {
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    border-radius: 8px;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }

  .company-icon:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: var(--clr-lossless-accent--brightest);
    transform: translateY(-2px);
  }

  .icon-image {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .company-details {
    flex: 1;
    min-width: 0;
    display: flex;
    gap: 3rem;
    align-items: flex-start;
  }

  .company-left {
    flex: 0 0 auto;
    min-width: 0;
  }

  .company-right {
    flex: 1;
    min-width: 0;
    max-width: 45%;
  }

  .company-name {
    font-size: 1.25rem;
    font-weight: 600;
    color: white;
    margin: 0 0 0.25rem 0;
    line-height: 1.2;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  .company-url {
    color: var(--clr-lossless-primary-light);
    text-decoration: none;
    font-size: 1rem;
    font-weight: 500;
    opacity: 0.8;
    transition: all 0.2s ease;
  }

  .company-url:hover {
    color: var(--clr-lossless-accent--brightest);
    opacity: 1;
    text-decoration: underline;
  }

  .company-description {
    font-size: 0.9rem;
    color: var(--clr-lossless-primary-light);
    opacity: 0.9;
    line-height: 1.4;
    margin: 0;
    max-width: none;
  }

  /* Carousel chevrons */
  .carousel-chevron {
    background: rgba(0, 0, 0, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--clr-lossless-primary-light);
    cursor: pointer;
    transition: all 0.2s ease;
    flex-shrink: 0;
  }

  .carousel-chevron:hover {
    background: rgba(0, 0, 0, 0.8);
    border-color: var(--clr-lossless-accent--brightest);
    color: var(--clr-lossless-accent--brightest);
    transform: scale(1.1);
  }

  .carousel-chevron:active {
    transform: scale(0.95);
  }

  .carousel-indicators {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    margin-top: 1rem;
  }

  .carousel-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.3);
    background: transparent;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .carousel-dot.active,
  .carousel-dot:hover {
    background: var(--clr-lossless-accent--brightest);
    border-color: var(--clr-lossless-accent--brightest);
  }

  .tool-showcase-empty {
    padding: 2rem;
    text-align: center;
    background: rgba(255, 0, 0, 0.1);
    border: 1px solid rgba(255, 0, 0, 0.3);
    border-radius: 12px;
    color: var(--clr-lossless-primary-light);
  }

  /* Mobile adjustments */
  @media (max-width: 640px) {
    .company-header {
      padding: 0.75rem;
    }

    .company-icon {
      width: 32px;
      height: 32px;
    }

    .company-name {
      font-size: 1.1rem;
    }

    .company-url {
      font-size: 0.9rem;
    }

    .company-description {
      font-size: 0.85rem;
    }

    .company-info {
      gap: 0.5rem;
    }

    .company-details {
      flex-direction: column;
      gap: 0.75rem;
    }

    .company-right {
      max-width: none;
    }

    .carousel-chevron {
      width: 32px;
      height: 32px;
    }
  }

  @media (max-width: 480px) {
    .carousel-chevron {
      display: none;
    }
  }
</style>