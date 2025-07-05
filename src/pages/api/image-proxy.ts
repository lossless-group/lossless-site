import type { APIRoute } from 'astro';
import fetch from 'node-fetch';
import { PROXY_CONFIG } from '../../utils/proxyConfig';

/**
 * Image proxy endpoint for OpenGraph images
 * 
 * This endpoint proxies images from external sources through our own domain,
 * which helps bypass CORS issues and improves image loading reliability.
 */
export const GET: APIRoute = async ({ request }) => {
  const requestId = Math.random().toString(36).substring(2, 10);
  
  const url = new URL(request.url);
  const imageUrl = url.searchParams.get('url');
  
  if (!imageUrl) {
    console.log(`[ImageProxy:${requestId}] Warning: Missing URL parameter, returning transparent pixel`);
    
    const transparentPixel = 'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    return new Response(Buffer.from(transparentPixel, 'base64'), {
      status: 200,
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'public, max-age=31536000', 
        'X-Content-Type-Options': 'nosniff'
      }
    });
  }
  
  console.log(`[ImageProxy:${requestId}] Request received for: ${imageUrl.substring(0, 100)}${imageUrl.length > 100 ? '...' : ''}`);
  

  try {
    // Decode the URL (it should be encoded when passed to this endpoint)
    const decodedUrl = decodeURIComponent(imageUrl);
    console.log(`[ImageProxy:${requestId}] Fetching image from: ${decodedUrl.substring(0, 100)}${decodedUrl.length > 100 ? '...' : ''}`);
    
    // Fetch the image with retry logic
    let response;
    let attempts = 0;
    const maxAttempts = PROXY_CONFIG.maxRetryAttempts;
    
    while (attempts < maxAttempts) {
      attempts++;
      try {
        response = await fetch(decodedUrl, {
          headers: {
            // Set a user agent to avoid being blocked
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
            // Referrer policy to help with some sites that check referrer
            'Referer': new URL(request.url).origin,
            // Accept headers to indicate we accept images
            'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9'
          },
          // Set timeout from config
          timeout: PROXY_CONFIG.fetchTimeout
        });
        
        // If successful, break out of retry loop
        break;
      } catch (fetchError) {
        if (attempts >= maxAttempts) {
          // Rethrow if we've exhausted our attempts
          throw fetchError;
        }
        console.warn(`[ImageProxy:${requestId}] Fetch attempt ${attempts} failed, retrying...`, fetchError.message);
        // Wait before retrying (500ms)
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    if (!response || !response.ok) {
      const status = response?.status || 500;
      const statusText = response?.statusText || 'Unknown Error';
      console.error(`[ImageProxy:${requestId}] Error fetching image: ${status} ${statusText}`);
      
      // Return a fallback image or error response
      return new Response(`Failed to fetch image: ${status} ${statusText}`, { 
        status: status,
        headers: {
          'Content-Type': 'text/plain',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-cache'
        }
      });
    }

    // Get the content type from the response
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    console.log(`[ImageProxy:${requestId}] Successfully fetched image, content-type: ${contentType}`);
    
    // Get the image data
    const imageData = await response.arrayBuffer();
    
    // Return the image with appropriate headers
    return new Response(imageData, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': `public, max-age=${PROXY_CONFIG.cacheDuration}`, // Cache based on config
        'Access-Control-Allow-Origin': '*', // Allow any site to use this proxy
        'Timing-Allow-Origin': '*', // Allow timing info to be shared
        'X-Content-Type-Options': 'nosniff', // Prevent MIME type sniffing
        'X-Proxy-Request-Id': requestId // Add request ID for debugging
      }
    });
  } catch (error) {
    console.error(`[ImageProxy:${requestId}] Error proxying image:`, error);
    return new Response(`Error proxying image: ${error.message}`, { 
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache'
      }
    });
  }
}
