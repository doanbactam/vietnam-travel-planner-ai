/// <reference types="@types/google.maps" />

import React, { useEffect, useRef, useState } from 'react';
import { MapData, MapPoint, MapRoute } from '../types';
import { LoadingIcon } from './LoadingIcon';

// FIX: Add global declaration for window.google to help TypeScript recognize the Google Maps API.
// This assumes that @types/google.maps is installed and the triple-slash directive above correctly loads the types.
// Removed problematic 'declare global' block for 'window.google'.
// The '/// <reference types="@types/google.maps" />' directive is the standard way to include these global types.
// The previous declaration for 'window.google' referenced 'typeof google', which failed as 'google' was not a recognized name,
// likely due to the broader issue of the type definition file not being found (error on line 2).
// Relying on the triple-slash directive is a cleaner approach.

interface ItineraryMapProps {
  mapData: MapData;
}

export const ItineraryMap: React.FC<ItineraryMapProps> = ({ mapData }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [markers, setMarkers] = useState<google.maps.marker.AdvancedMarkerElement[]>([]);
  const [polylines, setPolylines] = useState<google.maps.Polyline[]>([]);

  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current) {
        setError("Map container not found.");
        setIsLoading(false);
        return;
      }

      // FIX: Ensure window.google and window.google.maps are checked
      if (typeof window.google === 'undefined' || typeof window.google.maps === 'undefined') {
        setError("Google Maps API chưa sẵn sàng. Vui lòng kiểm tra kết nối mạng hoặc cấu hình API key.");
        setIsLoading(false);
        return;
      }

      try {
        // FIX: Consistently use window.google.maps
        const { Map } = await window.google.maps.importLibrary("maps") as google.maps.MapsLibrary;
        const { AdvancedMarkerElement } = await window.google.maps.importLibrary("marker") as google.maps.MarkerLibrary;

        const initialCenter = mapData.initialCenter || 
                              (mapData.points.length > 0 ? { lat: mapData.points[0].latitude, lng: mapData.points[0].longitude } : { lat: 16.0479, lng: 108.2208 }); // Default to Da Nang
        const initialZoom = mapData.initialZoom || (mapData.points.length > 0 ? 10 : 6);

        const mapInstance = new Map(mapRef.current, {
          center: initialCenter,
          zoom: initialZoom,
          mapId: 'VIETNAM_TRAVEL_PLANNER_MAP', // Optional: for cloud-based map styling
          gestureHandling: 'greedy',
          streetViewControl: false,
          mapTypeControl: false,
          zoomControl: true,
          fullscreenControl: false,
        });
        setMap(mapInstance);
        
        // Clear previous markers and polylines
        markers.forEach(marker => marker.map = null);
        setMarkers([]);
        polylines.forEach(polyline => polyline.setMap(null));
        setPolylines([]);

        const newMarkers: google.maps.marker.AdvancedMarkerElement[] = [];
        const newPolylines: google.maps.Polyline[] = [];
        // FIX: Consistently use window.google.maps
        const bounds = new window.google.maps.LatLngBounds();

        // Add points (markers)
        mapData.points.forEach((point, index) => {
          const position = { lat: point.latitude, lng: point.longitude };
          const marker = new AdvancedMarkerElement({
            map: mapInstance,
            position: position,
            title: point.name,
            // You can customize marker content here if needed
            // content: document.createElement('div'), // Example for custom HTML marker
          });

          // Add info window
          if (point.description || point.name) {
            const infoWindowContent = 
              `<div style="padding: 5px;">` +
              `<h4 style="margin:0 0 5px 0; font-weight:bold;">${point.icon || ''} ${point.name}</h4>` +
              (point.description ? `<p style="margin:0; font-size:0.9em;">${point.description}</p>` : '') +
              `</div>`;
            
            // FIX: Consistently use window.google.maps
            const infoWindow = new window.google.maps.InfoWindow({
              content: infoWindowContent,
            });
            marker.addListener('click', () => {
              infoWindow.open({
                anchor: marker,
                map: mapInstance,
              });
            });
          }

          newMarkers.push(marker);
          bounds.extend(position);
        });
        setMarkers(newMarkers);

        // Add routes (polylines)
        mapData.routes.forEach(route => {
          const start = mapData.points.find(p => p.name === route.startPointName);
          const end = mapData.points.find(p => p.name === route.endPointName);

          if (start && end) {
            const path = [
              { lat: start.latitude, lng: start.longitude },
              { lat: end.latitude, lng: end.longitude },
            ];
            // FIX: Consistently use window.google.maps
            const polyline = new window.google.maps.Polyline({
              path: path,
              geodesic: true,
              strokeColor: '#10B981', // Teal-500
              strokeOpacity: 0.8,
              strokeWeight: 4,
            });
            polyline.setMap(mapInstance);
            newPolylines.push(polyline);
          }
        });
        setPolylines(newPolylines);

        if (mapData.points.length > 0) {
          mapInstance.fitBounds(bounds);
           // Prevent zooming too much if only one point or points are very close
           if (mapData.points.length === 1 || bounds.getNorthEast().equals(bounds.getSouthWest())) {
             mapInstance.setZoom(Math.min(initialZoom, 15)); // Adjust max zoom for single point
           }
        }

        setError(null);
      } catch (e) {
        console.error("Error initializing Google Map:", e);
        setError("Không thể tải bản đồ. Vui lòng thử lại sau.");
      } finally {
        setIsLoading(false);
      }
    };

    initMap();

    // Cleanup function
    return () => {
      markers.forEach(marker => marker.map = null);
      polylines.forEach(polyline => polyline.setMap(null));
      // If mapInstance was stored in state and had a way to be "destroyed", do it here
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps 
  }, [mapData]); // markers and polylines were removed from deps as they are managed internally

  if (isLoading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center bg-slate-100 rounded-lg text-slate-600">
        <LoadingIcon className="w-10 h-10 text-teal-600" />
        <p className="mt-3">Đang tải bản đồ...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-96 flex flex-col items-center justify-center bg-red-50 border border-red-200 rounded-lg text-red-700 p-4">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mb-3">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m12-3.75A12 12 0 1 1 0 12a12 12 0 0 1 24 0ZM12 16.5h.008v.008H12v-.008Z" />
        </svg>
        <p className="font-semibold">Lỗi Bản Đồ</p>
        <p className="text-sm text-center">{error}</p>
      </div>
    );
  }
  
  if (!mapData || (mapData.points.length === 0 && mapData.routes.length === 0)) {
    return (
      <div className="h-96 flex flex-col items-center justify-center bg-slate-100 rounded-lg text-slate-500 text-sm">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mb-3 opacity-60">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
        </svg>
        <p>Không có dữ liệu bản đồ cho lịch trình này.</p>
      </div>
    );
  }


  return (
    <div 
      ref={mapRef} 
      className="w-full h-96 sm:h-[500px] bg-slate-200 rounded-lg shadow-md overflow-hidden border border-slate-300"
      aria-label="Bản đồ lịch trình"
    >
      {/* Google Map will be rendered here */}
    </div>
  );
};