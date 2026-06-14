import { useState } from 'react';
import { MapPin, Circle, Navigation, Shield, Hop as Home, Briefcase, Heart, TriangleAlert as AlertTriangle } from 'lucide-react';

type MoodTag = 'safe' | 'neutral' | 'stressful';
type PinType = 'shelter' | 'work' | 'anchor' | 'current';

type MapPin_T = {
  id: string;
  label: string;
  type: PinType;
  lat: number;
  lng: number;
  moodTag: MoodTag;
};

const METRO_STATIONS = [
  { name: 'Berri-UQAM', x: 52, y: 45 },
  { name: 'Place-des-Arts', x: 44, y: 42 },
  { name: 'McGill', x: 40, y: 38 },
  { name: 'Peel', x: 36, y: 36 },
  { name: 'Guy-Concordia', x: 30, y: 34 },
  { name: 'Atwater', x: 24, y: 32 },
  { name: 'Lionel-Groulx', x: 20, y: 35 },
  { name: 'Champ-de-Mars', x: 56, y: 44 },
  { name: 'Papineau', x: 62, y: 46 },
  { name: 'Frontenac', x: 68, y: 48 },
  { name: 'Jean-Talon', x: 52, y: 22 },
  { name: 'Parc', x: 44, y: 24 },
  { name: 'Mont-Royal', x: 56, y: 28 },
  { name: 'Sherbrooke', x: 54, y: 36 },
  { name: 'Beaudry', x: 54, y: 43 },
];

const PINS: MapPin_T[] = [
  { id: 'p1', label: 'Mission Old Brewery', type: 'shelter', lat: 45, lng: 48, moodTag: 'safe' },
  { id: 'p2', label: 'Cafe Workspace', type: 'work', lat: 38, lng: 40, moodTag: 'safe' },
  { id: 'p3', label: 'Lexi Anchor Spot', type: 'anchor', lat: 34, lng: 36, moodTag: 'safe' },
  { id: 'p4', label: 'Kee (Live)', type: 'current', lat: 52, lng: 44, moodTag: 'neutral' },
  { id: 'p5', label: 'Library', type: 'work', lat: 44, lng: 42, moodTag: 'safe' },
  { id: 'p6', label: 'Metro Tunnel', type: 'shelter', lat: 62, lng: 46, moodTag: 'stressful' },
];

const moodColors: Record<MoodTag, string> = {
  safe: 'bg-emerald-500',
  neutral: 'bg-amber-500',
  stressful: 'bg-red-500',
};

const moodBorderColors: Record<MoodTag, string> = {
  safe: 'border-emerald-500/50',
  neutral: 'border-amber-500/50',
  stressful: 'border-red-500/50',
};

const pinIcons: Record<PinType, typeof Home> = {
  shelter: Home,
  work: Briefcase,
  anchor: Heart,
  current: Navigation,
};

type Props = {
  isAdmin?: boolean;
};

