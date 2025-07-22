/**
 * Google Maps API Endpoint
 * 
 * Server-side endpoint for fetching location information from Google Maps URLs
 * using the Google Places API.
 */

import type { APIRoute } from 'astro';
import { 
  extractPlaceIdFromUrl, 
  resolveShortUrl, 
  extractCoordinatesFromUrl,
  isGoogleMapsUrl,
  type LocationInfo 
} from '@utils/googleMapsUtils';
import { GOOGLE_MAPS_API_KEY } from '@utils/envUtils';

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const mapsUrl = url.searchParams.get('url');

  console.log('[Google Maps API] Request URL:', request.url);
  console.log('[Google Maps API] Parsed URL params:', Object.fromEntries(url.searchParams));
  console.log('[Google Maps API] Maps URL:', mapsUrl);

  if (!mapsUrl) {
    console.log('[Google Maps API] Missing URL parameter');
    return new Response(JSON.stringify({ 
      error: 'Missing url parameter' 
    }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  console.log('[Google Maps API] Validating URL:', mapsUrl);
  const isValidUrl = isGoogleMapsUrl(mapsUrl);
  console.log('[Google Maps API] URL validation result:', isValidUrl);
  
  if (!isValidUrl) {
    console.log('[Google Maps API] Invalid Google Maps URL');
    return new Response(JSON.stringify({ 
      error: 'Invalid Google Maps URL' 
    }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  // Debug: Log all environment variables (filtered for security)
  console.log('[Google Maps API] Environment variables:', Object.keys(process.env)
    .filter(key => key.includes('GOOGLE') || key.includes('MAPS') || key === 'NODE_ENV')
    .reduce((obj, key) => ({
      ...obj,
      [key]: key.includes('KEY') ? '***' + (process.env[key] || '').slice(-4) : process.env[key]
    }), {}));

  // Get API key from envUtils
  const apiKey = GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    const errorMsg = 'Google Maps API key not found in environment variables. Please ensure GOOGLE_MAPS_API_KEY is set in your .env file and the server has been restarted.';
    console.error(errorMsg);
    console.error('[Google Maps API] Current working directory:', process.cwd());
    return new Response(JSON.stringify({ 
      error: errorMsg,
      help: 'Make sure your .env file is in the site/ directory and contains GOOGLE_MAPS_API_KEY=your_key_here',
      env: {
        nodeEnv: process.env.NODE_ENV,
        cwd: process.cwd(),
        hasGoogleMapsKey: !!process.env.GOOGLE_MAPS_API_KEY,
        hasImportMetaKey: !!(import.meta.env.GOOGLE_MAPS_API_KEY)
      }
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
  
  console.log('[Google Maps API] Successfully loaded API key (last 4):', '***' + apiKey.slice(-4));

  try {
    // First, try to resolve shortened URLs
    const resolvedUrl = await resolveShortUrl(mapsUrl);
    if (!resolvedUrl) {
      throw new Error('Could not resolve Google Maps URL');
    }

    let locationInfo: LocationInfo = {};

    // Try to extract place ID first
    const placeId = extractPlaceIdFromUrl(resolvedUrl);
    
    if (placeId) {
      // Use Google Places API to get detailed information
      locationInfo = await fetchPlaceDetails(placeId, apiKey);
    } else {
      // Fallback: try to extract coordinates and use reverse geocoding
      const coordinates = extractCoordinatesFromUrl(resolvedUrl);
      if (coordinates) {
        locationInfo = await reverseGeocode(coordinates, apiKey);
      }
    }

    // If we still don't have location info, return basic info
    if (!locationInfo.name && !locationInfo.address) {
      locationInfo = {
        formattedAddress: 'Location from Google Maps',
        coordinates: extractCoordinatesFromUrl(resolvedUrl) || undefined
      };
    }

    return new Response(JSON.stringify({
      success: true,
      data: locationInfo,
      originalUrl: mapsUrl,
      resolvedUrl: resolvedUrl
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
      }
    });

  } catch (error) {
    console.error('Error fetching Google Maps data:', error);
    
    return new Response(JSON.stringify({
      error: 'Failed to fetch location information',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};

/**
 * Fetch place details using Google Places API
 */
async function fetchPlaceDetails(placeId: string, apiKey: string): Promise<LocationInfo> {
  const fields = [
    'name',
    'formatted_address',
    'address_components',
    'geometry',
    'place_id',
    'types',
    'business_status',
    'rating',
    'user_ratings_total',
    'website',
    'formatted_phone_number',
    'photos',
    'opening_hours',
    'price_level'
  ].join(',');

  // Construct the API URL with all required parameters
  const apiUrl = new URL('https://maps.googleapis.com/maps/api/place/details/json');
  apiUrl.searchParams.append('place_id', placeId);
  apiUrl.searchParams.append('fields', fields);
  apiUrl.searchParams.append('key', apiKey);

  console.log('[Google Maps API] Fetching place details from:', apiUrl.toString().replace(apiKey, '***'));

  const response = await fetch(apiUrl.toString());
  const data = await response.json();

  if (!response.ok) {
    console.error('[Google Maps API] Error response:', data);
    throw new Error(`Google Places API error: ${response.status} - ${response.statusText}`);
  }

  if (data.status !== 'OK') {
    console.error('[Google Maps API] API error status:', data.status, data.error_message || '');
    throw new Error(`Google Places API status: ${data.status} - ${data.error_message || 'Unknown error'}`);
  }

  const place = data.result;
  
  // Extract address components for better address display
  const addressComponents = place.address_components?.map((component: any) => ({
    longName: component.long_name,
    shortName: component.short_name,
    types: component.types
  }));

  // Extract city and country from address components
  const city = addressComponents?.find(comp => 
    comp.types.includes('locality') || comp.types.includes('administrative_area_level_1')
  )?.longName;
  const country = addressComponents?.find(comp => 
    comp.types.includes('country')
  )?.longName;

  // Process photos to include photo references
  const photos = place.photos?.slice(0, 5).map((photo: any) => ({
    photoReference: photo.photo_reference,
    width: photo.width,
    height: photo.height,
    htmlAttributions: photo.html_attributions || []
  }));

  return {
    name: place.name,
    formattedAddress: place.formatted_address,
    city,
    country,
    coordinates: place.geometry?.location ? {
      lat: place.geometry.location.lat,
      lng: place.geometry.location.lng
    } : undefined,
    placeId: place.place_id,
    types: place.types,
    businessStatus: place.business_status,
    rating: place.rating,
    userRatingsTotal: place.user_ratings_total,
    website: place.website,
    phoneNumber: place.formatted_phone_number,
    photos,
    addressComponents,
    openingHours: place.opening_hours ? {
      openNow: place.opening_hours.open_now,
      periods: place.opening_hours.periods,
      weekdayText: place.opening_hours.weekday_text
    } : undefined,
    priceLevel: place.price_level
  };
}

/**
 * Reverse geocode coordinates to get location information
 */
async function reverseGeocode(coordinates: { lat: number; lng: number }, apiKey: string): Promise<LocationInfo> {
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coordinates.lat},${coordinates.lng}&key=${apiKey}`
  );

  if (!response.ok) {
    throw new Error(`Google Geocoding API error: ${response.status}`);
  }

  const data = await response.json();

  if (data.status !== 'OK' || !data.results.length) {
    throw new Error(`Google Geocoding API status: ${data.status}`);
  }

  const result = data.results[0];
  
  // Extract city and country from address components
  let city = '';
  let country = '';
  
  if (result.address_components) {
    for (const component of result.address_components) {
      if (component.types.includes('locality')) {
        city = component.long_name;
      }
      if (component.types.includes('country')) {
        country = component.long_name;
      }
    }
  }

  return {
    formattedAddress: result.formatted_address,
    coordinates: coordinates,
    city: city || undefined,
    country: country || undefined,
    placeId: result.place_id,
    types: result.types
  };
}
