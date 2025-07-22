/**
 * Google Maps Photo Proxy Endpoint
 * 
 * Server-side endpoint for fetching Google Places photos without exposing API key
 */

import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const photoReference = url.searchParams.get('photo_reference');
  const maxWidth = url.searchParams.get('maxwidth') || '400';

  if (!photoReference) {
    return new Response(JSON.stringify({ 
      error: 'Missing photo_reference parameter' 
    }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  const apiKey = import.meta.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ 
      error: 'Google Maps API key not configured' 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  try {
    // Fetch the photo from Google Places API
    const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${apiKey}`;
    
    const response = await fetch(photoUrl);
    
    if (!response.ok) {
      throw new Error(`Google Places Photo API error: ${response.status}`);
    }

    // Return the image with appropriate headers
    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    return new Response(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('Error fetching Google Places photo:', error);
    
    return new Response(JSON.stringify({
      error: 'Failed to fetch photo',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};
