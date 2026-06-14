import { MapContainer, TileLayer, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const MONTREAL_CENTER: [number, number] = [45.5017, -73.5673];

const LIVE_POINTS = [
  { lat: 45.5120, lng: -73.5540, color: '#10b981', size: 4 },
  { lat: 45.5244, lng: -73.5750, color: '#60a5fa', size: 5 },
  { lat: 45.5041, lng: -73.5700, color: '#ef4444', size: 4 },
  { lat: 45.5088, lng: -73.5668, color: '#a855f7', size: 6 },
  { lat: 45.5195, lng: -73.5721, color: '#f472b6', size: 4 },
  { lat: 45.5048, lng: -73.5874, color: '#22c55e', size: 5 },
  { lat: 45.5152, lng: -73.5615, color: '#f59e0b', size: 3 },
  { lat: 45.5180, lng: -73.5620, color: '#10b981', size: 4 },
  { lat: 45.5350, lng: -73.5600, color: '#60a5fa', size: 3 },
  { lat: 45.4960, lng: -73.5780, color: '#ef4444', size: 5 },
  { lat: 45.5200, lng: -73.5800, color: '#06b6d4', size: 4 },
  { lat: 45.5015, lng: -73.5635, color: '#f59e0b', size: 3 },
];

export function MiniMapHero() {
  return (
    <div className="w-full h-full rounded-2xl overflow-hidden border border-gray-800 shadow-2xl">
      <MapContainer
        center={MONTREAL_CENTER}
        zoom={12}
        className="w-full h-full"
        zoomControl={false}
        attributionControl={false}
        dragging={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        touchZoom={false}
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
        {LIVE_POINTS.map((point, i) => (
          <CircleMarker
            key={i}
            center={[point.lat, point.lng]}
            radius={point.size}
            pathOptions={{
              fillColor: point.color,
              fillOpacity: 0.8,
              stroke: true,
              color: point.color,
              weight: 1,
              opacity: 0.4,
            }}
          />
        ))}
      </MapContainer>
    </div>
  );
}
