import { useState, useEffect } from 'react';

export const useMapReady = () => {
  const [mapReady, setMapReady] = useState(false);

  const markMapReady = () => {
    console.log('Map marked as ready');
    setMapReady(true);
  };

  const resetMapReady = () => {
    console.log('Map ready status reset');
    setMapReady(false);
  };

  return {
    mapReady,
    markMapReady,
    resetMapReady
  };
};