export function LeachLocationMap({ isAdmin = false }: Props) {
  const [selectedPin, setSelectedPin] = useState<MapPin_T | null>(null);
  const [showMoodOverlay, setShowMoodOverlay] = useState(true);

  return (
    <div className="h-full flex flex-col">
      {/* Map header */}
      <div className="h-12 bg-gray-900/50 border-b border-gray-800 flex items-center justify-between px-5">
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-emerald-400" />
          <span className="text-sm font-medium text-white">Montreal Metro Overlay</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMoodOverlay(!showMoodOverlay)}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-colors ${
              showMoodOverlay ? 'bg-emerald-900/30 text-emerald-300' : 'bg-gray-800 text-gray-500'
            }`}
          >
            Mood Overlay
          </button>
          {isAdmin && (
            <button className="px-2.5 py-1 rounded-lg text-[10px] font-medium bg-orange-900/30 text-orange-300">
              Update Location
            </button>
          )}
        </div>
      </div>

      {/* Map area */}
      <div className="flex-1 relative bg-gray-950 overflow-hidden">
        {/* Grid background */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />

        {/* Metro lines (simplified SVG representation) */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 70" preserveAspectRatio="xMidYMid meet">
          {/* Green line (horizontal-ish) */}
          <polyline
            points="20,35 24,32 30,34 36,36 40,38 44,42 52,45 56,44 62,46 68,48"
            fill="none"
            stroke="#10b981"
            strokeWidth="0.6"
            opacity="0.6"
          />
          {/* Orange line (vertical-ish) */}
          <polyline
            points="44,24 52,22 52,28 54,36 54,43 52,45"
            fill="none"
            stroke="#f97316"
            strokeWidth="0.6"
            opacity="0.6"
          />
          {/* Blue line */}
          <polyline
            points="52,45 56,44 56,28 52,22"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="0.6"
            opacity="0.6"
          />
        </svg>

        {/* Metro stations */}
        {METRO_STATIONS.map((station) => (
          <div
            key={station.name}
            className="absolute transform -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${station.x}%`, top: `${station.y}%` }}
          >
            <div className="w-2.5 h-2.5 bg-gray-700 rounded-full border border-gray-600" />
            <span className="absolute left-3 top-[-2px] text-[7px] text-gray-500 whitespace-nowrap font-medium">
              {station.name}
            </span>
          </div>
        ))}

        {/* Pins */}
        {PINS.map((pin) => {
          const Icon = pinIcons[pin.type];
          const isSelected = selectedPin?.id === pin.id;
          return (
            <button
              key={pin.id}
              onClick={() => setSelectedPin(isSelected ? null : pin)}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
              style={{ left: `${pin.lng}%`, top: `${pin.lat}%` }}
            >
              {showMoodOverlay && (
                <div className={`absolute inset-0 w-8 h-8 -m-2 rounded-full ${moodColors[pin.moodTag]} opacity-20 animate-pulse`} />
              )}
              <div className={`relative w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${
                pin.type === 'current'
                  ? 'bg-emerald-600 border-emerald-400 shadow-lg shadow-emerald-500/30'
                  : `bg-gray-800 ${moodBorderColors[pin.moodTag]}`
              } ${isSelected ? 'scale-125 ring-2 ring-white/20' : 'group-hover:scale-110'}`}>
                <Icon size={10} className={pin.type === 'current' ? 'text-white' : 'text-gray-300'} />
              </div>
              {(isSelected || pin.type === 'current') && (
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 px-2 py-1 bg-gray-900 border border-gray-700 rounded text-[9px] text-white whitespace-nowrap font-medium">
                  {pin.label}
                </div>
              )}
            </button>
          );
        })}

        {/* Selected pin details */}
        {selectedPin && (
          <div className="absolute bottom-4 left-4 right-4 bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${moodColors[selectedPin.moodTag]}`} />
                <div>
                  <p className="text-sm font-medium text-white">{selectedPin.label}</p>
                  <p className="text-[10px] text-gray-500 capitalize">{selectedPin.type} | Mood: {selectedPin.moodTag}</p>
                </div>
              </div>
              <button onClick={() => setSelectedPin(null)} className="text-gray-500 hover:text-white text-xs">
                Close
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="h-10 bg-gray-900/80 border-t border-gray-800 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Circle size={6} className="text-emerald-500 fill-emerald-500" />
            <span className="text-[9px] text-gray-500">Safe</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Circle size={6} className="text-amber-500 fill-amber-500" />
            <span className="text-[9px] text-gray-500">Neutral</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Circle size={6} className="text-red-500 fill-red-500" />
            <span className="text-[9px] text-gray-500">Stressful</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Shield size={9} className="text-gray-600" />
          <span className="text-[9px] text-gray-600">Location visible to Lexi only</span>
        </div>
      </div>
    </div>
  );
}
