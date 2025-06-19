
import { useState, useEffect } from 'react';
import { config } from '../config/env';

export const useMapboxToken = () => {
  const [mapboxToken, setMapboxToken] = useState<string>('');

  useEffect(() => {
    // First check localStorage, then fall back to environment variable
    const savedToken = localStorage.getItem('mapbox-token');
    if (savedToken) {
      setMapboxToken(savedToken);
    } else if (config.mapbox.accessToken) {
      setMapboxToken(config.mapbox.accessToken);
    }
  }, []);

  const handleMapboxTokenSubmit = (token: string) => {
    setMapboxToken(token);
    localStorage.setItem('mapbox-token', token);
  };

  return {
    mapboxToken,
    handleMapboxTokenSubmit
  };
};
