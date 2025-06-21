import { config } from '../config/env';

/**
 * Parse coordinates from various formats into a standardized [lng, lat] array
 * @param coords - Coordinates in string format (e.g., "36.123, -1.456") or array format
 * @returns [lng, lat] array or null if invalid
 */
export const parseCoordinates = (coords: string | number[] | null | undefined): [number, number] | null => {
  if (!coords) return null;

  // If already an array of numbers
  if (Array.isArray(coords) && coords.length === 2) {
    const [lng, lat] = coords;
    if (typeof lng === 'number' && typeof lat === 'number') {
      return [lng, lat];
    }
  }

  // If it's a string, parse it
  if (typeof coords === 'string') {
    const trimmed = coords.trim();
    if (!trimmed) return null;

    // Split by comma and parse
    const parts = trimmed.split(',').map(part => part.trim());
    
    if (parts.length === 2) {
      const lng = parseFloat(parts[0]);
      const lat = parseFloat(parts[1]);
      
      if (!isNaN(lng) && !isNaN(lat)) {
        // Validate coordinate ranges
        if (lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90) {
          return [lng, lat];
        }
      }
    }
  }

  return null;
};

/**
 * Format coordinates as a comma-separated string
 * @param coords - [lng, lat] array
 * @returns Formatted string (e.g., "36.123, -1.456")
 */
export const formatCoordinates = (coords: [number, number]): string => {
  return `${coords[0]}, ${coords[1]}`;
};

/**
 * Reverse geocodes coordinates to get city, state and country
 * @param coords - [lng, lat] array 
 * @returns Promise that resolves to an object with city, state, country
 */
export const reverseGeocode = async (
  coords: [number, number]
): Promise<{city?: string; state?: string; country?: string}> => {
  try {
    // Get token from config
    const mapboxToken = config.mapbox.accessToken;
    
    if (!mapboxToken) {
      console.error('Mapbox token not available for reverse geocoding');
      console.log('Make sure VITE_MAPBOX_ACCESS_TOKEN is properly set in .env file');
      return {};
    }

    const [lng, lat] = coords;
    // For reverse geocoding with limit parameter, don't use multiple types
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxToken}`;
    
    console.log(`Reverse geocoding coordinates: ${lng}, ${lat}`);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Geocoding failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.features || data.features.length === 0) {
      console.warn('No geocoding features returned from Mapbox API', data);
      return {};
    }
    
    // Define type for geocoding features
    interface GeocodingFeature {
      place_type: string[];
      text: string;
      properties?: {
        short_code?: string;
      };
      context?: Array<{
        id: string;
        text: string;
        wikidata?: string;
        short_code?: string;
      }>;
    }
    
    // Extract location information from features
    let city = '';
    let state = '';
    let country = '';
    
    // Debug the returned features
    console.log('Geocoding features:', data.features);
    
    if (data.features.length > 0) {
      // Analyze the context of the first feature which is usually the most relevant
      const mainFeature: GeocodingFeature = data.features[0];
      
      // Try to identify city, state, and country from the context array
      if (mainFeature.context) {
        for (const contextItem of mainFeature.context) {
          // The id contains the feature type
          if (contextItem.id.includes('place')) {
            city = contextItem.text;
          } else if (contextItem.id.includes('region')) {
            state = contextItem.text;
          } else if (contextItem.id.includes('country')) {
            country = contextItem.text;
          }
        }
      }
      
      // If the main feature is itself a place/city
      if (mainFeature.place_type.includes('place')) {
        city = mainFeature.text;
      }
      // If the main feature is a region
      else if (mainFeature.place_type.includes('region')) {
        state = mainFeature.text;
      }
      // If the main feature is a country
      else if (mainFeature.place_type.includes('country')) {
        country = mainFeature.text;
      }
    }
    
    // Also check all features as a fallback
    if (!city || !state || !country) {
      for (const feature of data.features) {
        if (!city && feature.place_type.includes('place')) {
          city = feature.text;
        }
        if (!state && feature.place_type.includes('region')) {
          state = feature.text;
        }
        if (!country && feature.place_type.includes('country')) {
          country = feature.text;
        }
      }
    }
    
    console.log(`Reverse geocoding result: city=${city}, state=${state}, country=${country}`);
    
    return { city, state, country };
  } catch (error) {
    console.error('Error during reverse geocoding:', error);
    return {};
  }
};

/**
 * Format location information for display
 * @param user - User object with location information
 * @returns A formatted location string (city, state, country or coordinates)
 */
export const formatLocation = (user: { 
  city?: string; 
  state?: string; 
  country?: string; 
  location?: [number, number] | null;
}): string => {
  // Use city and country if available
  if (user.city && user.country) {
    return `${user.city}, ${user.country}`;
  }
  
  // Use just city if that's all we have
  if (user.city) {
    return user.city;
  }
  
  // Use city and state if available
  if (user.city && user.state) {
    return `${user.city}, ${user.state}`;
  }
  
  // Use just state if that's all we have
  if (user.state) {
    return user.state;
  }
  
  // Use just country if that's all we have
  if (user.country) {
    return user.country;
  }
  
  // Fall back to coordinates if we have them
  if (user.location) {
    return `${user.location[0].toFixed(6)}, ${user.location[1].toFixed(6)}`;
  }
  
  // Default if nothing is available
  return 'Location unknown';
};
