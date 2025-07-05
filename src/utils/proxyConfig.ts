/**
 * Configuration for the OpenGraph image proxy service
 * 
 * This file contains settings that control how the image proxy service works,
 * including which fields should be proxied and any other proxy-related settings.
 */

/**
 * List of field names that should be checked for image URLs to proxy
 * 
 * These field names are used in the proxyOpenGraphData function to determine
 * which fields in an object should have their URLs proxied.
 */
export const PROXY_IMAGE_FIELDS = [
  // OpenGraph standard fields
  'og_image',
  'og_image_url',
  'og_screenshot_url',
  
  // Other common image fields
  'favicon',
  'image',
  'banner_image',
  'portrait_image',
  'thumbnail',
  'logo',
  'hero_image',
  'cover_image',
  'preview_image',
  'icon',
  'avatar',
  
  // Add any additional fields that might contain image URLs here
];

/**
 * List of array field names that might contain image URLs
 * 
 * These field names are used to check for arrays of image URLs that should be proxied.
 */
export const PROXY_IMAGE_ARRAY_FIELDS = [
  'og_images',
  'images',
  'screenshots',
  'thumbnails',
  // Add any additional array fields that might contain image URLs here
];

/**
 * Configuration for the proxy service
 */
export const PROXY_CONFIG = {
  // Cache duration in seconds (24 hours)
  cacheDuration: 86400,
  
  // Maximum number of retry attempts for failed image fetches
  maxRetryAttempts: 2,
  
  // Timeout for image fetch requests in milliseconds
  fetchTimeout: 10000,
  
  // Whether to attempt direct URL if proxy fails (client-side fallback)
  tryDirectUrlOnProxyFailure: true
};
