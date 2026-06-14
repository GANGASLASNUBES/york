import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Zap, Bike, Shield, Radio, Battery, Wifi, Wrench, Wind, Bus, Car, Snowflake, MapPin } from 'lucide-react';

export type GearMode = 'commuter' | 'cyclist' | 'safety' | null;

type GearRecommendation = {
  id: string;
  icon: typeof Zap;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
};

type GearPin = {
  id: string;
  type: 'charging' | 'repair' | 'wifi';
  label: string;
  distance: string;
};

const MODE_OVERLAYS: Record<string, string[]> = {
  commuter: ['traffic', 'transit', 'street_closures', 'snow'],
  cyclist: ['bike_paths', 'air_quality', 'noise'],
  safety: ['shelters', 'wifi', 'parks'],
};

const MODE_RECOMMENDATIONS: Record<string, GearRecommendation[]> = {
  commuter: [
    { id: 'r1', icon: Bus, title: 'Transit delays detected', description: 'Orange line 5min delay -- adjust departure +10min', priority: 'high' },
    { id: 'r2', icon: Snowflake, title: 'Snow removal active', description: 'Plateau sector -- alternate routes suggested', priority: 'medium' },
    { id: 'r3', icon: Car, title: 'Congestion ahead', description: 'A-40 slow -- consider Sherbrooke detour', priority: 'medium' },
  ],
  cyclist: [
    { id: 'r4', icon: Wind, title: 'Air quality advisory', description: 'PM2.5 moderate -- mask recommended in Ville-Marie', priority: 'high' },
    { id: 'r5', icon: Bike, title: 'Bike path clear', description: 'De Maisonneuve corridor fully open', priority: 'low' },
    { id: 'r6', icon: Battery, title: 'E-bike charge low', description: 'Charging station 400m ahead at Berri-UQAM', priority: 'medium' },
  ],
  safety: [
    { id: 'r7', icon: Shield, title: 'Nearest shelter available', description: 'Mission Old Brewery -- 65 beds available', priority: 'low' },
    { id: 'r8', icon: Wifi, title: 'Free Wi-Fi nearby', description: 'Grande Bibliotheque -- 200m east', priority: 'low' },
    { id: 'r9', icon: MapPin, title: 'Warming center open', description: 'Ville-Marie center -- 24/7 access', priority: 'medium' },
  ],
};

const GEAR_PINS: GearPin[] = [
  { id: 'gp1', type: 'charging', label: 'Berri-UQAM Charging Hub', distance: '400m' },
  { id: 'gp2', type: 'charging', label: 'Place des Arts Station', distance: '850m' },
  { id: 'gp3', type: 'repair', label: 'BIPS Gear Service Point', distance: '1.2km' },
  { id: 'gp4', type: 'wifi', label: 'Grande Bibliotheque Hotspot', distance: '200m' },
  { id: 'gp5', type: 'wifi', label: 'Square Victoria Hotspot', distance: '650m' },
];

type Props = {
  onModeChange?: (mode: GearMode) => void;
  onHighlightOverlays?: (overlays: string[]) => void;
};

function priorityColor(p: string) {
  if (p === 'high') return 'border-red-700/40 bg-red-900/20';
  if (p === 'medium') return 'border-amber-700/40 bg-amber-900/20';
  return 'border-gray-700/40 bg-gray-800/30';
}

function pinTypeIcon(type: GearPin['type']) {
  switch (type) {
    case 'charging': return <Battery size={10} className="text-cyan-400" />;
    case 'repair': return <Wrench size={10} className="text-amber-400" />;
    case 'wifi': return <Wifi size={10} className="text-emerald-400" />;
  }
}

