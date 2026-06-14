import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';

export type BoroughMood = {
  borough: string;
  mood: 'energized' | 'stable' | 'stressed' | 'overloaded';
  compositeScore: number;
  factors: {
    noise: number;
    traffic: number;
    airQuality: number;
    events: number;
    weather: number;
    transit: number;
  };
  center: [number, number];
};

const BOROUGH_CENTERS: Record<string, [number, number]> = {
  'Le Plateau-Mont-Royal': [45.5244, -73.5750],
  'Rosemont-La Petite-Patrie': [45.5400, -73.5850],
  'Ville-Marie': [45.5088, -73.5668],
  'Verdun': [45.4530, -73.5700],
  'Mercier-Hochelaga-Maisonneuve': [45.5550, -73.5300],
  'Le Sud-Ouest': [45.4800, -73.5800],
  'Outremont': [45.5200, -73.6000],
  'Cote-des-Neiges-NDG': [45.4900, -73.6200],
};

const MOOD_COLORS: Record<string, string> = {
  energized: '#06b6d4',
  stable: '#10b981',
  stressed: '#f59e0b',
  overloaded: '#ef4444',
};

const MOOD_BG: Record<string, string> = {
  energized: 'bg-cyan-900/30 border-cyan-700/40',
  stable: 'bg-emerald-900/30 border-emerald-700/40',
  stressed: 'bg-amber-900/30 border-amber-700/40',
  overloaded: 'bg-red-900/30 border-red-700/40',
};

const MOOD_TEXT: Record<string, string> = {
  energized: 'text-cyan-400',
  stable: 'text-emerald-400',
  stressed: 'text-amber-400',
  overloaded: 'text-red-400',
};

const FALLBACK_DATA: BoroughMood[] = [
  { borough: 'Le Plateau-Mont-Royal', mood: 'energized', compositeScore: 62, factors: { noise: 55, traffic: 40, airQuality: 35, events: 80, weather: 45, transit: 50 }, center: [45.5244, -73.5750] },
  { borough: 'Rosemont-La Petite-Patrie', mood: 'stable', compositeScore: 44, factors: { noise: 35, traffic: 45, airQuality: 30, events: 50, weather: 45, transit: 55 }, center: [45.5400, -73.5850] },
  { borough: 'Ville-Marie', mood: 'stressed', compositeScore: 71, factors: { noise: 72, traffic: 85, airQuality: 40, events: 90, weather: 45, transit: 60 }, center: [45.5088, -73.5668] },
  { borough: 'Verdun', mood: 'stable', compositeScore: 38, factors: { noise: 30, traffic: 35, airQuality: 25, events: 45, weather: 40, transit: 50 }, center: [45.4530, -73.5700] },
  { borough: 'Mercier-Hochelaga-Maisonneuve', mood: 'stable', compositeScore: 42, factors: { noise: 40, traffic: 50, airQuality: 30, events: 35, weather: 45, transit: 45 }, center: [45.5550, -73.5300] },
  { borough: 'Le Sud-Ouest', mood: 'energized', compositeScore: 56, factors: { noise: 50, traffic: 55, airQuality: 35, events: 70, weather: 45, transit: 55 }, center: [45.4800, -73.5800] },
  { borough: 'Outremont', mood: 'stable', compositeScore: 35, factors: { noise: 25, traffic: 30, airQuality: 20, events: 40, weather: 45, transit: 45 }, center: [45.5200, -73.6000] },
  { borough: 'Cote-des-Neiges-NDG', mood: 'stable', compositeScore: 45, factors: { noise: 40, traffic: 50, airQuality: 30, events: 45, weather: 45, transit: 55 }, center: [45.4900, -73.6200] },
];

type Props = {
  compact?: boolean;
  onBoroughClick?: (borough: BoroughMood) => void;
};

export default function CityMoodBoroughRings({ compact = false, onBoroughClick }: Props) {
  const { t } = useTranslation();
  const [boroughs, setBoroughs] = useState<BoroughMood[]>(FALLBACK_DATA);
  const [hoveredBorough, setHoveredBorough] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMoods() {
      const { data } = await supabase
        .from('borough_mood')
        .select('*')
        .order('recorded_at', { ascending: false });

      if (data && data.length > 0) {
        const latest = new Map<string, typeof data[0]>();
        for (const row of data) {
          if (!latest.has(row.borough)) latest.set(row.borough, row);
        }
        const mapped: BoroughMood[] = Array.from(latest.values()).map((d) => ({
          borough: d.borough,
          mood: d.mood as BoroughMood['mood'],
          compositeScore: d.composite_score,
          factors: {
            noise: d.noise_score,
            traffic: d.traffic_score,
            airQuality: d.air_quality_score,
            events: d.events_score,
            weather: d.weather_score,
            transit: d.transit_score,
          },
          center: BOROUGH_CENTERS[d.borough] || [45.5, -73.56],
        }));
        if (mapped.length > 0) setBoroughs(mapped);
      }
    }
    fetchMoods();
  }, []);

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {boroughs.map((b) => (
          <button
            key={b.borough}
            onClick={() => onBoroughClick?.(b)}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border ${MOOD_BG[b.mood]} transition-colors hover:opacity-80`}
          >
            <div className="w-2 h-2 rounded-full" style={{ background: MOOD_COLORS[b.mood] }} />
            <span className="text-[9px] text-gray-300 max-w-[80px] truncate">{b.borough.split('-')[0]}</span>
            <span className={`text-[9px] font-medium ${MOOD_TEXT[b.mood]}`}>{b.compositeScore}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{t('mood.boroughMoodRings')}</h3>
      <div className="grid grid-cols-2 gap-2">
        {boroughs.map((b) => (
          <div
            key={b.borough}
            className={`relative p-3 rounded-xl border cursor-pointer transition-all ${MOOD_BG[b.mood]} ${
              hoveredBorough === b.borough ? 'scale-[1.02]' : ''
            }`}
            onMouseEnter={() => setHoveredBorough(b.borough)}
            onMouseLeave={() => setHoveredBorough(null)}
            onClick={() => onBoroughClick?.(b)}
          >
            {/* Ring visualization */}
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 shrink-0">
                <svg viewBox="0 0 36 36" className="w-10 h-10 -rotate-90">
                  <circle cx="18" cy="18" r="15" fill="none" strokeWidth="3" stroke="currentColor" className="text-gray-800" />
                  <circle
                    cx="18" cy="18" r="15" fill="none" strokeWidth="3"
                    stroke={MOOD_COLORS[b.mood]}
                    strokeDasharray={`${(b.compositeScore / 100) * 94.2} 94.2`}
                    strokeLinecap="round"
                  />
                </svg>
                <span className={`absolute inset-0 flex items-center justify-center text-[9px] font-bold ${MOOD_TEXT[b.mood]}`}>
                  {b.compositeScore}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-medium text-white truncate">{b.borough}</p>
                <p className={`text-[9px] capitalize ${MOOD_TEXT[b.mood]}`}>{t(`mood.${b.mood}`)}</p>
              </div>
            </div>

            {/* Hover factors */}
            {hoveredBorough === b.borough && (
              <div className="mt-2 pt-2 border-t border-gray-800/50 grid grid-cols-3 gap-1">
                {Object.entries(b.factors).map(([key, val]) => (
                  <div key={key} className="text-center">
                    <p className="text-[8px] text-gray-500 capitalize">{key === 'airQuality' ? 'Air' : key}</p>
                    <p className="text-[9px] text-gray-300 font-medium">{val}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
