/**
 * Utility for proxying OpenGraph images through our own domain
 * 
 * This helps bypass CORS issues and improves image loading reliability
 * by serving external images through our own domain.
 */

// Define proxy configuration constants directly in this file for now
const PROXY_IMAGE_FIELDS = ['image', 'og_image', 'banner_image', 'portrait_image', 'favicon', 'logo'];
const PROXY_IMAGE_ARRAY_FIELDS = ['images', 'og_images'];

/**
 * Determines if a URL should be proxied
 * @param url The URL to check
 * @returns boolean indicating if the URL should be proxied
 */
export function shouldProxyUrl(url: string | undefined | null): boolean {
  if (!url) return false;
  
  try {
    const urlObj = new URL(url);
    
    // Don't proxy our own domain
    const currentDomain = typeof window !== 'undefined' ? window.location.hostname : '';
    if (urlObj.hostname === currentDomain) return false;
    
    // Don't proxy data URLs
    if (url.startsWith('data:')) return false;
    
    // Don't proxy relative URLs
    if (!url.startsWith('http://') && !url.startsWith('https://')) return false;
    
    return true;
  } catch (e) {
    // If URL parsing fails, don't proxy
    return false;
  }
}

/**
 * Proxies an image URL through our own API endpoint
 * @param url The URL to proxy
 * @returns The proxied URL or original URL if no proxying needed
 */
export function proxyImageUrl(url: string | undefined | null): string {
  // Debug the input URL
  console.log(`[proxyImageUrl] Input URL: ${url}`);
  
  if (!url) {
    console.log('[proxyImageUrl] Empty URL, returning empty string');
    return '';
  }
  
  if (typeof url !== 'string') {
    console.log(`[proxyImageUrl] URL is not a string: ${typeof url}, returning empty string`);
    return '';
  }
  
  if (!url.startsWith('http')) {
    console.log(`[proxyImageUrl] Not an HTTP URL: ${url}, returning as-is`);
    return url;
  }
  
  // Don't proxy data URLs
  if (url.startsWith('data:')) {
    console.log('[proxyImageUrl] Data URL, returning as-is');
    return url;
  }
  
  // Get the base URL for our site
  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : import.meta.env.SITE || 'http://localhost:4323';
  
  // Make sure the URL is properly encoded once (and only once)
  // First decode it in case it's already encoded to prevent double-encoding
  try {
    // Try to decode the URL in case it's already encoded
    const decodedUrl = decodeURIComponent(url);
    // Then encode it properly
    const encodedUrl = encodeURIComponent(decodedUrl);
    
    // Use our own proxy endpoint which internally uses Oxylabs
    const proxiedUrl = `${baseUrl}/api/image-proxy?url=${encodedUrl}`;
    console.log(`[proxyImageUrl] Proxied URL: ${proxiedUrl}`);
    return proxiedUrl;
  } catch (error) {
    // If decoding fails, just encode the original URL
    const encodedUrl = encodeURIComponent(url);
    const proxiedUrl = `${baseUrl}/api/image-proxy?url=${encodedUrl}`;
    console.log(`[proxyImageUrl] Input URL (couldn't decode): ${url}`);
    console.log(`[proxyImageUrl] Proxied URL: ${proxiedUrl}`);
    return proxiedUrl;
  }
}

/**
 * Processes OpenGraph data to proxy all image URLs
 * @param data Object containing OpenGraph data
 * @returns Object with proxied image URLs
 */
export function proxyOpenGraphData<T extends Record<string, any>>(data: T): T {
  if (!data) return data;
  
  const result = { ...data } as Record<string, any>;
  
  // Process each configured image field
  for (const field of PROXY_IMAGE_FIELDS) {
    if (field in result && typeof result[field] === 'string') {
      result[field] = proxyImageUrl(result[field]);
    }
  }
  
  // Handle arrays of images
  for (const arrayField of PROXY_IMAGE_ARRAY_FIELDS) {
    if (arrayField in result && Array.isArray(result[arrayField])) {
      result[arrayField] = result[arrayField].map((img: string) => 
        typeof img === 'string' ? proxyImageUrl(img) : img
      );
    }
  }
  
  return result as T;
}
