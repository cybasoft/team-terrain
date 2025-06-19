
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { User } from '../types/User';
import { config } from '../config/env';
import { canMovePinForUser, canDeletePinForUser, isAdmin } from '../lib/permissions';
import MapSearchControl from './MapSearchControl';

interface MapComponentProps {
  users: User[];
  currentUser: User;
  onMapClick: (coordinates: [number, number]) => void;
  onPinDrag: (userId: string, coordinates: [number, number]) => void;
  onPinDelete?: (userId: string) => void;
  onUserDropOnMap?: (user: User, coordinates: [number, number]) => void;
  hasAvailableUsers?: () => boolean;
  mapboxToken: string;
}

const MapComponent: React.FC<MapComponentProps> = ({ 
  users, 
  currentUser, 
  onMapClick, 
  onPinDrag, 
  onPinDelete,
  onUserDropOnMap,
  hasAvailableUsers,
  mapboxToken 
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const searchMarker = useRef<mapboxgl.Marker | null>(null);
  const onMapClickRef = useRef(onMapClick);
  const onPinDragRef = useRef(onPinDrag);
  const onPinDeleteRef = useRef(onPinDelete);
  const [mapReady, setMapReady] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // Update the refs when functions change
  useEffect(() => {
    onMapClickRef.current = onMapClick;
    onPinDragRef.current = onPinDrag;
    onPinDeleteRef.current = onPinDelete;
  }, [onMapClick, onPinDrag, onPinDelete]);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    // Set up global function for pin deletion
    (window as typeof window & { deleteUserPin: (userId: string) => void }).deleteUserPin = (userId: string) => {
      if (onPinDeleteRef.current) {
        const user = users.find(u => u.id === userId);
        if (!user) return;

        // Show a confirmation dialog
        if (confirm(`Are you sure you want to delete ${user.name}'s pin from the map?`)) {
          // Close any open popups
          const popups = document.querySelectorAll('.mapboxgl-popup');
          popups.forEach(popup => {
            const popupElement = popup as HTMLElement;
            popupElement.style.opacity = '0';
            setTimeout(() => popupElement.remove(), 200);
          });
          
          // Call the delete handler
          onPinDeleteRef.current(userId);
        }
      }
    };
    
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
        onMapClickRef.current([e.lngLat.lng, e.lngLat.lat]);
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
      // Remove global functions
      delete (window as typeof window & { 
        deleteUserPin?: (userId: string) => void,
        selectSearchLocation?: (coords: [number, number]) => void 
      }).deleteUserPin;
      delete (window as typeof window & { 
        deleteUserPin?: (userId: string) => void,
        selectSearchLocation?: (coords: [number, number]) => void 
      }).selectSearchLocation;
    };
  }, [mapboxToken, users]); // Removed onMapClick from dependencies

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
      const canDeletePin = canDeletePinForUser(currentUser, user);
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
              <div class="p-3">
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
                ${canDeletePin ? `
                  <div class="mt-3 pt-2 border-t border-gray-200">
                    <button 
                      onclick="window.deleteUserPin('${user.id}')"
                      class="w-full bg-red-600 text-white px-3 py-2 rounded text-xs font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-1"
                      title="Delete this pin"
                    >
                      🗑️ Delete Pin
                    </button>
                  </div>
                ` : ''}
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
          onPinDragRef.current(user.id, newCoordinates);
        });
      }

      markers.current.set(user.id, marker);
    });

  }, [users, currentUser, mapReady]);

  // Handle location search result
  const handleLocationSearch = (coordinates: [number, number], placeName: string) => {
    if (!map.current) return;

    // Remove existing search marker
    if (searchMarker.current) {
      searchMarker.current.remove();
    }

    // Create search result marker
    const searchElement = document.createElement('div');
    searchElement.className = 'search-marker';
    searchElement.style.width = '30px';
    searchElement.style.height = '30px';
    searchElement.style.borderRadius = '50%';
    searchElement.style.backgroundColor = '#FF6B6B';
    searchElement.style.border = '3px solid white';
    searchElement.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
    searchElement.style.cursor = 'pointer';
    searchElement.style.display = 'flex';
    searchElement.style.alignItems = 'center';
    searchElement.style.justifyContent = 'center';
    searchElement.style.fontSize = '14px';
    searchElement.innerHTML = '📍';
    searchElement.style.animation = 'bounce 2s infinite';

    // Create search marker
    searchMarker.current = new mapboxgl.Marker({
      element: searchElement,
      draggable: false
    })
      .setLngLat(coordinates)
      .setPopup(
        new mapboxgl.Popup({ 
          offset: 25, 
          closeButton: true,
          className: 'search-result-popup'
        })
          .setHTML(`
            <div class="p-3">
              <div class="font-semibold text-sm text-gray-900 mb-2">📍 Search Result</div>
              <div class="text-sm text-gray-700 mb-3">${placeName}</div>
              <div class="text-xs text-blue-600 mb-3">
                ${coordinates[0].toFixed(6)}, ${coordinates[1].toFixed(6)}
              </div>
              <button 
                onclick="window.selectSearchLocation([${coordinates[0]}, ${coordinates[1]}])"
                class="w-full bg-blue-600 text-white px-3 py-2 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Pin Here
              </button>
            </div>
          `)
      )
      .addTo(map.current);

    // Fly to the search result
    map.current.flyTo({
      center: coordinates,
      zoom: Math.max(map.current.getZoom(), 14),
      duration: 1500
    });

    // Show popup
    searchMarker.current.getPopup()?.addTo(map.current);

    // Set up global function for popup button
    (window as typeof window & { selectSearchLocation: (coords: [number, number]) => void }).selectSearchLocation = (coords: [number, number]) => {
      onMapClick(coords);
      if (searchMarker.current) {
        searchMarker.current.remove();
        searchMarker.current = null;
      }
    };

    // Auto-remove search marker after 30 seconds
    setTimeout(() => {
      if (searchMarker.current) {
        searchMarker.current.remove();
        searchMarker.current = null;
      }
    }, 30000);
  };

  // Handle drag and drop events for dropping users onto the map
  const handleDragOver = (e: React.DragEvent) => {
    if (!isAdmin(currentUser) || !onUserDropOnMap) return;
    
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!isAdmin(currentUser)) return;
    
    // Only set dragover to false if we're actually leaving the map container
    if (!mapContainer.current?.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    if (!isAdmin(currentUser) || !onUserDropOnMap || !map.current) return;
    
    e.preventDefault();
    setIsDragOver(false);
    
    try {
      // Get the dropped user data
      const userData = e.dataTransfer.getData('application/json');
      if (!userData) return;
      
      const droppedUser: User = JSON.parse(userData);
      
      // Convert screen coordinates to map coordinates
      const rect = mapContainer.current!.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const lngLat = map.current.unproject([x, y]);
      const coordinates: [number, number] = [lngLat.lng, lngLat.lat];
      
      // Call the callback to handle the user drop
      onUserDropOnMap(droppedUser, coordinates);
      
    } catch (error) {
      console.error('Error handling user drop:', error);
    }
  };

  return (
    <div className="relative w-full h-full">
      {/* Search Control */}
      <div className="absolute top-4 left-4 right-4 z-20">
        <MapSearchControl
          mapboxToken={mapboxToken}
          onLocationSelect={handleLocationSearch}
          currentUser={currentUser}
          hasAvailableUsers={hasAvailableUsers?.() ?? true}
          className="max-w-md"
        />
      </div>

      <div 
        ref={mapContainer} 
        className={`absolute inset-0 rounded-lg shadow-lg transition-all duration-200 ${
          isDragOver ? 'ring-2 ring-blue-500 ring-opacity-50 bg-blue-50 bg-opacity-30' : ''
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      />
      
      {isDragOver && isAdmin(currentUser) && (
        <div className="absolute inset-0 bg-blue-500 bg-opacity-10 rounded-lg flex items-center justify-center pointer-events-none z-10 map-drag-overlay">
          <div className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-2xl font-medium border-2 border-blue-400">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">📍</span>
              <span>Drop here to pin user location</span>
            </div>
          </div>
        </div>
      )}
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
