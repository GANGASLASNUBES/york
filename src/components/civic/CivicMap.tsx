import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, Polyline, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

type MarkerData = {
  id: string;
  lat: number;
  lng: number;
  type: 'shelter' | 'snow' | 'closure' | 'bike' | 'wifi' | 'park' | 'art' | 'event' | 'traffic' | 'noise' | 'transit' | 'pin';
  label: string;
  severity?: 'green' | 'amber' | 'red';
  details?: string;
};

type HeatZone = {
  lat: number;
  lng: number;
  intensity: number;
  type: 'air_quality' | 'noise' | 'traffic' | 'mood';
};

type RouteOverlay = {
  id: string;
  points: [number, number][];
  color: string;
  label: string;
};

type Props = {
  markers: MarkerData[];
  heatZones?: HeatZone[];
  routes?: RouteOverlay[];
  onMapClick?: (lat: number, lng: number) => void;
  onMapLongPress?: (lat: number, lng: number) => void;
  onMarkerClick?: (marker: MarkerData) => void;
  center?: [number, number];
  zoom?: number;
  storyMode?: boolean;
};

const markerColors: Record<string, string> = {
  shelter: '#10b981',
  snow: '#60a5fa',
  closure: '#ef4444',
  bike: '#06b6d4',
  wifi: '#f59e0b',
  park: '#22c55e',
  art: '#f472b6',
  event: '#a855f7',
  traffic: '#ef4444',
  noise: '#eab308',
  transit: '#3b82f6',
  pin: '#6366f1',
};

function createCustomIcon(type: string, severity?: string) {
  const color = severity === 'red' ? '#ef4444' : severity === 'amber' ? '#f59e0b' : markerColors[type] || '#6b7280';
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="width:12px;height:12px;border-radius:50%;background:${color};border:2px solid #1f2937;box-shadow:0 2px 8px ${color}40;"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });
}

function MapClickHandler({ onMapClick, onMapLongPress }: {
  onMapClick?: (lat: number, lng: number) => void;
  onMapLongPress?: (lat: number, lng: number) => void;
}) {
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pressPos = useRef<{ lat: number; lng: number } | null>(null);

  useMapEvents({
    click(e) {
      onMapClick?.(e.latlng.lat, e.latlng.lng);
    },
    mousedown(e) {
      pressPos.current = { lat: e.latlng.lat, lng: e.latlng.lng };
      pressTimer.current = setTimeout(() => {
        if (pressPos.current) {
          onMapLongPress?.(pressPos.current.lat, pressPos.current.lng);
        }
      }, 600);
    },
    mouseup() {
      if (pressTimer.current) {
        clearTimeout(pressTimer.current);
        pressTimer.current = null;
      }
    },
    mousemove() {
      if (pressTimer.current) {
        clearTimeout(pressTimer.current);
        pressTimer.current = null;
      }
    },
  });

  return null;
}

function MapCenterHandler({ center, zoom }: { center?: [number, number]; zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || map.getZoom(), { animate: true });
    }
  }, [center, zoom, map]);
  return null;
}

const MONTREAL_CENTER: [number, number] = [45.5017, -73.5673];

export function CivicMap({
  markers,
  heatZones = [],
  routes = [],
  onMapClick,
  onMapLongPress,
  onMarkerClick,
  center,
  zoom = 13,
  storyMode = false,
}: Props) {
  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={center || MONTREAL_CENTER}
        zoom={zoom}
        className="w-full h-full z-0"
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url={storyMode
            ? 'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png'
            : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
          }
        />

        <MapClickHandler onMapClick={onMapClick} onMapLongPress={onMapLongPress} />
        <MapCenterHandler center={center} zoom={zoom} />

        {/* Heat zones as circles */}
        {heatZones.map((zone, i) => {
          const color = zone.type === 'air_quality' ? '#22c55e'
            : zone.type === 'noise' ? '#eab308'
            : zone.type === 'traffic' ? '#ef4444'
            : '#3b82f6';
          return (
            <CircleMarker
              key={`heat-${i}`}
              center={[zone.lat, zone.lng]}
              radius={zone.intensity * 15}
              pathOptions={{
                fillColor: color,
                fillOpacity: 0.15,
                stroke: true,
                color: color,
                weight: 1,
                opacity: 0.3,
              }}
            />
          );
        })}

        {/* Route overlays */}
        {routes.map((route) => (
          <Polyline
            key={route.id}
            positions={route.points}
            pathOptions={{ color: route.color, weight: 3, opacity: 0.7 }}
          />
        ))}

        {/* Markers */}
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            position={[marker.lat, marker.lng]}
            icon={createCustomIcon(marker.type, marker.severity)}
            eventHandlers={{
              click: () => onMarkerClick?.(marker),
            }}
          >
            <Popup className="civic-popup">
              <div className="text-xs font-medium">{marker.label}</div>
              {marker.details && <div className="text-[10px] text-gray-500 mt-0.5">{marker.details}</div>}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export type { MarkerData, HeatZone, RouteOverlay };
