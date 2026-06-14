import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Circle, Snowflake, Car, Construction, Building2, Calendar, Palette,
  MapPin, ArrowRight, Wind, Bus, ChevronRight, Sparkles, Plus
} from 'lucide-react';
import { MiniMapHero } from '../components/civic/MiniMapHero';
import { CityHeatIndexRing } from '../components/civic/CityHeatIndexRing';
import { CivicStoryCard } from '../components/civic/CivicStoryCard';
import LanguageSwitcher from '../components/LanguageSwitcher';

const SNAPSHOT_CARDS = [
  { label: 'City Heat Index', value: '62', sub: 'Stable', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { label: 'Transit', value: 'Minor Delay', sub: 'Orange Line 5m', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  { label: 'Snow/Weather', value: '−4°C', sub: 'Snow ops: Plateau', color: 'text-blue-300', bg: 'bg-blue-400/10' },
  { label: 'Air Quality', value: 'AQI 42', sub: 'Good', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
];

const OVERLAYS = [
  { key: 'snow', label: 'Snow Removal', icon: Snowflake, color: 'text-blue-400 bg-blue-500/10', desc: 'Active operations' },
  { key: 'traffic', label: 'Traffic', icon: Car, color: 'text-red-400 bg-red-500/10', desc: 'Live congestion' },
  { key: 'street_closures', label: 'Closures', icon: Construction, color: 'text-orange-400 bg-orange-500/10', desc: '3 active' },
  { key: 'shelters', label: 'Shelters', icon: Building2, color: 'text-emerald-400 bg-emerald-500/10', desc: 'Bed availability' },
  { key: 'cultural_events', label: 'Events', icon: Calendar, color: 'text-pink-400 bg-pink-500/10', desc: 'Coming up' },
  { key: 'public_art', label: 'Public Art', icon: Palette, color: 'text-cyan-400 bg-cyan-500/10', desc: '420+ installations' },
];

const STORIES = [
  { title: 'La Joute by Riopelle', description: 'A kinetic fountain that erupts with fire at dusk. One of Montreal\'s most iconic public artworks in Place Jean-Paul-Riopelle.', location: 'Place Jean-Paul-Riopelle', highlight: 'Fire sequence at 9pm', category: 'Art Tours' },
  { title: 'Festival International de Jazz', description: 'Over 3000 artists transform downtown Montreal into a celebration of improvisation and creative freedom.', location: 'Place des Arts', highlight: 'Jun 28 - Jul 7 | Free outdoor shows', category: 'Events' },
  { title: 'Mont-Royal at Sunrise', description: 'The Belvedere lookout offers the definitive view of the city at sunrise, when the light makes everything gold.', location: 'Avenue du Parc', highlight: 'Best viewed before 7am', category: 'Green Spaces' },
  { title: 'Under Pressure Murals', description: 'Massive street art installations that transform blank walls into narratives of identity, resilience, and belonging.', location: 'Saint-Laurent & Duluth', highlight: 'New murals added annually in June', category: 'Art Tours' },
  { title: 'Grande Bibliotheque', description: 'A cathedral of knowledge with natural light filtering through the birch-log facade. Quiet floors, maker spaces, and endless discovery.', location: 'Berri-UQAM', highlight: 'Free membership for all', category: 'Libraries' },
];

const TRENDING_PINS = [
  { label: 'Safe Rest Spot', category: 'safety', x: 42, y: 38 },
  { label: 'Pop-up Market', category: 'event', x: 55, y: 45 },
  { label: 'Glass on Path', category: 'safety', x: 38, y: 52 },
  { label: 'Mural Photo Spot', category: 'art', x: 62, y: 30 },
  { label: 'Free Wi-Fi Bench', category: 'wifi', x: 48, y: 60 },
];

const pinColors: Record<string, string> = {
  safety: 'bg-amber-400',
  event: 'bg-pink-400',
  art: 'bg-cyan-400',
  wifi: 'bg-yellow-400',
};

export function MontrealHomePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Language switcher in top bar */}
      <div className="absolute top-4 right-6 z-20">
        <LanguageSwitcher compact />
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Circle size={8} className="text-emerald-400 fill-emerald-400 animate-pulse" />
                <span className="text-[11px] text-emerald-400 font-medium uppercase tracking-wider">Live Now</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
                {t('home.title')}
              </h1>
              <p className="text-lg text-gray-400 mt-4 leading-relaxed max-w-lg">
                {t('home.hero')}
              </p>

              <div className="flex flex-wrap gap-3 mt-8">
                <button
                  onClick={() => navigate('/bips/civic-intel')}
                  className="flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-sm font-medium transition-colors"
                >
                  {t('home.viewCommandCenter')}
                  <ArrowRight size={14} />
                </button>
                <button
                  onClick={() => navigate('/bips/city-trails')}
                  className="flex items-center gap-2 px-5 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-sm font-medium text-gray-300 transition-colors"
                >
                  {t('home.viewTrails')}
                </button>
              </div>

              <div className="mt-8 flex items-center gap-6">
                <CityHeatIndexRing compositeScore={62} mood="stable" size="sm" />
                <div>
                  <p className="text-xs text-gray-500">Current City Mood</p>
                  <p className="text-sm font-semibold text-blue-400">Stable</p>
                  <p className="text-[9px] text-gray-600">Noise moderate | Events active | Transit minor delay</p>
                </div>
              </div>
            </div>

            <div className="h-72 lg:h-96">
              <MiniMapHero />
            </div>
          </div>
        </div>
      </section>

      {/* Today's Snapshot */}
      <section className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold">{t('home.citySnapshot')}</h2>
            <span className="text-[9px] text-gray-500">Auto-updating every 15 min</span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {SNAPSHOT_CARDS.map((card) => (
              <div key={card.label} className={`${card.bg} border border-gray-800 rounded-2xl p-5`}>
                <p className="text-[10px] text-gray-400 mb-1">{card.label}</p>
                <p className={`text-xl font-bold ${card.color}`}>{card.value}</p>
                <p className="text-[10px] text-gray-500 mt-1">{card.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Overlays */}
      <section className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold">{t('home.featuredOverlays')}</h2>
            <button
              onClick={() => navigate('/bips/civic-intel')}
              className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              {t('common.viewAll')} <ChevronRight size={12} />
            </button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2">
            {OVERLAYS.map((overlay) => {
              const Icon = overlay.icon;
              return (
                <button
                  key={overlay.key}
                  onClick={() => navigate('/bips/civic-intel')}
                  className="shrink-0 w-40 bg-gray-900 border border-gray-800 rounded-2xl p-4 hover:border-gray-700 transition-colors text-left"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${overlay.color}`}>
                    <Icon size={18} />
                  </div>
                  <h3 className="text-xs font-bold text-white">{overlay.label}</h3>
                  <p className="text-[9px] text-gray-500 mt-0.5">{overlay.desc}</p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* City Stories */}
      <section className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-900/60 to-amber-900/40 border border-amber-800/30 flex items-center justify-center relative overflow-hidden">
                <div className="w-4 h-4 rounded-full bg-red-600/80 absolute top-0.5" />
                <div className="absolute bottom-1 w-3 h-1.5">
                  <svg viewBox="0 0 24 12" className="w-full h-full">
                    <path d="M 2,8 C 6,2 18,2 22,8" fill="none" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
              <div>
                <h2 className="text-lg font-bold">City Stories</h2>
                <p className="text-[9px] text-gray-500">Narrated by Lexi</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/lexi/civic-stories')}
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1"
            >
              All stories <ChevronRight size={12} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {STORIES.slice(0, 3).map((story, i) => (
              <CivicStoryCard
                key={i}
                title={story.title}
                description={story.description}
                location={story.location}
                highlight={story.highlight}
                category={story.category}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Community Pins */}
      <section className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold">{t('home.communityPins')}</h2>
              <p className="text-[10px] text-gray-500 mt-0.5">Trending public pins this week</p>
            </div>
            <button
              onClick={() => navigate('/bips/civic-intel')}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-xs font-medium text-gray-300 transition-colors"
            >
              <Plus size={12} />
              Add Your Pin
            </button>
          </div>

          <div className="relative h-56 bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            {/* Grid */}
            <div className="absolute inset-0 opacity-[0.03]" style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }} />
            {/* River */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 56" preserveAspectRatio="xMidYMid meet">
              <path d="M 0,50 Q 25,48 50,50 T 100,46" fill="none" stroke="#1e3a5f" strokeWidth="6" opacity="0.3" />
            </svg>
            {/* Pins */}
            {TRENDING_PINS.map((pin, i) => (
              <div
                key={i}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
                style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
              >
                <div className={`w-3.5 h-3.5 rounded-full ${pinColors[pin.category] || 'bg-blue-400'} shadow-lg ring-2 ring-gray-900 group-hover:scale-150 transition-transform`} />
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-[8px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none font-medium">
                  {pin.label}
                </div>
              </div>
            ))}
            {/* Labels */}
            <div className="absolute top-3 left-4 flex items-center gap-3">
              <MapPin size={10} className="text-gray-600" />
              <span className="text-[9px] text-gray-600 font-medium">Montreal Community Pins</span>
            </div>
            <div className="absolute bottom-3 left-4 flex gap-2">
              {Object.entries(pinColors).map(([type, color]) => (
                <div key={type} className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${color}`} />
                  <span className="text-[7px] text-gray-500 capitalize">{type}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-600/20 rounded-lg flex items-center justify-center">
                <Sparkles size={14} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">BIPS Montreal</p>
                <p className="text-[9px] text-gray-500">Civic Integrations Engine v1.0</p>
              </div>
            </div>
            <div className="text-center sm:text-right">
              <p className="text-[10px] text-gray-500">Powered by Montreal Open Data (donnees.montreal.ca)</p>
              <p className="text-[9px] text-gray-600 mt-0.5">Foster Hardware Inc. | 20 civic sources | Updated in real-time</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
