/**
 * API endpoint for managing route mappings
 * 
 * This API allows for dynamic management of content path to web route mappings.
 * It provides endpoints to add, update, remove, and list route mappings.
 */

import type { APIRoute } from 'astro';
import { 
  addRouteMapping, 
  removeRouteMapping, 
  getAllRouteMappings 
} from '../../utils/routing/routeManager';

// Helper function to validate request body
function validateMappingRequest(body: any): { valid: boolean; message?: string } {
  if (!body) {
    return { valid: false, message: 'Request body is required' };
  }
  
  if (!body.contentPath) {
    return { valid: false, message: 'contentPath is required' };
  }
  
  if (body.action === 'add' && !body.routePath) {
    return { valid: false, message: 'routePath is required for add action' };
  }
  
  return { valid: true };
}

export const GET: APIRoute = async () => {
  try {
    // Return all current route mappings
    const mappings = getAllRouteMappings();
    
    return new Response(JSON.stringify({
      success: true,
      mappings
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    
    // Validate request body
    const validation = validateMappingRequest(body);
    if (!validation.valid) {
      return new Response(JSON.stringify({
        success: false,
        error: validation.message
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
    
    const { action, contentPath, routePath } = body;
    
    switch (action) {
      case 'add':
        addRouteMapping(contentPath, routePath);
        return new Response(JSON.stringify({
          success: true,
          message: `Route mapping added: ${contentPath} → ${routePath}`
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
      case 'remove':
        removeRouteMapping(contentPath);
        return new Response(JSON.stringify({
          success: true,
          message: `Route mapping removed for: ${contentPath}`
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
      default:
        return new Response(JSON.stringify({
          success: false,
          error: 'Invalid action. Use "add" or "remove".'
        }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        });
    }
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};
