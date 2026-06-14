import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, Eye } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCivicLayers } from './hooks/useCivicLayers';
import { useHeatIndex } from './hooks/useHeatIndex';
import { useStoryMode } from './hooks/useStoryMode';
import type { MarkerData, HeatZone, RouteOverlay } from '../../components/civic/CivicMap';
import type { SearchResult } from '../../components/civic/CivicSearchBar';
import type { PinData } from '../../components/civic/CivicPinForm';
import TopBar from './TopBar';
import BottomBar from './BottomBar';
import LayerSidebar from './LayerSidebar';
import DetailSidebar from './DetailSidebar';
import MapContainer from './MapContainer';
import PinCreationModal from './PinCreationModal';

type RightTab = 'details' | 'mood' | 'stories' | 'gear';

const CIVIC_MARKERS: MarkerData[] = [
  { id: 's1', lat: 45.5120, lng: -73.5540, type: 'shelter', label: 'Mission Old Brewery', severity: 'green', details: '235/300 beds' },
  { id: 's2', lat: 45.5180, lng: -73.5620, type: 'shelter', label: 'Maison du Pere', severity: 'amber', details: '180/200 beds' },
  { id: 's3', lat: 45.4960, lng: -73.5780, type: 'shelter', label: 'Welcome Hall Mission', severity: 'red', details: 'Full - waitlist active' },
  { id: 'sn1', lat: 45.5244, lng: -73.5750, type: 'snow', label: 'Snow: Plateau', severity: 'amber', details: 'Loading in progress' },
  { id: 'sn2', lat: 45.5350, lng: -73.5600, type: 'snow', label: 'Snow: Rosemont', severity: 'amber', details: 'Plowing underway' },
  { id: 'sn3', lat: 45.5017, lng: -73.5600, type: 'snow', label: 'Snow: Ville-Marie', severity: 'green', details: '87% complete' },
  { id: 'c1', lat: 45.5041, lng: -73.5700, type: 'closure', label: 'Sainte-Catherine Closure', severity: 'red', details: 'Festival setup until Jun 15' },
  { id: 'c2', lat: 45.5180, lng: -73.5874, type: 'closure', label: 'Avenue du Parc', severity: 'amber', details: 'Water main repair' },
  { id: 'b1', lat: 45.5100, lng: -73.5650, type: 'bike', label: 'De Maisonneuve Path', severity: 'green', details: 'Clear' },
  { id: 'b2', lat: 45.5200, lng: -73.5800, type: 'bike', label: 'Rachel Path', severity: 'green', details: 'Clear' },
  { id: 'w1', lat: 45.5152, lng: -73.5615, type: 'wifi', label: 'Grande Bibliotheque Wi-Fi', severity: 'green', details: 'Free public access' },
  { id: 'w2', lat: 45.5015, lng: -73.5635, type: 'wifi', label: 'Square Victoria Wi-Fi', severity: 'green', details: 'Free public access' },
  { id: 'p1', lat: 45.5244, lng: -73.5692, type: 'park', label: 'Parc La Fontaine', severity: 'green', details: 'Open dawn to dusk' },
  { id: 'p2', lat: 45.5048, lng: -73.5874, type: 'park', label: 'Mont-Royal Park', severity: 'green', details: 'All trails open' },
  { id: 'a1', lat: 45.5020, lng: -73.5670, type: 'art', label: 'La Joute (Riopelle)', severity: 'green', details: 'Fire sequence at 9pm' },
  { id: 'a2', lat: 45.5065, lng: -73.5715, type: 'art', label: 'Illuminated Crowd', severity: 'green', details: 'McGill College Ave' },
  { id: 'a3', lat: 45.5195, lng: -73.5721, type: 'art', label: 'Under Pressure Murals', severity: 'green', details: 'New murals Jun 2026' },
  { id: 'e1', lat: 45.5088, lng: -73.5668, type: 'event', label: 'Jazz Festival', severity: 'green', details: 'Jun 28 - Jul 7' },
  { id: 'e2', lat: 45.5195, lng: -73.5721, type: 'event', label: 'Mural Festival', severity: 'green', details: 'Jun 6-16' },
  { id: 't1', lat: 45.5050, lng: -73.5720, type: 'traffic', label: 'A-40 Congestion', severity: 'red', details: '35 min delay' },
  { id: 't2', lat: 45.4850, lng: -73.5450, type: 'traffic', label: 'Pont Jacques-Cartier', severity: 'amber', details: '10 min delay' },
  { id: 'n1', lat: 45.5017, lng: -73.5600, type: 'noise', label: 'Construction Noise', severity: 'red', details: '72 dB avg' },
  { id: 'n2', lat: 45.5150, lng: -73.5680, type: 'noise', label: 'Traffic Noise', severity: 'amber', details: '65 dB avg' },
  { id: 'tr1', lat: 45.5117, lng: -73.5647, type: 'transit', label: 'Berri-UQAM Station', severity: 'green', details: 'Normal service' },
  { id: 'tr2', lat: 45.5230, lng: -73.5860, type: 'transit', label: 'Laurier Station', severity: 'amber', details: 'Orange line 5min delay' },
];

