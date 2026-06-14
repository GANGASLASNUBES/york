import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Route, MapPin, Plus, Palette, Trees, Calendar, Shield, ArrowLeft, Circle } from 'lucide-react';
import { CityTrailCard } from '../components/civic/CityTrailCard';
import { CivicMapPanel } from '../components/civic/CivicMapPanel';

type TrailType = 'art' | 'park' | 'festival' | 'safety' | 'custom';

type Trail = {
  id: string;
  name: string;
  description: string;
  trailType: TrailType;
  pinCount: number;
  distance: string;
  duration: string;
};

const SYSTEM_TRAILS: Trail[] = [
  {
    id: 'art-trail',
    name: 'Montreal Art Trail',
    description: 'Discover iconic public art installations across the city. From La Joute to the Under Pressure murals, follow the creative pulse of Montreal.',
    trailType: 'art',
    pinCount: 8,
    distance: '4.2 km',
    duration: '2-3 hours',
  },
  {
    id: 'park-trail',
    name: 'Green Spaces Trail',
    description: 'Connect with nature through Montreal\'s best parks. From Mont-Royal to Parc La Fontaine, experience urban greenery at its finest.',
    trailType: 'park',
    pinCount: 6,
    distance: '7.8 km',
    duration: '3-4 hours',
  },
  {
    id: 'festival-trail',
    name: 'Festival Quarter Trail',
    description: 'Navigate the Quartier des Spectacles and surrounding festival venues. Jazz, murals, and Francofolies in one curated route.',
    trailType: 'festival',
    pinCount: 10,
    distance: '2.8 km',
    duration: '1-2 hours',
  },
  {
    id: 'safety-trail',
    name: 'Winter Safety Trail',
    description: 'Essential winter stops: warming centers, shelters, Wi-Fi hotspots, and safe rest areas. Stay warm, stay connected.',
    trailType: 'safety',
    pinCount: 12,
    distance: '3.5 km',
    duration: '1 hour',
  },
];

const TRAIL_FILTERS: { key: TrailType | 'all'; label: string; icon: typeof Route; color: string }[] = [
  { key: 'all', label: 'All Trails', icon: Route, color: 'text-white' },
  { key: 'art', label: 'Art', icon: Palette, color: 'text-cyan-400' },
  { key: 'park', label: 'Parks', icon: Trees, color: 'text-emerald-400' },
  { key: 'festival', label: 'Festival', icon: Calendar, color: 'text-pink-400' },
  { key: 'safety', label: 'Safety', icon: Shield, color: 'text-amber-400' },
];

export function CityTrailsPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<TrailType | 'all'>('all');

  const filtered = filter === 'all'
    ? SYSTEM_TRAILS
    : SYSTEM_TRAILS.filter((t) => t.trailType === filter);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/90 backdrop-blur sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="text-gray-500 hover:text-white transition-colors">
              <ArrowLeft size={18} />
            </button>
            <div className="w-8 h-8 bg-emerald-600/20 rounded-lg flex items-center justify-center">
              <Route size={14} className="text-emerald-400" />
            </div>
            <div>
              <h1 className="text-sm font-bold">City Trails</h1>
              <p className="text-[9px] text-gray-500">Curated routes across Montreal</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Circle size={6} className="text-emerald-400 fill-emerald-400 animate-pulse" />
              <span className="text-[9px] text-emerald-400 font-medium">Live</span>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-xs font-medium text-gray-300 transition-colors">
              <Plus size={12} />
              Custom Trail
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Map preview */}
        <div className="mb-8">
          <CivicMapPanel title="Trail Map - Montreal" height="h-56" />
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {TRAIL_FILTERS.map((f) => {
            const Icon = f.icon;
            const isActive = filter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-gray-800 border border-gray-700 text-white'
                    : 'text-gray-500 hover:text-gray-300 border border-transparent'
                }`}
              >
                <Icon size={12} className={isActive ? f.color : ''} />
                <span className="text-xs font-medium">{f.label}</span>
              </button>
            );
          })}
        </div>

        {/* Trails grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((trail) => (
            <CityTrailCard
              key={trail.id}
              id={trail.id}
              name={trail.name}
              description={trail.description}
              trailType={trail.trailType}
              pinCount={trail.pinCount}
              distance={trail.distance}
              duration={trail.duration}
              onStart={() => navigate('/bips/civic-intel')}
              onSave={() => {}}
              onShare={() => {}}
            />
          ))}
        </div>

        {/* How it works */}
        <div className="mt-12 bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-sm font-bold text-white mb-4">How Trails Work</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { step: '1', title: 'Choose a trail', desc: 'Select from curated routes or build your own custom trail.' },
              { step: '2', title: 'Follow the route', desc: 'Each trail shows pins, stories, and live conditions along the way.' },
              { step: '3', title: 'Save and share', desc: 'Bookmark trails, add your own pins, and share with the community.' },
            ].map((item) => (
              <div key={item.step} className="flex gap-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-900/30 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-emerald-400">{item.step}</span>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">{item.title}</h4>
                  <p className="text-[10px] text-gray-500 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
