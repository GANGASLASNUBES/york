import { MapPin, Layers } from 'lucide-react';

type MapMarker = {
  id: string;
  label: string;
  lat: number;
  lng: number;
  type: 'shelter' | 'snow' | 'closure' | 'bike' | 'wifi' | 'park' | 'art';
  severity?: 'green' | 'amber' | 'red';
};

const markerColors: Record<string, string> = {
  shelter: 'bg-emerald-500',
  snow: 'bg-blue-400',
  closure: 'bg-red-500',
  bike: 'bg-cyan-400',
  wifi: 'bg-amber-400',
  park: 'bg-green-500',
  art: 'bg-pink-400',
};

type Props = {
  markers?: MapMarker[];
  title?: string;
  height?: string;
  showLegend?: boolean;
};

const MONTREAL_GRID = [
  { name: 'Plateau', x: 52, y: 35 },
  { name: 'Ville-Marie', x: 48, y: 48 },
  { name: 'Rosemont', x: 60, y: 28 },
  { name: 'Mile End', x: 46, y: 25 },
  { name: 'Old Port', x: 52, y: 58 },
  { name: 'NDG', x: 28, y: 42 },
  { name: 'Hochelaga', x: 68, y: 45 },
  { name: 'Verdun', x: 35, y: 60 },
  { name: 'Saint-Henri', x: 32, y: 52 },
  { name: 'Outremont', x: 42, y: 20 },
];

const DEFAULT_MARKERS: MapMarker[] = [
  { id: 'm1', label: 'Mission Old Brewery', lat: 45, lng: 50, type: 'shelter', severity: 'green' },
  { id: 'm2', label: 'Welcome Hall', lat: 38, lng: 35, type: 'shelter', severity: 'amber' },
  { id: 'm3', label: 'Rue Sainte-Catherine Closure', lat: 48, lng: 44, type: 'closure', severity: 'red' },
  { id: 'm4', label: 'Snow: Plateau', lat: 35, lng: 52, type: 'snow', severity: 'amber' },
  { id: 'm5', label: 'De Maisonneuve Bike Path', lat: 42, lng: 48, type: 'bike', severity: 'green' },
  { id: 'm6', label: 'Wi-Fi: Grande Bibliotheque', lat: 50, lng: 52, type: 'wifi', severity: 'green' },
  { id: 'm7', label: 'Parc La Fontaine', lat: 32, lng: 55, type: 'park', severity: 'green' },
  { id: 'm8', label: 'La Joute Sculpture', lat: 55, lng: 42, type: 'art', severity: 'green' },
];

export function CivicMapPanel({ markers = DEFAULT_MARKERS, title = 'Montreal Civic Map', height = 'h-80', showLegend = true }: Props) {
  return (
    <div className={`relative ${height} bg-gray-950 rounded-2xl border border-gray-800 overflow-hidden`}>
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 h-10 bg-gradient-to-b from-gray-950 to-transparent flex items-start justify-between px-4 pt-2.5">
        <div className="flex items-center gap-2">
          <MapPin size={12} className="text-emerald-400" />
          <span className="text-[10px] font-semibold text-white">{title}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Layers size={10} className="text-gray-500" />
          <span className="text-[9px] text-gray-500">{markers.length} points</span>
        </div>
      </div>

      {/* Grid */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
        backgroundSize: '32px 32px',
      }} />

      {/* Montreal River */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 70" preserveAspectRatio="xMidYMid meet">
        <path d="M 0,65 Q 25,62 50,64 T 100,60" fill="none" stroke="#1e3a5f" strokeWidth="8" opacity="0.3" />
        <path d="M 15,55 Q 30,50 50,52 T 85,48" fill="none" stroke="#374151" strokeWidth="0.3" opacity="0.5" />
      </svg>

      {/* Borough labels */}
      {MONTREAL_GRID.map((b) => (
        <div
          key={b.name}
          className="absolute transform -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${b.x}%`, top: `${b.y}%` }}
        >
          <span className="text-[8px] text-gray-700 font-medium">{b.name}</span>
        </div>
      ))}

      {/* Markers */}
      {markers.map((marker) => (
        <div
          key={marker.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
          style={{ left: `${marker.lng}%`, top: `${marker.lat}%` }}
        >
          <div className={`w-3 h-3 rounded-full ${markerColors[marker.type]} shadow-lg ring-2 ring-gray-950 group-hover:scale-150 transition-transform`} />
          <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 px-2 py-1 bg-gray-900 border border-gray-700 rounded text-[8px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none font-medium">
            {marker.label}
          </div>
        </div>
      ))}

      {/* Legend */}
      {showLegend && (
        <div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
          {Object.entries(markerColors).map(([type, color]) => (
            <div key={type} className="flex items-center gap-1 px-1.5 py-0.5 bg-gray-900/80 border border-gray-800 rounded">
              <div className={`w-2 h-2 rounded-full ${color}`} />
              <span className="text-[8px] text-gray-400 capitalize">{type}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
