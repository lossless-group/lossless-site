<script lang="ts">
  import { onMount } from 'svelte';
  import TagCloud from './TagCloud.svelte';

  // Tool interface matching the Astro component
  interface Tool {
    id?: string;
    slug?: string;
    title?: string;
    lede?: string;
    description?: string;
    banner_image: string;
    url: string;
    tags: string[];
    collection: string;
    site_name?: string;
    zinger?: string;
    og_title?: string;
    og_description?: string;
    image?: string;
    og_image?: string;
    og_image_url?: string;
    favicon?: string;
    description_site_cp?: string;
    filename?: string;
    og_screenshot_url?: string;
  }

  // Props
  export let tool: Tool;
  export let highlightTags: string[] = [];
  export let small: boolean = false;

  // Utility functions (simplified versions of the Astro utils)
  function filterTitle(title: string, siteName: string): string {
    const titleStr = String(title || '');
    const siteNameStr = String(siteName || '');
    
    if (!titleStr || !siteNameStr) return titleStr;
    
    const separators = ['|', '-', ':', '•', '—', '–'];
    const separatorPattern = separators.map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    const separatorRegex = new RegExp(`\\s*(${separatorPattern})\\s*`);
    let cleanTitle = titleStr;

    const siteNameParts = siteNameStr.split(separatorRegex).filter(Boolean);
    
    siteNameParts.forEach(part => {
        const escapedPart = part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        cleanTitle = cleanTitle.replace(new RegExp(`^${escapedPart}\\s*(${separatorPattern})\\s*`), '');
        cleanTitle = cleanTitle.replace(new RegExp(`\\s*(${separatorPattern})\\s*${escapedPart}$`), '');
    });
    
    return cleanTitle.trim();
  }

  function getEffectiveSiteName(site_name?: string, filename?: string, url?: string): string {
    if (site_name) return site_name;
    if (filename) return filename.replace(/\.md$/, '');
    if (url) {
      try {
        const urlObj = new URL(url);
        return urlObj.hostname.replace(/^www\./, '');
      } catch {
        return url;
      }
    }
    return '';
  }

  function toProperCase(str: string): string {
    return str
      .replace(/[-_]/g, ' ')
      .split(' ')
      .filter(word => word.length > 0)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  function getReferenceSlug(filename: string): string {
    if (!filename) {
      throw new Error("Blank or improper filename passed to the getReferenceSlug function");
    }
    
    const parts = filename.split('/');
    const slugifiedParts = parts.map(p => p.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''));
    return slugifiedParts.join('/');
  }

  // Computed values
  $: safeTags = tool.tags || [];
  $: effectiveFilename = tool.filename || (tool.slug ? tool.slug.split('/').pop()?.replace(/\.md$/, '') : undefined);
  $: effectiveSiteName = toProperCase(getEffectiveSiteName(tool.site_name || effectiveFilename));
  $: effectiveTitle = tool.zinger || tool.title || tool.og_title || "";
  $: displayTitle = effectiveTitle ? filterTitle(effectiveTitle, effectiveSiteName || "") : "";

  // Description handling
  $: hasDescriptionSiteCp = tool.description_site_cp !== undefined && 
                           tool.description_site_cp !== null && 
                           tool.description_site_cp.trim() !== "";
  $: hasDescription = tool.description !== undefined && 
                     tool.description !== null && 
                     tool.description.trim() !== "";
  $: hasOgDescription = tool.og_description && tool.og_description.trim() !== '';
  $: effectiveDescription = hasDescriptionSiteCp ? tool.description_site_cp :
                           hasDescription ? tool.description :
                           hasOgDescription ? tool.og_description : '';

  // Generate toolkit path
  $: toolkitPath = `/toolkit/${getReferenceSlug(tool.id)}`;

  // Image handling
  $: primaryImage = tool.image || tool.banner_image || tool.og_image || tool.og_image_url;
  $: fallbackImage = tool.og_screenshot_url;
  $: hasImage = primaryImage || fallbackImage;

  let imageElement: HTMLImageElement;
  let imageContainer: HTMLElement;

  onMount(() => {
    if (imageElement) {
      const handleImageError = () => {
        if (imageElement.src === primaryImage && fallbackImage) {
          console.log("Primary image failed to load, falling back to screenshot URL");
          imageElement.src = fallbackImage;
          
          const handleFallbackError = () => {
            console.log("Screenshot image also failed to load, hiding image container");
            if (imageContainer) imageContainer.style.display = "none";
          };
          
          imageElement.addEventListener("error", handleFallbackError, { once: true });
        } else {
          console.log("Image failed to load and no fallback available, hiding image container");
          if (imageContainer) imageContainer.style.display = "none";
        }
      };
      
      imageElement.addEventListener("error", handleImageError, { once: true });
    }
  });
