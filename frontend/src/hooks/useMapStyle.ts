import { useState, useEffect } from 'react';
import { config } from '../config/env';

/**
 * Hook to manage map style with local storage persistence
 */
export function useMapStyle() {
  // Try to get the stored style from localStorage, fall back to the env config
  const [mapStyle, setMapStyleState] = useState<string>(() => {
    const storedStyle = localStorage.getItem('mapStyle');
    return storedStyle || config.mapbox.mapStyle;
  });

  // Function to change the map style and persist to localStorage
  const setMapStyle = (style: string) => {
    setMapStyleState(style);
    localStorage.setItem('mapStyle', style);
  };

  // Initialize from localStorage on mount if available
  useEffect(() => {
    const storedStyle = localStorage.getItem('mapStyle');
    if (storedStyle) {
      setMapStyleState(storedStyle);
    }
  }, []);

  return { mapStyle, setMapStyle };
}
