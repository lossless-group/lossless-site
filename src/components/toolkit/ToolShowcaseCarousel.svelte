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

  function getBannerImage(tool: any): string | null {
    return tool.og_image || tool.image || tool.og_screenshot || tool.og_screenshot_url || null;
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
    margin: 1.5rem 0;
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

  .tool-showcase-wide .company-header {
    position: relative;
    background: rgba(255, 255, 255, 0.05) !important;
    border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
    padding: 0.5rem 0.5rem 0.5rem 1rem !important;
    z-index: 2;
    display: flex !important;
    align-items: flex-start !important;
    gap: 0.25rem !important;
    min-height: 60px;
    box-sizing: border-box !important;
  }

  .tool-showcase-wide .banner-container + .company-header {
    margin-top: -30px !important;
    background: rgba(0, 0, 0, 0.4) !important;
    backdrop-filter: blur(15px) !important;
    border-top: none !important;
    border-radius: 0 0 12px 12px !important;
  }

  .tool-showcase-wide .company-info {
    display: flex !important;
    align-items: center !important;
    gap: 0.75rem !important;
    flex: 1 !important;
    min-width: 0 !important;
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

  .tool-showcase-wide .company-details {
    flex: 1 !important;
    min-width: 0 !important;
    display: flex !important;
    gap: 0.5rem !important;
    align-items: flex-start !important;
    width: 100% !important;
    justify-content: flex-start !important;
    padding: 0 !important;
    margin: 0 !important;
  }

  .tool-showcase-wide .company-left {
    flex: 0 1 auto !important;
    min-width: 0 !important;
    overflow: hidden !important;
    max-width: 40% !important;
    display: flex !important;
    flex-direction: column !important;
    margin-right: 0.5rem !important;
  }

  .tool-showcase-wide .company-right {
    flex: 1 1 auto !important;
    min-width: 0 !important;
    max-width: 60% !important;
    display: flex !important;
    flex-direction: column !important;
    padding: 0 0.5rem !important;
  }

  .tool-showcase-wide .company-name {
    font-size: 1.25rem !important;
    font-weight: 600 !important;
    color: white !important;
    margin: 0 0 0.25rem 0 !important;
    line-height: 1.3 !important;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3) !important;
    display: -webkit-box !important;
    -webkit-line-clamp: 2 !important;
    -webkit-box-orient: vertical !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    max-height: 3.2em !important;
    width: 100% !important;
    font-family: inherit !important;
  }

  .tool-showcase-wide .company-url {
    color: var(--clr-lossless-accent--bright) !important;
    text-decoration: none !important;
    font-size: 0.9rem !important;
    font-weight: 500 !important;
    opacity: 0.9 !important;
    transition: all 0.2s ease !important;
    word-break: break-all !important;
    font-family: inherit !important;
    display: inline-block !important;
  }

  .company-url:hover {
    color: var(--clr-lossless-accent--brightest);
    opacity: 1;
    text-decoration: underline;
  }

  .tool-showcase-wide .company-description {
    font-size: 0.75rem !important;
    color: rgba(255, 255, 255, 0.8) !important;
    line-height: 1.3 !important;
    margin: 0 !important;
    padding: 0 !important;
    font-family: inherit !important;
    width: 100% !important;
    max-width: 100% !important;
    box-sizing: border-box !important;
    display: block !important;
    word-wrap: break-word !important;
    overflow-wrap: break-word !important;
  }

  /* Carousel chevrons */
  .carousel-chevron {
    background: rgba(0, 0, 0, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--clr-lossless-primary-light);
    cursor: pointer;
    transition: all 0.2s ease;
    flex-shrink: 0;
    margin: 0 0.25rem !important;
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
    margin: 0.5rem 0 0 0;
    padding: 0.25rem 0;
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
  @media (max-width: 768px) {
    .tool-showcase-wide .company-header {
      padding: 0.75rem !important;
    }

    .tool-showcase-wide .company-icon {
      width: 32px !important;
      height: 32px !important;
    }

    .tool-showcase-wide .carousel-chevron {
      width: 28px !important;
      height: 28px !important;
      margin-top: 0.25rem !important;
    }

    .tool-showcase-wide .company-name {
      font-size: 1.1rem !important;
    }

    .tool-showcase-wide .company-url {
      font-size: 0.85rem !important;
    }

    .tool-showcase-wide .company-description {
      font-size: 0.85rem !important;
    }

    .tool-showcase-wide .company-info {
      gap: 0.5rem !important;
    }

    .tool-showcase-wide .company-details {
      flex-direction: column !important;
      gap: 0.75rem !important;
    }

    .tool-showcase-wide .company-left {
      max-width: 100% !important;
      width: 100% !important;
    }
    .tool-showcase-wide .company-right {
      max-width: 100% !important;
      width: 100% !important;
      padding: 0 !important;
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