</script>

<div class={`tool-card card card-hover-effect${small ? ' small' : ''}`} data-tags={JSON.stringify(safeTags)}>
  <div class="content-wrapper">
    {#if hasImage}
      <div class="tool-card-image" bind:this={imageContainer}>
        <img
          bind:this={imageElement}
          src={primaryImage || fallbackImage}
          alt={displayTitle}
          data-primary-image={primaryImage}
          data-screenshot-url={fallbackImage}
          loading="lazy"
          decoding="async"
        />
      </div>
    {/if}
    
    <div class="tool-card__header">
      <div class="tool-card__site-name">
        <a href={tool.url} target="_blank" rel="noopener noreferrer">
          <h2><span class="text-wrapper">{effectiveSiteName}</span></h2>
        </a>
      </div>
      <h4><span class="text-wrapper">{displayTitle}</span></h4>
    </div>

    {#if !small && effectiveDescription}
      <p class="tool-description">
        <span class="description-text">{effectiveDescription}</span>
      </p>
    {/if}

    {#if !small}
      <div class="tool-card__footer">
        <TagCloud tags={safeTags} {highlightTags} />
      </div>
    {/if}

    {#if !small}
      <div class="tool-card__cta">
        <a 
          href={toolkitPath} 
          class="tool-thoughts-cta text-cta"
        >
          Our Thoughts
          <span class="arrow">→</span>
        </a>
      </div>
    {/if}
  </div>
</div>

<style>
  .tool-card {
    background: color-mix(
      in oklab,
      var(--clr-lossless-primary-glass),
      var(--clr-lossless-primary-dark) 90%
    );
    border: 1px solid var(--clr-lossless-ui-btn-border);
    color: aliceblue;
    padding: 0.15em;
    border-radius: 1em;
    height: 100%;
    display: flex;
    flex-direction: column;
    max-width: 100%;
    max-height: 100%;
    margin-bottom: 2px;
    box-sizing: border-box;
    opacity: 1;
    transform: translateY(0);
    transition: opacity 300ms ease, transform 300ms ease, box-shadow 300ms ease;
    will-change: opacity, transform, box-shadow;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    min-width: 0;
    flex-shrink: 1;
  }

  .tool-card.fade-in {
    animation: fadeInUp 400ms ease forwards;
  }

  .tool-card.fade-out {
    animation: fadeOutDown 300ms ease forwards;
    pointer-events: none;
  }

  .tool-card h2 {
    font-size: var(--fs-500);
    font-weight: var(--fw-bold);
    margin-bottom: 0.25em;
  }

  .tool-card .content-wrapper {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    flex-grow: 1;
    height: 100%;
    width: 100%;
    padding: 0.5em;
    box-sizing: border-box;
  }

  .tool-card-image {
    border-radius: 8px 8px 0 0;
    overflow: hidden;
    margin-bottom: 0.5em;
    max-height: 180px;
    flex-shrink: 0;
  }

  .tool-card-image img {
    width: 100%;
    height: 100%;
    max-height: 180px;
    object-fit: cover;
    border-radius: 0.5em;
    transition: transform 0.3s ease-in-out;
  }

  .tool-card:hover .tool-card-image img {
    transform: scale(1.1);
  }

  .tool-card__header {
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 0.5em;
    margin-bottom: 0.5em;
  }

  .tool-card__site-name {
    display: inline-flex;
    align-items: center;
    gap: 0.5em;
    width: 100%;
  }

  .tool-card__site-name h2 {
    margin: 0;
    line-height: 1;
    width: 100%;
    overflow: hidden;
  }

  .tool-card__site-name a {
    color: inherit;
    text-decoration: none;
    width: 100%;
  }

  .tool-card__site-name a:hover {
    color: var(--clr-lossless-accent--brightest);
  }

  .tool-card h4 {
    color: var(--clr-heading);
    font-size: var(--fs-350);
    margin: 0;
    flex-grow: 1;
  }

  .tool-description {
    color: var(--clr-body);
    font-family: var(--ff-legible);
    font-weight: var(--fw-regular);
    font-size: var(--fs-300);
    margin-bottom: 0.5em;
    flex-grow: 1;
    width: 100%;
    max-width: 100%;
    word-wrap: break-word;
    word-break: break-word;
    hyphens: auto;
    overflow-wrap: break-word;
    overflow: hidden;
    display: -webkit-box;
    line-clamp: 3;
    -webkit-box-orient: vertical;
  }

  .description-text {
    display: inline-block;
    width: 100%;
    white-space: normal;
  }

  .text-wrapper {
    display: inline-block;
    width: 100%;
    white-space: normal;
    word-wrap: break-word;
    word-break: break-word;
    overflow-wrap: break-word;
    hyphens: auto;
  }
  
  .tool-card h2, 
  .tool-card h4 {
    width: 100%;
    max-width: 100%;
    word-wrap: break-word;
    word-break: break-word;
    overflow-wrap: break-word;
    hyphens: auto;
  }
  
  .tool-card h4 {
    color: var(--clr-heading);
    font-size: var(--fs-350);
    margin: 0;
    flex-grow: 1;
  }

  .tool-card__footer {
    display: flex;
    flex-direction: column;
    gap: 0.75em;
    margin-top: 0.5em;
  }

  .tool-card__cta {
    display: flex;
    justify-content: flex-end;
    width: 100%;
  }

  .tool-thoughts-cta {
    margin-top: 0.25em;
    color: var(--clr-lossless-accent--brightest);
    text-decoration: none;
    font-size: var(--fs-300);
    font-weight: var(--fw-medium);
    display: inline-flex;
    align-items: center;
    gap: 0.5em;
    transition: all 0.2s ease;
  }

  .tool-thoughts-cta:hover {
    color: var(--clr-white);
    transform: translateX(2px);
  }

  .arrow {
    transition: transform 0.2s ease;
  }

  .tool-thoughts-cta:hover .arrow {
    transform: translateX(3px);
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fadeOutDown {
    from {
      opacity: 1;
      transform: translateY(0);
    }
    to {
      opacity: 0;
      transform: translateY(20px);
    }
  }

  .tool-card.small {
    height: 200px !important;
    max-height: 200px !important;
    min-height: 200px !important;
    flex: unset !important;
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
    overflow: hidden !important;
  }

  .tool-card.small .content-wrapper {
    height: 100% !important;
    flex-grow: 0 !important;
    padding: 0 !important;
    display: flex !important;
    flex-direction: column !important;
  }

  .tool-card.small .tool-card__footer,
  .tool-card.small .tool-card__cta,
  .tool-card.small .tool-description {
    display: none !important;
  }

  .tool-card.small .tool-card-image {
    height: 50% !important;
    max-height: 50% !important;
    margin-bottom: 0 !important;
    border-radius: 0.5em 0.5em 0 0 !important;
    flex-shrink: 0 !important;
    display: flex !important;
    align-items: stretch !important;
  }

  .tool-card.small .tool-card-image img {
    height: 100% !important;
    max-height: 100% !important;
    width: 100% !important;
    object-fit: cover !important;
    border-radius: 0.5em 0.5em 0 0 !important;
    flex: 1 !important;
    display: block !important;
    margin: 0 !important;
  }

  .tool-card.small .tool-card__header {
    padding: 0.4em 0.5em 0.5em 0.5em !important;
    margin-bottom: 0 !important;
    flex-grow: 1 !important;
    display: flex !important;
    flex-direction: column !important;
    justify-content: center !important;
  }

  /* Responsive styles for better adaptation to smaller widths */
  @media (max-width: 1024px) {
    .tool-card {
      padding: 0.1em;
    }
    
    .tool-card .content-wrapper {
      padding: 0.4em;
    }
    
    .tool-card-image img {
      height: 160px;
    }
    
    .tool-card h2 {
      font-size: var(--fs-400);
    }
    
    .tool-card h4 {
      font-size: var(--fs-300);
    }
    
    .tool-description {
      font-size: var(--fs-250);
    }
  }

  @media (max-width: 768px) {
    .tool-card-image img {
      height: 140px;
    }
    
    .tool-card h2 {
      font-size: var(--fs-350);
    }
    
    .tool-card h4 {
      font-size: var(--fs-250);
    }
    
    .tool-description {
      font-size: var(--fs-200);
    }
  }

  @media (max-width: 480px) {
    .tool-card-image img {
      height: 120px;
    }
    
    .tool-card h2 {
      font-size: var(--fs-300);
    }
    
    .tool-card h4 {
      font-size: var(--fs-200);
    }
    
    .tool-description {
      font-size: var(--fs-150);
    }
  }

  /* When sidebar is expanded (hover state on desktop) */
  @media (min-width: 1025px) {
    .toolkit-layout:has(.sidebar:hover) .tool-card {
      padding: 0.1em;
    }
    
    .toolkit-layout:has(.sidebar:hover) .tool-card .content-wrapper {
      padding: 0.4em;
    }
    
    .toolkit-layout:has(.sidebar:hover) .tool-card-image img {
      height: 160px;
    }
    
    .toolkit-layout:has(.sidebar:hover) .tool-card h2 {
      font-size: var(--fs-400);
    }
    
    .toolkit-layout:has(.sidebar:hover) .tool-card h4 {
      font-size: var(--fs-300);
    }
    
    .toolkit-layout:has(.sidebar:hover) .tool-description {
      font-size: var(--fs-250);
    }
  }
</style>