export default function GearIntelligencePanel({ onModeChange, onHighlightOverlays }: Props) {
  const { t } = useTranslation();
  const [connected, setConnected] = useState(true);
  const [activeMode, setActiveMode] = useState<GearMode>('commuter');

  const handleModeSelect = (mode: GearMode) => {
    setActiveMode(mode);
    onModeChange?.(mode);
    if (mode) onHighlightOverlays?.(MODE_OVERLAYS[mode]);
  };

  const recommendations = activeMode ? MODE_RECOMMENDATIONS[activeMode] : [];

  return (
    <div className="space-y-4">
      {/* Connection status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Radio size={11} className={connected ? 'text-emerald-400' : 'text-gray-600'} />
          <span className="text-[10px] text-gray-300">
            {connected ? t('gear.connected') : t('gear.noGear')}
          </span>
        </div>
        <button
          onClick={() => setConnected(!connected)}
          className={`text-[9px] px-2 py-0.5 rounded ${connected ? 'bg-emerald-900/30 text-emerald-400' : 'bg-gray-800 text-gray-500'}`}
        >
          {connected ? t('gear.active') : t('gear.connect')}
        </button>
      </div>

      {!connected && (
        <div className="text-center py-4 bg-gray-800/30 rounded-lg border border-gray-800">
          <Zap size={16} className="text-gray-600 mx-auto mb-2" />
          <p className="text-[10px] text-gray-500">{t('gear.connectPrompt')}</p>
        </div>
      )}

      {connected && (
        <>
          {/* Mode selector */}
          <div>
            <h4 className="text-[9px] text-gray-500 uppercase tracking-wider mb-2">{t('gear.activeMode')}</h4>
            <div className="grid grid-cols-3 gap-1.5">
              {([
                { mode: 'commuter' as GearMode, icon: Car, label: t('gear.modes.commuter') },
                { mode: 'cyclist' as GearMode, icon: Bike, label: t('gear.modes.cyclist') },
                { mode: 'safety' as GearMode, icon: Shield, label: t('gear.modes.safety') },
              ]).map(({ mode, icon: Icon, label }) => (
                <button
                  key={mode}
                  onClick={() => handleModeSelect(mode)}
                  className={`flex flex-col items-center gap-1 px-2 py-2 rounded-lg border transition-colors ${
                    activeMode === mode
                      ? 'bg-cyan-900/30 border-cyan-700/40 text-cyan-300'
                      : 'bg-gray-800/50 border-gray-700/40 text-gray-500 hover:text-gray-300'
                  }`}
                >
                  <Icon size={12} />
                  <span className="text-[9px] font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Active overlays */}
          {activeMode && (
            <div>
              <h4 className="text-[9px] text-gray-500 uppercase tracking-wider mb-1.5">{t('gear.overlays')}</h4>
              <div className="flex flex-wrap gap-1">
                {MODE_OVERLAYS[activeMode].map((o) => (
                  <span key={o} className="text-[9px] bg-cyan-900/20 text-cyan-400 border border-cyan-800/40 px-2 py-0.5 rounded capitalize">
                    {o.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div>
              <h4 className="text-[9px] text-gray-500 uppercase tracking-wider mb-1.5">{t('gear.recommendations')}</h4>
              <div className="space-y-1.5">
                {recommendations.map((r) => (
                  <div key={r.id} className={`border rounded-lg px-2.5 py-2 ${priorityColor(r.priority)}`}>
                    <div className="flex items-center gap-1.5">
                      <r.icon size={10} className="text-gray-400 shrink-0" />
                      <p className="text-[10px] font-medium text-white">{r.title}</p>
                    </div>
                    <p className="text-[9px] text-gray-400 mt-0.5 ml-4">{r.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Gear pins */}
          <div>
            <h4 className="text-[9px] text-gray-500 uppercase tracking-wider mb-1.5">{t('gear.nearbyPoints')}</h4>
            <div className="space-y-1">
              {GEAR_PINS.slice(0, 4).map((p) => (
                <div key={p.id} className="flex items-center gap-2 bg-gray-800/30 rounded-lg px-2.5 py-1.5">
                  {pinTypeIcon(p.type)}
                  <span className="text-[10px] text-gray-300 flex-1 truncate">{p.label}</span>
                  <span className="text-[9px] text-gray-600 shrink-0">{p.distance}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
