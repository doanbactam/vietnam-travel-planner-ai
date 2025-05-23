// FIX: Removed '/// <reference types="@types/google.maps" />' as it was causing an error "Cannot find type definition file".
// The following fixes assume that the Google Maps API is loaded globally and available on window.google.
// Types are cast to 'any' or inferred as 'any' to resolve TypeScript errors when @types/google.maps is not found.

import React, { useEffect, useRef, useState } from 'react';
import { MapData, MapPoint, MapRoute } from '../types';
import { LoadingIcon } from './LoadingIcon';

interface ItineraryMapProps {
  mapData: MapData;
}

export const ItineraryMap: React.FC<ItineraryMapProps> = ({ mapData }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  // FIX: Changed google.maps.Map to any due to type definition issues.
  const [map, setMap] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  // FIX: Changed google.maps.marker.AdvancedMarkerElement[] to any[] due to type definition issues.
  const [markers, setMarkers] = useState<any[]>([]);
  // FIX: Changed google.maps.Polyline[] to any[] due to type definition issues.
  const [polylines, setPolylines] = useState<any[]>([]);

  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current) {
        setError("Map container not found.");
        setIsLoading(false);
        return;
      }

      // FIX: Cast window to 'any' to access 'google' property and avoid 'Property 'google' does not exist on type 'Window'' error.
      if (typeof (window as any).google === 'undefined' || typeof (window as any).google.maps === 'undefined') {
        setError("Google Maps API chưa sẵn sàng. Vui lòng kiểm tra kết nối mạng hoặc cấu hình API key.");
        setIsLoading(false);
        return;
      }

      try {
        // FIX: Cast window to 'any' and removed specific type casting (as google.maps.MapsLibrary) for imported libraries.
        // Map constructor will be of type 'any'.
        const { Map } = await (window as any).google.maps.importLibrary("maps");
        // FIX: Cast window to 'any' and removed specific type casting (as google.maps.MarkerLibrary) for imported libraries.
        // AdvancedMarkerElement constructor will be of type 'any'.
        const { AdvancedMarkerElement } = await (window as any).google.maps.importLibrary("marker");

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
        // FIX: If 'markers' is any[], 'marker.map' access is fine.
        markers.forEach(marker => marker.map = null);
        setMarkers([]);
        // FIX: If 'polylines' is any[], 'polyline.setMap' access is fine.
        polylines.forEach(polyline => polyline.setMap(null));
        setPolylines([]);

        const newMarkers: any[] = [];
        const newPolylines: any[] = [];
        // FIX: Cast window to 'any' to access google.maps.LatLngBounds.
        const bounds = new (window as any).google.maps.LatLngBounds();

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
            
            // FIX: Cast window to 'any' to access google.maps.InfoWindow.
            const infoWindow = new (window as any).google.maps.InfoWindow({
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
            // FIX: Cast window to 'any' to access google.maps.Polyline.
            const polyline = new (window as any).google.maps.Polyline({
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