const HEAT_ZONES: HeatZone[] = [
  { lat: 45.505, lng: -73.56, intensity: 2.5, type: 'air_quality' },
  { lat: 45.52, lng: -73.58, intensity: 1.8, type: 'air_quality' },
  { lat: 45.498, lng: -73.555, intensity: 3.0, type: 'noise' },
  { lat: 45.515, lng: -73.57, intensity: 2.2, type: 'noise' },
  { lat: 45.505, lng: -73.572, intensity: 2.8, type: 'traffic' },
  { lat: 45.485, lng: -73.545, intensity: 2.0, type: 'traffic' },
];

const BIKE_ROUTES: RouteOverlay[] = [
  { id: 'r1', points: [[45.509, -73.575], [45.511, -73.570], [45.514, -73.565], [45.517, -73.560], [45.520, -73.555]], color: '#06b6d4', label: 'De Maisonneuve' },
  { id: 'r2', points: [[45.522, -73.580], [45.523, -73.575], [45.524, -73.570], [45.525, -73.565], [45.526, -73.560]], color: '#06b6d4', label: 'Rachel' },
];

const SNOW_ROUTES: RouteOverlay[] = [
  { id: 'sr1', points: [[45.524, -73.580], [45.524, -73.575], [45.524, -73.570], [45.524, -73.565]], color: '#60a5fa', label: 'Plateau Snow Route' },
  { id: 'sr2', points: [[45.535, -73.565], [45.535, -73.560], [45.535, -73.555], [45.535, -73.550]], color: '#60a5fa', label: 'Rosemont Snow Route' },
];

