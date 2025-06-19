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
