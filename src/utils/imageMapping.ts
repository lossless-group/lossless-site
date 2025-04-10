/**
 * Image Mapping Utility
 * 
 * This utility provides simple image objects with src/alt properties
 * without requiring any Astro image processing or metadata.
 */

/**
 * Get a placeholder image for a given path
 * Used as fallback when local images can't be loaded
 * 
 * @param {string} imagePath - Path from data source (JSON, etc.)
 * @param {string} title - Title to use for alt text
 * @returns {Object} Simple image object with src and alt
 */
function getPlaceholderImage(imagePath: string, title: string): { src: string; alt: string } {
  // Create a themed placeholder based on the path
  let color = '3a506b'; // Default blue
  
  if (imagePath.includes('Notebook')) {
    color = '3a506b'; // Blue for notebook
  } else if (imagePath.includes('Collaborative')) {
    color = '506b3a'; // Green for collaboration
  } else if (imagePath.includes('AI')) {
    color = '6b3a50'; // Purple for AI
  }
  
  // Return a placeholder image
  return {
    src: `https://via.placeholder.com/1200x800/${color}/ffffff.png?text=${encodeURIComponent(title || 'Image')}`,
    alt: title
  };
}

/**
 * Get the appropriate image object for a given path
 * 
 * @param {string} imagePath - Path from data source (JSON, etc.)
 * @param {string} title - Title to use for alt text and fallback
 * @returns {Object} Simple image object with src and alt
 */
export function getImageForPath(imagePath: string, title: string = ''): { src: string; alt: string } {
  // Check if it's a remote URL
  if (imagePath.startsWith('http')) {
    return {
      src: imagePath,
      alt: title
    };
  }
  
  // For the specific Warp Notebooks image, use a direct mapping
  if (imagePath.includes('Screenshot 2025-03-30 at 11.42.35 AM_Warp--Notebooks.png')) {
    // Using a relative path that works in the browser
    return {
      src: '/assets/Representations/Screenshot 2025-03-30 at 11.42.35 AM_Warp--Notebooks.png',
      alt: title
    };
  }
  
  // For other local images, use a placeholder for now
  console.warn(`Using placeholder for local image: ${imagePath}`);
  return getPlaceholderImage(imagePath, title);
}
