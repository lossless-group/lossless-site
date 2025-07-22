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

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const mapsUrl = url.searchParams.get('url');

  if (!mapsUrl) {
    return new Response(JSON.stringify({ 
      error: 'Missing url parameter' 
    }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  if (!isGoogleMapsUrl(mapsUrl)) {
    return new Response(JSON.stringify({ 
      error: 'Invalid Google Maps URL' 
    }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  const apiKey = import.meta.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.error('Google Maps API key not configured');
    return new Response(JSON.stringify({ 
      error: 'Google Maps API not configured' 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

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
    'geometry',
    'place_id',
    'types',
    'business_status',
    'rating',
    'user_ratings_total',
    'website',
    'formatted_phone_number'
  ].join(',');

  const response = await fetch(
    `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=${fields}&key=${apiKey}`
  );

  if (!response.ok) {
    throw new Error(`Google Places API error: ${response.status}`);
  }

  const data = await response.json();

  if (data.status !== 'OK') {
    throw new Error(`Google Places API status: ${data.status}`);
  }

  const place = data.result;
  
  return {
    name: place.name,
    formattedAddress: place.formatted_address,
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
    phoneNumber: place.formatted_phone_number
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
