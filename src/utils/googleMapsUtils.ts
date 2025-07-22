/**
 * Google Maps Utilities
 * 
 * Utilities for working with Google Maps URLs and extracting location information
 * using the Google Maps API.
 */

export interface LocationInfo {
  name?: string;
  address?: string;
  city?: string;
  country?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  placeId?: string;
  types?: string[];
  formattedAddress?: string;
  businessStatus?: string;
  rating?: number;
  userRatingsTotal?: number;
  website?: string;
  phoneNumber?: string;
}

/**
 * Extracts place ID from various Google Maps URL formats
 * 
 * Supports:
 * - https://maps.app.goo.gl/ks4bpfmxT3PqXC2b6 (shortened URLs)
 * - https://www.google.com/maps/place/...
 * - https://maps.google.com/...
 * 
 * @param url - Google Maps URL
 * @returns Place ID if found, null otherwise
 */
export function extractPlaceIdFromUrl(url: string): string | null {
  if (!url) return null;

  try {
    // Handle different URL formats
    const urlObj = new URL(url);
    
    // Check for place_id parameter
    const placeIdParam = urlObj.searchParams.get('place_id');
    if (placeIdParam) {
      return placeIdParam;
    }

    // Check for cid parameter (alternative place identifier)
    const cidParam = urlObj.searchParams.get('cid');
    if (cidParam) {
      return cidParam;
    }

    // Extract from path for /place/ URLs
    const pathMatch = urlObj.pathname.match(/\/place\/([^\/]+)/);
    if (pathMatch) {
      return pathMatch[1];
    }

    return null;
  } catch (error) {
    console.error('Error parsing Google Maps URL:', error);
    return null;
  }
}

/**
 * Resolves a shortened Google Maps URL to get the full URL
 * 
 * @param shortUrl - Shortened Google Maps URL (e.g., maps.app.goo.gl/...)
 * @returns Promise resolving to the full URL
 */
export async function resolveShortUrl(shortUrl: string): Promise<string | null> {
  if (!shortUrl.includes('goo.gl') && !shortUrl.includes('maps.app.goo.gl')) {
    return shortUrl; // Already a full URL
  }

  try {
    // Use a HEAD request to get the redirect location without downloading content
    const response = await fetch(shortUrl, {
      method: 'HEAD',
      redirect: 'manual' // Don't follow redirects automatically
    });

    const location = response.headers.get('location');
    if (location) {
      return location;
    }

    // Fallback: try with GET request
    const getResponse = await fetch(shortUrl, {
      redirect: 'manual'
    });
    
    const getLocation = getResponse.headers.get('location');
    return getLocation || shortUrl;
  } catch (error) {
    console.error('Error resolving short URL:', error);
    return shortUrl; // Return original URL as fallback
  }
}

/**
 * Extracts coordinates from Google Maps URL
 * 
 * @param url - Google Maps URL
 * @returns Coordinates if found, null otherwise
 */
export function extractCoordinatesFromUrl(url: string): { lat: number; lng: number } | null {
  if (!url) return null;

  try {
    // Look for @lat,lng pattern
    const coordMatch = url.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
    if (coordMatch) {
      return {
        lat: parseFloat(coordMatch[1]),
        lng: parseFloat(coordMatch[2])
      };
    }

    // Look for ll parameter
    const urlObj = new URL(url);
    const llParam = urlObj.searchParams.get('ll');
    if (llParam) {
      const [lat, lng] = llParam.split(',').map(coord => parseFloat(coord.trim()));
      if (!isNaN(lat) && !isNaN(lng)) {
        return { lat, lng };
      }
    }

    return null;
  } catch (error) {
    console.error('Error extracting coordinates from URL:', error);
    return null;
  }
}

/**
 * Formats location information for display
 * 
 * @param locationInfo - Location information object
 * @returns Formatted location string
 */
export function formatLocationForDisplay(locationInfo: LocationInfo): string {
  if (!locationInfo) return '';

  const parts: string[] = [];

  if (locationInfo.name) {
    parts.push(locationInfo.name);
  }

  if (locationInfo.address) {
    parts.push(locationInfo.address);
  } else if (locationInfo.formattedAddress) {
    parts.push(locationInfo.formattedAddress);
  } else {
    if (locationInfo.city) parts.push(locationInfo.city);
    if (locationInfo.country) parts.push(locationInfo.country);
  }

  return parts.join(', ');
}

/**
 * Determines if a URL is a Google Maps URL
 * 
 * @param url - URL to check
 * @returns True if it's a Google Maps URL
 */
export function isGoogleMapsUrl(url: string): boolean {
  if (!url) return false;

  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    return (
      hostname.includes('maps.google.com') ||
      hostname.includes('google.com/maps') ||
      hostname.includes('maps.app.goo.gl') ||
      hostname.includes('goo.gl')
    );
  } catch {
    return false;
  }
}
