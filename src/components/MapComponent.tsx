
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { User } from '../types/User';
import { config } from '../config/env';

interface MapComponentProps {
  users: User[];
  onMapClick: (coordinates: [number, number]) => void;
  onPinDrag: (userId: string, coordinates: [number, number]) => void;
  mapboxToken: string;
}

const MapComponent: React.FC<MapComponentProps> = ({ users, onMapClick, onPinDrag, mapboxToken }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: config.mapbox.mapStyle,
      center: [config.mapbox.defaultCenter.lng, config.mapbox.defaultCenter.lat],
      zoom: config.mapbox.defaultZoom,
    });

    map.current.addControl(
      new mapboxgl.NavigationControl(),
      'top-right'
    );

    map.current.on('click', (e) => {
      // Only trigger map click if not clicking on a marker
      const features = map.current!.queryRenderedFeatures(e.point);
      if (features.length === 0) {
        onMapClick([e.lngLat.lng, e.lngLat.lat]);
      }
    });

    // Ensure map is fully loaded before allowing marker operations
    map.current.on('load', () => {
      console.log('Map fully loaded and ready for markers');
      setMapReady(true);
    });

    return () => {
      map.current?.remove();
      setMapReady(false);
    };
  }, [mapboxToken, onMapClick]);

  useEffect(() => {
    if (!map.current || !mapReady) {
      console.log('Map not ready yet, skipping marker update. Map:', !!map.current, 'Ready:', mapReady);
      return;
    }

    console.log('MapComponent: Processing users for markers:', users);

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current.clear();

    // Add markers for users with locations (regardless of pinned status)
    const usersWithLocations = users.filter(user => user.location && user.location.length === 2);
    console.log('Users with valid locations:', usersWithLocations);

    usersWithLocations.forEach(user => {
      console.log(`Adding marker for ${user.name} at:`, user.location);
      
      const markerElement = document.createElement('div');
      markerElement.className = 'marker-custom';
      markerElement.style.width = '20px';
      markerElement.style.height = '20px';
      markerElement.style.borderRadius = '50%';
      markerElement.style.backgroundColor = user.pinned ? '#3B82F6' : '#10B981';
      markerElement.style.border = '2px solid white';
      markerElement.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
      markerElement.style.cursor = 'grab';
      markerElement.style.transformOrigin = 'center';
      markerElement.style.transition = 'transform 0.2s ease-in-out';

      const marker = new mapboxgl.Marker({
        element: markerElement,
        draggable: true
      })
        .setLngLat(user.location!)
        .setPopup(
          new mapboxgl.Popup({ 
            offset: 25, 
            closeButton: true, 
            closeOnClick: false,
            closeOnMove: false,
            className: 'user-info-popup'
          })
            .setHTML(`
              <div class="p-2">
                <div class="font-semibold text-sm text-gray-900">${user.name}</div>
                <div class="text-xs text-gray-600 mt-1">${user.pinned ? 'Pinned Location' : 'Located'}</div>
                ${user.email ? `<div class="text-xs text-gray-500 mt-1">${user.email}</div>` : ''}
                <div class="text-xs text-blue-600 mt-2">
                  ${user.location![0].toFixed(6)}, ${user.location![1].toFixed(6)}
                </div>
              </div>
            `)
        )
        .addTo(map.current!);

      // Show popup on hover
      markerElement.addEventListener('mouseenter', () => {
        marker.getPopup()?.addTo(map.current!);
      });

      // Hide popup when mouse leaves (with slight delay)
      markerElement.addEventListener('mouseleave', () => {
        setTimeout(() => {
          if (!marker.getPopup()?.isOpen()) return;
          const popupElement = document.querySelector('.user-info-popup');
          if (popupElement && !popupElement.matches(':hover')) {
            marker.getPopup()?.remove();
          }
        }, 100);
      });

      // Toggle popup on click
      markerElement.addEventListener('click', (e) => {
        e.stopPropagation();
        const popup = marker.getPopup();
        if (popup?.isOpen()) {
          popup.remove();
        } else {
          popup?.addTo(map.current!);
        }
      });

      // Handle drag end event
      marker.on('dragend', () => {
        const lngLat = marker.getLngLat();
        const newCoordinates: [number, number] = [lngLat.lng, lngLat.lat];
        console.log(`User ${user.name} dragged to:`, newCoordinates);
        onPinDrag(user.id, newCoordinates);
      });

      markers.current.set(user.id, marker);
    });

    console.log(`Added ${markers.current.size} markers to map`);
  }, [users, onPinDrag, mapReady]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0 rounded-lg shadow-lg" />
      {!mapboxToken && (
        <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center p-8">
            <div className="text-gray-500 mb-2">Map requires Mapbox token</div>
            <div className="text-sm text-gray-400">Please enter your token below</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapComponent;
