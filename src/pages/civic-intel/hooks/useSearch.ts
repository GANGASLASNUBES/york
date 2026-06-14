import { useState, useCallback } from 'react';

export type SearchResultType = 'civic' | 'event' | 'park' | 'shelter' | 'art' | 'library' | 'pin' | 'trail';

export type SearchResult = {
  id: string;
  title: string;
  type: SearchResultType;
  subtitle?: string;
  lat: number;
  lng: number;
};

const MOCK_INDEX: SearchResult[] = [
  { id: 's1', title: 'Old Port Shelter', type: 'shelter', subtitle: '28 beds available', lat: 45.5075, lng: -73.5530 },
  { id: 's2', title: 'La Joute (Riopelle)', type: 'art', subtitle: 'Kinetic sculpture', lat: 45.5020, lng: -73.5600 },
  { id: 's3', title: 'Parc La Fontaine', type: 'park', subtitle: 'Open 6am-11pm', lat: 45.5225, lng: -73.5680 },
  { id: 's4', title: 'Jazz Festival', type: 'event', subtitle: 'Jun 28 - Jul 7', lat: 45.5088, lng: -73.5668 },
  { id: 's5', title: 'Grande Bibliotheque', type: 'library', subtitle: 'Free Wi-Fi', lat: 45.5155, lng: -73.5620 },
  { id: 's6', title: 'Under Pressure Murals', type: 'art', subtitle: 'Saint-Laurent corridor', lat: 45.5244, lng: -73.5692 },
  { id: 's7', title: 'Mont-Royal Park', type: 'park', subtitle: 'Belvedere open', lat: 45.5048, lng: -73.5874 },
  { id: 's8', title: 'Art Trail - Downtown', type: 'trail', subtitle: '4.2 km, 8 stops', lat: 45.5017, lng: -73.5673 },
  { id: 's9', title: 'Transit Hub Berri-UQAM', type: 'civic', subtitle: '3 metro lines', lat: 45.5155, lng: -73.5613 },
  { id: 's10', title: 'Warming Center - Ville-Marie', type: 'shelter', subtitle: '24/7 access', lat: 45.5100, lng: -73.5650 },
];

export function useSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const search = useCallback((q: string) => {
    setQuery(q);
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setIsSearching(true);
    const lower = q.toLowerCase();
    const matches = MOCK_INDEX.filter(
      (item) =>
        item.title.toLowerCase().includes(lower) ||
        item.type.includes(lower) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(lower))
    );
    setResults(matches);
    setIsSearching(false);
  }, []);

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
  }, []);

  return { query, results, isSearching, search, clearSearch };
}
