import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPin, ChevronDown, ArrowLeft, Building2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import NeighborhoodSnapshotCard from '../../components/neighborhoods/NeighborhoodSnapshotCard';
import NeighborhoodMiniMap from '../../components/neighborhoods/NeighborhoodMiniMap';
import type { NeighborhoodStats } from '../../components/neighborhoods/NeighborhoodSnapshotCard';

type Borough = {
  name: string;
  neighborhoods: string[];
  center: [number, number];
};

const BOROUGHS: Borough[] = [
  { name: 'Le Plateau-Mont-Royal', neighborhoods: ['Mile End', 'Le Plateau', 'De Lorimier'], center: [45.5244, -73.5750] },
  { name: 'Rosemont-La Petite-Patrie', neighborhoods: ['Rosemont', 'La Petite-Patrie', 'Vieux-Rosemont'], center: [45.5400, -73.5850] },
  { name: 'Ville-Marie', neighborhoods: ['Downtown', 'Old Montreal', 'Quartier Latin', 'Quartier des Spectacles'], center: [45.5088, -73.5668] },
  { name: 'Verdun', neighborhoods: ['Wellington-De L Eglise', 'Desmarchais-Crawford', 'Ile-des-Soeurs'], center: [45.4530, -73.5700] },
  { name: 'Mercier-Hochelaga-Maisonneuve', neighborhoods: ['Hochelaga', 'Maisonneuve', 'Mercier-Est'], center: [45.5550, -73.5300] },
  { name: 'Le Sud-Ouest', neighborhoods: ['Saint-Henri', 'Griffintown', 'Pointe-Saint-Charles'], center: [45.4800, -73.5800] },
  { name: 'Outremont', neighborhoods: ['Outremont Village', 'Mile-Ex'], center: [45.5200, -73.6000] },
  { name: 'Cote-des-Neiges-NDG', neighborhoods: ['Cote-des-Neiges', 'NDG', 'Snowdon'], center: [45.4900, -73.6200] },
];

const MOCK_PINS = [
  { id: 'n1', lat: 45.5244, lng: -73.5692, label: 'Parc La Fontaine', type: 'park' },
  { id: 'n2', lat: 45.5195, lng: -73.5721, label: 'Mural Festival', type: 'event' },
  { id: 'n3', lat: 45.5180, lng: -73.5620, label: 'Maison du Pere', type: 'shelter' },
  { id: 'n4', lat: 45.5100, lng: -73.5650, label: 'De Maisonneuve Path', type: 'bike' },
  { id: 'n5', lat: 45.5020, lng: -73.5670, label: 'La Joute', type: 'art' },
];

const FALLBACK_STATS: NeighborhoodStats[] = BOROUGHS.flatMap((b) =>
  b.neighborhoods.map((n) => ({
    borough: b.name,
    neighborhood: n,
    heatIndex: Math.floor(Math.random() * 40) + 30,
    transitStatus: ['normal', 'minor_delays', 'disruptions'][Math.floor(Math.random() * 3)],
    noiseLevel: Math.floor(Math.random() * 30) + 30,
    airQuality: Math.floor(Math.random() * 25) + 20,
    activeEvents: Math.floor(Math.random() * 6),
    shelterCapacity: ['available', 'limited', 'full'][Math.floor(Math.random() * 3)],
  }))
);

export default function NeighborhoodDashboardPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [selectedBorough, setSelectedBorough] = useState<Borough>(BOROUGHS[0]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [stats, setStats] = useState<NeighborhoodStats[]>(FALLBACK_STATS);

  useEffect(() => {
    async function fetchStats() {
      const { data } = await supabase
        .from('neighborhood_stats')
        .select('*')
        .eq('borough', selectedBorough.name);

      if (data && data.length > 0) {
        setStats(data.map((d) => ({
          borough: d.borough,
          neighborhood: d.neighborhood,
          heatIndex: d.heat_index,
          transitStatus: d.transit_status,
          noiseLevel: d.noise_level,
          airQuality: d.air_quality,
          activeEvents: d.active_events,
          shelterCapacity: d.shelter_capacity,
        })));
      }
    }
    fetchStats();
  }, [selectedBorough]);

  const filteredStats = stats.filter((s) => s.borough === selectedBorough.name);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-gray-900/95 border-b border-gray-800 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/bips/civic-intel')} className="text-gray-500 hover:text-white transition-colors">
              <ArrowLeft size={16} />
            </button>
            <div className="w-8 h-8 bg-cyan-600/20 rounded-lg flex items-center justify-center">
              <Building2 size={14} className="text-cyan-400" />
            </div>
            <div>
              <h1 className="text-sm font-bold">{t('neighborhoods.title')}</h1>
              <p className="text-[10px] text-gray-500">{t('neighborhoods.subtitle')}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <LanguageSwitcher compact />
            {/* Borough selector */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg hover:border-gray-600 transition-colors"
              >
                <MapPin size={12} className="text-cyan-400" />
                <span className="text-xs font-medium text-gray-200">{selectedBorough.name}</span>
                <ChevronDown size={12} className="text-gray-500" />
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-1 w-64 bg-gray-900 border border-gray-700 rounded-xl shadow-xl z-40 py-1 max-h-60 overflow-y-auto">
                  {BOROUGHS.map((b) => (
                    <button
                      key={b.name}
                      onClick={() => { setSelectedBorough(b); setDropdownOpen(false); }}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-800 transition-colors ${
                        b.name === selectedBorough.name ? 'text-cyan-400 bg-gray-800/50' : 'text-gray-300'
                      }`}
                    >
                      {b.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Mini map */}
        <div className="mb-6">
          <NeighborhoodMiniMap center={selectedBorough.center} pins={MOCK_PINS} />
        </div>

        {/* Snapshot cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStats.map((s) => (
            <NeighborhoodSnapshotCard
              key={s.neighborhood}
              stats={s}
              onViewInCommandCenter={() => navigate('/bips/civic-intel')}
              onViewStories={() => navigate('/lexi/civic-stories')}
            />
          ))}
        </div>

        {filteredStats.length === 0 && (
          <div className="text-center py-16">
            <MapPin size={32} className="text-gray-700 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No neighborhood data available for {selectedBorough.name}</p>
          </div>
        )}
      </div>
    </div>
  );
}
