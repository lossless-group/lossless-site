# Google Maps Integration for InfoSidebar

This implementation adds Google Maps location information to the InfoSidebar component when a `google_maps_url` field is present in the frontmatter.

## Setup

1. **Environment Configuration**
   - Add your Google Maps API key to `/site/.env`:
   ```
   GOOGLE_MAPS_API_KEY=your_actual_api_key_here
   ```

2. **Required Google Cloud APIs**
   Enable these APIs in your Google Cloud Console:
   - Maps JavaScript API
   - Places API  
   - Geocoding API

## How It Works

### 1. Frontmatter Detection
The InfoSidebar component checks for either:
- `google_maps_url` field
- `googleMapsUrl` field (alternative naming)

### 2. Server-Side Processing
- API endpoint at `/api/google-maps` handles the location lookup
- Supports various Google Maps URL formats:
  - Shortened URLs: `https://maps.app.goo.gl/...`
  - Full URLs: `https://www.google.com/maps/place/...`
  - Direct coordinate URLs

### 3. Client-Side Display
- Shows loading state while fetching location data
- Displays location name and address when available
- Falls back to "View on Google Maps" link if API fails
- Includes a map pin icon for visual clarity

## Usage

Simply add a `google_maps_url` field to your markdown frontmatter:

```yaml
---
title: "My Event"
google_maps_url: "https://maps.app.goo.gl/ks4bpfmxT3PqXC2b6"
---
```

The InfoSidebar will automatically detect this and display location information.

## Files Modified/Created

1. **`/src/utils/googleMapsUtils.ts`** - Utility functions for URL parsing
2. **`/src/pages/api/google-maps.ts`** - Server-side API endpoint
3. **`/src/components/markdown/InfoSidebar.astro`** - Updated component with location display
4. **`/.env.example`** - Environment variable template

## Error Handling

- If the Google Maps API is unavailable, shows fallback link
- If the URL is invalid, shows error message
- If no API key is configured, logs error and shows fallback

## Security

- API key is server-side only (not exposed to client)
- All external requests are validated
- CORS headers are properly configured
