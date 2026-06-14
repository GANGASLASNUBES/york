import { useState, useRef, useEffect } from 'react';
import { Search, MapPin, Calendar, Palette, Trees, BookOpen, Wifi, X } from 'lucide-react';

type SearchResult = {
  id: string;
  label: string;
  type: 'location' | 'event' | 'park' | 'shelter' | 'art' | 'library' | 'wifi' | 'pin';
  lat: number;
  lng: number;
};

const MOCK_RESULTS: SearchResult[] = [
  { id: '1', label: 'Parc La Fontaine', type: 'park', lat: 45.5244, lng: -73.5692 },
  { id: '2', label: 'Mission Old Brewery', type: 'shelter', lat: 45.5120, lng: -73.5540 },
  { id: '3', label: 'Festival International de Jazz', type: 'event', lat: 45.5088, lng: -73.5668 },
  { id: '4', label: 'La Joute (Riopelle)', type: 'art', lat: 45.5020, lng: -73.5670 },
  { id: '5', label: 'Grande Bibliotheque', type: 'library', lat: 45.5152, lng: -73.5615 },
  { id: '6', label: 'Mont-Royal Lookout', type: 'park', lat: 45.5048, lng: -73.5874 },
  { id: '7', label: 'Wi-Fi: Square Victoria', type: 'wifi', lat: 45.5015, lng: -73.5635 },
  { id: '8', label: 'Mural Festival - Saint-Laurent', type: 'event', lat: 45.5195, lng: -73.5721 },
  { id: '9', label: 'Jardin Botanique', type: 'park', lat: 45.5589, lng: -73.5580 },
  { id: '10', label: 'Atwater Library', type: 'library', lat: 45.4840, lng: -73.5820 },
];

const typeIcons: Record<string, typeof MapPin> = {
  location: MapPin,
  event: Calendar,
  park: Trees,
  shelter: MapPin,
  art: Palette,
  library: BookOpen,
  wifi: Wifi,
  pin: MapPin,
};

const typeColors: Record<string, string> = {
  location: 'text-gray-400',
  event: 'text-pink-400',
  park: 'text-emerald-400',
  shelter: 'text-emerald-400',
  art: 'text-cyan-400',
  library: 'text-amber-400',
  wifi: 'text-amber-400',
  pin: 'text-blue-400',
};

type Props = {
  onSelect: (result: SearchResult) => void;
};

export function CivicSearchBar({ onSelect }: Props) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const filtered = query.length > 0
    ? MOCK_RESULTS.filter((r) => r.label.toLowerCase().includes(query.toLowerCase()))
    : [];

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className="relative w-full max-w-md">
      <div className="flex items-center bg-gray-900/95 border border-gray-700 rounded-xl px-3 py-2 backdrop-blur shadow-xl">
        <Search size={14} className="text-gray-500 shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Search locations, events, art, shelters..."
          className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 px-2 outline-none"
        />
        {query && (
          <button onClick={() => { setQuery(''); setOpen(false); }} className="text-gray-500 hover:text-gray-300">
            <X size={14} />
          </button>
        )}
      </div>

      {open && filtered.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-gray-900 border border-gray-700 rounded-xl overflow-hidden shadow-2xl z-50 max-h-72 overflow-y-auto">
          {filtered.map((result) => {
            const Icon = typeIcons[result.type] || MapPin;
            return (
              <button
                key={result.id}
                onClick={() => { onSelect(result); setQuery(result.label); setOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-800/50 transition-colors text-left"
              >
                <Icon size={13} className={typeColors[result.type]} />
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-white block truncate">{result.label}</span>
                  <span className="text-[9px] text-gray-500 capitalize">{result.type}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export type { SearchResult };
