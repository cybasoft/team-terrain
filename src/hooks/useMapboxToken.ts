
import { useState, useEffect } from 'react';

export const useMapboxToken = () => {
  const [mapboxToken, setMapboxToken] = useState<string>('');

  useEffect(() => {
    const savedToken = localStorage.getItem('mapbox-token');
    if (savedToken) {
      setMapboxToken(savedToken);
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
