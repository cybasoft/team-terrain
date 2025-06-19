
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { User } from '../types/User';
import { config } from '../config/env';
import { canMovePinForUser } from '../lib/permissions';

interface MapComponentProps {
  users: User[];
  currentUser: User;
  onMapClick: (coordinates: [number, number]) => void;
  onPinDrag: (userId: string, coordinates: [number, number]) => void;
  mapboxToken: string;
}

const MapComponent: React.FC<MapComponentProps> = ({ users, currentUser, onMapClick, onPinDrag, mapboxToken }) => {
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
      return;
    }

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current.clear();

    // Add markers for users with locations (regardless of pinned status)
    const usersWithLocations = users.filter(user => user.location && user.location.length === 2);

    usersWithLocations.forEach(user => {
      const markerElement = document.createElement('div');
      markerElement.className = 'marker-custom';
      markerElement.style.width = '20px';
      markerElement.style.height = '20px';
      markerElement.style.borderRadius = '50%';
      markerElement.style.backgroundColor = user.pinned ? '#3B82F6' : '#10B981';
      markerElement.style.border = '2px solid white';
      markerElement.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
      markerElement.style.transformOrigin = 'center';
      markerElement.style.transition = 'transform 0.2s ease-in-out';

      // Check if current user can move this pin
      const canMovePin = canMovePinForUser(currentUser, user);
      markerElement.style.cursor = canMovePin ? 'grab' : 'pointer';

      // Add visual indicator for non-movable pins
      if (!canMovePin) {
        markerElement.style.opacity = '0.8';
        markerElement.title = 'Pin locked - you can only move your own pin';
      } else {
        markerElement.title = canMovePin && currentUser.id !== user.id ? 
          'You can move this pin (admin)' : 
          'You can move this pin (your pin)';
      }

      const marker = new mapboxgl.Marker({
        element: markerElement,
        draggable: canMovePin
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
                <div class="text-xs text-gray-500 mt-1">${user.email}</div>
                <div class="text-xs text-blue-600 mt-2">
                  ${user.location![0].toFixed(6)}, ${user.location![1].toFixed(6)}
                </div>
                <div class="text-xs mt-2 ${canMovePin ? 'text-green-600' : 'text-orange-600'}">
                  ${canMovePin ? 
                    (currentUser.id === user.id ? '🔓 You can move this pin' : '🔓 Movable (admin)') : 
                    '🔒 Pin locked'
                  }
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

      // Handle drag end event (only if draggable)
      if (canMovePin) {
        marker.on('dragend', () => {
          const lngLat = marker.getLngLat();
          const newCoordinates: [number, number] = [lngLat.lng, lngLat.lat];
          onPinDrag(user.id, newCoordinates);
        });
      }

      markers.current.set(user.id, marker);
    });

  }, [users, currentUser, onPinDrag, mapReady]);

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
