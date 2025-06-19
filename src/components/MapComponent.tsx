
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { User } from '../types/User';

interface MapComponentProps {
  users: User[];
  onMapClick: (coordinates: [number, number]) => void;
  mapboxToken: string;
}

const MapComponent: React.FC<MapComponentProps> = ({ users, onMapClick, mapboxToken }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [36.8219, -1.2921], // Nairobi, Kenya coordinates
      zoom: 10,
    });

    map.current.addControl(
      new mapboxgl.NavigationControl(),
      'top-right'
    );

    map.current.on('click', (e) => {
      onMapClick([e.lngLat.lng, e.lngLat.lat]);
    });

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken, onMapClick]);

  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Add markers for pinned users
    users.filter(user => user.pinned && user.location).forEach(user => {
      const marker = new mapboxgl.Marker({
        color: '#3B82F6'
      })
        .setLngLat(user.location!)
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML(`<div class="font-semibold">${user.name}</div>`)
        )
        .addTo(map.current!);
      
      markers.current.push(marker);
    });
  }, [users]);

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
