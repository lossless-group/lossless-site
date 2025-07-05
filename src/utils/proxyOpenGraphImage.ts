/**
 * Utility for proxying OpenGraph images through our own domain
 * 
 * This helps bypass CORS issues and improves image loading reliability
 * by serving external images through our own domain.
 */

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
 * Proxies an image URL through our own domain
 */
export function proxyImageUrl(url: string | undefined | null): string {
  if (!url) return '';
  if (typeof url !== 'string') return '';
  if (!url.startsWith('http')) return url;
  
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:4321';
  return `${baseUrl}/api/image-proxy?url=${encodeURIComponent(url)}`;
}

import { PROXY_IMAGE_FIELDS, PROXY_IMAGE_ARRAY_FIELDS } from './proxyConfig';

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
