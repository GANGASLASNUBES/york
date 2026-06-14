import { Thermometer, Bus, Volume2, Wind, Calendar, Shield } from 'lucide-react';

export type NeighborhoodStats = {
  borough: string;
  neighborhood: string;
  heatIndex: number;
  transitStatus: string;
  noiseLevel: number;
  airQuality: number;
  activeEvents: number;
  shelterCapacity: string;
};

type Props = {
  stats: NeighborhoodStats;
  onViewInCommandCenter: () => void;
  onViewStories: () => void;
};

function scoreColor(score: number): string {
  if (score <= 30) return 'text-emerald-400';
  if (score <= 55) return 'text-cyan-400';
  if (score <= 75) return 'text-amber-400';
  return 'text-red-400';
}

function transitColor(status: string): string {
  if (status === 'normal') return 'text-emerald-400';
  if (status === 'minor_delays') return 'text-amber-400';
  return 'text-red-400';
}

export default function NeighborhoodSnapshotCard({ stats, onViewInCommandCenter, onViewStories }: Props) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-white">{stats.neighborhood}</h3>
          <p className="text-[10px] text-gray-500">{stats.borough}</p>
        </div>
        <div className={`text-lg font-bold ${scoreColor(stats.heatIndex)}`}>
          {stats.heatIndex}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="flex items-center gap-2 bg-gray-800/50 rounded-lg px-2.5 py-1.5">
          <Thermometer size={11} className={scoreColor(stats.heatIndex)} />
          <span className="text-[10px] text-gray-300">Heat: {stats.heatIndex}</span>
        </div>
        <div className="flex items-center gap-2 bg-gray-800/50 rounded-lg px-2.5 py-1.5">
          <Bus size={11} className={transitColor(stats.transitStatus)} />
          <span className="text-[10px] text-gray-300 capitalize">{stats.transitStatus.replace('_', ' ')}</span>
        </div>
        <div className="flex items-center gap-2 bg-gray-800/50 rounded-lg px-2.5 py-1.5">
          <Volume2 size={11} className={scoreColor(stats.noiseLevel)} />
          <span className="text-[10px] text-gray-300">Noise: {stats.noiseLevel}</span>
        </div>
        <div className="flex items-center gap-2 bg-gray-800/50 rounded-lg px-2.5 py-1.5">
          <Wind size={11} className={scoreColor(stats.airQuality)} />
          <span className="text-[10px] text-gray-300">Air: {stats.airQuality}</span>
        </div>
        <div className="flex items-center gap-2 bg-gray-800/50 rounded-lg px-2.5 py-1.5">
          <Calendar size={11} className="text-cyan-400" />
          <span className="text-[10px] text-gray-300">{stats.activeEvents} events</span>
        </div>
        <div className="flex items-center gap-2 bg-gray-800/50 rounded-lg px-2.5 py-1.5">
          <Shield size={11} className="text-emerald-400" />
          <span className="text-[10px] text-gray-300 capitalize">{stats.shelterCapacity}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onViewInCommandCenter}
          className="flex-1 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 rounded-lg text-[10px] font-medium text-white transition-colors text-center"
        >
          View in Command Center
        </button>
        <button
          onClick={onViewStories}
          className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-[10px] font-medium text-gray-300 transition-colors"
        >
          Stories
        </button>
      </div>
    </div>
  );
}
