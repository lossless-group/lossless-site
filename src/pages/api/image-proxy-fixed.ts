import type { APIRoute } from 'astro';
import fetch from 'node-fetch';
import { HttpsProxyAgent } from 'https-proxy-agent';

// Oxylabs proxy configuration
const PROXY_HOST = 'dc.oxylabs.io';
const PROXY_PORT = 8000;
const PROXY_USERNAME = 'user-losslessgroupsite_KInfm-country-US';
const PROXY_PASSWORD = 'LSLG~Hi5olDontLose';

// Proxy configuration
const PROXY_CONFIG = {
  fetchTimeoutMs: 10000,
  maxRetryAttempts: 3,
  cacheDurationSeconds: 31536000 // 1 year
};

/**
 * Image proxy endpoint for OpenGraph images
 * 
 * This endpoint proxies images from external sources through our own domain,
 * which helps bypass CORS issues and improves image loading reliability.
 * Uses Oxylabs datacenter proxies for better reliability and to avoid IP blocks.
 */
export const GET: APIRoute = async ({ request }) => {
  const requestId = Math.random().toString(36).substring(2, 10);
  
  // Extract URL parameter using regex for maximum reliability
  const urlString = request.url;
  const urlMatch = urlString.match(/[?&]url=([^&]+)/);
  let imageUrl = urlMatch ? decodeURIComponent(urlMatch[1]) : null;
  
  console.log(`[ImageProxy:${requestId}] Raw request URL: ${request.url}`);
  console.log(`[ImageProxy:${requestId}] Extracted URL parameter: ${imageUrl}`);
  
  // Return transparent pixel if no URL parameter
  if (!imageUrl) {
    console.log(`[ImageProxy:${requestId}] Missing URL parameter, returning transparent pixel`);
    return getTransparentPixelResponse();
  }
  
  // Sanitize URL - remove quotes, angle brackets, whitespace
  const originalUrl = imageUrl;
  imageUrl = imageUrl.trim();
  imageUrl = imageUrl.replace(/^['"<>]+|['"<>]+$/g, '');
  
  if (originalUrl !== imageUrl) {
    console.log(`[ImageProxy:${requestId}] URL sanitized from: ${originalUrl}`);
    console.log(`[ImageProxy:${requestId}] URL sanitized to: ${imageUrl}`);
  }
  
  // Skip non-HTTP URLs
  if (!imageUrl.startsWith('http')) {
    console.log(`[ImageProxy:${requestId}] Not an HTTP URL: ${imageUrl}, returning transparent pixel`);
    return getTransparentPixelResponse();
  }
  
  console.log(`[ImageProxy:${requestId}] Fetching image: ${imageUrl}`);
  
  try {
    // First try direct fetch
    console.log(`[ImageProxy:${requestId}] Attempting direct fetch...`);
    try {
      const directResponse = await fetch(imageUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
        },
        timeout: PROXY_CONFIG.fetchTimeoutMs,
      });
      
      if (directResponse.ok) {
        console.log(`[ImageProxy:${requestId}] Direct fetch successful: ${directResponse.status}`);
        const imageBuffer = await directResponse.buffer();
        return getImageResponse(imageBuffer, directResponse.headers.get('content-type'));
      }
      
      console.log(`[ImageProxy:${requestId}] Direct fetch failed: ${directResponse.status}, trying proxy...`);
    } catch (directError) {
      console.log(`[ImageProxy:${requestId}] Direct fetch error: ${directError.message}, trying proxy...`);
    }
    
    // If direct fetch fails, try with proxy
    const proxyResponse = await fetchWithProxy(imageUrl, requestId);
    
    if (proxyResponse.ok) {
      console.log(`[ImageProxy:${requestId}] Proxy fetch successful: ${proxyResponse.status}`);
      const imageBuffer = await proxyResponse.buffer();
      return getImageResponse(imageBuffer, proxyResponse.headers.get('content-type'));
    }
    
    console.log(`[ImageProxy:${requestId}] Proxy fetch failed: ${proxyResponse.status}`);
    return getTransparentPixelResponse();
    
  } catch (error: any) {
    console.error(`[ImageProxy:${requestId}] Error fetching image: ${error.message}`);
    return getTransparentPixelResponse();
  }
};

/**
 * Get transparent pixel response as fallback
 */
function getTransparentPixelResponse() {
  const transparentPixel = 'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
  return new Response(Buffer.from(transparentPixel, 'base64'), {
    status: 200,
    headers: {
      'Content-Type': 'image/gif',
      'Cache-Control': `public, max-age=${PROXY_CONFIG.cacheDurationSeconds}`,
      'X-Content-Type-Options': 'nosniff',
      'Access-Control-Allow-Origin': '*'
    }
  });
}

/**
 * Get image response with proper headers
 */
function getImageResponse(buffer: Buffer, contentType: string | null) {
  return new Response(buffer, {
    status: 200,
    headers: {
      'Content-Type': contentType || 'image/jpeg',
      'Cache-Control': `public, max-age=${PROXY_CONFIG.cacheDurationSeconds}`,
      'X-Content-Type-Options': 'nosniff',
      'Access-Control-Allow-Origin': '*'
    }
  });
}

/**
 * Fetch with proxy and retry logic
 */
async function fetchWithProxy(url: string, requestId: string) {
  let attempts = 0;
  
  while (attempts < PROXY_CONFIG.maxRetryAttempts) {
    try {
      console.log(`[ImageProxy:${requestId}] Proxy attempt ${attempts + 1}/${PROXY_CONFIG.maxRetryAttempts}`);
      
      const proxyUrl = `http://${PROXY_USERNAME}:${PROXY_PASSWORD}@${PROXY_HOST}:${PROXY_PORT}`;
      const agent = new HttpsProxyAgent(proxyUrl);
      
      return await fetch(url, {
        agent,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
        },
        timeout: PROXY_CONFIG.fetchTimeoutMs,
      });
    } catch (error: any) {
      attempts++;
      console.error(`[ImageProxy:${requestId}] Proxy attempt ${attempts} failed: ${error.message}`);
      
      if (attempts >= PROXY_CONFIG.maxRetryAttempts) {
        throw error;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay => resolve(delay), 1000));
    }
  }
  
  throw new Error(`Failed after ${PROXY_CONFIG.maxRetryAttempts} attempts`);
}