export default function CivicIntelPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { activeLayers, toggleLayer, setLayers } = useCivicLayers();
  const { mood, score } = useHeatIndex();
  const { isStoryMode, toggleStoryMode } = useStoryMode(setLayers);

  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [rightTab, setRightTab] = useState<RightTab>('details');
  const [selectedMarker, setSelectedMarker] = useState<MarkerData | null>(null);
  const [pinFormPosition, setPinFormPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number] | undefined>(undefined);
  const [userPins, setUserPins] = useState<MarkerData[]>([]);
  const [showSignInBanner, setShowSignInBanner] = useState(!isAuthenticated);

  const filteredMarkers = CIVIC_MARKERS.filter((m) => {
    if (m.type === 'shelter' && activeLayers.has('shelters')) return true;
    if (m.type === 'snow' && activeLayers.has('snow')) return true;
    if (m.type === 'closure' && activeLayers.has('street_closures')) return true;
    if (m.type === 'bike' && activeLayers.has('bike_paths')) return true;
    if (m.type === 'wifi' && activeLayers.has('wifi')) return true;
    if (m.type === 'park' && activeLayers.has('parks')) return true;
    if (m.type === 'art' && activeLayers.has('public_art')) return true;
    if (m.type === 'event' && activeLayers.has('cultural_events')) return true;
    if (m.type === 'traffic' && activeLayers.has('traffic')) return true;
    if (m.type === 'noise' && activeLayers.has('noise')) return true;
    if (m.type === 'transit' && activeLayers.has('transit')) return true;
    return false;
  });

  const activeHeatZones = HEAT_ZONES.filter((z) => {
    if (z.type === 'air_quality' && activeLayers.has('air_quality')) return true;
    if (z.type === 'noise' && activeLayers.has('noise')) return true;
    if (z.type === 'traffic' && activeLayers.has('traffic')) return true;
    return false;
  });

  const activeRoutes: RouteOverlay[] = [
    ...(activeLayers.has('bike_paths') ? BIKE_ROUTES : []),
    ...(activeLayers.has('snow') ? SNOW_ROUTES : []),
  ];

  const allMarkers = [...filteredMarkers, ...userPins];

  const handleSearchSelect = useCallback((result: SearchResult) => {
    setMapCenter([result.lat, result.lng]);
    setRightTab('details');
    setRightOpen(true);
    setSelectedMarker({
      id: result.id,
      lat: result.lat,
      lng: result.lng,
      type: result.type as MarkerData['type'],
      label: result.label,
      severity: 'green',
    });
  }, []);

  const handlePinSave = useCallback((pin: PinData) => {
    const newPin: MarkerData = {
      id: `user-${Date.now()}`,
      lat: pin.lat,
      lng: pin.lng,
      type: 'pin',
      label: pin.title,
      severity: pin.severity || undefined,
      details: pin.description,
    };
    setUserPins((prev) => [...prev, newPin]);
    setPinFormPosition(null);
  }, []);

  const handleMarkerClick = useCallback((marker: MarkerData) => {
    setSelectedMarker(marker);
    setRightTab('details');
    setRightOpen(true);
  }, []);

  return (
    <div className="h-screen w-full flex flex-col bg-gray-950 text-white overflow-hidden">
      <TopBar
        storyMode={isStoryMode}
        onToggleStoryMode={() => toggleStoryMode(activeLayers)}
        onSearchSelect={handleSearchSelect}
      />

      {/* Public mode banner */}
      {showSignInBanner && !isAuthenticated && (
        <div className="bg-gray-900/95 border-b border-gray-800 px-4 py-2 flex items-center justify-between z-30 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-[9px] font-medium text-gray-500 bg-gray-800 px-2 py-0.5 rounded">PUBLIC MODE</span>
            <p className="text-[10px] text-gray-400">
              Sign in to save pins, build custom maps, and receive alerts
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/auth/login')}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-[10px] font-medium text-white transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => setShowSignInBanner(false)}
              className="text-gray-500 hover:text-white text-xs px-1"
            >
              x
            </button>
          </div>
        </div>
      )}

      {/* Main body */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Left sidebar */}
        <div className={`absolute left-0 top-0 bottom-0 z-20 transition-all ${leftOpen ? 'w-56' : 'w-0'}`}>
          <LayerSidebar
            isOpen={leftOpen}
            onClose={() => setLeftOpen(false)}
            enabledLayers={activeLayers}
            onToggle={toggleLayer}
          />
        </div>

        {!leftOpen && (
          <button
            onClick={() => setLeftOpen(true)}
            className="absolute left-3 top-3 z-20 w-8 h-8 bg-gray-900/90 border border-gray-700 rounded-lg flex items-center justify-center text-gray-400 hover:text-white backdrop-blur transition-colors"
          >
            <Layers size={13} />
          </button>
        )}

        {/* Map */}
        <MapContainer
          markers={allMarkers}
          heatZones={activeHeatZones}
          routes={activeRoutes}
          center={mapCenter}
          storyMode={isStoryMode}
          onMapLongPress={(lat, lng) => setPinFormPosition({ lat, lng })}
          onMarkerClick={handleMarkerClick}
        />

        {/* Pin form */}
        <PinCreationModal
          position={pinFormPosition}
          onSave={handlePinSave}
          onCancel={() => setPinFormPosition(null)}
        />

        {/* Right sidebar */}
        <div className={`absolute right-0 top-0 bottom-0 z-20 transition-all ${rightOpen ? 'w-72' : 'w-0'}`}>
          <DetailSidebar
            isOpen={rightOpen}
            onClose={() => setRightOpen(false)}
            activeTab={rightTab}
            onTabChange={setRightTab}
            selectedMarker={selectedMarker}
            onClearMarker={() => setSelectedMarker(null)}
            heatScore={score}
            heatMood={mood}
          />
        </div>

        {!rightOpen && (
          <button
            onClick={() => setRightOpen(true)}
            className="absolute right-3 top-3 z-20 w-8 h-8 bg-gray-900/90 border border-gray-700 rounded-lg flex items-center justify-center text-gray-400 hover:text-white backdrop-blur transition-colors"
          >
            <Eye size={13} />
          </button>
        )}
      </div>

      <BottomBar />

      {/* Map legend */}
      <div className="absolute bottom-20 left-4 z-20 bg-gray-900/90 border border-gray-800 rounded-xl p-3 backdrop-blur hidden lg:block">
        <h4 className="text-[8px] text-gray-500 uppercase tracking-wider font-semibold mb-2">Legend</h4>
        <div className="space-y-1">
          {[
            { color: '#10b981', label: 'Shelter' },
            { color: '#60a5fa', label: 'Snow' },
            { color: '#ef4444', label: 'Closure/Traffic' },
            { color: '#06b6d4', label: 'Bike Path' },
            { color: '#f59e0b', label: 'Wi-Fi/Noise' },
            { color: '#22c55e', label: 'Park' },
            { color: '#f472b6', label: 'Art' },
            { color: '#a855f7', label: 'Event' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
              <span className="text-[8px] text-gray-400">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}